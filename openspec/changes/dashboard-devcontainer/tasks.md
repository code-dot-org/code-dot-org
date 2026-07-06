# dashboard-devcontainer — tasks

## 1. Devcontainer definition

- [ ] 1.1 Add `.devcontainer/devcontainer.json`: `"image":` on the GHCR
      dev-target image, `docker-outside-of-docker` feature, VM-friendly
      defaults (no forced amd64)
- [ ] 1.2 Add `.devcontainer/compose.yaml`: mysql:8.0, redis:7.4, minio at
      the versions in `k8s/helm/templates/services/`, with volumes for data
- [ ] 1.3 Wire the workspace as a named volume; document the "Clone
      Repository in Container Volume" path and add a scripted
      `git clone --filter=blob:none` equivalent for non-VS-Code use

## 2. Lifecycle

- [ ] 2.1 `onCreateCommand` script: `bundle install` + `yarn` hydration
      against committed lockfiles (cacheable, prebuild-safe)
- [ ] 2.2 `postCreateCommand` script: generate `locals.yml`, restore DB
      (hook `seeded-db-snapshot` when it lands), incremental
      `bundle install`/`yarn` to absorb prebuild staleness
- [ ] 2.3 Verify no secrets or per-developer state can reach
      `onCreateCommand` (prebuild images are shared)

## 3. CI prebuild

- [ ] 3.1 Add `.github/workflows/devcontainer-prebuild.yml` using
      `devcontainers/ci`, native arm64+amd64 runners per
      `k8s-skaffold-build.yml`, manifest push to GHCR
- [ ] 3.2 Trigger on `staging` pushes touching Gemfile.lock, yarn.lock,
      Dockerfiles, or `.devcontainer/`
- [ ] 3.3 Confirm GHCR visibility/auth story for the image; document pull
      auth if private

## 4. Inner loop and docs

- [ ] 4.1 Run `bin/dashboard-server` in-container as the non-root user;
      forward port 3000 (and 9000 when `yarn start` runs)
- [ ] 4.2 Document skaffold-over-socket as the secondary prod-parity path,
      noting skaffold#9324
- [ ] 4.3 `SETUP.md`: add the devcontainer quick-start section; note the
      8GB Docker VM cap and the `docker cp`/volume-browse/OrbStack answers
      to "code not on my Mac"

## 5. Verification

- [ ] 5.1 Cold first run on a 16GB Apple Silicon machine: pull + blobless
      clone + postCreate wall clock recorded; must be within 25 min
- [ ] 5.2 `uname -m` = `aarch64` in-container on Apple Silicon; no qemu
- [ ] 5.3 Dashboard serves `/health_check` against compose mysql; one
      `bundle exec spring testunit` dashboard test passes in-container
- [ ] 5.4 Edit a Rails file, confirm rerun restarts without skaffold sync;
      server process uid is non-root
- [ ] 5.5 Base-layer digests shared between devcontainer and `runtime`
      images verified with `docker image inspect`
