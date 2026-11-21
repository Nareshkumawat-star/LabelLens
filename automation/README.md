# Scheduled maintainer automation

Runs on a cron schedule, independent of any chat session. Each run picks **one** small
improvement, opens an **issue** for it, then commits it on a branch and opens a **draft PR**
that closes the issue.

## Turn it on

1. Add the model key: repository **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `OPENAI_API_KEY`
   - Value: your own API key (Freebuff: Account → Developer API)

   Without this secret the workflow runs, prints a notice and exits without changes.

2. Optionally set a variable under **Settings → Variables**:
   - `AUTOMATION_MODEL` — model name (default `gpt-4.1-mini`)

3. Trigger a first run by hand: **Actions → Auto improve (scheduled) → Run workflow**, with
   `dry_run` checked to see the plan without writing anything.

## Turn it off

- Set `"enabled": false` in `automation/config.json`, or
- Disable the workflow in the **Actions** tab, or
- Delete `.github/workflows/auto-improve.yml`.

## Guardrails

- PRs are always **drafts** — nothing merges without a human.
- Rate limited: stops when `maxOpenAutomationPrs` labelled PRs are already open.
- Protected paths are refused: workflows, lockfiles, env files, `automation/`.
- Proposed files must already exist in the repo; no invented paths, no `..`, no absolute paths.
- Size limited by `maxFilesPerPr` and `maxDiffLines` in `automation/config.json`.

## Scheduling

Default is every 6 hours (`0 */6 * * *` in `.github/workflows/auto-improve.yml`). Note that
GitHub disables scheduled workflows on repositories with no activity for 60 days, and cron
runs can be delayed during peak times.
