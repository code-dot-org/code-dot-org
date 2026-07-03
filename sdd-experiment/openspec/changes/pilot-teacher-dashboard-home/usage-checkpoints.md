# Usage Checkpoints

Operating record for the usage governance rules of the
pilot-teacher-dashboard-home change. Every CEO/Opus agent start, phase
start, and handoff boundary records a row here.

Pause thresholds: Fable week >= 85% pauses orchestration; session
exhaustion pauses all model work. Fail closed if the Fable week
percentage or reset time is missing from `/usage` output.

Policy adaptation (recorded for transparency): subagents do not sleep
through a pause window themselves. On a triggered pause rule a subagent
records `budget_pause` here and returns control to the CEO agent, which
owns the sleep/recheck cycle. This keeps the single-monitor invariant
and avoids idle agents holding resources.

## Checkpoints

| # | UTC-ish time (local tz per /usage) | Agent / boundary | Session | Week (all) | Week (Fable) | Session reset | Week reset | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-07-03 (America/Los_Angeles) | CEO — pilot start | 3% | 45% | 6% | Jul 3, 7:30am | Jul 6, 9am | PASS — proceed |
| 2 | 2026-07-03 (America/Los_Angeles) | Opus — planning phase start | 7% | 45% | 7% | Jul 3, 7:30am | Jul 6, 9am | PASS — proceed |
| 3 | 2026-07-03 (America/Los_Angeles) | Opus — planning handoff | 17% | 47% | 7% | Jul 3, 7:29am | Jul 6, 8:59am | PASS — handoff to CEO gate |
| 4 | 2026-07-03 (America/Los_Angeles) | CEO — registry gate decision + Phase 2 delegation | 19% | 47% | 7% | Jul 3, 7:30am | Jul 6, 9am | PASS — proceed |
| 5 | 2026-07-03 (America/Los_Angeles) | Opus — Phase 2 start (scaffold) | 19% | 47% | 7% | Jul 3, 7:29am | Jul 6, 8:59am | PASS — proceed |
| 6 | 2026-07-03 (America/Los_Angeles) | Opus — Phase 2 handoff; PREFLIGHT FOR SONNET TASK 1 (hard gate) | 25% | 48% | 9% | Jul 3, 7:30am | Jul 6, 9am | PASS — Sonnet may start task 1 |
| 7 | 2026-07-03 (America/Los_Angeles) | Opus — Session A interim review; PREFLIGHT FOR SONNET SESSION B (tasks 3.1-3.2, 4.1-4.2, hard gate) | 30% | 48% | 9% | Jul 3, 7:29am | Jul 6, 8:59am | PASS — Sonnet may start Session B |
| 8 | 2026-07-03 (America/Los_Angeles) | Opus — Session B interim review; PREFLIGHT FOR SONNET SESSION C (tasks 5.1 + 6.1, hard gate) | 39% | 49% | 11% | Jul 3, 7:30am | Jul 6, 9am | PASS — Sonnet may start Session C |
