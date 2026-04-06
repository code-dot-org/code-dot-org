# Checklist

- [x] Append a `NOTES.md` entry for the cleanup-scope guardrail change and send the note to Slack
- [x] Append a `NOTES.md` entry for the Ruby bootstrap-script destroy failure and send the note to Slack
- [x] Finish exact cleanup until `bin/check-phase-deployment-status` reports every workload and namespace `missing`
- [x] Verify `kubectl get application,applicationset -A` is empty again at the clean baseline
- [x] During cleanup-to-scratch, render `~/src/k8s-gitops/apps/infra/*/chart` with the real values file and try one bulk delete of the full rendered object set
- [x] Verify phase-owned cluster-scoped/shared-namespace residue is also gone before the next apply
  - current explicit case: render `apps/infra/networking/chart` and ensure the ALB webhook service/configs and other rendered networking support objects are gone
- [x] Append a `NOTES.md` entry for the return-to-clean-baseline result and send the note to Slack
- [x] Start one full logged `apply` from the clean baseline
- [x] Be patient with the apply; wait for Argo and the cluster workloads to settle before judging anything
- [x] Verify the full apply reached the expected live shape before destroy
- [x] Append a `NOTES.md` entry for the full-apply result and send the note to Slack
- [x] Start one full logged `destroy` from that full apply
- [x] Immediately run `bin/check-phase-deployment-status`
- [x] If any residue survives, append every surviving object to `NOTES.md` by exact `Kind/name` plus namespace when present
- [x] Inspect the full-destroy per-run log for the narrow question: did `app-of-apps-bootstrap.tf` wait for Argo to finish deleting `app-of-apps` and descendants?
- [x] Append a `NOTES.md` entry for the full-destroy result and send the note to Slack
- [x] Decide whether mimic is still needed:
  - if `app-of-apps-bootstrap.tf` clearly waited, remove mimic from the active plan for now
  - if it still returned early, keep mimic available as the next isolation harness

## Next Iteration

- [x] Start from a real empty phase-3 baseline
- [x] Confirm `bin/check-phase-deployment-status` reports every workload and namespace `missing`
- [x] Confirm `kubectl get application,applicationset -A` returns no resources
- [x] Confirm `namespace/argocd` and `namespace/dex` are both absent before the next apply
- [x] Start one fresh full logged `tofu apply`
- [x] Wait through slow Fargate startup; do not treat normal startup delay as evidence
- [x] Confirm the apply reaches the expected live shape
  - `app-of-apps`, `infra`, `dex`, `external-dns`, and `kargo` healthy enough for destroy
  - `argocd` bootstrap live
- [x] Start one fresh full logged `tofu destroy`
- [x] Watch specifically for the two already-tested fixes:
  - `Application/argocd` postdelete hook removes `Ingress/argocd-server`
  - `networking` gateway objects prune cleanly before the controller dies
- [x] After destroy, treat these as accepted namespace-scoped residue if they are the only leftovers:
  - `ServiceAccount/argocd-redis-secret-init`, namespace `argocd`
  - `Role/argocd-redis-secret-init`, namespace `argocd`
  - `RoleBinding/argocd-redis-secret-init`, namespace `argocd`
  - `Secret/argocd-redis`, namespace `argocd`
  - `SigningKey/openid-connect-keys`, namespace `dex`
  - `Namespace/argocd`
  - `Namespace/dex`
- [x] If anything else survives, record every residue object in `NOTES.md` as exact `Kind/name` plus namespace
- [x] Append one `NOTES.md` entry for the full clean-cycle result
