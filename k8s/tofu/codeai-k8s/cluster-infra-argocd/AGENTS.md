- When making Helm chart changes you wish to `tofu apply`, be sure to bump the Helm chart version number or it will say there is no diff to apply.

## Diagnosing tofu apply/destroy failures

- In this directory, use `bin/logged-tofu <apply|destroy> "<what is being tested>"` for every `tofu` apply or destroy unless the user explicitly says not to log. Plain `tofu plan` is fine unless a logged plan is specifically requested. `bin/logged-tofu` writes both the rolling file `tofu.log` in this directory and a per-run timestamped file under `logs/`, inserts 50 blank lines and a `START OF TOFU RUN` marker before each run, and keeps the `kubectl get events -A --watch --output-watch-events` logger running after `tofu` exits. When starting a logged run I must echo the exact `tail -n +1 -f ...` commands for both the per-run log and the rolling `tofu.log` in chat. When I am figuring out what happened in a logged run, I must only inspect the latest per-run log file, not `tofu.log`, because the rolling file will blow out context. After I have verified health of everything in Argo and on the cluster, or we have accepted the remaining problem, I must stop the watcher with `bin/logged-tofu-stop`.
- After any `tofu destroy` here says it is done, I must immediately run `bin/check-phase-deployment-status`. That command is the source of truth for what phase-3 resources must be gone. Any row it reports with a status other than `missing` is a destroy failure, and must be debugged until we've gotten it destroying perfectly. Immediate next step: inspect the end of the latest per-run `logs/tofu-*.log` file and diagnose why those resources survived.
- After diagnosis, we must try to make systemic fixes that prevent the un-cleaned-up resources from surviving the next "tofu destroy"
- After diagnosis, maybe some discussion, and making fixes, the default is to discuss the cleanup plan with the user before deleting residue. I should not start cleanup on my own unless the user explicitly tells me otherwise. You can ask if you think we've got a fix in place and you think we're ready to cleanup just say "Cleanup cluster?" at the end of your chat.
- When the user says `cleanup`, `clean up`, or `cleanup the phase` (or variants, be smart), then I should keep deleting residue until every row from `bin/check-phase-deployment-status` reports `missing`, then verify again and report the final clean state.
- Cleanup scope is exact, not inferred.
- `bin/check-phase-deployment-status` is necessary but not always sufficient to
  call the phase "clean". If an app in this phase owns cluster-scoped or
  shared-namespace support objects, verify those are gone too before the next
  apply.
- When cleaning phase residue, delete only:
  - the workload objects named directly by `bin/check-phase-deployment-status`
  - the namespaces named directly by `bin/check-phase-deployment-status`, plus namespaced objects inside those namespaces
- Do not delete resources created by the previous phase. Some of them may look tempting, but they are not for you.
- Do not delete any other support objects just because they appear related. In particular, do not delete service accounts, RBAC, webhooks, ingress classes, CRDs, secrets, configmaps, or cloud-side residue outside the listed namespaces unless:
  - the object is directly named by `bin/check-phase-deployment-status`, or
  - ownership has been proven from source code, and the user explicitly approves broader cleanup
- For workloads listed in shared namespaces like `kube-system`, delete only the exact listed workload object, not adjacent support objects.
- Exception for proven phase-owned cluster-scoped/shared-namespace residue:
  once ownership is proven from rendered source, it is allowed to delete those
  exact rendered objects even if `bin/check-phase-deployment-status` does not
  name them directly.
- For cleanup-to-scratch or other brute cleanup, do not hand-pick first. The required default fast path is: render the exact phase-owned manifests from `~/src/k8s-gitops/apps/infra/*/chart` with the real values file `~/src/k8s-gitops/apps/infra/codeai-cluster-config.values.yaml`, make one exact object list from that rendered output, and try one bulk delete of that whole rendered set in a single pass.
- Explicit approval rule: if an object is created by the rendered `~/src/k8s-gitops/apps/infra/*/chart` manifests, it is in scope for cleanup here and should be included in that bulk delete without extra approval.
- Source of truth for that rendered cleanup is `~/src/k8s-gitops/apps/infra`, not the local charts or experiments under `code-dot-org/k8s/tofu/...`.
- Rendered bulk cleanup is allowed here because the current `~/src/k8s-gitops/apps/infra/*/application.yaml` files all point at `apps/infra/*/chart`. If that stops being true, re-check before using this rule.
- After I think phase 3 is clean, I must run `tofu apply` in `../cluster-infra` as a sanity check for accidental previous-phase deletions before trusting the baseline.
- If that `../cluster-infra` apply wants to recreate anything, I must treat that as proof that phase-3 cleanup deleted previous-phase objects by mistake, and I must list those recreated objects by exact name in `NOTES.md` as a cleanup mistake.
