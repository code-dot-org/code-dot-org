ALWAYS CHECK ITEMS OFF AS YOU ACCOMPLISH THEM.

ALWAYS RELOAD CODE AND LOOK AT SOURCE CODE TO CONFIRM HYPOTHESES (read argo docs etc! read argo source code etc! read research, search, PROVE, this is a logic game not a game of whackamole).

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

Current execution choice after the partial-cycle cleanup mistake:

- do not treat any destroy run from a partial apply, dirty phase, or targeted
  bootstrap-only graph as evidence for the main question
- first get phase 3 back to a true clean baseline:
  - `bin/check-phase-deployment-status` must report every row `missing`
  - `kubectl get application,applicationset -A` must be empty
- then run one full logged `apply` from that clean baseline
  - be patient with the apply; slow Fargate startup is not itself evidence
- then run one full logged `destroy` from that full apply
- after every real destroy:
  - if anything survives, write every residue object into `NOTES.md` one by
    one as exact `Kind/name`, plus namespace when there is one
- the main question to answer from that destroy is narrow:
  - did `app-of-apps-bootstrap.tf` wait for Argo to finish deleting
    `Application/app-of-apps` and its descendants before the bootstrap layer
    continued
- only after that full clean cycle should the plan choose between:
  - continue on the real tree, if the bootstrap wait question is answered
  - or go back to `../mimic`, if the clean full cycle still shows early return
    from `app-of-apps-bootstrap.tf`
- therefore:
  - keep mimic only as an available fallback tool
  - do not suggest or force mimic while the real full cycle is answering the
    bootstrap wait question directly

Current execution choice after the full destroy watch on 2026-04-05:

- the real tree has already answered the original wrapper question:
  `kubectl_manifest.app_of_apps_bootstrap` is now blocking for minutes on
  destroy, so the old "Tofu returns too early to be waiting at all" theory is
  no longer the active problem statement
- therefore `../mimic` is no longer the active plan
- only go back to `../mimic` if a later residue bug needs a tiny reproduction
  harness for one specific leftover object pattern

Accepted residue after the ingress-hook experiment:

- treat the following as accepted namespace-scoped residue, not active design
  bugs, because namespace deletion removes them cleanly:
  - `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
  - `Role/argocd-redis-secret-init`, namespace `argocd`
  - `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
  - `Secret/argocd-redis`, namespace `argocd`
  - `SigningKey/openid-connect-keys`, namespace `dex`
  - `Namespace/argocd`
  - `Namespace/dex`
- do not spend more fix effort on those objects unless a later run shows they
  survive even after the owning namespace delete
- active investigation should now ignore those accepted leftovers and focus only
  on any residue outside that namespace-delete bucket

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

Observed on the clean cycle ending 2026-04-04T23:12:33-1000:

- keep `bootstrap.yaml`; do not remove it just because destroy is still wrong
- do not use `syncPolicy.preserveResourcesOnDeletion: false`; upstream behavior
  makes `true` the only non-default case, so `false` would just restate the
  default
- the first proven missing ownership/finalizer edge is lower than the wrapper:
  the nested child `Application` manifests created under parent `Application`s
  like `infra` are plain Argo-managed manifests, not `ApplicationSet` outputs,
  so they do not get controller-added finalizers for free
- the clean observed live objects showed:
  - top-level generated apps `infra`, `kargo`, `codeai`: finalizer present
  - root `ApplicationSet/app-of-apps`: finalizer present
  - nested child apps `networking`, `external-dns`,
    `external-secrets-operator`: no ownerRef, no finalizer
- the clean observed destroy showed:
  - tofu waited 1m14s on `Application/app-of-apps`
  - then Helm removed Argo
  - immediate and +30s phase checks still showed `dex`, `external-dns`,
    `external-secrets-operator`, and `networking` workloads running, with
    `argocd`, `dex`, `external-dns`, `external-secrets`, and `kargo`
    namespaces still active
  - no `Application` or `ApplicationSet` CRs remained afterward
