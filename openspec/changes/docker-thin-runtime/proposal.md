# docker-thin-runtime

## Why

The final image unconditionally copies in the `code-dot-org-db-seed` layer
(config/levels 948M + scripts_json 230M + scripts 207M ≈ 1.4G) and the
`code-dot-org-static` layer, but the Rails runtime serves curriculum from the
DB — those files are only read at seed time and only written in
levelbuilder_mode. The `activejob-only` profile already proves Rails boots
without them. Meanwhile i18n is punted, not solved: the image ships only
`*en.yml` via a dockerignore negation; the full locale tree (477M) has no
home.

## What Changes

- The thin `runtime` composition becomes the default deployed image: no
  db-seed layer, no static layer, no node_modules/yarn output. API +
  ActiveJob only; frontend `apps/` is explicitly out of scope.
- New `seed` composition = runtime + db-seed content layer. Used by the
  `setup-db` skaffold profile / helm `dashboardJob`, and by
  levelbuilder-shaped deploys.
- New i18n content layer: a `FROM scratch` dockerfile (same pattern as
  `code-dot-org-static.dockerfile`) carrying `dashboard/config/locales` and
  related locale trees, included only in prod-web-shaped compositions.
  Dev/API images stay en-only.
- The scratch content-layer pattern (static/pegasus/db-seed dockerfiles +
  skaffold `requires` graph) is unchanged; only which compositions include
  which layers changes.
- **BREAKING** for anyone who execs into the deployed image expecting
  `dashboard/config/scripts`, static assets, or non-en locales: use the
  `seed` composition or a prod-web-shaped image.

## Capabilities

### New Capabilities

- `image-content-composition`: the contract for which content layers
  (db-seed, static, i18n) each image composition (`runtime`, `seed`,
  prod-web) includes and excludes.

### Modified Capabilities

None (no existing specs).

## Impact

- `k8s/docker/*.dockerfile` and their `.dockerignore` files (new i18n layer,
  composition changes)
- `skaffold.yaml`: `setup-db` and `activejob-only` profiles, artifact
  `requires` graph
- `k8s/helm/templates/dashboard/dashboard-job.yaml` and values files
  (`dashboardJob` uses the `seed` image)
- `k8s/mimic/` must mirror COPY changes
- Builds on `docker-rails-way-image` (base/build/runtime/dev targets); this
  change composes content onto those targets.
