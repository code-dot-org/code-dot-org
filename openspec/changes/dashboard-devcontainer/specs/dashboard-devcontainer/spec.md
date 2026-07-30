# dashboard-devcontainer

## ADDED Requirements

### Requirement: Devcontainer uses the prebuilt dev-target image
`devcontainer.json` SHALL reference a prebuilt image on GHCR via `"image":`,
built from the `dev` target defined by `docker-rails-way-image`. Opening the
devcontainer SHALL NOT trigger a local Dockerfile build.

#### Scenario: First open pulls, does not build
- **WHEN** a developer opens the devcontainer on a machine with no cached
  image
- **THEN** the image is pulled from GHCR and no `docker build` of the app
  Dockerfile runs locally

#### Scenario: Shared lineage with production
- **WHEN** the devcontainer image and the `runtime` image are pulled on one
  machine
- **THEN** their `base`-stage layers are identical (shared digests)

### Requirement: Workspace lives in a named volume
The workspace SHALL reside in a named Docker volume, populated by
`git clone --filter=blob:none`. The source tree SHALL NOT be bind-mounted
from the host.

#### Scenario: Native-speed workspace I/O
- **WHEN** the container's workspace mount is inspected
- **THEN** it is a named volume (not a VirtioFS bind mount) and file
  operations run at native VM filesystem speed

#### Scenario: Blobless clone bounds disk
- **WHEN** the workspace volume is populated on create
- **THEN** the clone used `--filter=blob:none` and the in-volume `.git` is a
  small fraction of the 27G full history

### Requirement: Backing services run via compose at helm-chart versions
The devcontainer SHALL start mysql:8.0, redis:7.4, and minio via docker
compose, at the versions pinned in `k8s/helm/templates/services/`. The inner
loop SHALL NOT require a Kubernetes control plane.

#### Scenario: Services up without k8s
- **WHEN** the devcontainer starts on a machine with Docker Desktop
  Kubernetes disabled
- **THEN** mysql, redis, and minio are reachable from the app container at
  the documented hosts/ports

### Requirement: Lifecycle separates cacheable from per-developer work
`onCreateCommand` SHALL contain only work that CI prebuilds can bake in
(bundle/yarn hydration against committed lockfiles). `postCreateCommand`
SHALL contain per-developer work (locals.yml, DB restore) and MUST NOT be
baked into prebuilt images.

#### Scenario: Prebuild absorbs hydration
- **WHEN** a devcontainer is created from a fresh prebuilt image with
  unchanged lockfiles
- **THEN** `onCreateCommand` work is already satisfied and only
  `postCreateCommand` executes materially

#### Scenario: First-run budget holds
- **WHEN** a developer with no local state runs pull + clone + postCreate
- **THEN** total wall clock is within 25 minutes

### Requirement: Prebuild is multi-arch and CI-driven
CI SHALL prebuild the devcontainer image via the `devcontainers/ci` action
and push an amd64+arm64 manifest to GHCR using native runners. Apple Silicon
machines SHALL run the arm64 variant without emulation.

#### Scenario: No Rosetta on Apple Silicon
- **WHEN** the devcontainer runs on an Apple Silicon host
- **THEN** `uname -m` inside the container reports `aarch64` and no
  qemu/Rosetta translation is active

### Requirement: Inner-loop server runs in the container as non-root
`bin/dashboard-server` SHALL run inside the devcontainer as the image's
non-root user, with hot reload provided by rerun — not by skaffold file
sync.

#### Scenario: Edit-reload cycle without sync
- **WHEN** a developer edits a Rails file in the workspace volume
- **THEN** rerun restarts the server in-container; no skaffold sync occurs
  and the server process is not root

### Requirement: Docker socket available for prod-parity work
The devcontainer SHALL include the `docker-outside-of-docker` feature so
skaffold/k8s workflows remain runnable, documented as the secondary path.

#### Scenario: Skaffold build from inside the container
- **WHEN** `skaffold build` is invoked inside the devcontainer
- **THEN** it builds via the host docker daemon without docker-in-docker
