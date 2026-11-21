#!/usr/bin/env node
/**
 * Scheduled maintainer automation.
 *
 * One run, over every repo listed in config.repos:
 *   1. Reads that repo's tree, README, recent issues and recent commits.
 *   2. Skips the repo cleanly when it already has an equivalent open automation
 *      issue, or when it is at its open automation PR cap.
 *   3. Asks a model for ONE small, self-contained improvement.
 *   4. Opens an issue, commits to a branch, opens a DRAFT pull request that closes it.
 *
 * A failure in one repo is logged and the loop continues. The process exits
 * non-zero only if every attempted repo failed.
 *
 * Everything the model returns is untrusted input: file paths are checked against the
 * real repository tree, protected paths are refused, and size limits are enforced.
 * Pull requests are always drafts so a human decides what merges.
 */

import { readFile } from "node:fs/promises";

const GH = process.env.GITHUB_API_URL || "https://api.github.com";
const TOKEN = process.env.AUTOMATION_TOKEN || process.env.GITHUB_TOKEN;
const LLM_KEY = process.env.OPENAI_API_KEY;
const LLM_BASE = process.env.OPENAI_BASE_URL || "https://freebuff.com/api/v1/paid";
const MODEL = process.env.AUTOMATION_MODEL || "gpt-4.1-mini";
const DRY_RUN = String(process.env.DRY_RUN || "").toLowerCase() === "true";
const SELF_REPO = process.env.GITHUB_REPOSITORY;

const log = (...a) => console.log("[auto]", ...a);
const logFor = (repo, ...a) => console.log(`[auto] ${repo} ::`, ...a);

