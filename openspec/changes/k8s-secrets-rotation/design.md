# k8s-secrets-rotation — design

## Context

Current state: AWS Secrets Manager holds `{env}/cdo/*`; ESO syncs them into
the k8s Secret `cdo-external-secrets` on a 5-minute refresh; the pod template
(`k8s/helm/templates/dashboard/_dashboard.yaml`) maps every key via `envFrom`
with a `CDO_` prefix; `lib/cdo.rb` parses `CDO_*` ENV at boot. Documented in
`k8s/docs/kubernetes-secrets.md`. `enableServiceLinks: false` is already set
(_dashboard.yaml:196).

2025-26 research verdict: this pipeline is the mainstream pattern. ESO
recovered from its 2025 maintenance scare (stable v1 API, Red Hat-supported
operator, CNCF incubation applicant). Env-var consumption is acceptable with
hardening. Do NOT migrate to the CSI driver or Vault injection; do NOT adopt
Rails `credentials.yml.enc` (GitLab and Shopify on k8s don't either —
master-key distribution problem, worse rotation).

A second, overlapping path exists: runtime lazy AWS SM fetches via
`!Secret`/`!StackSecret` YAML tags resolved by `lib/cdo/secrets_config.rb`
(lazy `Cdo::Secrets` lookups at first access). Both paths need pod IAM; two
failure modes, two audit surfaces.

## Goals / Non-Goals

**Goals:**
- A secret changed in AWS SM reaches running pods without manual restarts.
- MySQL credential rotation with zero downtime.
- No silently-dropped secret keys; failures surface in CI, not in prod.
- One documented rule for which secret path a workload uses.
- `CDO_*` values stay out of crash payloads.

**Non-Goals:**
- Replacing the ESO → env-var pipeline (verified as the right pattern).
- CSI driver, Vault injection, or `credentials.yml.enc` migration.
- File-mounted secrets for all keys (deliberately deferred; see Open
  Questions).
- Changing `lib/cdo.rb` config parsing semantics in this change.

## Decisions

1. **Reloader with an explicit annotation watch list, not `auto` mode.**
   `reloader.stakater.com/search` + `secret.reloader.stakater.com/reload:
   cdo-external-secrets` on the dashboard and activejob-worker Deployments
   triggers a rolling restart when the Secret's data changes. Annotations
   keep the reload set explicit and play well with ArgoCD diffing; `auto`
   mode reloads on any referenced resource and hides intent. Alternatives:
   ESO `templateFrom` checksum in pod annotations (couples chart to Secret
   contents), kubelet-level projected-volume refresh (doesn't help env vars),
   a rotation CronJob doing `rollout restart` (a worse Reloader).
2. **AWS SM alternating-users rotation for MySQL credentials.** The rotation
   Lambda flips between two DB users; the old credential stays valid while
   Reloader rolls pods, so in-flight connections and not-yet-restarted pods
   keep working. This is the entire zero-downtime story — no connection
   sidecars, no client-side retry hacks. Alternative (single-user rotation):
   old password dies at rotation instant, guaranteeing a failure window on
   any pod that hasn't restarted yet.
3. **Canonical rule: k8s workloads use ESO env; runtime fetch is for
   stack-scoped secrets on EC2.** k8s-deployed processes read config only
   from `CDO_*` env vars; `!Secret`/`!StackSecret` lazy fetches remain for
   `CfnStack/*` secrets on EC2 where per-stack scoping matters. Rule lands in
   `k8s/docs/kubernetes-secrets.md`. Alternative (collapse to one path
   everywhere): would force the EC2 fleet onto a k8s-shaped mechanism it
   doesn't have, for no gain.
4. **CI validation of key names, not runtime detection.** `envFrom` drops
   keys that don't match `[A-Za-z_][A-Za-z0-9_]*` with at most a pod event —
   and a k8s regression removed even that warning. A validate-workflow check
   that every AWS SM key destined for `cdo-external-secrets` is a valid
   env-var name fails the PR/deploy instead. Alternative (runtime assert in
   cdo.rb): too late — the key is already gone by the time Ruby boots.
5. **Keep env-var consumption; defer the file-mount provider.** An optional
   provider reading `/etc/cdo-secrets/<key>` files with env fallback would be
   OWASP-preferred (no child-process inheritance, atomic rotation via
   projected-volume symlink swap) but touches `lib/cdo.rb` load order and
   every deploy surface. Hardening now (scrubbed reporters, documented
   `enableServiceLinks`) captures most of the value at a fraction of the
   blast radius.
6. **Document `enableServiceLinks: false` as load-bearing, not incidental.**
   `lib/cdo.rb` enumerates ENV by `CDO_` prefix (ENV_PREFIX regex); a Service
   named `cdo-*` in the namespace would inject `CDO_*_SERVICE_HOST` et al.
   straight into the config namespace. The setting exists; the rationale is
   nowhere. Write it down next to the setting and in the secrets doc.

## Risks / Trade-offs

- [Reloader rolls every pod on any watched-Secret change; a fat-fingered SM
  edit restarts the fleet] → explicit watch list keeps the trigger surface
  small; rolling strategy with existing surge settings bounds the blast;
  rotation runbook says to batch SM edits.
- [Alternating-users rotation requires the app to pick up the new username,
  not just password] → both come from the same SM secret JSON; the rolling
  restart re-reads both atomically. Verify in staging before enabling in
  prod.
- [ESO refresh (≤5 min) + Reloader + rollout is minutes of propagation lag]
  → acceptable for rotation; for revocation-in-anger, the runbook includes a
  manual `rollout restart` fast path.
- [CI key-name check can drift from what ESO actually syncs] → derive the
  key list from the same source (SM listing / ExternalSecret manifest) rather
  than a hand-maintained copy.
- [Cross-repo coupling: Reloader install lives in k8s-gitops/opentofu] →
  this change carries only the annotations, which are inert without the
  operator; sequence the gitops PR first and link both PRs.

## Migration Plan

1. Land docs + CI validation (no behavior change).
2. Gitops repo: install Reloader (separate PR, linked).
3. Add annotations to the dashboard and activejob-worker Deployments; verify
   in a non-prod env that an SM edit rolls pods within one refresh interval.
4. Enable alternating-users rotation on the MySQL secret in non-prod; rotate
   under load, confirm zero 5xx; then prod.

Rollback: remove annotations (pods stop auto-rolling; nothing else changes);
disable the rotation schedule in SM. No data migration.

## Open Questions

- File-mount provider for a small set of high-value keys
  (`/etc/cdo-secrets/<key>` files, env fallback, atomic rotation): worth a
  follow-up proposal once rotation is proven?
- `YAML.load` type coercion of env values in `lib/cdo.rb:404`: a password
  `no` becomes `false` (parse-failure fallback to string exists, but valid
  YAML scalars coerce). Spike on strict string mode for secret-sourced keys?
- `PERMIT_UNKNOWN_PROPERTIES_IN_CDO=1` is set pod-wide, permanently disabling
  the config typo-guard. Can it be narrowed now that the key set is
  CI-validated?
