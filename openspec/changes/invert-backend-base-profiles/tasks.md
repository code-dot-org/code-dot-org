# Tasks

## 1. Kustomize component split (no behavior change)

- [x] 1.1 Record baseline renders: `kustomize build` output for `base` and
      every overlay (development, skaffold, production, staging, test,
      levelbuilder, activejob-only) saved for later diffing
- [x] 1.2 Create `k8s/kustomize/components/backend` holding locals.yml,
      cdo-local-secrets, the `cdo-active-job-worker` Deployment (moved from
      `overlays/activejob-only/active-job-worker-deployment.yaml`, with a
      spec safe for unconfigured envTypes), and backend-only locals
      overrides moved from `overlays/activejob-only/locals.patch.yaml`
- [x] 1.3 Create `k8s/kustomize/components/dashboard` holding the
      cdo-dashboard Deployment, Service, and Ingress moved from `base/`
- [x] 1.4 Rewrite `base/kustomization.yaml` to compose backend + dashboard
      components; verify `kustomize build base` matches the 1.1 baseline
      with exactly one delta: the added `cdo-active-job-worker` Deployment
- [x] 1.5 Verify all env overlays (production/staging/test/levelbuilder)
      render identically to baseline apart from the added worker
      Deployment, and that the remote gitops envType components apply
      cleanly against it; run `verify-helm-parity` and update its baseline
      for the worker

## 2. Backend overlay and dashboard layering (Kustomize)

- [x] 2.1 Create `overlays/backend` composing `components/backend` (which
      now includes the worker Deployment) and the mysql/redis/minio
      components
- [x] 2.2 Rework `overlays/development` to compose `overlays/backend` (or
      the same components) plus `components/dashboard` and its existing
      dashboard patches; confirm rendered output matches the 1.1 baseline
      for development
- [x] 2.3 Delete `overlays/activejob-only` including all `$patch: delete`
      files (deployment, ingress, service) and confirm nothing references it
- [x] 2.4 Point `overlays/setup-db-minimal` (and any other overlay that
      referenced activejob-only or development) at the new layering

## 3. Skaffold inversion (both variants, same commits)

- [x] 3.1 Root `skaffold.yaml`: make the base `code-dot-org` artifact build
      `--target code-dot-org-activejob-only` requiring only
      `code-dot-org-core`; drop pegasus/static/db-seed from the base
      artifact list
- [x] 3.2 Root `skaffold.yaml`: add a `dashboard` profile (auto-activated on
      `command: dev` / `command: debug`) that appends the
      pegasus/static/db-seed artifacts, switches the image build to
      `--target runtime` with the frontend build args, and stacks the
      dashboard Helm values layer
- [x] 3.3 Root `skaffold.yaml`: remove the `activejob-only` profile; fold
      `IMPORT_IMAGE_TO_K8S_NODE=true` into the base build command if the
      local cluster still needs it; drop `BUNDLE_JOBS=1` unless still
      required
- [x] 3.4 `k8s/kustomize/skaffold.yaml`: apply the identical inversion —
      backend base builds/deploys `overlays/backend` (via the skaffold
      overlay), `dashboard` profile adds artifacts and switches manifests to
      the development/skaffold dashboard overlay; remove `activejob-only`
- [x] 3.5 Fix the `mimic` profile in both variants for the new artifact
      list: replace index-based patches with whole-array replacement or
      verified post-dashboard indices
- [x] 3.6 Update file header comments and profile comments in both variants:
      document `skaffold dev` (full app), `skaffold dev -p -dashboard`
      (backend only), and the setup-db-minimal combo replacing
      `-p activejob-only`

## 4. Helm values inversion

- [x] 4.1 Flip `k8s/helm/values.yaml` defaults to backend-only:
      `dashboard.enabled: false`, `activeJobWorker.enabled: true`,
      backend locals/env defaults absorbed from `activejob-only.values.yaml`
- [x] 4.2 Add `k8s/helm/dashboard.values.yaml` enabling the dashboard
      Deployment/Service/Ingress, health checks, and dashboard locals;
      wire it into the `dashboard` Skaffold profile
- [x] 4.3 Delete `k8s/helm/activejob-only.values.yaml`; reconcile
      `development.values.yaml` and `adhoc.values.yaml` with the new
      defaults

## 5. Validation

- [x] 5.1 `skaffold diagnose` / `skaffold render` succeed for: bare default,
      `dev` (dashboard auto-active), `-p -dashboard`,
      `-p -dashboard -p setup-db-minimal`, `-p setup-db -p setup-s3`,
      `-p mimic`, `-p local-dev` — in both variants
- [x] 5.2 Boot backend-only locally (`skaffold dev -p -dashboard` +
      setup-db-minimal): ActiveJob worker runs a job; no cdo-dashboard
      Deployment/Service/Ingress exists in the cluster
- [x] 5.3 Boot the full dashboard locally (`skaffold dev`): dashboard
      reachable on forwarded ports 13000/19000 with built frontend assets
- [x] 5.4 Confirm backend-only build never builds
      pegasus/static/db-seed images (inspect skaffold build output)
- [x] 5.5 Re-run `verify-helm-parity` and env overlay render diffs; update
      `k8s/mimic/README.md` and any docs mentioning `-p activejob-only`
- [ ] 5.6 File the k8s-gitops follow-up: per-envType configuration of the
      `cdo-active-job-worker` Deployment (replicas, resources, image) for
      the production migration path

## 6. Default flip: bare `skaffold dev` is backend-only (spec revision)

- [x] 6.1 Remove the dashboard profile's auto-activation in both skaffold
      variants; bare commands use the backend base, full app is
      `-p dashboard`
- [x] 6.2 Update comments and docs: mimic (`-p dashboard,mimic`),
      setup-db/setup-s3 (`-p dashboard -p setup-db -p setup-s3`),
      setup-db-minimal (bare + `-p setup-db-minimal`), k8s/README.md and
      k8s/mimic/README.md run instructions
- [x] 6.3 Re-verify: diagnose matrix for the new combos; bare `skaffold dev`
      config equals the old `-p -dashboard` config
