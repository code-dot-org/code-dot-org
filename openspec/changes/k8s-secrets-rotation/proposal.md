# k8s-secrets-rotation

## Why

The secrets pipeline (AWS Secrets Manager → External Secrets Operator →
`cdo-external-secrets` → `envFrom` with `CDO_` prefix → `lib/cdo.rb`) is the
right pattern and stays. But env vars freeze at process start: ESO's 5-minute
refresh updates the k8s Secret and changes nothing in running pods, so there
is no rotation story. Around that gap sit three smaller ones: `envFrom`
silently drops Secret keys that aren't valid env-var names (a k8s regression
removed even the pod-event warning); two overlapping secret paths (ESO env
vars vs runtime `!Secret` fetches via `lib/cdo/secrets_config.rb`) with no
rule for which to use; and every `system()` child and crash reporter inherits
the full `CDO_*` env.

## What Changes

- Deploy stakater/Reloader (install lives in k8s-gitops/opentofu, out of this
  repo); annotate the dashboard and activejob-worker Deployments with an
  explicit secret watch list (annotations strategy, not `auto`, for ArgoCD
  compatibility).
- Adopt AWS SM alternating-users rotation for the MySQL credentials so the
  old credential stays valid through the rolling-restart window. That is the
  entire zero-downtime story; no sidecars.
- Add a CI validate check that every AWS SM key destined for
  `cdo-external-secrets` matches `[A-Za-z_][A-Za-z0-9_]*`.
- Document the canonical rule in `k8s/docs/kubernetes-secrets.md`:
  k8s-deployed workloads consume ESO env vars; runtime lazy fetch is reserved
  for stack-scoped `CfnStack/*` secrets on EC2.
- Audit exception reporters (Honeybadger, `dashboard/engines/observability`)
  to ensure ENV is scrubbed from crash payloads.
- Document why `enableServiceLinks: false` is load-bearing: a Service named
  `cdo-*` would inject `CDO_*_SERVICE_HOST` vars straight into the config
  namespace (`lib/cdo.rb` enumerates ENV by `CDO_` prefix).

## Capabilities

### New Capabilities

- `k8s-secrets-lifecycle`: the contract for how secrets reach pods, rotate
  without downtime, get validated, and stay out of crash payloads.

### Modified Capabilities

None (no existing specs).

## Impact

- `k8s/helm/templates/dashboard/_dashboard.yaml` and deployment templates
  (Reloader annotations)
- `k8s/docs/kubernetes-secrets.md` (canonical-path rule, rotation runbook,
  `enableServiceLinks` rationale)
- CI validate workflow (`.github/workflows/k8s-validate.yml` territory)
- Cross-repo: Reloader install and ESO config live in k8s-gitops/opentofu —
  called out explicitly, not changed here
- Independent of the docker image proposals.
