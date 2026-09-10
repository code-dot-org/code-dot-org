# 14 — Engineer: red Drone build

**Verdict: PARTLY**

## Path taken
- CodeAI Documentation (home) — start
- Testing (Developers > Operations) — 1 click (partially answered)
- Search "flake" — 2 false-positive results (substring matches in unrelated content)
- Search "Drone rerun" — 0 results
- Delivery (via search) — dead end, no new information

## Answering sentence
"Your PR is red on Drone and you need to know which suite failed, or you want to run one test file before pushing." — followed by per-suite one-file commands. For retries: "Retries are 2 under automated providers (Drone, GitHub Actions, DTT), 0 locally." For "what's the process if it's a known flake": none found.

## Confusion points
- Page opens by naming the exact situation ("Your PR is red on Drone...") then never resolves the flake-vs-real-break question it raised.
- "Next steps" links to Test API and Delivery. Expected: a link to a flaky-test tracker, a Slack channel, or a "build is red, now what" decision guide.
- Retry fact ("Retries are 2 under automated providers") is buried in the Playwright e2e section specifically, not called out as general CI behavior.
- Search for "flake" returned false positives (substring matches in bash snippets). No real content on flaky tests anywhere.
- Search for "Drone rerun" returned 0 results. No page about restarting a Drone build.

## Screenshots
None. Missing: screenshot of the Drone UI showing a "Restart" button — exactly what an engineer staring at a red PR needs.

## Product test
Not applicable. CI/developer-workflow question, nothing to verify in the product.

## Three wishes
1. "Tell me how to tell a flake from a real break (e.g., check if this test failed on other recent PRs, or link to a flaky-test tracker)."
2. "Point Next steps to a known-flakes process or Slack channel."
3. "Show how to rerun the actual Drone build (the Restart button in the Drone UI), not just how to run a test locally."