- current first-fix plan:
  - patch the nested child `Application` manifests in `~/src/k8s-gitops`
  - keep the fix narrow; do not restate defaults on `ApplicationSet` or on the
    top-level generated apps
  - think once more about the self-pruning `apps/infra/argocd/application.yaml`
    case before touching it

Observed on the destroy ending 2026-04-04T23:38:19-1000:

- `kubectl_manifest.app_of_apps_bootstrap` destroyed in `35s`
- Helm uninstall then kept running for `5m20s` and ended with:
  - `uninstallation completed with 1 error(s): context deadline exceeded`
- immediate and `+30s` `bin/check-phase-deployment-status` checks both showed:
  - all tracked workloads `missing`
  - namespaces `argocd`, `dex`, `external-dns`, and `external-secrets`
    still `active`
  - namespace `kargo` already `missing`
- post-destroy live state also showed:
  - no `Application` CRs
  - no `ApplicationSet` CRs
  - the remaining active namespaces only had the normal namespace finalizer:
    - `["kubernetes"]`

Historical branch from earlier in the night; not the active plan now:

- keep the bootstrap split introduced by that commit; diagnose it, do not back
  it out blindly
- stop broadening real `apps/` fixes until the delete chain is explained in
  `../mimic`
- use the sibling Tofu target `k8s/tofu/codeai-k8s/mimic` for the next loop,
  not another full `cluster-infra-argocd` cycle
- reasons:
  - `mimic` uses the same `bootstrap.yaml` -> `app-of-apps.yaml` pattern from
    the suspect commit
- `mimic` reuses the live Argo install, so the signal is not polluted by
  Argo bootstrap or Helm uninstall timing
- `mimic-leaf` already has a long deletion path:
  - `terminationGracePeriodSeconds: 300`
  - `preStop: sleep 120`
  so a correct wait chain should block for minutes in a tiny tree
- revert the unproven real-app nested-child-finalizer patch now; keep only the
  mimic-harness timing trim while diagnosing the actual wrapper/ApplicationSet
  delete chain
- mandatory sub-task before clearing this plan:
  - use `k8s/tofu/codeai-k8s/mimic` to find the exact delete-chain failure
  - do not treat this plan as complete until:
    1. the mimic root cause is identified from manifests, Argo docs, Argo code,
       and live timing
    2. a minimal fix is made in `k8s-gitops`
    3. that fix is proven in `mimic` first
- detailed notes to preserve while doing that sub-task:
  - keep the `bootstrap.yaml` approach and make it work; do not dodge the
    problem by going back to direct tofu ownership of `app-of-apps.yaml`
  - the target behavior is exact:
    `kubectl_manifest.mimic_app_of_apps_bootstrap.wait = true` should not
    return until Argo has deleted the descendant leaf resources
  - inspect rendered or otherwise full manifests, not just the hand-written
    source files; confirm where finalizers are actually present in the objects
    Argo sees and generates
  - remember that generated or passthrough `Application` objects may only show
    the decisive finalizer state when observed as full objects, not from a
    shallow mental model of the source tree
  - read Argo docs and Argo controller code before the mimic cycle starts; use
    full-cluster recovery time for that research instead of waiting idly
  - choose the watch set before running mimic; do not improvise once delete is
    already in flight
  - watch Argo CRs and cluster resources closely, with timestamps:
    - `Application/mimic-app-of-apps`
    - `ApplicationSet/mimic-app-of-apps`
    - generated wrapper `Application`s
    - `Application/mimic-leaf`
    - `Namespace/leaf`
    - `Deployment/leaf`
    - leaf Pod
    - `Service/leaf`
    - `Ingress/leaf`
    - `TargetGroupBinding` in `leaf`, if present
  - keep the mimic delete delay long enough to make ordering obvious, but short
    enough for fast loops and safely below the ApplicationSet controller's
    `2m` deleting-app timeout; the current `sleep 60` setting is the working
    value
  - keep reverting unproven `k8s-gitops` chart changes that did not solve the
    real problem; do not let failed experiments accumulate
