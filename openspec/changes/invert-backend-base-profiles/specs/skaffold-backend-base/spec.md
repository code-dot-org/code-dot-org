# skaffold-backend-base

## ADDED Requirements

### Requirement: Backend-only deployment is the base configuration
The Skaffold configuration SHALL express the backend-only deployment
(ActiveJob worker and/or backend Rails APIs, shared services: MySQL, Redis,
MinIO, locals/secrets config) as base configuration. Backend-only manifests
and values MUST NOT be produced by deleting or disabling resources defined
by a fuller configuration.

#### Scenario: No deletion patches in the backend layer
- **WHEN** the backend-only configuration is rendered (Kustomize overlay or
  Helm values resolution)
- **THEN** no `$patch: delete` Kustomize patches and no `enabled: false`
  Helm value overrides are required to exclude dashboard frontend resources

#### Scenario: Backend-only deploy runs without dashboard resources
- **WHEN** a developer runs the backend-only Skaffold invocation
- **THEN** the cluster contains the ActiveJob worker and required backing
  services, and contains no cdo-dashboard Deployment, Service, or Ingress

### Requirement: Backend-only build skips the frontend toolchain
The backend-only image build SHALL NOT require the frontend build pipeline.
It MUST NOT run `yarn build` and MUST NOT depend on frontend-only artifact
images that exist solely to serve dashboard assets.

#### Scenario: Building the backend image
- **WHEN** Skaffold builds artifacts for the backend-only configuration
- **THEN** the resulting image boots Rails for ActiveJob work without a
  frontend asset build having run

### Requirement: ActiveJob worker is a shared base resource
The ActiveJob worker Deployment SHALL live in the shared backend layer
rendered by `k8s/kustomize/base`, not in a local-dev-only overlay, so that
server environment overlays (production, staging, test, levelbuilder) can
configure it as the first stage of migrating the full app to Kubernetes.

#### Scenario: Env overlays render the worker
- **WHEN** any environment overlay that composes `base` is rendered
- **THEN** the output includes the `cdo-active-job-worker` Deployment,
  available for envType components to patch

#### Scenario: Base render changes only by the worker
- **WHEN** the restructured `base` is rendered and diffed against the
  pre-change render
- **THEN** the only differences are the added `cdo-active-job-worker`
  Deployment and additive keys in the shared locals ConfigMap:
  `active_job_queue_adapter` (enqueuers must use the same adapter as the
  worker) and the blank secret overrides the adhoc boot requires (shared by
  the worker and the setup-db-minimal job via envFrom)

### Requirement: Both Skaffold variants stay in sync
The inversion SHALL be applied identically to the Helm-based root
`skaffold.yaml` and the Kustomize-based `k8s/kustomize/skaffold.yaml`, per
the sync requirement stated in both file headers.

#### Scenario: Variant parity
- **WHEN** the profile layering is changed in one variant
- **THEN** the other variant exposes the same profile names with the same
  backend-base / dashboard-on-top semantics

### Requirement: Composable auxiliary profiles keep working
The auxiliary composing profiles SHALL remain functional: setup-db,
setup-db-minimal, setup-s3, local-dev, and mimic each keep working when
combined with the backend-only base and with the full dashboard profile,
as applicable.

#### Scenario: Minimal DB setup against backend base
- **WHEN** a developer runs the backend-only configuration together with
  `setup-db-minimal`
- **THEN** the database is created or migrated using the backend-only image
