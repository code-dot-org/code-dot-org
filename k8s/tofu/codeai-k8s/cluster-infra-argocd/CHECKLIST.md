# Checklist

- [ ] Before the next tofu operation, rewrite this file for the current hypothesis.
- [ ] After the tofu operation completes, inspect the latest per-run `logs/tofu-*.log`.
- [ ] Compare tofu timing to Kubernetes event timing in that same log.
- [ ] Check Argo app health and sync state against the current success condition.
- [ ] Run `bin/check-phase-deployment-status`.
- [ ] If the run failed, identify the simplest systemic fix before starting the next cycle.
- [ ] If a fix is made, append a note to `NOTES.md` and then rewrite this checklist for the next run.