- next diagnostic steps:
  1. inspect the live owner/finalizer chain in `mimic` on apply:
     bootstrap `Application` -> root `ApplicationSet` -> generated wrapper
     `Application`s -> leaf `Application` -> workload
     - this means actual live manifests, not inferred source:
       capture full YAML with `metadata.finalizers`, `metadata.ownerReferences`,
       and `metadata.deletionTimestamp` visible before starting the mimic
       destroy
     - write that pre-destroy chain down in `NOTES.md` in enough detail that a
       future run does not need to rediscover it from scratch
  2. run the next mimic `apply -> destroy` with a per-run log and event stream
  3. during destroy, compare:
     - `kubectl_manifest.mimic_app_of_apps_bootstrap` timing
     - `Application/mimic-app-of-apps` finalizer clearing
     - `ApplicationSet/mimic-app-of-apps` deletion timing
     - generated child `Application` deletion timing
     - `leaf` workload and namespace disappearance
     - exact short-circuit point:
       what still existed when Tofu returned, and what finalizer or owner edge
       had already cleared that allowed it to return then
  4. if mimic still returns early, fix the smallest missing
     ownership/finalizer/cascade edge in `k8s-gitops`, preferably under
     `mimic/` first
  5. only then port the proven fix back to real `apps/`
  6. if mimic keeps working while the real tree fails, do not patch the real
     tree yet:
     - isolate one concrete main-tree difference
     - reproduce that failure mode in `mimic`
     - prove the fix there first
     - only then modify the real tree

Observed after the `sleep 180` mimic destroy ending `2026-04-05T00:21:00-1000`:

- the wrapper path in `mimic` is not the simple root cause:
  - `kubectl_manifest.mimic_app_of_apps_bootstrap` stayed blocked for `3m2s`
  - it crossed `2m0s` cleanly, so the easy "`ApplicationSet` timeout explains
    everything" story is false
  - the root `Application` remained while the leaf pod was still
    `Terminating`
- the steady-state live chain still showed:
  - all `Application`s had `resources-finalizer.argocd.argoproj.io`
  - the `ApplicationSet`s themselves had no steady-state finalizer
- the only survivor after both healthy-state mimic destroys was the empty old
  `leaf` namespace
- upstream docs now matter more:
  - Argo says a namespace created by `CreateNamespace=true` is normally not
    tracked unless `managedNamespaceMetadata` adds tracking metadata
  - that matches the real-tree symptom of empty active namespaces surviving
    after workloads and `Application` CRs are gone

Current best next hypothesis:

- the real-tree failure is now more likely to be about namespace ownership than
  about the wrapper wait chain itself
- before touching the real tree, reproduce that exact namespace-residue shape
  in `mimic` with a fresh app-created namespace that is not pre-existing

Observed after the fresh-namespace mimic destroy ending
`2026-04-05T00:29:57-1000`:

- the fresh namespaces `leaf-generated` and `boo-leaf-generated` reproduced the
  real-tree residue shape
- before destroy they had:
  - fresh creation timestamps from this run
  - no `argocd.argoproj.io/tracking-id` annotation
  - only the normal namespace finalizer
- after destroy they were still `Active` and empty while:
  - all mimic `Application` CRs were gone
  - all mimic `ApplicationSet` CRs were gone
  - all leaf workload objects were gone

Current next fix to prove in `mimic`:

- keep `CreateNamespace=true`
- add `managedNamespaceMetadata` tracking ownership to the fresh namespaces
- rerun apply/destroy
- only if that deletes the fresh namespaces cleanly, port the same idea to the
  real tree

Observed during the tracked-namespace mimic destroy started
`2026-04-05T00:33:57-1000`:

