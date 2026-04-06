# Notes

Record one entry per change.

For each entry include:

- timestamp
- deploy log filename
- change made
- reasoning
- expected difference on next run

Do not write broad summaries here. Write one concrete note per change.

- timestamp: 2026-04-04T22:27:00-1000
  deploy log filename: logs/tofu-2026-04-04T22-11-12-destroy.log
  change made: switched tofu back to applying `apps/app-of-apps/app-of-apps.yaml` directly instead of the wrapper `bootstrap.yaml` Application
  reasoning: the wrapper Application deleted too shallowly; tofu started uninstalling Argo as soon as the wrapper was gone, while child app cleanup was still in flight. Owning the root ApplicationSet directly keeps the non-recursive rename but makes tofu wait on the object that actually fans out the child apps.
  expected difference on next run: on the next destroy after a fresh apply, `kubectl_manifest.wait = true` should track ApplicationSet teardown instead of wrapper-Application teardown. Watch whether the `networking` workload and the empty `argocd`/`dex`/`external-dns` namespaces still survive after destroy.

- timestamp: 2026-04-04T22:32:00-1000
  deploy log filename: logs/tofu-2026-04-04T22-24-07-apply.log
  change made: replaced the Dex and Kargo public `wait-for-200` steps with cluster rollout waits for `deployment/dex` and `deployment/kargo-api`, and dropped the extra post-restart public `argocd` URL wait
  reasoning: the apply failure was not just slow DNS. Both waits started before the Dex/Kargo workloads even existed, then failed on local public DNS lookups for minutes. Waiting on the actual deployments is earlier, deterministic, and matches the apply success condition better than public hostname reachability from the local machine.
  expected difference on next run: after the next clean apply, tofu should wait for the Dex and Kargo workloads to exist and roll out instead of spinning on unresolved public DNS names. Watch whether `infra` can progress far enough to create Dex/Kargo and whether the rollout waits finish without manual interruption.

- timestamp: 2026-04-04T22:47:11-1000
  deploy log filename: logs/tofu-2026-04-04T22-34-15-destroy.log
  change made: published `external_dns_iam_role_arn` through the cluster-config handoff and changed the external-dns Helm wiring to create `external-dns-sa` inside the external-dns namespace instead of assuming a pre-existing service account
  reasoning: the interrupted destroy exposed the real apply blocker. `infra` never became healthy because the external-dns Deployment could not create Pods: the chart expected `external-dns-sa`, but that service account lived in the earlier `cluster-infra` root and was deleted with the namespace during destroy. Recreating the namespace-local service account from the existing IRSA role keeps the AWS-side role split but removes the broken cross-root namespace dependency.
  expected difference on next run: after `cluster-infra` republishes the handoff values and the next clean apply runs, external-dns should create its own service account, the Deployment should become running, `infra` should advance past step 1, and the root ApplicationSet should be able to create Dex and Kargo.

- timestamp: 2026-04-04T22:53:32-1000
  deploy log filename: logs/tofu-2026-04-04T22-11-12-destroy.log, logs/tofu-2026-04-04T22-24-07-apply.log, logs/tofu-2026-04-04T22-34-15-destroy.log
  change made: reverted the three speculative fixes above: direct tofu ownership of `app-of-apps.yaml`, the Dex/Kargo rollout-wait substitution, and the external-dns service-account handoff experiment
  reasoning: user objected that these were layered onto broken or dirty cycles instead of being proven from source, history, ownership, and finalizers first. Keep this objection active. Before any new fix, ask whether the previous fix should be undone, and do not keep a change merely because it explains one dirty run.
  expected difference on next run: the next cycle starts from the original code path. Only bootstrap/finalizer/cascade changes that survive source and history review should be tested.

- timestamp: 2026-04-04T23:13:30-1000
  deploy log filename: logs/tofu-2026-04-04T22-58-06-apply.log, logs/tofu-2026-04-04T23-09-55-destroy.log
  change made: completed one clean observation cycle on the original code path and rewrote the working diagnosis around nested child `Application` finalizers instead of the `bootstrap.yaml` wrapper or `preserveResourcesOnDeletion`
  reasoning: the live apply showed the top-level generated apps `infra`, `kargo`, and `codeai` already had `resources-finalizer.argocd.argoproj.io`, and the live root `ApplicationSet/app-of-apps` also had that finalizer. The missing edge was lower. The nested child apps created as plain manifests under `infra` showed no ownerRef and no finalizer: `networking`, `external-dns`, and `external-secrets-operator`. After destroy, tofu waited 1m14s for `Application/app-of-apps`, then removed the bootstrap Helm release, but the immediate and +30s `bin/check-phase-deployment-status` checks still showed `dex`, `external-dns`, `external-secrets-operator`, and `networking` workloads running, with `argocd`, `dex`, `external-dns`, `external-secrets`, and `kargo` namespaces still active. No `Application` or `ApplicationSet` CRs remained afterward. This matches child app CR deletion without child workload pruning. Also, `syncPolicy.preserveResourcesOnDeletion: false` would only restate the default and is not the fix.
  expected difference on next run: if the nested child app manifests that are applied by parent `Application`s get explicit `resources-finalizer.argocd.argoproj.io`, destroy should keep Argo alive until those child workloads are actually gone. The immediate and +30s phase checks after destroy should show those workloads and namespaces as `missing`, not still `running` or `active`.

- timestamp: 2026-04-04T23:16:00-1000
  deploy log filename: logs/tofu-2026-04-04T22-58-06-apply.log, logs/tofu-2026-04-04T23-09-55-destroy.log
  change made: added explicit `resources-finalizer.argocd.argoproj.io` to the nested child `Application` manifests in `~/src/k8s-gitops`: `apps/infra/dex/application.yaml`, `apps/infra/external-dns/application.yaml`, `apps/infra/external-secrets-operator/application.yaml`, `apps/infra/kargo-secrets/application.yaml`, `apps/infra/networking/application.yaml`, `apps/infra/standard-envtypes/application.yaml`, and `apps/kargo/projects/codeai/application.yaml`
  reasoning: these are the child apps applied as plain manifests by parent `Application`s, so they do not inherit the `ApplicationSet` controller's generated-app finalizer behavior. The clean observed cycle showed those child app CRs disappearing while their workloads and namespaces survived after destroy. This change makes the child apps themselves own workload pruning before their CRs vanish. `apps/infra/argocd/application.yaml` was intentionally left unchanged in this first pass because it is the one self-pruning Argo case that could deadlock if handled carelessly.
  expected difference on next run: during destroy, the nested child app CRs should stay in deleting state until their workloads are pruned, instead of disappearing immediately. The immediate and +30s phase checks should stop showing `dex`, `external-dns`, `external-secrets-operator`, and `networking` still running after Argo uninstall. If residue remains concentrated in Argo namespace resources after that, revisit `apps/infra/argocd/application.yaml` separately.

- timestamp: 2026-04-04T23:55:00-1000
  deploy log filename: logs/tofu-2026-04-04T23-31-50-destroy.log
  change made: pivoted the next diagnosis loop from full `cluster-infra-argocd` churn to the sibling `mimic` tofu target after inspecting `k8s-gitops` commit `0d1ca75664d07108b842ec694af21974e0c8873b`
  reasoning: the latest destroy still let `kubectl_manifest.app_of_apps_bootstrap` complete in `35s`, then Helm uninstall ran another `5m20s` and ended with `context deadline exceeded`. The immediate and `+30s` phase checks showed all tracked workloads gone, but `argocd`, `dex`, `external-dns`, and `external-secrets` namespaces still active. Live post-destroy inspection showed no remaining `Application` or `ApplicationSet` CRs at all, and those namespaces only had the normal `["kubernetes"]` finalizer. That means the next useful question is not another broad cluster fix; it is whether the wrapper `Application` is returning before a delayed child delete chain in the exact bootstrap pattern from the suspect commit. `mimic` already uses that pattern and ships a purpose-built `mimic-leaf` workload with a `240s` preStop and `300s` termination grace period, so it can answer that question much faster.
  expected difference on next run: the next run should happen in `../mimic`, not full `cluster-infra-argocd`. Watch whether `kubectl_manifest.mimic_app_of_apps_bootstrap` returns before the delayed `mimic-leaf` workload and `leaf` namespace are actually gone. If it does, the bootstrap/ApplicationSet delete chain is wrong in a small reproducible tree.

- timestamp: 2026-04-04T23:59:00-1000
  deploy log filename: logs/tofu-2026-04-04T23-31-50-destroy.log
  change made: shortened the `mimic-leaf` delete delay in `~/src/k8s-gitops/mimic/apps/leaf/manifests/deployment.yaml` from `sleep 240` to `sleep 60`
  reasoning: the `mimic` loop is now the primary delete-chain diagnostic harness. Source review of Argo code showed `performReverseDeletion()` returns an error if a generated `Application` has been deleting for over `2m`, so the previous longer sleeps could turn the experiment into a controller timeout instead of a clean wait-chain probe. A one-minute delayed leaf is still long enough to prove whether the bootstrap `Application` waits for descendant teardown, while staying comfortably below that ApplicationSet timeout.
  expected difference on next run: the next mimic destroy should still visibly block if the delete chain is correct, but the decisive wait should be about one minute and should not trip the ApplicationSet controller's `2m` deleting-app timeout.

