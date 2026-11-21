#!/usr/bin/env node
/**
 * Scheduled maintainer automation.
 *
 * One run:
 *   1. Reads recent history so it does not repeat itself.
 *   2. Asks a model for ONE small, self-contained improvement.
 *   3. Opens an issue describing it.
 *   4. Commits the change on a branch and opens a DRAFT pull request that closes the issue.
 *
 * Everything the model returns is untrusted input: file paths are checked against the
 * real repository tree, protected paths are refused, and size limits are enforced.
 * The PR is always a draft so a human decides what merges.
 */

import { readFile } from "node:fs/promises";

const GH = "https://api.github.com";
const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const LLM_KEY = process.env.OPENAI_API_KEY;
const LLM_BASE = process.env.OPENAI_BASE_URL || "https://freebuff.com/api/v1/paid";
const MODEL = process.env.AUTOMATION_MODEL || "gpt-4.1-mini";
const DRY_RUN = String(process.env.DRY_RUN || "").toLowerCase() === "true";

const log = (...a) => console.log("[auto]", ...a);

function fail(msg) {
  console.error("[auto] " + msg);
  process.exit(1);
}

function skip(msg) {
  log(msg);
  log("nothing to do; exiting cleanly");
  process.exit(0);
}

async function gh(path, { method = "GET", body } = {}) {
  const res = await fetch(GH + path, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "auto-improve",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data).slice(0, 400)}`);
  }
  return data;
}

/** Recursively list blob paths, capped so the prompt stays small. */
async function listTree(sha, limit = 400) {
  const out = [];
  const seen = new Set();
  const queue = [sha];
  while (queue.length && out.length < limit) {
    const tree = await gh(`/repos/${REPO}/git/trees/${queue.shift()}?recursive=0`);
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

async function readText(path, ref) {
  const res = await fetch(`${GH}/repos/${REPO}/contents/${path}?ref=${ref}`, {
    headers: {
      Accept: "application/vnd.github.raw",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "auto-improve",
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text.length > 20000 ? text.slice(0, 20000) : text;
}

function isProtected(p, patterns) {
  return patterns.some((rule) => (rule.endsWith("/") ? p.startsWith(rule) : p === rule));
}

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
  if (!res.ok) throw new Error(`model call failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
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

async function main() {
  if (!REPO) fail("GITHUB_REPOSITORY is not set");
  if (!TOKEN) fail("GITHUB_TOKEN is not set");

  const cfg = JSON.parse(await readFile(new URL("./config.json", import.meta.url), "utf8"));
  if (!cfg.enabled) skip("config.enabled is false");

  if (!LLM_KEY) {
    log("OPENAI_API_KEY is not set — add it under Settings > Secrets > Actions to turn this on.");
    log("exiting without changes.");
    return;
  }

  const [owner, repo] = REPO.split("/");
  const meta = await gh(`/repos/${REPO}`);
  const base = meta.default_branch;
  const headSha = (await gh(`/repos/${REPO}/git/ref/heads/${base}`)).object.sha;

  // Guardrail: don't pile up unattended PRs.
  const openPrs = await gh(`/repos/${REPO}/pulls?state=open&per_page=100`);
  const mine = openPrs.filter((p) => (p.labels || []).some((l) => l.name === cfg.label));
  if (mine.length >= cfg.maxOpenAutomationPrs) {
    skip(`${mine.length} automation PR(s) already open (limit ${cfg.maxOpenAutomationPrs})`);
  }

  const tree = await listTree(headSha);
  const readme = (await readText("README.md", base)) || "";
  const recentIssues = await gh(`/repos/${REPO}/issues?state=all&per_page=20`);
  const recentTitles = recentIssues.map((i) => `- ${i.title}`).join("\n");
  const recentCommits = (await gh(`/repos/${REPO}/commits?per_page=15`))
    .map((c) => `- ${c.commit.message.split("\n")[0]}`)
    .join("\n");

  const prompt = [
    `Repository: ${REPO}`,
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

  log(`asking ${MODEL} for one improvement in ${REPO}`);
  const plan = validate(await askModel(prompt), tree, cfg);
  log(`plan: ${plan.title}`);

  if (DRY_RUN) {
    log("DRY_RUN=true — not writing anything. Plan follows:");
    console.log(JSON.stringify(plan, null, 2).slice(0, 4000));
    return;
  }

  // 1. Issue first, so the PR can close it.
  const issue = await gh(`/repos/${REPO}/issues`, {
    method: "POST",
    body: {
      title: plan.title,
      body:
        plan.body +
        "\n\n---\n_Opened by the scheduled maintainer automation. A draft PR follows._",
      labels: [cfg.label],
    },
  });
  log(`issue #${issue.number} created: ${issue.html_url}`);

  // 2. Branch + commit.
  const slug = plan.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const branch = `auto/${slug}-${Date.now().toString(36)}`;

  const blobs = [];
  for (const f of plan.files) {
    const b = await gh(`/repos/${REPO}/git/blobs`, {
      method: "POST",
      body: { content: f.content, encoding: "utf-8" },
    });
    blobs.push({ path: f.path, sha: b.sha, mode: "100644", type: "blob" });
  }
  const newTree = await gh(`/repos/${REPO}/git/trees`, {
    method: "POST",
    body: { base_tree: headSha, tree: blobs },
  });
  const commit = await gh(`/repos/${REPO}/git/commits`, {
    method: "POST",
    body: {
      message: `${plan.title}\n\nCloses #${issue.number}`,
      tree: newTree.sha,
      parents: [headSha],
    },
  });
  await gh(`/repos/${REPO}/git/refs`, {
    method: "POST",
    body: { ref: `refs/heads/${branch}`, sha: commit.sha },
  });
  log(`branch ${branch} pushed`);

  // 3. Draft PR — a human still decides.
  const pr = await gh(`/repos/${REPO}/pulls`, {
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
  log(`PR #${pr.number} opened: ${pr.html_url}`);
}

main().catch((err) => fail(err.stack || String(err)));
