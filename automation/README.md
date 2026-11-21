# Scheduled maintainer automation

Runs on a cron schedule, independent of any chat session, and works through the repositories
listed in `automation/config.json`. For each repo it picks **one** small improvement, opens an
**issue** for it, then commits it on a branch and opens a **draft PR** that closes the issue.

## Add your repos

Edit `automation/config.json` and list every repository you want maintained, as `owner/name`:

```json
{
  "enabled": true,
  "repos": [
    "Nareshkumawat-star/LabelLens",
    "your-username/your-other-repo"
  ],
  "maxReposPerRun": 3
}
```

Rules:

- Both spellings matter: `owner/name`, exactly as it appears in the GitHub URL.
- Only put repos here that you own or can push to. A repo you cannot write to is logged as
  failed and the rest of the run continues.
- `maxReposPerRun` caps how many repos one run touches, so the job stays inside its time limit.
- If `repos` is empty or missing, the automation falls back to the repository the workflow is
  installed in — so a single-repo setup needs no config at all.

## Which token / scope is needed

The default `GITHUB_TOKEN` only works for **the repo the workflow runs in**. To write to the
other repos in your list, add a personal access token:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
   → **Generate new token**.
2. **Repository access:** *Only select repositories* → pick every repo in your `repos` list.
3. **Permissions:** *Contents* → Read and write, *Issues* → Read and write,
   *Pull requests* → Read and write.
4. Save it, then add it to the repo that hosts this workflow:
   **Settings → Secrets and variables → Actions → New repository secret**, name `AUTOMATION_TOKEN`.

The workflow uses `AUTOMATION_TOKEN` when present and falls back to `GITHUB_TOKEN` otherwise.

## Turn it on

1. Add the model key: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `OPENAI_API_KEY`
   - Value: your own API key (Freebuff: Account → Developer API)

   Without this secret the workflow runs, prints a notice and exits without changes.

2. Optionally set a variable: `AUTOMATION_MODEL` (default `gpt-4.1-mini`).

3. Trigger a first run by hand: **Actions → Auto improve (scheduled) → Run workflow** with
   `dry_run` checked, so you see the proposed plan for each repo and nothing is written.

## Turn it off

- Set `"enabled": false` in `automation/config.json`, or
- Remove repos from the `repos` list, or
- Disable the workflow in the **Actions** tab, or delete `.github/workflows/auto-improve.yml`.

## What one run does, per repo

1. Reads the repo tree, README, recent issues and recent commits.
2. Skips the repo cleanly if it is at `maxOpenAutomationPrs` open automation PRs, or if an
   equivalent open automation issue already exists.
3. Asks the model for one small, self-contained improvement.
4. Validates the plan, opens the **issue**, commits to `auto/<slug>-<id>`, opens a **draft PR**.
5. Any error in a repo is logged and the loop moves to the next repo. The job only fails when
   **every** repo failed.

## Guardrails

- PRs are always **drafts** — nothing merges without a human.
- Rate limited per repo by `maxOpenAutomationPrs`.
- Protected paths refused: `.github/`, lockfiles, env files, `automation/`.
- Proposed files must already exist in that repo; no invented paths, no `..`, no absolute paths.
- Size limited by `maxFilesPerPr` and `maxDiffLines`.
- `workflow_dispatch` defaults to `dry_run: true`.

## Scheduling

Default is every 6 hours (`0 */6 * * *`). GitHub disables scheduled workflows on repositories
with no activity for 60 days, and cron runs can be delayed during peak times.