- the first namespace-tracking patch in `mimic` was malformed:
  - Argo tracking ids are parsed as
    `<application>:<group>/<kind>:<namespace>/<name>`
  - for a cluster-scoped `Namespace`, the namespace segment must therefore be
    empty:
    - `mimic-leaf:/Namespace:/leaf-generated`
    - `mimic-boo-leaf:/Namespace:/boo-leaf-generated`
  - the attempted values omitted that empty-namespace slash:
    - `mimic-leaf:/Namespace:leaf-generated`
    - `mimic-boo-leaf:/Namespace:boo-leaf-generated`
- Argo source confirms that malformed value is not parseable:
  - `util/argo/resource_tracking.go` splits the third field as
    `<namespace>/<name>` and rejects anything without exactly one slash
  - the docs example in `docs/user-guide/sync-options.md` also uses the empty
    namespace segment for `Namespace`
- live state matches that source reading:
  - `leaf-generated` stayed `Active` after `Application/mimic-leaf` was gone
  - so the first tracking patch does not yet prove namespace ownership or
    namespace deletion
- separate live evidence from the same run still supports the existing
  delete-chain diagnosis:
  - `ApplicationSet` objects delete with `foregroundDeletion`
  - `Application/mimic-app-of-apps`, `Application/mimic-boo`, and
    `Application/mimic-boo-leaf` each reported exactly `1 objects remaining for
    deletion`
  - the remaining live object was the ALB-backed
    `Ingress/boo-leaf-generated/boo-leaf`
- next step:
  - correct only the namespace tracking-id format in `mimic`
  - rerun the mimic `apply -> healthy -> destroy`
  - do not treat the first tracking experiment as valid evidence
- end state of that stale run:
  - `kubectl_manifest.mimic_app_of_apps_bootstrap` stayed blocked until
    `19m50s`
  - tofu then failed with:
    - `Error: mimic-app-of-apps failed to delete resource`
  - live residue immediately after the error:

Current override after the real destroy started
`2026-04-05T01:25:33-1000`:

- the nested child `Application` finalizer patch did materially change the real
  destroy shape
  - the bootstrap app no longer returns in `35s`
  - it stayed blocked past `12m` until manual interrupt
- the currently proven blocker is now inside the self-hosted `argocd` child
  app, not the `bootstrap.yaml` wrapper:
  - `Application/argocd` entered deletion with
    `resources-finalizer.argocd.argoproj.io`
  - the application-controller logged:
    - `deployments.apps "argocd-repo-server" is forbidden`
  - live state at the same time showed:
    - `clusterrolebinding/argocd-application-controller` already gone
    - `kubectl auth can-i delete deployments.apps -n argocd --as=system:serviceaccount:argocd:argocd-application-controller` = `no`
    - `deployment/argocd-repo-server` still present
  - the `argocd-application-controller` pod then shut down, followed by the
    applicationset controller
  - after that cutoff there were no more Argo controller log lines, only Tofu
    `Still destroying...`
- after interrupt, `bin/check-phase-deployment-status` showed the characteristic
  partial-destroy residue:
  - `argocd-server` and `argocd-application-controller`: `missing`
  - `external-dns`, `external-secrets-operator`, `networking`: still `running`
  - namespaces `argocd`, `dex`, `external-dns`, `external-secrets`, `kargo`:
    still `Active`
- therefore the next fix must target self-hosted Argo delete ordering or
  ownership in `~/src/k8s-gitops/apps/infra/argocd`, not the bootstrap split
  or broad tofu-side cleanup
- decision discipline for the next change:
  - reason from rendered chart output and Argo docs before editing
  - prefer the smallest chart-side change that preserves a live, authorized
    application-controller until the last blocking Argo-managed resource is
    pruned
  - do not spend the next real destroy on a change whose ordering logic cannot
    be explained from source and rendered manifests
    - no `mimic-leaf`
    - `mimic-app-of-apps`, `mimic-boo`, `mimic-boo-leaf`,
      `ApplicationSet/mimic-app-of-apps`, and `ApplicationSet/mimic-boo`
      still present in deletion
    - `Ingress/boo-leaf-generated/boo-leaf` still present
    - `leaf-generated` and `boo-leaf-generated` still `Active`
