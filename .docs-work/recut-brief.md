# Wave 1 recut brief

You are the editor recutting the **[DOMAIN]** pages of the CodeAI (studio.code.org) documentation so that they read like the best product help on the web. Repo: /var/home/sliang/git-workspaces/code-dot-org-full. You do not re-investigate the product; the facts are already in the pages and their evidence files. You may run the existing journeys and add screenshots. The dashboard at http://localhost-studio.code.org:3000 is long-running and shared: never start, stop, or restart it.

## The problem you are fixing
The user reviewed the first drafts and said: "it reads like a code report rewritten for humans" and "users want to solve a problem, not see the features." The pages were cut per inventory item and written from the implementation outward: they open by defining the object, enumerate every option in a table, end with flat outcomes ("You are taken to your home page"), and split what a reader experiences as one moment across many pages, or pile several outcomes into one "settings" page.

## Read first
1. `.docs-work/domains.md`: the "Reader first", "Page shape", "Terminology", and "Style" conventions are binding.
2. `.docs-work/raw/style-samples.md`: the "Observed patterns" section (real pages from GitHub Docs, Microsoft Support, GOV.UK, GitLab, Google help, Stripe).
3. `.docs-work/domains/[DOMAIN]/plan.md` and `report.md`.
4. Every page under [PAGE DIRS] and its evidence file under `.docs-evidence/` at the same path.
5. `docs/README.md` for commands. `frontend/packages/e2e-tests/docs-journeys/helpers.ts` (the `docsScreenshot` helper now takes `{locator}` to crop to one control, or `{fullPage: true}`).
6. Load the `github-docs` skill before writing (and `govuk` for any page that helps a reader decide; `microsoft-writing-style` for support tone).

## Calibration example
Before (current opening of "Change your settings"): "You can change your display name, email address, password, and interface preferences from your account settings. 1. Select your name in the top-right corner of any page. 2. Select Settings. 3. Make your changes."

After, as its own page titled "Change your display name":

> Your display name is the name your teacher sees on the roster and the name shown on projects you share. If it is misspelled or you would rather use a nickname, you can change it any time.
>
> 1. Select your name in the top-right corner, then select **Settings**.
> 2. Under **Display name**, type the new name.
> 3. Select **Save**.
>
> If your teacher created your account, your teacher manages your name. Ask them to change it, or [switch to your own account](/students/account/upgrade-to-a-personal-account/).

Notice: the title is an imperative naming one outcome; the opening tells the reader what this thing is to them and when they would change it; the steps name real controls; the limitation appears where it blocks the reader; the page is short.

## What to do
1. **Recut boundaries.** Merge pages that are one moment for the reader; split pages that hold several outcomes (a settings page becomes one page per outcome). Titles are imperatives for tasks, nouns for concepts and reference, and troubleshooting titles lead with the symptom. Group pages in directories named for the reader's task group, not the feature. Aim for fewer, clearer pages overall, but never fewer outcomes covered.
2. **Rewrite every page** to the page shape: situation and why/when, prerequisites, one primary path with real UI labels in bold, "If you..." subsections for variants, "Optional:" for optional work, a short "Next steps" or "Related" list of two to four links. Say why a step matters when it is not obvious. Warm, direct, plain; second person; short sentences for students; never childish, never chatty, no marketing words, no "This guide", no summaries that repeat the steps. Read every page aloud in your head as the person it is for.
3. **Facts.** Keep only claims the evidence file supports (VERIFIED, OBSERVED, STRONGLY_SUPPORTED). Do not add claims. If a rewrite needs a fact the evidence lacks, leave it out and list it in your report. You may confirm a UI label by running the domain's existing journey specs (`cd frontend && yarn workspace @code-dot-org/e2e-tests docs:journeys`).
4. **Screenshots.** The user wants readers to be able to recognize controls. Add a screenshot where a step names a control that is hard to find or easy to confuse: prefer a crop of the control itself via `docsScreenshot(page, '<audience>/<...>/<page>.md', '<name>', {locator})`, placed inline right after the step that mentions it, with alt text that says what it shows. Budget: roughly one image per three pages; each must earn its place. Never a hero image. Extend an existing journey spec rather than writing a new one where you can. A journey that cannot run gets no image.
5. **Evidence and links.** Keep evidence parity: create, merge, or delete evidence files to match the new pages, carrying `sources`, `routes`, `flags`, `journey`, `verification`, and `screenshots` forward; add new screenshots to `screenshots`. Fix every intra-domain link (absolute site paths, trailing slash, no `.md`, no `/docs/`). Record every moved, merged, or split page in `.docs-work/domains/[DOMAIN]/renames.md` as `old site path -> new site path` so the orchestrator can fix links from other domains. Do not edit pages outside your directories.
6. **Verify.** `cd docs/site && nvm use && npm run build && npm run evidence:check` must pass before you finish.

## Usage
Run `/var/home/sliang/.claude/skills/usage-guard/check-usage.sh` at start and end; stop at >= 90 on any window, save state, and end your report with `USAGE BREACH: <window> <pct>%`. Do not spawn subagents.

## Report (chat, under 350 words)
Pages before and after (counts and the new tree), the renames file path, screenshots added and what each shows, facts you wanted but the evidence lacked, and anything in the conventions that fought the material. Do not paste page contents.
