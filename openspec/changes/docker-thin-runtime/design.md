# docker-thin-runtime — design

## Context

The final dockerfile COPYs the `db-seed` and `static` scratch layers into
every composition. The seed content is read through
`Rake::FileTask['config/scripts/.seeded']` (unit.rb:1254) against
`UNIT_DIRECTORY`/`UNIT_JSON_DIRECTORY` (`dashboard/app/models/unit.rb:188`,
`:202`) — seed-time paths, not request-time. Curriculum file *writes* are
gated on `Rails.application.config.levelbuilder_mode`. The `activejob-only`
skaffold profile already boots Rails with stub build dirs and no
seed/static/pegasus layers, so the thin shape is proven; it just isn't the
default.

Locales: the dockerignore negation `!dashboard/config/locales/**/*en.yml`
ships en only. The full tree is 477M and changes only on translation sync.

## Goals / Non-Goals

**Goals:**
- Default deployed image carries no seed/static layers (~1.4G+ smaller).
- A `seed` composition for the DB-seed Job and levelbuilder-shaped deploys.
- Locales become a content layer that prod-web pulls and dev/API skips.

**Non-Goals:**
- Dockerfile stage structure (base/build/runtime/dev) — that is
  `docker-rails-way-image`.
- Serving the frontend (`apps/`) from this image at all.
- Solving levelbuilder's writable-checkout workload (open question below).
- RAM-side i18n loading (`lazy_load_i18n` already exists).

## Decisions

1. **Content layers as `FROM scratch` images, composed by COPY.** Same
   pattern as `code-dot-org-static.dockerfile`: a 477M locale layer as a
   late COPY never invalidates code layers and only rebuilds on translation
   sync. Alternatives: runtime S3 locale fetch — rejected, adds a boot-time
   network dependency; k8s 1.33 image volumes — attractive future option
   (mount content layers without composing images), noted, not taken while
   we support older clusters.
2. **Seed Job runs the `seed` image as its container image.** The helm
   `dashboardJob` just points at a different tag; no init-container or
   volume plumbing. Alternative (mount seed content into the runtime image
   via emptyDir copy) rejected: slower, more YAML, same bytes pulled.
3. **Levelbuilder is a different workload, not a composition flag.** It
   writes curriculum files and needs a git checkout, so it gets the
   seed-shaped image plus writable state — but the writable-state design
   deserves its own change. Here it only consumes the `seed` composition.
4. **Disk and RAM are orthogonal.** `LazyLoadableBackend` (`lib/cdo.rb:82`)
   already mitigates locale RAM cost; this change addresses only which bytes
   ship in which image. No i18n code changes.

## Risks / Trade-offs

- [Hidden file dependencies on removed content — precedent:
  `pegasus/data/static_models.rb` had to be exempted from the pegasus
  exclusion because `lib/cdo/db.rb` requires it at boot] → per-composition
  boot-and-smoke CI checks hitting `/health_check` plus a representative
  API before merge; exemption list stays additive as findings surface.
- [i18n layer staleness: the locale layer rebuilds on translation sync, not
  on deploy, so a prod-web image can ship locales older than the code] →
  tag the layer with the sync commit; CI warns when the layer lags the sync
  cadence.
- [Profile matrix growth: helm/skaffold now multiply targets × compositions]
  → keep compositions to exactly three (runtime, seed, prod-web); resist
  per-service one-offs.

## Migration Plan

Flip the default deploy image to the thin `runtime` composition behind the
existing profiles: activejob-only first (already thin), then the web
deployment. `setup-db`/`dashboardJob` repoint at the `seed` image in the same
release. Rollback = repoint helm `image:` at the previous fat tag; no data
migration.

## Open Questions

- Levelbuilder writable state: seed image + what — PVC, git sidecar, or a
  dedicated change? Deliberately not solved here.
- Which locale trees beyond `dashboard/config/locales` belong in the i18n
  layer (pegasus locale dirs, `i18n/locales`)?
- Do any prod-web paths still read static-layer files directly, or is that
  layer fully CDN-shadowed today?
