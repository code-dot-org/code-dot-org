# Iteration Log Format

Each port produces an iteration log at
`agent-loop/logs/<scenario-slug>.iteration.md`.

## Required fields

```markdown
# Iteration Log: <Scenario Name>

**Source:** `<feature-file-path>` — scenario "<scenario name>"
**Test file:** `tests/<dir>/<file>.spec.ts`
**Date:** YYYY-MM-DD

## Attempt 1

**What was tried:** <brief description of the initial translation approach>
**Result:** PASS | FAIL
**Failure output (if any):**
```

<paste relevant Playwright error / stack trace here>

```
**What changed for next attempt:** <description of what was revised>

## Attempt 2

**What was tried:** <what was changed from attempt 1>
**Result:** PASS | FAIL
**Failure output (if any):**
```

<paste relevant Playwright error / stack trace here>

```
**What changed for next attempt:** <description of what was revised>

## Attempt 3 (final)

**What was tried:** <what was changed from attempt 2>
**Result:** PASS | FAIL — FIXME if still failing

## Outcome

PASSED on attempt N | FIXME (reason: <...>)
```

## Notes

- Omit attempt sections that were not reached (i.e., if the test passed on
  attempt 1, only include Attempt 1).
- For `test.fixme` outcomes, copy the fixme reason verbatim into the Outcome
  section.
- Keep each "What was tried" entry to 2–3 sentences. The goal is a reviewable
  record, not a novel.