/** GitHub API call. `repo` scopes the call so the log can name the repo. */
async function gh(repo, path, { method = "GET", body, raw = false } = {}) {
  const res = await fetch(`${GH}/repos/${repo}${path}`, {
    method,
    headers: {
      Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "auto-improve",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${repo}${path} -> ${res.status} ${String(text).slice(0, 300)}`);
  }
  if (raw) return text;
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/** Recursively list blob paths, capped so the prompt stays small. */
async function listTree(repo, sha, limit = 400) {
  const out = [];
  const seen = new Set();
  const queue = [sha];
  while (queue.length && out.length < limit) {
    const tree = await gh(repo, `/git/trees/${queue.shift()}?recursive=0`);
    for (const e of tree.tree || []) {
      if (e.type === "tree") {
        if (!seen.has(e.sha) && !/^(node_modules|\.next|dist|build|out)$/.test(e.path)) {
          seen.add(e.sha);
          queue.push(e.sha);
        }
      } else if (e.type === "blob") {
        out.push(e.path);
        if (out.length >= limit) break;
      }
    }
  }
  return out;
}

async function readText(repo, path, ref) {
  try {
    const text = await gh(repo, `/contents/${path}?ref=${ref}`, { raw: true });
    return text.length > 20000 ? text.slice(0, 20000) : text;
  } catch {
    return null;
  }
}

function isProtected(p, patterns) {
  return patterns.some((rule) => (rule.endsWith("/") ? p.startsWith(rule) : p === rule));
}

const normalizeTitle = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function askModel(prompt) {
  const res = await fetch(`${LLM_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${LLM_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a careful maintainer. Propose at most ONE small, low-risk, self-contained improvement. " +
            "Prefer accessibility, error handling, small correctness bugs, dead code removal, or clearer docs. " +
            "Never invent files that do not exist in the provided tree, never touch workflows, lockfiles or secrets. " +
            "Return strict JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`model call failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("model returned no content");
  return JSON.parse(raw);
}

function validate(plan, tree, cfg) {
  if (!plan || typeof plan !== "object") throw new Error("plan is not an object");
  const title = String(plan.title || "").trim();
  const body = String(plan.body || "").trim();
  const files = Array.isArray(plan.files) ? plan.files : [];
  if (title.length < 8) throw new Error("title too short");
  if (!files.length) throw new Error("no files proposed");
  if (files.length > cfg.maxFilesPerPr) throw new Error("too many files");
  const known = new Set(tree);
  let lines = 0;
  for (const f of files) {
    const p = String(f.path || "");
    if (!p || p.includes("..") || p.startsWith("/")) throw new Error(`bad path: ${p}`);
    if (isProtected(p, cfg.protectedPaths)) throw new Error(`protected path: ${p}`);
    if (!known.has(p)) throw new Error(`file does not exist in repo: ${p}`);
    if (typeof f.content !== "string" || !f.content.length) throw new Error(`empty content: ${p}`);
    if (f.content.length > 120000) throw new Error(`content too large: ${p}`);
    lines += f.content.split("\n").length;
  }
  if (lines > cfg.maxDiffLines * 4) throw new Error("change too large");
  return { title, body: body || title, files };
}

/**
 * Handle one repository.
 * Returns { repo, outcome: "opened" | "skipped" | "failed", detail }.
 * Throws only on unexpected errors; the caller treats a throw as "failed".
 */
async function processRepo(repo, cfg) {
  const meta = await gh(repo, "");
  const base = meta.default_branch;
  const headSha = (await gh(repo, `/git/ref/heads/${base}`)).object.sha;

  // Guardrail: don't pile up unattended PRs in this repo.
  const openPrs = await gh(repo, "/pulls?state=open&per_page=100");
  const mine = openPrs.filter((p) => (p.labels || []).some((l) => l.name === cfg.label));
  if (mine.length >= cfg.maxOpenAutomationPrs) {
    logFor(repo, `skipped: ${mine.length} automation PR(s) already open (limit ${cfg.maxOpenAutomationPrs})`);
    return { repo, outcome: "skipped", detail: "open automation PR cap reached" };
  }

  const tree = await listTree(repo, headSha);
  const readme = (await readText(repo, "README.md", base)) || "";
  const allIssues = await gh(repo, "/issues?state=all&per_page=20");
  const recentTitles = allIssues.map((i) => `- ${i.title}`).join("\n");
  const recentCommits = (await gh(repo, "/commits?per_page=15"))
    .map((c) => `- ${c.commit.message.split("\n")[0]}`)
    .join("\n");

  const prompt = [
    `Repository: ${repo}`,
    `Default branch: ${base}`,
    "",
    "README (truncated):",
    readme.slice(0, 6000) || "(none)",
    "",
    "Files:",
    tree.join("\n"),
    "",
    "Recent issue titles (do not duplicate):",
    recentTitles || "(none)",
    "",
    "Recent commits:",
    recentCommits || "(none)",
    "",
    "Propose ONE small improvement. Reply with JSON:",
    `{"title": string, "body": string, "files": [{"path": string, "content": string}]}`,
    "- body: what is wrong, why it matters, how the change fixes it.",
    "- files: complete new contents of files that ALREADY appear in Files above (full file, not a diff).",
    `- at most ${cfg.maxFilesPerPr} files, keep the change small.`,
  ].join("\n");

  logFor(repo, `asking ${MODEL} for one improvement`);
  const plan = validate(await askModel(prompt), tree, cfg);
  logFor(repo, `plan: ${plan.title}`);

  // Dedupe: an equivalent open automation issue means we already have this queued.
  const openSame = (await gh(repo, `/issues?state=open&labels=${encodeURIComponent(cfg.label)}&per_page=100`)).some(
    (i) => normalizeTitle(i.title) === normalizeTitle(plan.title),
  );
  if (openSame) {
    logFor(repo, "skipped: an equivalent automation issue is already open");
    return { repo, outcome: "skipped", detail: "equivalent open issue" };
  }

  if (DRY_RUN) {
    logFor(repo, "dry run — not writing. Plan:");
    console.log(JSON.stringify(plan, null, 2).slice(0, 3000));
    return { repo, outcome: "skipped", detail: "dry run" };
  }

  // 1. Issue first, so the PR can close it.
  const issue = await gh(repo, "/issues", {
    method: "POST",
    body: {
      title: plan.title,
      body: plan.body + "\n\n---\n_Opened by the scheduled maintainer automation. A draft PR follows._",
      labels: [cfg.label],
    },
  });
  logFor(repo, `issue #${issue.number} created: ${issue.html_url}`);

  // 2. Branch + commit.
  const slug = plan.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const branch = `auto/${slug}-${Date.now().toString(36)}`;

  const blobs = [];
  for (const f of plan.files) {
    const b = await gh(repo, "/git/blobs", {
      method: "POST",
      body: { content: f.content, encoding: "utf-8" },
    });
    blobs.push({ path: f.path, sha: b.sha, mode: "100644", type: "blob" });
  }
  const newTree = await gh(repo, "/git/trees", {
    method: "POST",
    body: { base_tree: headSha, tree: blobs },
  });
  const commit = await gh(repo, "/git/commits", {
    method: "POST",
    body: { message: `${plan.title}\n\nCloses #${issue.number}`, tree: newTree.sha, parents: [headSha] },
  });
  await gh(repo, "/git/refs", {
    method: "POST",
    body: { ref: `refs/heads/${branch}`, sha: commit.sha },
  });
  logFor(repo, `branch ${branch} pushed`);

  // 3. Draft PR — a human still decides.
  const pr = await gh(repo, "/pulls", {
    method: "POST",
    body: {
      title: plan.title,
      head: branch,
      base,
      draft: true,
      body:
        plan.body +
        `\n\nCloses #${issue.number}\n\n---\n_Opened as a draft by the scheduled maintainer automation. ` +
        `Review before merging._`,
    },
  });
  logFor(repo, `draft PR #${pr.number} opened: ${pr.html_url}`);
  return { repo, outcome: "opened", detail: `issue #${issue.number}, PR #${pr.number}` };
}

/** config.repos, or the repo the workflow runs in when the list is empty/missing. */
function resolveTargets(cfg) {
  const raw = Array.isArray(cfg.repos) ? cfg.repos : [];
  const cleaned = raw
    .map((r) => String(r || "").trim())
    .filter(Boolean)
    .filter((r) => {
      const ok = /^[\w.-]+\/[\w.-]+$/.test(r);
      if (!ok) log(`ignoring malformed repo entry: ${JSON.stringify(r)} (expected "owner/name")`);
      return ok;
    });

  const list = cleaned.length ? cleaned : SELF_REPO ? [SELF_REPO] : [];
  if (!cleaned.length) {
    if (SELF_REPO) log(`config.repos is empty — falling back to this repository (${SELF_REPO})`);
    else log("config.repos is empty and GITHUB_REPOSITORY is unset — nothing to do");
  }

  const unique = [...new Set(list)];
  const cap = Number(cfg.maxReposPerRun) > 0 ? Number(cfg.maxReposPerRun) : unique.length;
  if (unique.length > cap) log(`capping run to ${cap} of ${unique.length} repo(s) (maxReposPerRun)`);
  return unique.slice(0, cap);
}

async function main() {
  if (!TOKEN) {
    console.error("[auto] no token: set AUTOMATION_TOKEN or GITHUB_TOKEN");
    process.exit(1);
  }

  const cfgFile = process.env.AUTOMATION_CONFIG || new URL("./config.json", import.meta.url);
  const cfg = JSON.parse(await readFile(cfgFile, "utf8"));
  if (!cfg.enabled) {
    log("config.enabled is false — nothing to do");
    return;
  }

  if (!LLM_KEY) {
    log("OPENAI_API_KEY is not set — add it under Settings > Secrets > Actions to turn this on.");
    log("exiting without changes.");
    return;
  }

  const targets = resolveTargets(cfg);
  if (!targets.length) {
    log("no repositories to process — exiting");
    return;
  }

  log(`run starting over ${targets.length} repo(s): ${targets.join(", ")}`);

  const results = [];
  for (const repo of targets) {
    try {
      results.push(await processRepo(repo, cfg));
    } catch (err) {
      const detail = err.message || String(err);
      logFor(repo, `FAILED — ${detail}`);
      results.push({ repo, outcome: "failed", detail });
    }
  }

  const opened = results.filter((r) => r.outcome === "opened");
  const skipped = results.filter((r) => r.outcome === "skipped");
  const failed = results.filter((r) => r.outcome === "failed");

  log("─".repeat(50));
  log(`summary: ${opened.length} opened, ${skipped.length} skipped, ${failed.length} failed`);
  for (const r of results) log(`  ${r.outcome.padEnd(7)} ${r.repo} — ${r.detail}`);

  if (failed.length && failed.length === results.length) {
    console.error("[auto] every repository failed");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[auto] " + (err.stack || String(err)));
  process.exit(1);
});
