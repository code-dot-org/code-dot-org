ALWAYS CHECK ITEMS OFF AS YOU ACCOMPLISH THEM.

ALWAYS RELOAD CODE AND LOOK AT SOURCE CODE TO CONFIRM HYPOTHESES.

YOU MAY DOWNLOAD OTHER PROJECT SOURCE CODE TO CONFIRM.

ALWAYS CHOOSE THE SMALLEST ARCHITECTURAL AND KISS AND SHORT CHANGE TO TRY FIRST WHEN IN DOUBT.

You can always escalate later, I don't want to come back to everything fucked. If you think
a previous fix was overkill or you get a new idea, undo the previous idea and try something
new. Do not layer trash on trash, if something didn't help UNDO IT.

Whenever you start a new `tofu apply` or `tofu destroy`, look at NOTES.md for the previous
apply/destroy (respectively), to see if that change actually worked. And do that when you
finish to see if it worked too!

Remember: if a previous phase (apply/destroy) didn't finish cleanly, that might mess up the next (destroy/apply). 
Don't index too hard on these as far as systemic fixes.

# cluster-infra-argocd apply/destroy loop

## Goal

Make this module converge in both directions:

1. `tofu apply` must end with every Argo app healthy except the `codeai-*`
   apps, which are out of scope for now. `bin/check-phase-deployment-status`
   must report every expected workload present. It is acceptable if `tofu
   apply` returns before all workloads are ready, as long as they become ready
   shortly after and the post-run checks pass.
2. `tofu destroy` must end with the Argo apps gone and the workloads from
   `bin/check-phase-deployment-status` reported as `missing`. Within 1 minute of
   `tofu destroy` completing, the script must show everything gone.

## Loop

Work in repeated `apply -> destroy -> apply -> destroy` cycles.

After each `destroy`, diagnose, fix, and clean up on your own so the next `apply` starts from
the cleanest state possible. Do automatic residue cleanup as needed. Do not ask for
cleanup. 

After each cycle:

- decide whether the relevant success condition above is true
- if not, analyze the latest per-run tofu log, compare tofu timing to
  Kubernetes event timing, and look for the simplest systemic fix in this
  directory and in `~/src/k8s-gitops/apps/**`
- prefer fixes that improve the next run, not one-off hand repair

## Evidence

Use the latest per-run `logs/tofu-*.log` file as the primary trace. Compare:

- Tofu step timing
- post-apply or post-destroy wait timing
- `kubectl get events -A --watch-only --output-watch-events` timing in the same
  log
- Argo app health/sync timing
- workload presence or absence from `bin/check-phase-deployment-status`

Think in terms of ordering, ownership, and delayed controller behavior.

## Change discipline

Every time a code or manifest change is made:

- append an entry to `NOTES.md`
- include the current timestamp
- include the per-run deploy log filename that motivated the change
- state the reasoning for the change
- state what should be different on the next run and what to watch for

Every time a change is made:

- rewrite `CHECKLIST.md` into a fresh post-run checklist for the very next tofu
  operation
- make the checklist specific to the current hypothesis
- check items off as they are completed
- do not start the next apply/destroy cycle until the checklist is empty

## If you destroy a resource created in the previous phase (../cluster-infra/)

You may run tofu apply there and recreate it. Try not to delete it again.

## Stop conditions

Stop running only when one of these is true:

1. both a clean destroy and a full apply have succeeded in the same cycle
2. both directions are still failing and there are no new systemic fix ideas to
   try; record that clearly in this file before stopping

## Attention

If user attention is needed, send a Slack note and keep working.

