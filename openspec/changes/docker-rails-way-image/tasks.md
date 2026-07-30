# docker-rails-way-image — tasks

## 1. Base swap

- [ ] 1.1 Rewrite `code-dot-org-core.dockerfile`: `FROM ruby:3.2.11-slim@<digest>`
      as `base`; runtime apt set only (libjemalloc2, default-mysql-client,
      imagemagick runtime libs, curl, tzdata, locales)
- [ ] 1.2 Add jemalloc `LD_PRELOAD` symlink + ENV in `base`
- [ ] 1.3 Delete rbenv/ruby-build install; keep `BUNDLE_PATH` on ENV so
      `kubectl exec` shells resolve gems

## 2. Build stage

- [ ] 2.1 Add `build` stage: build-essential, libmysqlclient-dev, git,
      pkg-config; keep existing BuildKit cache mounts for bundler and uv
- [ ] 2.2 Adopt Rails-template cleanup after `bundle install`
      (`rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/cache .../bundler/gems/*/.git`)
- [ ] 2.3 Move `bootsnap` out of `group :development` in `Gemfile`; add
      `bootsnap precompile --gemfile` and app-code precompile steps
- [ ] 2.4 Set `BUNDLE_DEPLOYMENT=1`, `BUNDLE_WITHOUT` defaults as ENV;
      keep `BUNDLE_WITHOUT` overridable by build arg (activejob-only profile)

## 3. Runtime and dev targets

- [ ] 3.1 Add `runtime` target: base + COPY of `${BUNDLE_PATH}`, `.venv`,
      and source; numeric non-root `USER`
- [ ] 3.2 Add `dev` target: base + toolchain (build-essential, node 20 via
      nodesource, chromium, zsh/oh-my-zsh, awscli); unset `BUNDLE_DEPLOYMENT`
- [ ] 3.3 Update `.dockerignore` files if stage inputs changed

## 4. Wiring

- [ ] 4.1 Update `skaffold.yaml` build commands/targets and the
      activejob-only profile to use the `runtime` target
- [ ] 4.2 Mirror all COPY changes into `k8s/mimic/code-dot-org/`
- [ ] 4.3 Confirm `.github/workflows/k8s-skaffold-build.yml` needs no change
      beyond target names; note expected CI build-time delta in the PR

## 5. Verification

- [ ] 5.1 `dive` report: runtime image size before/after recorded in PR
- [ ] 5.2 Boot smoke: runtime image serves `/health_check` and one
      representative API endpoint against a seeded local DB
- [ ] 5.3 Dev target: `bundle install` with a native-extension gem and
      `bundle exec spring testunit` of one dashboard test pass
- [ ] 5.4 `skaffold build -p mimic --cache-artifacts=false` passes
- [ ] 5.5 Cold `skaffold build` wall-clock and peak RAM measured on an
      M-series laptop; recorded in PR (target: <20 min, <10GB)