- timestamp: 2026-04-05T00:03:00-1000
  deploy log filename: logs/tofu-2026-04-04T23-31-50-destroy.log
  change made: reverted the seven real-app nested-child `Application` finalizer additions in `~/src/k8s-gitops` and kept only the mimic-only delay trim
  reasoning: user objected that the real-app finalizer patch was unproven. The next diagnosis target is narrower: prove, in `mimic`, why the bootstrap `Application` with `wait = true` returns before the leaf teardown is finished. Carrying the real-app patch forward would blur that question.
  expected difference on next run: the next run should exercise the unmodified real app tree semantics, while `mimic` remains fast enough to diagnose the wrapper/ApplicationSet delete chain.

- timestamp: 2026-04-05T00:12:00-1000
  deploy log filename: logs/tofu-2026-04-04T23-45-09-apply.log
  change made: documented the restore-apply failure cause before cleanup: `helm_release.argocd_bootstrap` timed out in pre-install because stale `argocd-redis-secret-init` hook resources from the earlier failed run were still present and already deleting under `argocd.argoproj.io/hook-finalizer`
  reasoning: live inspection with a static kubeconfig showed the current failed Helm release had only the redis-secret hook resources and the `argocd-server` ingress. The hook objects were old, not fresh for this run, and several showed `deletionTimestamp` already set:
    - `ServiceAccount/argocd-redis-secret-init`: deleting since `2026-04-05T09:47:24Z`, finalizer `argocd.argoproj.io/hook-finalizer`
    - `Role/argocd-redis-secret-init`: finalizer `argocd.argoproj.io/hook-finalizer`
    - `RoleBinding/argocd-redis-secret-init`: finalizer `argocd.argoproj.io/hook-finalizer`
    - `Job/argocd-redis-secret-init`: deleting since `2026-04-05T09:34:06Z`, finalizer `argocd.argoproj.io/hook-finalizer`
  expected difference on next run: after clearing or otherwise removing these stale hook resources, the next restore apply should progress past Helm pre-install instead of spending the full timeout on `before-hook-creation` cleanup.

- timestamp: 2026-04-05T00:18:00-1000
  deploy log filename: logs/tofu-2026-04-04T23-55-23-apply.log
  change made: made `bin/logged-tofu` and `bin/logged-tofu-stop` module-relative instead of hardcoding `cluster-infra-argocd`, then symlinked them into `k8s/tofu/codeai-k8s/mimic/bin/`
  reasoning: the mimic loop needs the same per-run `tofu` logs and timestamped Kubernetes event stream as the main loop. The only hardcoded blocker was the shared `/tmp/cluster-infra-argocd-*` pointer names, which would have collided across modules. Using `basename "$cwd"` keeps the behavior the same for `cluster-infra-argocd` while letting `mimic` produce its own independent log pointers and stop path.
  expected difference on next run: `k8s/tofu/codeai-k8s/mimic/bin/logged-tofu` should work from the mimic directory without log-pointer collisions, and mimic runs should produce the same style of event-rich `logs/tofu-*.log` traces as the main loop.

- timestamp: 2026-04-05T00:08:30-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-05-56-apply.log
  change made: recorded that the mimic leaf on EKS Fargate has minute-scale cold-start latency and that destroy experiments must wait for post-apply health before concluding anything about Argo delete timing
  reasoning: on the settled mimic apply, the root objects were created quickly, but `mimic-leaf` and `mimic-boo-leaf` stayed `Progressing` while the `leaf` pod sat `Pending`. Live pod inspection then showed the pod only got scheduled and started around a minute later on Fargate. That startup lag is operational noise, not evidence about finalizers or cascade ownership.
  expected difference on next run: future mimic loops should allow the leaf apps to reach `Healthy` before destroy and should not misdiagnose Fargate startup delay as an Argo bootstrap or delete-chain bug.

- timestamp: 2026-04-05T00:12:45-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-10-17-destroy.log
  change made: recorded the first healthy-state mimic destroy result before changing the harness again
  reasoning: with `mimic-leaf` at `preStop: sleep 60`, `kubectl_manifest.mimic_app_of_apps_bootstrap` did not return early; tofu stayed in destroy for `1m2s`. The watcher log showed the child `Application`s disappeared first, the root `Application/mimic-app-of-apps` remained while the leaf pod was still `Terminating`, the leaf workload objects were gone by `2026-04-05T00:11:58-1000`, and the root `Application` plus both `ApplicationSet`s were gone by `2026-04-05T00:12:04-1000`. The live pre-destroy capture also showed all `Application`s had `resources-finalizer.argocd.argoproj.io`, while the steady-state `ApplicationSet`s had no finalizer. The only survivor after destroy was the empty `leaf` namespace, but that namespace predated the run by about two days, so this loop does not yet prove whether Argo would prune a fresh app-created namespace.
  expected difference on next run: the next mimic iteration can raise the leaf delay above the suspected `2m` ApplicationSet deleting-app threshold. If tofu still waits through that longer delay, the bootstrap wrapper path is probably not the main-tree failure. If it breaks around two minutes, that points back at the ApplicationSet delete chain.

- timestamp: 2026-04-05T00:14:20-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-10-17-destroy.log
  change made: increased `~/src/k8s-gitops/mimic/apps/leaf/manifests/deployment.yaml` from `sleep 60` to `sleep 180`
  reasoning: user requested a stronger mimic probe. This intentionally crosses the Argo ApplicationSet controller's observed `2m` deleting-app threshold from source review, so the next mimic destroy will distinguish between a genuinely robust wrapper wait chain and a path that only happens to work below that timeout.
  expected difference on next run: after the next mimic apply reaches `Healthy`, the destroy should either wait roughly three minutes for the leaf pod teardown or fail/short-circuit around the two-minute controller threshold. That result should be treated as hard evidence, not a hunch.

- timestamp: 2026-04-05T00:21:20-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-17-22-destroy.log
  change made: recorded the second healthy-state mimic destroy result with the leaf `preStop` raised to `180s`
  reasoning: the wrapper `Application` again did not return early. Tofu stayed blocked through `2m0s`, then through `3m0s`, and finished at `3m2s`. The parallel watcher showed the root `Application/mimic-app-of-apps` still present while the leaf pod remained `Terminating`, and the only survivor after destroy was still the empty old `leaf` namespace. This falsifies the simple theory that the `bootstrap.yaml` -> `ApplicationSet` wrapper path is inherently short-circuiting around the ApplicationSet controller's `2m` deleting-app threshold.
  expected difference on next run: the next mimic change should stop targeting the wrapper wait chain directly and should instead reproduce a main-tree-only difference. The strongest current candidate is namespace ownership: Argo docs say a `CreateNamespace=true` namespace is normally not tracked unless `managedNamespaceMetadata` adds tracking metadata, which matches the empty namespaces left behind in the real destroy.

- timestamp: 2026-04-05T00:24:20-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-17-22-destroy.log
  change made: moved `mimic-leaf` from `leaf` to `leaf-generated` and `mimic-boo-leaf` from `boo-leaf` to `boo-leaf-generated`
  reasoning: the old survivor namespaces were both bad evidence. `leaf` and `boo-leaf` already existed from `2026-04-03T09:07:14Z` and had no `argocd.argoproj.io/tracking-id` annotation, so their survival after destroy did not prove anything about a fresh `CreateNamespace=true` namespace. Argo's own docs say generated namespaces are normally not tracked unless tracking metadata is added. The next clean mimic reproduction should therefore start from brand-new namespaces so we can see whether they survive destroy in the same empty-active shape as the real `dex` and `external-dns` namespaces.
  expected difference on next run: after the next mimic apply and healthy wait, `leaf-generated` and `boo-leaf-generated` should appear as fresh namespaces created by Argo. After destroy, if those namespaces remain active and empty while the `Application` CRs and workloads are gone, that will reproduce the real-tree namespace symptom in `mimic`.

- timestamp: 2026-04-05T00:30:20-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-26-20-destroy.log
  change made: recorded the fresh-namespace mimic destroy result
  reasoning: this run reproduced the real-tree residue shape in a small tree. Before destroy, the fresh namespaces `leaf-generated` and `boo-leaf-generated` were created on `2026-04-05T10:24:45Z` and `2026-04-05T10:24:46Z` respectively, and both had no `argocd.argoproj.io/tracking-id` annotation. After destroy, tofu again returned after `3m2s`, all `Application` and `ApplicationSet` CRs were gone, all workload objects were gone, and both fresh namespaces remained `Active` and empty. The watcher caught that state explicitly at `2026-04-05T00:29:56-1000`. This matches the real-tree symptom of empty active namespaces surviving after Argo cleanup far better than the old bootstrap-wrapper theory does.
  expected difference on next run: the next smallest mimic fix should add namespace tracking ownership through `managedNamespaceMetadata` to these `CreateNamespace=true` apps. If that fix is correct, the same fresh namespaces should disappear after destroy instead of remaining active and empty.

- timestamp: 2026-04-05T00:31:40-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-26-20-destroy.log
  change made: added `syncPolicy.managedNamespaceMetadata.annotations.argocd.argoproj.io/tracking-id` to `mimic-leaf` and `mimic-boo-leaf` while keeping `CreateNamespace=true`
  reasoning: Argo docs say a generated namespace is normally not tracked, and that adding tracking metadata through `managedNamespaceMetadata` makes the namespace owned by Argo and therefore eligible for deletion. The fresh-namespace mimic run reproduced the real empty-active namespace symptom exactly, so this is now the smallest doc-backed ownership fix to prove in the harness before touching the real tree.
  expected difference on next run: after the next mimic apply, `leaf-generated` and `boo-leaf-generated` should show the Argo tracking annotation before destroy. After the next destroy, those namespaces should be deleted instead of remaining active and empty.