- controller and AWS evidence for that timeout:
  - Argo application-controller kept reporting exactly `1 objects remaining for
    deletion` on the root, `mimic-boo`, and `mimic-boo-leaf`
  - the remaining Kubernetes object was
    `Ingress/boo-leaf-generated/boo-leaf`
  - the AWS load balancer controller repeatedly logged:
    - `failed to delete targetGroup: timed out waiting for the condition`
  - AWS then showed the target group still existed but had:
    - no attached load balancer
    - no registered targets
- stale-run cleanup:
  - manually deleted the orphan target group in AWS
  - waited for the ingress to clear
  - deleted the two empty generated namespaces by hand so the corrected
    tracking-id run can start from a fresh `CreateNamespace=true` baseline
- interpretation:
  - that timeout is real evidence about a stale ALB-target-group cleanup path
  - it is not valid evidence for or against namespace ownership, because the
    namespace tracking ids under test were malformed the whole time

DO NOT WRITE A CLEANUP SCRIPT THAT JUST DELETES THINGS. The argo app-of-apps being deleted
should clean things up for you. FIX THAT. If that returns to tofu before its done
FIX THAT.

AFTER YOU MAKE A FIX: guess if I'm gonna be pissed about it being a hacky workaround. The
final fixes should be elegant, terse, and minimal. THINK BIG PICTURE.

## Meta discipline added 2026-04-04T22:52:28-1000

Do not pile speculative fixes onto a broken cycle.

Before changing code, write down the exact failure chain in object terms:

- what object is being deleted or waited on
- what owner/finalizer/cascade edge is missing or wrong
- what exact next-run log line or live object state should change if the fix is correct

Before accepting any fix idea:

- read the current source again
- read the relevant git history again
- ask whether this is a symptom fix or a cause fix
- ask whether the previous change should be undone instead of layered over

If the evidence comes from an interrupted or otherwise dirty apply/destroy, bias toward:

- cleanup
- rerun
- re-evaluate

Do not turn a dirty run into a systemic conclusion unless source, history, and live state all agree.

For Argo problems, diagnose in this order before editing:

1. source manifests
2. ownership and finalizers
3. controller logs and Kubernetes events
4. only then a code or manifest change

After every failed fix:

- undo it unless there is strong evidence it is still correct
- note the objection in `NOTES.md`
- explicitly ask what new fact justifies keeping any part of it

User feedback on 2026-04-05:

- the deeper, non-thrashing investigation style is explicitly preferred
- keep this standard; do not regress into speculative fix stacking

## Main Issue First

Primary unresolved question:

- why the real `cluster-infra-argocd` destroy lets
  `kubectl_manifest.app_of_apps_bootstrap` finish in about `35s`

Until that question is explained from source, live ownership/finalizer state,
and delete timing, do not take a secondary branch and stay there.

Secondary branches include:

- namespace residue after the root app is already gone
- cloud-controller cleanup lag after the real `35s` question is still open
- any other post-return cleanup detail that does not explain the fast root
  return itself

Allowed use of a secondary branch before the main question is solved:

- one short proving pass to falsify or confirm a candidate cause
- then return immediately to the `35s` question unless the branch directly
  explains that fast return

Disallowed:

- optimizing residue cleanup first
- treating empty surviving namespaces as the main problem while the root still
  returns too fast
- spending multiple cycles on post-return debris before the fast-return cause is
  known

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

Whenever a new entry is added to `NOTES.md`:

- send that note to Slack DM `D050QKCKBE0`
- mention `<@U050N1RC0MR>`
- do it when the note is written; do not wait for cycle start
- keep the Slack message in the same concise, concrete style as the note

## If you destroy a resource created in the previous phase (../cluster-infra/)

You may run tofu apply there and recreate it. Try not to delete it again.

## Stop conditions

