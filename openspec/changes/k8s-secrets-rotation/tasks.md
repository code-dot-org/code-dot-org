# k8s-secrets-rotation — tasks

## 1. Rotation plumbing

- [ ] 1.1 Add Reloader annotations (explicit `cdo-external-secrets` watch
      list, annotations strategy) to the dashboard and activejob-worker
      Deployment templates in `k8s/helm/templates/dashboard/`
- [ ] 1.2 File and link the k8s-gitops/opentofu PR installing Reloader;
      sequence it before the annotation PR merges
- [ ] 1.3 Configure AWS SM alternating-users rotation for the MySQL
      credential secret (rotation Lambda + schedule), non-prod first

## 2. Validation

- [ ] 2.1 Add a CI check that every AWS SM key destined for
      `cdo-external-secrets` matches `[A-Za-z_][A-Za-z0-9_]*`; derive the
      key list from the ExternalSecret/SM source, not a hand-kept copy
- [ ] 2.2 Wire the check into the k8s validate workflow
      (`.github/workflows/k8s-validate.yml` territory)

## 3. Docs

- [ ] 3.1 Update `k8s/docs/kubernetes-secrets.md`: canonical-path rule (ESO
      env for k8s workloads; `!Secret`/`!StackSecret` reserved for
      `CfnStack/*` on EC2)
- [ ] 3.2 Add a rotation runbook: normal path (SM edit → ESO → Reloader →
      rollout) and revocation-in-anger fast path (`rollout restart`)
- [ ] 3.3 Document the `enableServiceLinks: false` rationale in the doc and
      as a comment next to the setting in `_dashboard.yaml`

## 4. Env hygiene

- [ ] 4.1 Audit Honeybadger config (`dashboard/engines/observability`) for
      ENV scrubbing; confirm no `CDO_*` values ship in crash payloads
- [ ] 4.2 Fix scrub config if the audit finds leaks; add a regression test

## 5. Verification

- [ ] 5.1 Non-prod: edit a low-stakes SM key; confirm the Deployments roll
      within one refresh interval and new pods see the new value
- [ ] 5.2 Non-prod: rotate the MySQL credential under synthetic load;
      confirm zero 5xx through the rollout window
- [ ] 5.3 CI: add a deliberately invalid SM key name in a test fixture;
      confirm the validate check fails naming the key
- [ ] 5.4 Trigger a test exception in a pod; inspect the Honeybadger payload
      for `CDO_*` values