- timestamp: 2026-04-05T00:48:30-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-33-57-destroy.log
  change made: corrected the mimic namespace tracking annotation format from `app:/Namespace:name` to `app:/Namespace:/name`
  reasoning: the first tracking patch was malformed and therefore not valid evidence. Argo parses `argocd.argoproj.io/tracking-id` as `<application>:<group>/<kind>:<namespace>/<name>` in `util/argo/resource_tracking.go`. For a cluster-scoped `Namespace`, the namespace segment must be empty, so the docs example uses `your-application-name:/Namespace:/your-namespace-name`. The attempted values omitted that empty namespace slash, so Argo could not parse them. Live state matched that source reading: `leaf-generated` stayed `Active` after `Application/mimic-leaf` was gone. The same destroy also showed the wrapper chain itself was still waiting correctly on one remaining object, the ALB-backed `Ingress/boo-leaf-generated/boo-leaf`, so the malformed namespace tracking patch must be corrected and re-tested rather than interpreted as a valid result.
  expected difference on next run: after the next mimic apply, `leaf-generated` and `boo-leaf-generated` should show parseable tracking ids in the exact `app:/Namespace:/name` form. Before destroy, confirm that Argo recognizes those namespaces as managed. After destroy, the fresh namespaces should be part of the delete set instead of surviving as empty active residue.

- timestamp: 2026-04-05T00:59:40-1000
  deploy log filename: /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/mimic/logs/tofu-2026-04-05T00-33-57-destroy.log
  change made: cleaned stale residue from the malformed-tracking mimic destroy by deleting the orphan ALB target group and the two empty generated namespaces
  reasoning: the malformed-tracking run timed out after `19m50s` with `Error: mimic-app-of-apps failed to delete resource`. Argo still had the root and nested boo apps in deletion, and the only remaining Kubernetes object was `Ingress/boo-leaf-generated/boo-leaf`. The AWS load balancer controller logs showed repeated `failed to delete targetGroup: timed out waiting for the condition`. AWS then showed the target group still existed but already had no attached load balancer and no registered targets, so it was stale residue, not live workload state. After deleting that orphan target group, the ingress cleared, the mimic Argo CRs drained away, and only the two empty generated namespaces remained. Those namespaces were then deleted manually so the corrected tracking-id run can start from a fresh namespace-creation baseline.
  expected difference on next run: the next corrected mimic apply should recreate `leaf-generated` and `boo-leaf-generated` from scratch. Any subsequent namespace deletion result will therefore reflect the corrected tracking-id format, not leftover state from the malformed-tracking timeout run.

- timestamp: 2026-04-05T01:12:26-1000
  deploy log filename: logs/tofu-2026-04-04T23-31-50-destroy.log
  change made: restored the nested child `Application` finalizer patch in `~/src/k8s-gitops` after confirming from live full YAML that the real missing ownership edge is exactly the parent-Application -> child-Application layer
  reasoning: the real cluster now gives a cleaner proof than the earlier broad hypothesis. Live `kubectl get application -n argocd ... -o yaml` showed the root and top-level generated apps already had `resources-finalizer.argocd.argoproj.io`, while the nested child apps under parent `Application`s did not. The missing live finalizers were:
    - `networking`
    - `external-dns`
    - `external-secrets-operator`
    - `kargo-secrets`
    - `standard-envtypes`
    - `dex`
    - `argocd`
    - `kargo-project-codeai`
  reasoning continued: repo inspection matched that live state. The only repo-wide `Application` manifests still lacking a finalizer after the patch are the deliberate parents `apps/infra/application.yaml` and `apps/kargo/application.yaml`. That keeps the fix narrow: add the Argo resource finalizer only to the real child apps that were missing it, and do not restate defaults or touch the already-finalized top-level apps.
  expected difference on next run: after Argo syncs the git change, those eight child `Application` CRs should each show `resources-finalizer.argocd.argoproj.io` in full YAML before destroy. On the next real destroy, watch whether `kubectl_manifest.app_of_apps_bootstrap` now waits materially longer than `35s`, and specifically whether `Application/argocd` deleting itself immediately before the bootstrap return explains any remaining short-circuit.

- timestamp: 2026-04-05T01:16:21-1000
  deploy log filename: logs/tofu-2026-04-04T23-31-50-destroy.log
  change made: recorded user approval to keep the nested child `Application` finalizer patch even if it turns out not to change the immediate main destroy timing
  reasoning: the patch is technically correct on its own merits and should not be auto-reverted merely because the current live child `Application` CRs may not absorb `metadata.finalizers` in place. Keep this decision explicit so later diagnosis does not thrash by undoing a sound change while chasing the separate question of why existing synced child apps still show `finalizers=[]`.
  expected difference on next run: no code-path difference by itself. The practical difference is decision discipline: keep the patch in `~/src/k8s-gitops` while investigating Argo's live reconciliation behavior and the real `35s` destroy return.

- timestamp: 2026-04-05T01:38:20-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: recorded the first in-flight main destroy diagnosis after the nested child finalizers had actually synced live
  reasoning: this run has already falsified the old `35s means nothing was really waited for` shape. `kubectl_manifest.app_of_apps_bootstrap` stayed in destroy past `2m`, and the controller log shows the tree actively draining: `kargo` fell from `70` objects remaining to single digits, `infra` entered deletion, and `Application/argocd` itself picked up a deletion timestamp and `resources-finalizer.argocd.argoproj.io`. The new hard blocker is different and much more specific. Live API state during the same destroy shows `application/app-of-apps`, `applicationset/app-of-apps`, `application/infra`, and `application/argocd` all in deletion with finalizers present, while the `argocd` namespace has already lost almost all Argo RBAC and configmaps. At that point `deployment/argocd-repo-server` is still present, `kubectl auth can-i delete deployments.apps -n argocd --as=system:serviceaccount:argocd:argocd-application-controller` returns `no`, and the run log contains the matching controller warning: `deployments.apps "argocd-repo-server" is forbidden` because `system:serviceaccount:argocd:argocd-application-controller` can no longer delete deployments in `argocd`. The live cluster also confirms why: `clusterrolebinding/argocd-application-controller` is already gone before `deployment/argocd-repo-server` is gone. So the current main destroy problem is no longer an empty bootstrap wait chain; it is Argo pruning its own controller RBAC out from under itself before it finishes deleting the remaining Argo-managed workload.
  expected difference on next run: the next fix should target self-hosted Argo delete ordering or ownership in the `argocd` child app, not the bootstrap wrapper or child-Application finalizer chain. Success means the controller keeps enough permission to delete `argocd-repo-server` and the rest of the Argo app, allowing `kubectl_manifest.app_of_apps_bootstrap` to finish only after that self-hosted subtree is actually gone.

- timestamp: 2026-04-05T01:46:10-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: recorded that the current main destroy is now a hard wedge, not merely a long wait
  reasoning: by `2026-04-05T01:35:40-1000`, `kubectl_manifest.app_of_apps_bootstrap` had been stuck in destroy for `9m21s`. The run log shows a clean cutoff in Argo control-plane activity: the last `argocd-application-controller` line is the `forbidden` delete error and graceful shutdown at `2026-04-05T01:26:52-1000`, and the last `argocd-applicationset-controller` shutdown line is `2026-04-05T01:26:53-1000`. After that there are no more Argo controller log lines at all, only kube events and Tofu's periodic `Still destroying...`. Live API state matches the freeze: `application/argocd` still carries the same `DeletionError` condition for `deployment/argocd-repo-server`, and the remaining live objects in namespace `argocd` are down to a tiny residue set headed by `deployment.apps/argocd-repo-server`, `service/argocd-redis`, `configmap/argocd-cm`, `configmap/argocd-redis-health-configmap`, `secret/argocd-redis`, `secret/repo-code-dot-org`, `secret/sh.helm.release.v1.argocd.v1`, `serviceaccount/argocd-application-controller`, and `rolebinding/argocd-redis-secret-init`. This matters because it proves the destroy is not slowly progressing anymore; once the controller prunes itself and loses RBAC, bootstrap has no live control loop left to finish the last Argo-managed resources.
  expected difference on next run: the next experiment or fix must preserve a live, authorized Argo controller until after the last blocking Argo resources are pruned. A promising minimal path is sync-wave ordering inside the `argocd` child chart so non-controller workloads such as `argocd-repo-server` prune before the controller and its RBAC do.

- timestamp: 2026-04-05T01:50:40-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: recorded the final outcome and residue of the interrupted wedged destroy
  reasoning: after the wedge was already proven, the run was interrupted at `2026-04-05T01:38:56-1000` so Tofu could exit and the residue could be measured. Tofu returned `Error: app-of-apps failed to delete resource`. The required follow-up `bin/check-phase-deployment-status` snapshot showed a very specific partial-destroy shape: `argocd-server` and `argocd-application-controller` were both missing, while `external-dns`, `external-secrets-operator`, and `networking` workloads were still running and the namespaces `argocd`, `dex`, `external-dns`, `external-secrets`, and `kargo` all remained `Active`. This is consistent with the control-plane death observed in the log. Once Argo pruned away its own controller and RBAC too early, the destroy stopped making semantic progress and stranded a mixed state instead of converging to empty.
  expected difference on next run: the next fix must do more than make bootstrap wait longer. It must prevent the specific stranded shape where the Argo control plane dies first and leaves a half-destroyed tree with live downstream workloads and active namespaces behind.