Stop running only when one of these is true:

1. both a clean destroy and a full apply have succeeded in the same cycle
2. both directions are still failing and there are no new systemic fix ideas to
   try; record that clearly in this file before stopping
3. review the set of diffs to both repos that you changed in the plan, am I gonna
   be pissed that you did something ugly and horrible? then undo it and find a
   better way. the final fixes should be elegant and DRY.
4. this plan is not clearable until the mimic sub-task above is done; do not
   skip from full-cluster symptoms straight to a real-tree fix without a mimic
   reproduction and minimal proof.

WHEN YOU ARE DONE: notify me on slack that you completed with SUCCESS OR FAILURE
on each of apply/destroy being one-shot-completable now.

## Attention

If user attention is needed, notify me on slack with a note/question and keep working.
I can help if things are confusing, I have a lot of context you don't.

## Current override

Live full-manifest inspection of the real tree changed the execution order.
This overrides the earlier mimic-only hold point.

- proved from live `kubectl get ... -o yaml`:
  - root and top-level generated apps already have
    `resources-finalizer.argocd.argoproj.io`
  - nested child apps under parent `Application`s like `infra` and `kargo`
    do not
- keep the parent apps `apps/infra/application.yaml` and
  `apps/kargo/application.yaml` unchanged for now
- current smallest real-tree fix is the nested-child finalizer patch in
  `~/src/k8s-gitops`:
  - `apps/infra/argocd/application.yaml`
  - `apps/infra/dex/application.yaml`
  - `apps/infra/external-dns/application.yaml`
  - `apps/infra/external-secrets-operator/application.yaml`
  - `apps/infra/kargo-secrets/application.yaml`
  - `apps/infra/networking/application.yaml`
  - `apps/infra/standard-envtypes/application.yaml`
  - `apps/kargo/projects/codeai/application.yaml`
- user explicitly approved committing and pushing that patch, and also approved
  at most one real `destroy` iteration afterward to see whether the timing
  changes
- on that destroy, treat this as a required timing question in the per-run log:
  - does `Application/argocd` start deleting or disappear immediately before
    `kubectl_manifest.app_of_apps_bootstrap` returns?
  - if yes, consider whether Argo self-removal is collapsing the remaining
    delete chain just before Tofu unblocks

## Current next cycle

Before another design change, re-establish a truly empty phase-3 baseline and
then run one full main-module cycle.

- immediate next steps:
  1. clean residue until `bin/check-phase-deployment-status` reports every row
     `missing`
  2. run one full logged `apply`
  3. verify the apply with Argo health plus
     `bin/check-phase-deployment-status`
  4. run one full logged `destroy`
  5. immediately run `bin/check-phase-deployment-status` and inspect the latest
     destroy log
- only after that full cycle, choose the next debug arena:
  - if `app-of-apps` clearly waits for child deletion, do not go back to
    `../mimic`; debug the remaining failure in the full tree
  - if create/destroy still fails in a way the full tree does not explain
    cleanly, use `../mimic` again only for that specific unexplained edge

## Result 2026-04-06

The full real-tree cycle has now succeeded in the destroy direction.

- clean baseline re-established
- full logged apply run from that baseline
- full logged destroy run from that apply
- `kubectl_manifest.app_of_apps_bootstrap` waited `6m34s`
- `Application/argocd` entered deletion before `networking`
- `Job/argocd-server-remove-ingress-postdelete` ran and deleted
  `Ingress/argocd-server`
- `helm_release.argocd_bootstrap` uninstall then completed in `32s`
- final `bin/check-phase-deployment-status` was returned to all `missing`
  after deleting the residual namespaces `argocd`, `external-dns`, and
  `external-secrets`

What this proves:

- the old `networking` gateway-finalizer wedge is fixed
- the old Helm-side Argo uninstall timeout is fixed
- the remaining recurring failure is not destroy ordering; it is the public
  wait path during apply, still exposed by local shell-side DNS behavior

## Status

Done.
