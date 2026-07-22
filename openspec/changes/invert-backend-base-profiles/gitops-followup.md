# Draft issue for code-dot-org/k8s-gitops

Title: Configure cdo-active-job-worker per envType

Body:

code-dot-org's kustomize `base` now renders a `cdo-active-job-worker`
Deployment (the first piece of the app migrating to Kubernetes; see the
invert-backend-base-profiles change in code-dot-org). Every envType overlay
that composes `//k8s/kustomize/base` therefore renders the worker, with all
environment-specific fields pinned to interim defaults:

- `RAILS_ENV=adhoc` (env), 1 CPU / 2Gi requests+limits, replicas 1,
  `imagePullPolicy: IfNotPresent`, uid 1000
- container-level `CDO_*` env pins worker tuning and blanks several secrets
  (`CDO_RECAPTCHA_*`, `CDO_CONTENTFUL_*`, ...) that otherwise fail Config
  validation booting a pared-down environment; plain env beats envFrom, so
  external-secret values do NOT reach these keys yet

Per-envType work needed before any server environment relies on the worker:

1. deployment-root patch: staging/test run the chart as root
   (`user.uid: 0` in deployment values) and root-patch `cdo-dashboard` by
   name; add the equivalent patch for `cdo-active-job-worker`, or drop root
   entirely. Until then `verify-helm-parity` in code-dot-org carries an
   accepted-drift rule for the worker's pod securityContext — remove that
   rule when this lands.
2. RAILS_ENV / RACK_ENV env patch per envType (production, staging, test,
   levelbuilder), mirroring the existing `cdo-dashboard` deployment.patch.
3. Resources, replicas, and scheduling (nodeSelector/tolerations) sized per
   environment.
4. Un-pin the blanked `CDO_*` env entries once external secrets should flow
   to the worker.
5. Helm parity: the same values must land in `activeJobWorker.*` in the
   envType/deployment values files so `verify-helm-parity` stays green.