- timestamp: 2026-04-05T01:49:34-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: tightened the self-delete diagnosis after a second pass over the log plus live residue inspection
  reasoning: the earlier notes correctly identified the first fatal `forbidden` error, but they did not pin down the exact surviving set. Live state now shows `Application/argocd` still stuck on the same `DeletionError`, `deployment/argocd-repo-server` still present with no `deletionTimestamp`, and `clusterrolebinding/argocd-application-controller` already gone. The same live residue also shows `statefulset/argocd-application-controller`, `role/argocd-application-controller`, and `rolebinding/argocd-application-controller` are already gone, while `serviceaccount/argocd-application-controller` still exists. The run log adds one more concrete symptom after the controller dies: at `2026-04-05T01:27:45-1000` a fresh `pod/argocd-repo-server-8545cb4f4-c4k6s` starts failing `FailedMount` because `argocd-tls-certs-cm`, `argocd-gpg-keys-cm`, and `argocd-ssh-known-hosts-cm` have already been pruned. So the problem is not merely "Argo is gone too soon" in the abstract. The controller process and its cluster-scoped authority disappear before it has even marked `argocd-repo-server` for deletion, while sibling support objects are already being removed underneath that surviving deployment.
  expected difference on next run: the smallest plausible fix should keep only the controller process and the cluster-scoped authority it still needs alive through the end of self-delete. In practice that points first at last-wave ordering for `statefulset/argocd-application-controller`, `serviceaccount/argocd-application-controller`, `clusterrole/argocd-application-controller`, and `clusterrolebinding/argocd-application-controller`. If that is sufficient, the next destroy should show `deployment/argocd-repo-server` receiving a real deletion instead of staying ordinary and spawning broken replacement pods after the controller dies.

- timestamp: 2026-04-05T01:51:55-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: pushed the first self-delete ordering candidate to `~/src/k8s-gitops` on `main` as commit stack `84630cd` then `7d994df`
  reasoning: the candidate was intentionally narrowed before push. Commit `84630cd` added the basic mechanism: values-backed `argocd.argoproj.io/sync-wave: "-1"` on the controller `StatefulSet` and `ServiceAccount`, plus a later repo source to override controller RBAC that the upstream chart cannot annotate from values. After the deeper log pass and live residue inspection, commit `7d994df` removed the extra namespaced `Role` and `RoleBinding` overrides and kept only the cluster-scoped `ClusterRole` and `ClusterRoleBinding`. That narrower shape matches the actual first-order evidence better: live residue showed the fatal cutoff was loss of cluster-scoped authority plus controller process liveness, not the namespaced controller role objects. Render validation after narrowing showed exactly the intended late-wave set: `serviceaccount/argocd-application-controller` and `statefulset/argocd-application-controller` from values, plus `clusterrole/argocd-application-controller` and `clusterrolebinding/argocd-application-controller` from the override source. The override YAML was also diff-checked against the current chart render and matched exactly except for the added sync-wave annotation.
  expected difference on next run: once Argo syncs `main`, the next destroy should keep the controller pod and its cluster-scoped authority alive long enough to issue a real delete for `deployment/argocd-repo-server`. The success signal is not just a longer wait. It is disappearance of the current `DeletionError` shape: no early loss of `clusterrolebinding/argocd-application-controller`, no surviving undeleted `deployment/argocd-repo-server`, and no broken replacement repo-server pod trying to mount already-pruned configmaps after the controller dies.

- timestamp: 2026-04-05T02:02:16-1000
  deploy log filename: logs/tofu-2026-04-05T01-53-31-apply.log
  change made: recorded that this restore apply is polluted by interrupted-destroy state drift and therefore is not valid evidence on the self-delete ordering fix
  reasoning: the run log shows `kubectl_manifest.app_of_apps_bootstrap: Refreshing state...` at `2026-04-05T01:53:47-1000`, but the plan that follows contains no recreate or update for that resource, only the Helm revision update plus the wait helpers. Live cluster state during the same run proves the root object is actually gone: `kubectl get application app-of-apps -n argocd` returns `NotFound`, `kubectl get applicationsets -n argocd` returns no resources, and the only live Argo `Application` CRs are nested children such as `external-dns`, `external-secrets-operator`, and `networking`. Tofu state still claims the bootstrap object exists and still carries the old UID `4b515339-374d-45a4-9372-d1e01c83145e`, so the interrupted destroy left a stale state entry for a live-missing root object. That explains the bad restore shape exactly: Helm rebuilt the Argo control plane, but the app tree was never recreated, so the subsequent Dex/Kargo public waits were guaranteed to fail and must not be interpreted as evidence against or for the controller-RBAC ordering fix.
  expected difference on next run: before using another full apply or destroy as evidence, force a real recreation of `kubectl_manifest.app_of_apps_bootstrap` or otherwise repair the stale state/live mismatch. The success signal for that recovery step is explicit live reappearance of `Application/app-of-apps`, `ApplicationSet/app-of-apps`, and the parent apps such as `infra` and `argocd` before judging Dex/Kargo health or the next destroy timing.

- timestamp: 2026-04-05T02:21:30-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: split the self-managed Argo app out of `infra` and moved it back to top-level `apps/argocd`, with direct Tofu bootstrap after Helm
  reasoning: the destroy log and live deletion state exposed a deeper architectural problem than bad internal prune order. During the wedge, `Application/app-of-apps`, `ApplicationSet/app-of-apps`, `Application/infra`, and `Application/argocd` were all still in deletion, which means the self-hosted Argo app sat inside the same finalizer chain it was responsible for advancing. Even if internal ordering kept the controller alive longer, fully deleting Argo from inside `infra` leaves no controller to clear the parent `infra` and `app-of-apps` finalizers afterward. The new shape removes that self-reference. In `~/src/k8s-gitops`, commit `c25fce9` moved `apps/infra/argocd/...` to `apps/argocd/...`, renamed the Argo `Application` manifest to `apps/argocd/bootstrap.yaml` so `apps/app-of-apps/app-of-apps.yaml` no longer auto-discovers it, and removed Argo from `apps/infra/application.yaml`. In `cluster-infra-argocd`, `argocd-bootstrap.tf` now sparse-checks out `apps/argocd`, still installs the Helm chart, then applies `kubectl_manifest.argocd_bootstrap_application` from `apps/argocd/bootstrap.yaml`; `app-of-apps-bootstrap.tf` now depends on that direct Argo bootstrap instead of Helm directly. A targeted `tofu plan -replace=kubectl_manifest.app_of_apps_bootstrap` after the push confirmed the intended graph: direct create of `kubectl_manifest.argocd_bootstrap_application`, recreate of `kubectl_manifest.app_of_apps_bootstrap`, and no Argo child under `infra`.
  expected difference on next run: the recovery apply should recreate two separate roots in order: first `Application/argocd`, then `Application/app-of-apps`. Live state should show `Application/argocd` present even though `infra` no longer contains an Argo child. On the next destroy, Tofu should wait for `app-of-apps` to drain first, then separately wait for `Application/argocd`, with Helm uninstall only after both direct bootstrap `Application`s are gone. If the remaining destroy problem is purely internal to the Argo app, it should now show up as a wedge on `kubectl_manifest.argocd_bootstrap_application` instead of trapping the parent `infra` and `app-of-apps` chain behind it.

- timestamp: 2026-04-05T02:51:56-1000
  deploy log filename: logs/tofu-2026-04-05T01-25-33-destroy.log
  change made: added disabled draft file `new-argocd-bootstrap.tf` to sketch a Ruby-owned replacement for the current Terraform bootstrap path
  reasoning: the user asked for the design written down as code before deciding whether to adopt it. The new file is intentionally inert: `local.new_argocd_bootstrap_enabled = false`, so it does not affect current plans. It expresses the intended interface only. A future `bin/argocd-bootstrap` entrypoint would own the full Argo lifecycle instead of splitting ownership across Terraform, Helm, and Argo: `apply` would bootstrap-only and refuse Helm upgrades of an existing Argo release, while `destroy` would be allowed to reconcile Helm to the latest git chart first, then tear down `app-of-apps` and let Helm own final Argo uninstall. The draft passes the repo/default-branch, chart path, app-of-apps manifest path, and cluster connection data through one `terraform_data.new_argocd_bootstrap` resource so the eventual script contract is explicit before implementation starts.
  expected difference on next run: none yet. This file is a reviewable draft only and must not change live behavior until the Ruby script exists and the module is explicitly switched over.

