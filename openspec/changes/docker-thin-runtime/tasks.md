# docker-thin-runtime — tasks

## 1. i18n content layer

- [ ] 1.1 Add `k8s/docker/code-dot-org-i18n.dockerfile` (`FROM scratch`,
      pattern of `code-dot-org-static.dockerfile`) carrying
      `dashboard/config/locales` and related locale trees
- [ ] 1.2 Add its `.dockerignore`; confirm the layer weighs ~477M and
      contains no code
- [ ] 1.3 Register the artifact in `skaffold.yaml` with `requires` wiring

## 2. Compositions

- [ ] 2.1 Make the final dockerfile's `runtime` composition drop the
      db-seed and static COPYs and node_modules/yarn output
- [ ] 2.2 Add the `seed` composition: `runtime` + db-seed layer COPY
- [ ] 2.3 Add the prod-web composition: `runtime` + static + i18n layers
- [ ] 2.4 Keep the en-only dockerignore negation
      (`!dashboard/config/locales/**/*en.yml`) for `runtime`/`seed`/dev

## 3. Wiring

- [ ] 3.1 Point the default deploy profile at the `runtime` composition;
      fold the `activejob-only` stub-dirs approach into it
- [ ] 3.2 Point the `setup-db` profile and
      `k8s/helm/templates/dashboard/dashboard-job.yaml` (+ values files)
      at the `seed` image
- [ ] 3.3 Mirror all COPY/composition changes into `k8s/mimic/`

## 4. Verification

- [ ] 4.1 Boot-and-smoke CI check per composition: `/health_check` + one
      representative API endpoint
- [ ] 4.2 Seed Job run from the `seed` image against an empty DB completes
- [ ] 4.3 Audit thin image: no `config/scripts*`, `config/levels`, static
      paths, node_modules; locales en-only
- [ ] 4.4 Cache check: locale-only change rebuilds only the i18n layer;
      code-only change reuses it
- [ ] 4.5 Image size before/after recorded in PR (`dive` or
      `docker image inspect`)
- [ ] 4.6 `skaffold build -p mimic --cache-artifacts=false` passes
