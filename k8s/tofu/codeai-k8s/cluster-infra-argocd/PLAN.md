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

You may commit and push to k8s-gitops to deploy changes as they require this. Just use the main
branch. start each commit message with "PLAN: ". Periodically look at all changes
done during the plan by looking in `git log` for PLAN messages to make sure you're not
ping-ponging things (do a diff between now and the commit before the first PLAN commit). 
On code-dot-org repo on the other hand, you shouldn't need to commit,
so you can always look at uncommitted changes to see the sum total of what we've changed.
Think systemically, and undo failed fixes. Note in NOTES.md.

NOTE: in a previous commit (today) we shifted ArgoCD app-of-apps to use a bootstrap app-of-apps/bootstrap.yaml
that points at an app-of-apps/app-of-apps.yaml applicationset. This is new! And suspect.
We used to just call that app-of-apps/applicationset.yaml, and it self-managed itself.
During this period, it appeared that argo would MOSTLY wait for all app-of-apps children to
be destroyed before returning to the tofu destroy that it was complete. Inspect this change
as a source of ideas. You can delete this note if you think you've fully mined this idea.

DO NOT WRITE A CLEANUP SCRIPT THAT JUST DELETES THINGS. The argo app-of-apps being deleted
should clean things up for you. FIX THAT. If that returns to tofu before its done
FIX THAT.

AFTER YOU MAKE A FIX: guess if I'm gonna be pissed about it being a hacky workaround. The
final fixes should be elegant, terse, and minimal. THINK BIG PICTURE.

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

WHEN YOU ARE DONE: notify me on slack that you completed with SUCCESS OR FAILURE
on each of apply/destroy being one-shot-completable now.

## Attention

If user attention is needed, notify me on slack with a note/question and keep working.
I can help if things are confusing, I have a lot of context you don't.