- timestamp: 2026-04-05T04:12:10-1000
  deploy log filename: none; interactive `AWS_PROFILE=codeorg-admin tofu plan`
  change made: replaced the old live Terraform bootstrap shape with the Ruby-owned path in config: `argocd-bootstrap.tf` now defines `terraform_data.argocd_bootstrap`, `app-of-apps-bootstrap.tf` depends on that resource instead of `helm_release.argocd_bootstrap`, the draft file was deleted, and compatibility `removed { destroy = false }` blocks were added for the old `helm_release.argocd_bootstrap` and `terraform_data.argocd_bootstrap_checkout`
  reasoning: the first trustworthy check had to be a real admin-credential plan, not another read-only approximation. That plan proved the critical safety property of this cutover: the old Helm bootstrap release was not going to uninstall Argo. OpenTofu showed `helm_release.argocd_bootstrap` as "removed from the OpenTofu state but will not be destroyed", and it showed the old checkout helper the same way. That removed the main fear around switching ownership. The same plan also exposed the remaining drift honestly: `kubectl_manifest.app_of_apps_bootstrap` still planned as a create even though it refreshed from state, and the Dex/Kargo wait helpers were still tainted from earlier interrupted work. So the safe reading is narrow: the bootstrap-owner transition itself is safe at the Helm layer, but the next evidence must come from a targeted forward apply under admin creds, not from guessing about stale downstream state.
  expected difference on next run: the next targeted forward step should no longer contain any destructive Helm action. It should focus on creating `terraform_data.argocd_bootstrap` and then reveal whether `kubectl_manifest.app_of_apps_bootstrap` still needs real recovery and whether the tainted wait helpers should be recreated or reset.

- timestamp: 2026-04-05T04:12:10-1000
  deploy log filename: none; interactive `AWS_PROFILE=codeorg-admin tofu state rm helm_release.argocd_bootstrap` and `AWS_PROFILE=codeorg-admin tofu state rm terraform_data.argocd_bootstrap_checkout`
  change made: explicitly removed the old Helm bootstrap resource and the old sparse-checkout helper from OpenTofu state with admin creds before starting the targeted forward apply
  reasoning: once the admin plan showed both old resources were supposed to be forgotten rather than destroyed, the cleanest cutover was to use tweezers and forget them directly instead of carrying transition bookkeeping into the next apply. `tofu state rm` is exact here: it changes only OpenTofu bookkeeping and leaves the live Argo release untouched. Doing the two state removals up front means the next apply can talk only about the new owner path instead of mixing one-time migration noise with the real bootstrap test. That makes the next result easier to interpret and reduces the risk of misreading a forget-only migration step as a bootstrap success or failure.
  expected difference on next run: the next plan/apply should not mention `helm_release.argocd_bootstrap` or `terraform_data.argocd_bootstrap_checkout` at all. If they still appear, the transition is not actually clean. Otherwise the forward step should reduce to the new `terraform_data.argocd_bootstrap` path plus whatever stale downstream resources remain to be reconciled.

- timestamp: 2026-04-05T04:20:05-1000
  deploy log filename: logs/tofu-2026-04-05T04-13-03-apply.log
  change made: caught and fixed the first real Ruby bootstrap-script bug during the targeted forward apply by replacing `helm list --all` with a simple release-existence check based on `helm status`
  reasoning: the first targeted `terraform_data.argocd_bootstrap` apply failed before it reached any real cluster-side bootstrap logic. The log showed the exact command and the exact CLI failure: `helm --kubeconfig ... list --namespace argocd --all --filter ^argocd$ --output json` returned `Error: unknown flag: --all`. That made the issue unambiguous: this was local script misuse of the installed Helm CLI, not an Argo or cluster behavior problem. The smallest correct fix was also the simplest one. `apply` only needs to know whether the named release already exists, so `helm status <release> --namespace <namespace>` is sufficient and avoids feature drift in `helm list` flags entirely.
  expected difference on next run: the next targeted apply should get past the release-existence check and either install Argo if the release is missing or log the intended bootstrap-only refusal if the release already exists.

- timestamp: 2026-04-05T04:20:05-1000
  deploy log filename: logs/tofu-2026-04-05T04-14-18-apply.log
  change made: proved the forward tweezer path for `terraform_data.argocd_bootstrap` under real admin creds after the Helm-status fix
  reasoning: the rerun applied exactly one targeted resource and converged. The first retry only replaced the tainted `terraform_data.argocd_bootstrap` left by the earlier script failure. The script then did the intended bootstrap-only behavior on apply: it cloned `k8s-gitops` at `5d7dd07219bcb8eeccabbbba96e698cda0028bed`, detected that Helm release `argocd` already existed, and logged `refusing Helm upgrade during apply`. OpenTofu then completed the targeted apply successfully with `Resources: 1 added, 0 changed, 1 destroyed`. This is the first real proof that the new Terraform-to-Ruby forward path works as designed when the live release already exists: it records the bootstrap owner in state without mutating the live Argo install.
  expected difference on next run: any later targeted forward apply of `terraform_data.argocd_bootstrap` should be a no-op unless the resource is tainted or missing from state. The next interesting evidence should therefore come from the backward path, not from re-testing forward apply again.

- timestamp: 2026-04-05T04:20:05-1000
  deploy log filename: logs/tofu-2026-04-05T04-15-15-destroy.log
  change made: proved the backward tweezer path for `terraform_data.argocd_bootstrap`, and captured exactly what it does and does not own
  reasoning: the targeted destroy completed cleanly in `3m55s`, but the path it took matters. The script cloned `k8s-gitops`, then spent roughly three minutes in the allowed pre-destroy `helm upgrade --install` reconcile. During that reconcile, the log showed temporary loss and recreation of `configmap/argocd-cm`, the `argocd-redis-secret-init` job running, and `deployment/argocd-repo-server` being recreated slowly on Fargate before becoming ready enough for Helm to continue. At `2026-04-05T04:18:52-1000` the script logged `Uninstalling Helm release 'argocd'`, and the Argo control-plane pods were killed immediately after. OpenTofu then finished the targeted destroy successfully. The immediate required `bin/check-phase-deployment-status` snapshot is the important limiter on the result: `argocd-server` and `argocd-application-controller` were `missing`, but `external-dns`, `external-secrets-operator`, `external-secrets-operator-webhook`, and `networking-aws-load-balancer-controller` were still `running`, and the namespaces `argocd`, `dex`, `external-dns`, `external-secrets`, and `kargo` were still `active`. So this backward test proves something narrow but useful: the new Ruby-owned bootstrap resource can go backward and remove Argo itself, but destroying that resource alone does not remove the app-of-apps-managed phase workloads. That missing ownership is expected from the targeted graph and must not be mistaken for a script failure.
  expected difference on next run: the next destroy experiment must include the real parent chain if the success condition is full phase cleanup. Destroying only `terraform_data.argocd_bootstrap` should be treated as an isolated bootstrap-owner test whose success criteria are limited to Argo-side behavior, not total cluster emptiness.

- timestamp: 2026-04-05T04:28:45-1000
  deploy log filename: none; manual cleanup after the targeted bootstrap-only destroy
  change made: cleaned the cluster back to a true empty phase-3 baseline before the next full cycle
  reasoning: the targeted destroy deliberately removed only the bootstrap-owned Argo layer, so it left the expected phase residue behind: orphan `Application` CRs `external-dns`, `external-secrets-operator`, and `networking` in namespace `argocd`; live workloads for `external-dns`, `external-secrets-operator`, and `networking`; and the namespaces `argocd`, `dex`, `external-dns`, `external-secrets`, and `kargo`. The orphan `Application` CRs still had `resources-finalizer.argocd.argoproj.io` even though Argo was gone, so they were patched to `finalizers=[]` and deleted first. Then the five leftover phase namespaces were deleted. For the `networking` residue in `kube-system`, the cleanup also deleted the AWS load balancer controller namespaced objects plus the cluster-scoped `clusterrole`, `clusterrolebinding`, `ingressclass/aws-alb`, and both webhook configurations. After that, `bin/check-phase-deployment-status` reported every workload and namespace as `missing`, and `kubectl get application,applicationset -A` returned `No resources found`.
  expected difference on next run: the next full logged `apply` starts from a genuinely empty phase-3 baseline. Any create or destroy failure after this point is new evidence from the current design, not noise from orphaned Argo CRs or leftover phase workloads.

- timestamp: 2026-04-05T04:49:55-1000
  deploy log filename: logs/tofu-2026-04-05T04-29-36-apply.log
  change made: recorded the cleanup mistake explicitly and added the exact-scope cleanup guardrail to `AGENTS.md`
  reasoning: the next full apply proved that part of the earlier manual cleanup was wrong and costly. `logs/tofu-2026-04-05T04-29-36-apply.log` showed `replicaset/networking-aws-load-balancer-controller-8454c785bc` repeatedly failing pod creation because `serviceaccount "aws-load-balancer-controller-sa" not found`. That service account is not owned by this phase: `apps/infra/networking/chart/values.yaml` sets `serviceAccount.create: false`, and the real owner is the previous-phase Tofu resource `cluster-infra/infra/networking/controller-service-accounts.tf`. The exact objects I deleted and should not have deleted during cleanup were:
    - `serviceaccount/aws-load-balancer-controller-sa`
    - `service/aws-load-balancer-webhook-service`
    - `secret/aws-load-balancer-tls`
    - `role/networking-aws-load-balancer-controller-leader-election-role`
    - `rolebinding/networking-aws-load-balancer-controller-leader-election-rolebinding`
    - `clusterrole/networking-aws-load-balancer-controller-role`
    - `clusterrolebinding/networking-aws-load-balancer-controller-rolebinding`
    - `ingressclass/aws-alb`
    - `validatingwebhookconfiguration/aws-load-balancer-webhook`
    - `mutatingwebhookconfiguration/aws-load-balancer-webhook`
  reasoning continued: that was a costly mistake. It did not reveal a destroy bug; it injected new cross-phase damage. The next full apply then failed for the wrong reason, forced a targeted repair in the previous `cluster-infra` phase to recreate `kube-system/aws-load-balancer-controller-sa`, and consumed another cycle on recovery instead of diagnosis. The correction is now written into `AGENTS.md`: cleanup scope is exact, not inferred; delete only the workload objects named by `bin/check-phase-deployment-status`, plus the namespaces named by it and objects inside those namespaces; do not delete previous-phase support objects just because they look related.
  expected difference on next run: future cleanup should no longer remove previous-phase prerequisites like `kube-system/aws-load-balancer-controller-sa` or adjacent support objects in shared namespaces. The next destroy-to-scratch run should therefore only remove true phase residue and should not poison the following apply with self-inflicted cross-phase breakage.

- timestamp: 2026-04-05T07:02:00-1000
  deploy log filename: none; interactive `AWS_PROFILE=codeorg-admin tofu apply` in `../cluster-infra`
  change made: reran the required previous-phase sanity apply after phase-3 cleanup and proved the cleanup mistake exactly by recreating four previous-phase objects:
    - `Namespace/dex`
    - `ServiceAccount/dex/external-secrets-sa-dex`
    - `Namespace/external-dns`
    - `ServiceAccount/external-dns/external-dns-sa`
  reasoning: local `AGENTS.md` requires a `../cluster-infra` apply after phase 3 looks clean. That sanity check came back with `4 to add` and then recreated exactly the namespace and service-account objects above. This is proof that the earlier phase-3 cleanup again deleted previous-phase objects by accident. The recreated set matches the earlier observed cross-phase damage, but now it is re-proven under the current narrowed cleanup rules and recorded by exact name.
  expected difference on next run: the next full phase-3 apply should start from a repaired previous-phase baseline, with `dex` and `external-dns` support objects present again. If the next destroy leaves only the accepted namespace-scoped residue plus any newly identified phase-owned leftovers, the earlier cleanup mistake will no longer be contaminating the result.

- timestamp: 2026-04-05T23:11:59-1000
  deploy log filename: none; manual Helm plus Argo delete-hook experiment in live cluster
  change made: proved that `argocd-remove-ingress-postdelete.yaml` works in the narrow case it was designed for
  reasoning: the experiment intentionally isolated only the Argo self-delete ingress problem. From a clean `argocd` namespace, Helm installed `apps/infra/argocd/chart`, then only `apps/infra/argocd/application.yaml` was applied. The first attempt failed because the old hook image `registry.k8s.io/kubectl:v1.35.3` has no `/bin/sh`; after switching the hook image to `bitnami/kubectl:latest`, the retry succeeded. Deleting `Application/argocd` then created `Job/argocd-server-remove-ingress-postdelete`, and the hook logs showed the intended sequence exactly: `argocd-remove-ingress-postdelete: deleting ingress/argocd-server in namespace argocd`, then Kubernetes confirming `ingress.networking.k8s.io "argocd-server" deleted from argocd namespace`, then `argocd-remove-ingress-postdelete: deleted ingress/argocd-server in namespace argocd`. After that, the rest of the Argo control-plane objects were still present, which is the expected proof that the hook only removed the ingress and did not tear down Argo itself.
  reasoning continued: Helm uninstall immediately after the successful hook run also succeeded, which is the important follow-on proof. The old `Ingress/argocd-server` wedge did not recur. Helm still left namespace-local residue (`Secret/argocd-redis`, `ServiceAccount/argocd-redis-secret-init`, `Role/argocd-redis-secret-init`, and `RoleBinding/argocd-redis-secret-init`), so the namespace still had to be deleted afterward, but the ingress-driven uninstall timeout itself was gone in this isolated test.
  expected difference on next run: if the same hook runs during the full phase-3 destroy path, `Ingress/argocd-server` should be deleted before Helm uninstall reaches it, and the old Helm-side wedge on that ingress should not recur. Any remaining full destroy residue after that point should be treated as a narrower post-Helm namespace cleanup problem, not the old ALB-ingress finalizer problem.

- timestamp: 2026-04-05T23:13:45-1000
  deploy log filename: none; follow-up after the successful hook experiment
  change made: narrowed the next investigation target to the non-ingress residue that still remained after the earlier full destroy
  reasoning: the isolated hook test removed the biggest uncertainty. `Ingress/argocd-server` is no longer the first thing to chase. The next work should focus only on the remaining small residue set from the earlier full destroy that still needs to be explained or designed away:
    - `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
    - `Role/argocd-redis-secret-init`, namespace `argocd`
    - `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
    - `Secret/argocd-redis`, namespace `argocd`
    - `SigningKey/openid-connect-keys`, namespace `dex`
  expected difference on next run: the next destroy analysis should ignore the already-solved ingress wedge and instead determine whether these remaining objects are expected Helm leftovers, hook leftovers, controller leftovers, or real design bugs that still need a fix.

- timestamp: 2026-04-05T05:20:41-1000
  deploy log filename: logs/tofu-2026-04-05T05-14-09-destroy.log
  change made: recorded why the Ruby-owned `argocd-bootstrap` destroy path failed before Helm uninstall
  reasoning: this failure is real for the script path, even though the surrounding partial-cycle destroy is not valid evidence for the main app-of-apps wait question. The destroy-side script ran `helm upgrade argocd ... --install` as a pre-uninstall reconcile step and failed for two concrete reasons. First, the live Argo install was already self-managing the same resources, and the reconcile hit field-manager ownership conflicts against `argocd-controller` on multiple objects: `argocd-notifications-secret`, repo secrets `repo-code-dot-org`, `repo-k8s-gitops`, `repo-kargo-charts`, `Deployment/argocd-applicationset-controller`, `Deployment/argocd-repo-server`, and `StatefulSet/argocd-application-controller`. Second, the cluster was still dirty from the earlier networking cleanup mistake: the reconcile also failed validation on the Argo ingress because the AWS load balancer webhook service in `kube-system` had no endpoints (`failed calling webhook "vingress.elbv2.k8s.aws": no endpoints available for service "aws-load-balancer-webhook-service"`). So the current script assumption is too optimistic: "refresh Helm to latest git, then uninstall" is not automatically safe once Argo has been self-managing the same release.
  expected difference on next run: if the Ruby bootstrap path is retried without changing this ownership model, the destroy-side `helm upgrade --install` preflight is likely to fail again before uninstall. Either the pre-destroy reconcile step must be redesigned to avoid fighting Argo's live field ownership, or this script path should be treated as an abandoned branch rather than as the fix for the main full-cycle destroy.

- timestamp: 2026-04-05T05:23:50-1000
  deploy log filename: none; `git revert --no-edit 21d33389eda861076e5861f28eabf3fbdf5a80e0`
  change made: reverted the Ruby-owned `terraform_data.argocd_bootstrap` / `bin/argocd-bootstrap` branch and restored the simpler `helm_release` bootstrap path for now
  reasoning: user explicitly chose to park the script branch after the partial-cycle destroy exposed that its pre-destroy `helm upgrade --install` reconcile is not a drop-in replacement for the old path. The script branch is still recorded in git and in the notes, so it can be revived later if needed. For the next meaningful full clean apply/destroy cycle, the simpler `helm_release` ownership is the better baseline: fewer moving parts, less procedural logic, and no extra script-specific failure mode to confuse the main `app-of-apps-bootstrap.tf` wait question.
  expected difference on next run: the next apply/destroy cycle should once again use the original Terraform `helm_release.argocd_bootstrap` path instead of the Ruby wrapper, and there should be no script-side pre-destroy Helm reconcile attempt in the logs.

- timestamp: 2026-04-05T05:34:42-1000
  deploy log filename: none; manual cleanup after the parked-script rollback
  change made: re-established a true empty phase-3 baseline after the manual `helm uninstall argocd` cleanup wedged on the dead ALB finalizer path
  reasoning: after the script branch was parked and `helm_release` restored, the remaining live residue was narrow but still not clean: `bin/check-phase-deployment-status` showed all tracked workloads `missing`, but namespaces `argocd`, `external-dns`, and `external-secrets` were still active. Deleting those listed namespaces removed `external-dns` and `external-secrets`, but `argocd` stuck `Terminating`. Direct inspection proved the remaining content was entirely inside the listed namespace: `Ingress/argocd-server` with finalizer `ingress.k8s.aws/resources` and one `TargetGroupBinding` with finalizer `elbv2.k8s.aws/resources`. Because the phase-3 networking controller was correctly gone, both direct object patches failed on the dead AWS load balancer admission webhooks. The cleanup therefore used the namespace itself, which is directly listed by the phase check, as the final cleanup lever: `/api/v1/namespaces/argocd/finalize` was called with an empty `spec.finalizers` list. After that, `kubectl get namespace argocd` returned `NotFound`, `kubectl get application,applicationset -A -o wide` returned `No resources found`, and `bin/check-phase-deployment-status` reported every workload and namespace `missing`.
  expected difference on next run: the next full logged `apply` starts from a real empty phase-3 baseline again. Any apply or destroy failure after this point is current evidence from the restored `helm_release` path, not residue from the parked script branch or from the dead ALB finalizer path.

- timestamp: 2026-04-05T05:35:59-1000
  deploy log filename: logs/tofu-2026-04-05T05-35-32-apply.log
  change made: restored `kubectl_manifest.app_of_apps_bootstrap` to depend on `helm_release.argocd_bootstrap` after parking the Ruby bootstrap branch
  reasoning: the first clean full apply after the rollback failed before any cluster work because `app-of-apps-bootstrap.tf` still referenced `terraform_data.argocd_bootstrap`, which no longer exists after reverting commit `21d33389eda861076e5861f28eabf3fbdf5a80e0`. That was a narrow rollback follow-through bug, not a cluster symptom. The restored dependency edge points the wrapper app bootstrap back at the live `helm_release.argocd_bootstrap` resource, which is the real bootstrap owner on the current branch.
  expected difference on next run: the next full logged apply should get past Terraform validation and proceed into the real cluster-side create path instead of failing immediately on an undeclared-resource error.

- timestamp: 2026-04-05T05:37:31-1000
  deploy log filename: logs/tofu-2026-04-05T05-36-34-apply.log
  change made: removed the stale `terraform_data.argocd_bootstrap` state entry after parking the Ruby bootstrap branch
  reasoning: once the dependency edge was fixed, the next clean apply plan still wanted to destroy `terraform_data.argocd_bootstrap` because that parked script-owned resource remained only in state. Letting the clean full-cycle apply perform that destroy would have mixed old-script teardown behavior back into the new baseline and polluted the result. The right move was tweezers again: `AWS_PROFILE=codeorg-admin tofu state rm terraform_data.argocd_bootstrap`. That changes only bookkeeping and keeps the next apply focused on the restored `helm_release.argocd_bootstrap` path.
  expected difference on next run: the next full logged apply plan should no longer mention `terraform_data.argocd_bootstrap` at all. If it still does, the rollback cutover is not actually clean yet.

- timestamp: 2026-04-05T05:55:44-1000
  deploy log filename: none; manual cleanup and rendered phase-owned bulk delete before the next full cycle
  change made: re-established a true clean phase-3 baseline under the stricter rendered-cleanup rule by deleting the full rendered `~/src/k8s-gitops/apps/infra/*/chart` object set and then clearing the one remaining dead finalizer
  reasoning: after the failed `05:38` apply, the user explicitly asked for fast cleanup back to scratch. The brute pass first removed the tracked phase workloads and namespaces again: `bin/check-phase-deployment-status` returned every row `missing`. Then the new cleanup rule was exercised for real against the live source of truth, not the local experimental charts: all `~/src/k8s-gitops/apps/infra/*/chart` manifests were rendered with `~/src/k8s-gitops/apps/infra/codeai-cluster-config.values.yaml` and bulk-deleted. That removed the phase-owned support objects that `bin/check-phase-deployment-status` does not list directly, including the Argo CRDs and the external-secrets CRDs. The one rendered residue that still survived after that pass was `GatewayClass/aws-alb`, which comes from `apps/infra/networking/chart/templates/gateway-class.yaml`. A fresh read showed the exact reason it survived: it was already `Terminating` with dead finalizer `gateway.k8s.aws/gatewayclass` after the phase-owned networking controller had been removed. Clearing that finalizer and deleting the object finished the rendered cleanup. Final verification after that cleanup was:
    - `bin/check-phase-deployment-status`: every workload and namespace `missing`
    - `kubectl get namespace argocd dex external-dns external-secrets kargo --ignore-not-found`: no output
    - `kubectl get crd applications.argoproj.io applicationsets.argoproj.io appprojects.argoproj.io --ignore-not-found`: no output
    - `kubectl get service -n kube-system aws-load-balancer-webhook-service --ignore-not-found`: no output
    - `kubectl get deployment -n kube-system networking-aws-load-balancer-controller --ignore-not-found`: no output
    - `kubectl get validatingwebhookconfiguration aws-load-balancer-webhook --ignore-not-found`: no output
    - `kubectl get mutatingwebhookconfiguration aws-load-balancer-webhook --ignore-not-found`: no output
    - `kubectl get gatewayclass aws-alb --ignore-not-found -o name`: no output
  expected difference on next run: the next full logged apply now starts from the cleanest baseline we have had tonight: the tracked phase rows are gone, the rendered phase-owned cluster-scoped/shared-namespace support objects are gone, and the dead `aws-alb` finalizer path has been cleared out of the way before the next real create/destroy cycle.

- timestamp: 2026-04-05T06:21:11-1000
  deploy log filename: none; manual sanity apply in `../cluster-infra`
  change made: proved that the supposedly clean phase-3 baseline had still deleted previous-phase objects by mistake, and recorded the exact names
  reasoning: after the fresh phase-3 apply failed in the Dex and Kargo public URL waits, the user ordered a phase-2 sanity apply in `../cluster-infra` without disturbing phase 3. That apply was not a no-op. It recreated exactly three Kubernetes objects: `Namespace/dex`, `ServiceAccount/dex/external-secrets-sa-dex`, and `ServiceAccount/external-dns/external-dns-sa`. This is proof that the earlier phase-3 cleanup had gone too far and had removed previous-phase objects again. Those three names must now be treated as a concrete cleanup mistake, not as speculation, and future cleanup must always be followed by a `../cluster-infra` apply sanity check before trusting the baseline.
  expected difference on next run: after future cleanup-to-scratch, a follow-up `../cluster-infra` apply should be a no-op. If it wants to recreate anything, the baseline is not actually clean and the recreated object names must be logged immediately as accidental previous-phase deletions.

- timestamp: 2026-04-05T06:29:57-1000
  deploy log filename: logs/tofu-2026-04-05T05-56-40-apply.log
  change made: recorded the failed full apply as a limited success, because the initial wait failure was followed by a phase-2 repair and then full healthy convergence inside Argo
  reasoning: the logged apply itself still failed, and it failed exactly where the log says it failed: after `helm_release.argocd_bootstrap` completed and `kubectl_manifest.app_of_apps_bootstrap` created `Application/app-of-apps`, the two public waits `terraform_data.wait_for_dex_after_bootstrap` and `terraform_data.wait_for_kargo_after_bootstrap` started immediately and then died on local DNS lookups for `dex.k8s.code.org` and `kargo.k8s.code.org`. But that was not the whole story. The user correctly suspected previous-phase drift, ordered a `../cluster-infra` sanity apply, and that apply recreated `Namespace/dex`, `ServiceAccount/dex/external-secrets-sa-dex`, and `ServiceAccount/external-dns/external-dns-sa`. After those previous-phase repairs, live Argo recovered on its own without another phase-3 apply: `app-of-apps`, `infra`, `dex`, `external-dns`, `kargo`, and `kargo-project-codeai` all reached `Synced/Healthy`. So this failed apply should be treated as limited success: bootstrap worked, app-of-apps creation worked, Argo's internal graph progressed, and the failure evidence now points at the public wait assumptions plus the earlier cleanup damage, not at bootstrap ownership.
  expected difference on next run: the next phase-3 apply retry should not need to recreate `helm_release.argocd_bootstrap` or `kubectl_manifest.app_of_apps_bootstrap`; from the current partial state it should only rerun the wait/restart `terraform_data` resources. If the repaired phase-2 baseline is enough, that retry should get through the wait stage instead of dying on the same DNS lookups.

- timestamp: 2026-04-05T06:39:08-1000
  deploy log filename: logs/tofu-2026-04-05T06-30-36-apply.log
  change made: the phase-3 retry apply succeeded from the repaired partial state, and narrowed the public-wait issue to local macOS shell DNS lag rather than cluster health
  reasoning: the retry plan did exactly the safe thing the earlier partial-state plan promised: it did not touch `helm_release.argocd_bootstrap` or `kubectl_manifest.app_of_apps_bootstrap`, and only reran the tainted `terraform_data` waits plus the `argocd-server` restart/wait chain. `kargo.k8s.code.org` returned `200` immediately. `dex.k8s.code.org/.well-known/openid-configuration` stayed stuck for another `5m51s`, but the failure mode was now sharply defined: the browser on this same machine could already render the endpoint while shell-side `curl`, Ruby `Addrinfo.getaddrinfo`, and direct `./bin/wait-for-200` all still failed with `getaddrinfo`. `dscacheutil -flushcache` alone did not fix that shell-side resolver lag, and the root-only `killall -HUP mDNSResponder` step was not available in the non-interactive shell. At `06:37:17-1000` the running wait finally saw `dex` return `200`, proving the shell resolver had eventually caught up on its own. The retry then restarted `deployment/argocd-server`, waited for rollout completion, saw one transient `504` from `https://argocd.k8s.code.org/`, then got `200` and finished successfully at `06:38:53-1000`. Live shape after success was good enough for destroy work: `app-of-apps`, `infra`, `dex`, `external-dns`, `kargo`, and `kargo-project-codeai` were `Synced/Healthy`; `argocd-server`, `dex`, `external-dns`, `external-secrets`, and `kargo-api` deployments were all ready; the public ingresses for Argo, Dex, and Kargo existed. The only lagging leaf state was `codeai-staging` and `codeai-test`, both still `Synced/Progressing`.
  expected difference on next run: the next apply from a similar partial state should again be low-risk because only the wait/restart `terraform_data` resources need to rerun. For future waits on this macOS host, the newly added best-effort DNS-cache nudge in `bin/wait-for-200` may shorten the shell-side resolver lag, but that helper change was not what rescued this in-flight run because the long-lived wait process had already started before the file was edited.

- timestamp: 2026-04-05T07:45:00-1000
  deploy log filename: logs/tofu-2026-04-05T07-26-09-destroy.log
  change made: recorded the exact residue after the full destroy that proved the wrapper wait but still failed in Helm uninstall
  reasoning: this destroy answered the original narrow question cleanly. `kubectl_manifest.app_of_apps_bootstrap` started destroying at `07:26:34-1000` and did not finish until `07:27:51-1000`, so the bootstrap wrapper did wait `1m16s` for Argo-side deletion work before Helm was allowed to start. The later failure was different: `helm_release.argocd_bootstrap` then spent `5m20s` uninstalling and returned `uninstallation completed with 1 error(s): context deadline exceeded` at `07:33:13-1000`. Immediate post-destroy checks showed that all tracked workloads were gone, all `Application` and `ApplicationSet` CRs were gone, and the old `networking` wedge was fixed (`GatewayClass/aws-alb` and `LoadBalancerConfiguration/kube-system/aws-alb` were both missing). Helm-chart CRDs are not being counted as residue here; that is just a Helm ownership/timeout artifact. The object-level residue is now narrower and exact:
    - phase-3 residue from this destroy:
      - `Ingress/argocd-server`, namespace `argocd`
      - `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
      - `Role/argocd-redis-secret-init`, namespace `argocd`
      - `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
      - `Secret/argocd-redis`, namespace `argocd`
      - `TargetGroupBinding/k8s-argocd-argocdse-817b2865e4`, namespace `argocd`
      - `Namespace/argocd`
      - `Namespace/external-secrets`
      - `Namespace/kargo`
      - `SigningKey/openid-connect-keys`, namespace `dex`
    - objects still present but proven previous-phase ownership:
      - `Namespace/dex`
      - `Namespace/external-dns`
      - `ServiceAccount/external-secrets-sa-dex`, namespace `dex`
      - `ServiceAccount/external-dns-sa`, namespace `external-dns`
  reasoning continued: the current live state sharpens the blocker further. `Ingress/argocd-server` is itself in deletion with finalizer `["ingress.k8s.aws/resources"]`. The corresponding `TargetGroupBinding/k8s-argocd-argocdse-817b2865e4` still exists, is not in deletion, and still carries `["elbv2.k8s.aws/resources"]`. By contrast, the `argocd-redis-secret-init` service account/role/rolebinding, `Secret/argocd-redis`, and `SigningKey/dex/openid-connect-keys` are all still plain live objects with no `deletionTimestamp` at all. The surviving phase-owned namespaces `argocd`, `external-secrets`, and `kargo` are also still plain `Active` namespaces with only the normal namespace finalizer `["kubernetes"]`, not namespaces that are mid-delete.
  expected difference on next run: no more work should be spent on the old "wrapper returned too early" theory or on the old `networking` gateway-finalizer wedge, because both are now disproven/fixed in the real tree. The remaining problem is narrower: Helm uninstall leaves a small set of Argo/CRD/namespace residue and times out while doing so.

- timestamp: 2026-04-05T07:59:37-1000
  deploy log filename: pending next destroy; timeout-only follow-up
  change made: temporarily raised `helm_release.argocd_bootstrap.timeout` from the previous `300` second default to `600` seconds to test whether Helm uninstall is merely slow or would still sit twice as long without clearing the remaining residue
  reasoning: this is deliberately a narrow experiment, not a design decision. The last full destroy already proved that `kubectl_manifest.app_of_apps_bootstrap` waited for Argo and that the old `networking` wedge is gone. The open question is now smaller: whether the Helm-side `context deadline exceeded` is just an overly short uninstall timeout or evidence that the remaining residue is not progressing at all. This timeout bump should therefore be reverted after the test, regardless of outcome, so we do not accidentally normalize a debugging knob into the real configuration. The narrowed live finalizer state at the time of the timeout change is:
    - pending delete and waiting on a finalizer:
      - kind/name `Ingress/argocd-server`, namespace `argocd`, finalizer `ingress.k8s.aws/resources`
    - still carrying finalizers but not itself in deletion:
      - kind/name `TargetGroupBinding/k8s-argocd-argocdse-817b2865e4`, namespace `argocd`, finalizer `elbv2.k8s.aws/resources`
    - explicitly not part of the pending-delete/finalizer set:
      - kind/name `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
      - kind/name `Role/argocd-redis-secret-init`, namespace `argocd`
      - kind/name `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
      - kind/name `Secret/argocd-redis`, namespace `argocd`
      - kind/name `SigningKey/openid-connect-keys`, namespace `dex`
      - kind/name `Namespace/argocd`, namespace `-`
      - kind/name `Namespace/external-secrets`, namespace `-`
      - kind/name `Namespace/kargo`, namespace `-`
  expected difference on next run: if `600` seconds is enough and Helm eventually clears the residue, the last destroy failure was mostly timeout pressure. If Helm simply waits roughly twice as long and still leaves the same live set behind, the timeout was only exposing a true stuck teardown and should be reverted immediately after that proof is captured.

- timestamp: 2026-04-05T21:33:29-1000
  deploy log filename: none; interactive summary
  change made: recorded the exact chat summary verbatim, with the observed ingress class name carried through into the conclusion
  verbatim summary:
    **argo-bootstrap.tf wedges upon deleting ingress/argocd-server and times out**

    1. when we install argo initially via `helm_release`, it doesn't require networking for Argo core itself
    2. but then we later install networking, and that brings in the AWS load balancer controller / ingress machinery, including a default ingress class, `aws-alb`
    3. then we restart Argo at the end of the Tofu install
    4. the exact Argo k8s object is `Ingress/argocd-server` in namespace `argocd`
    5. that ingress is what makes `https://argocd.k8s.code.org` work, and it leads to the derived `TargetGroupBinding/k8s-argocd-argocdse-817b2865e4`
    6. the observed live `Ingress/argocd-server` manifest now has `spec.ingressClassName: aws-alb`
    7. when we go to delete, we tear down `networking` as part of the app-of-apps uninstall, leaving `Ingress/argocd-server` stuck with finalizer `ingress.k8s.aws/resources`
    8. this leaves that Argo ingress path with finalizers that can no longer complete:
       `TargetGroupBinding/k8s-argocd-argocdse-817b2865e4` still carries finalizer `elbv2.k8s.aws/resources` and likely needs the AWS load balancer controller alive to finish its AWS cleanup
    9. therefore when we get to `argocd-bootstrap.tf`, Helm hangs on removing the `helm_release.argocd_bootstrap` and times out

    Conclusion: to be deleted, Argo must not have the networking ingress class `aws-alb` on it at time of delete.

- timestamp: 2026-04-06T01:52:30-1000
  deploy log filename: logs/tofu-2026-04-06T01-26-41-apply.log and logs/tofu-2026-04-06T01-43-07-destroy.log
  change made: recorded the first clean full apply/destroy cycle after the two systemic fixes, and the exact post-destroy residue shape
  reasoning: this cycle was the real proof run from an actually empty phase-3 baseline. The full logged apply still ended the same way it has been ending lately: bootstrap succeeded, `helm_release.argocd_bootstrap` finished after `3m44s`, `kubectl_manifest.app_of_apps_bootstrap` created successfully, and then the public waits for Dex and Kargo hit the local shell-side DNS failure path and timed out at `600s`. That is not the destroy bug. The full logged destroy that followed is the important result. `kubectl_manifest.app_of_apps_bootstrap` started destroying at `01:44:39-1000` and did not finish until `01:51:13-1000`, so it waited `6m34s` for the Argo-side delete chain. During that wait, the two tested fixes both fired in the real tree:
    - `Application/argocd` entered deletion before `networking`
    - `Job/argocd-server-remove-ingress-postdelete` was created by Argo, pulled the `bitnami/kubectl:latest` image, and logged:
      - `argocd-remove-ingress-postdelete: deleting ingress/argocd-server in namespace argocd`
      - `ingress.networking.k8s.io "argocd-server" deleted from argocd namespace`
      - `argocd-remove-ingress-postdelete: deleted ingress/argocd-server in namespace argocd`
    - live `kubectl get ingress -n argocd argocd-server` then returned `NotFound`
  reasoning continued: once `app-of-apps` completed, `helm_release.argocd_bootstrap` uninstall started at `01:51:13-1000` and finished cleanly at `01:51:45-1000`, only `32s` later. This is the first full-cycle proof that the old Helm-side Argo uninstall wedge is gone. Immediate post-destroy `bin/check-phase-deployment-status` showed all tracked workloads `missing`, but namespaces `argocd`, `external-dns`, and `external-secrets` were still `active`. Direct inspection showed:
    - namespace `argocd` contained only:
      - `Secret/argocd-redis`, namespace `argocd`
      - `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
      - `Role/argocd-redis-secret-init`, namespace `argocd`
      - `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
    - namespace `external-dns` contained only:
      - `ServiceAccount/default`, namespace `external-dns`
      - `ConfigMap/kube-root-ca.crt`, namespace `external-dns`
    - namespace `external-secrets` contained only:
      - `ServiceAccount/default`, namespace `external-secrets`
      - `ConfigMap/kube-root-ca.crt`, namespace `external-secrets`
  reasoning continued: deleting those three namespaces (`argocd`, `external-dns`, `external-secrets`) immediately returned the module to a fully clean state. A final `bin/check-phase-deployment-status` then reported every workload and every tracked namespace `missing`.
  expected difference on next run: the Argo destroy path itself is now one-shot clean in the real tree. The remaining recurring apply pain is the public wait path (`dex.k8s.code.org` and `kargo.k8s.code.org`) and its local shell-side DNS behavior, not the destroy graph.
