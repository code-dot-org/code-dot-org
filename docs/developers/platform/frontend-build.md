---
title: Frontend build
description: The apps/ webpack bundle, the frontend/ Turborepo, the design system, and the i18n layout.
type: concept
---

The CodeAI frontend is split between two trees: `apps/` (the production workhorse) and `frontend/` (a growing Turborepo of modular packages).

## apps/

`apps/` is a single webpack bundle containing the client-side code for every lab, the teacher dashboard views, and shared infrastructure. It has roughly 220 entry points defined in `apps/webpackEntryPoints.js`.

### How Rails serves it

In development, `yarn start` (from `apps/`) runs a webpack dev server with HMR. A Rails view mounts a specific entry by referencing its webpack asset path (for example, `blockly/js/maze.js`). The bundle is served from `dashboard/public/blockly`, which is a symlink to `apps/build/package` when `use_my_apps: true` is set in `locals.yml`.

To create the symlink: `rake package:apps:symlink` from the repo root. To build once: `cd apps && yarn build`. To run the dev server: `cd apps && yarn start`.

### rspack opt-in

`yarn start --rspack` routes bundling through rspack (a Rust webpack implementation). It is faster for dev-server startup (seconds instead of minutes) but uses swc instead of babel for transpilation, which can produce edge-case differences. The default webpack build is authoritative for production.

See `apps/README.md` for source-map options (`APPS_DEVTOOL`), memory management (`yarn start:cheap`, `yarn start:cheapest`), and the rspack-specific levers (`RSPACK_NO_WRITE`, `RSPACK_SWC`, `RSPACK_NO_LAZY`).

### The apps/src/ sprawl

`apps/src/` has 131 top-level entries: 25 labs, 6 teacher-tool directories, and 35 shared or infrastructure directories. This flat namespace is a known hazard -- there is no enforced boundary between labs, teacher tools, and shared code. New labs should use the lab2 framework (`apps/src/lab2/`).

### Testing and linting

- `cd apps && yarn test:unit` runs Jest unit tests.
- `cd apps && yarn test:integration` runs Karma integration tests (browser).
- `cd apps && yarn run typecheck` checks TypeScript types (~10 seconds).
- `./tools/hooks/pre-commit` (from repo root) lints only modified files (fast).

See `apps/README.md` for the full test and build reference.

## frontend/

`frontend/` is a Yarn workspaces monorepo managed by Turborepo. It contains 19 packages and 3 apps.

### Packages in production today

These packages are linked into the `apps/` webpack bundle via `portal:` dependencies in `apps/package.json` and ship to production through the existing apps build:

- `@code-dot-org/component-library` -- the design system React components.
- `@code-dot-org/component-library-styles` -- shared SCSS for the design system.
- `@code-dot-org/core` -- shared utilities and plugins.
- `@code-dot-org/fonts` -- the font package.
- `@code-dot-org/markdown` -- Markdown rendering.
- `@code-dot-org/lesson-deep-dive` -- the lesson deep-dive component.
- `@code-dot-org/ailab` -- the AI lab package.

### Packages only in the gated frontend-studio shell

The `frontend/apps/studio` app is a separate Vite-built SPA mounted at `/frontend-studio/*` in Rails. It is gated by the DCDO flag `frontend_studio_enabled`, which defaults to `false` in production and returns 404 when off. Production traffic does not reach it today.

Inside this shell, `frontend/packages/labs/music` (the music lab port) and the localization plugin in `@code-dot-org/core` are used. These are not the versions production serves -- legacy `apps/src/music` and `apps/src/localization` remain authoritative.

### Apps

| App | Purpose |
|---|---|
| `frontend/apps/studio` | The new SPA shell (gated, not in production). |
| `frontend/apps/design-system-storybook` | Storybook for the component library. |
| `frontend/apps/mobile` | The mobile Capacitor wrapper (experimental). |

See `frontend/AGENTS.md` and `frontend/README.md` for workspace commands, package conventions, and architecture guidance.

## Design system

The component library (`frontend/packages/component-library/`) provides React components built on a DSCO (Design System for Code.org) foundation that is migrating toward Material UI (MUI).

Key facts:
- Production code in `apps/` imports `@code-dot-org/component-library` via the `portal:` link.
- The Storybook instance lives at `frontend/apps/design-system-storybook`.
- A DSCO-to-MUI migration is in progress. Which components have been migrated is not tracked in a single in-repo document.
- Shared styles live in `@code-dot-org/component-library-styles`.

When working on React UI, prefer design-system components over custom or legacy alternatives. See `AGENTS.md` for the project-level guidance.

## Localization (i18n)

Locale data lives in three places:

| Location | What it contains |
|---|---|
| `dashboard/config/locales/` | Rails-side locale YAML files (56 entries). |
| `apps/i18n/<lab>/<locale>.json` | Per-lab JavaScript locale files (~34 locales per lab). |
| `config/i18n/` | The canonical language/locale registry: `locales.yml` and `cdo-languages.csv`. |

The Rails i18n backend is set by `CDO.i18n_backend`. Available languages are loaded from `Cdo::I18n.available_languages`, and fallback chains from `Cdo::I18n::LOCALE_FALLBACKS`.

No Crowdin config or translation-sync rake task exists in this repo. The pipeline that sends strings to translators and returns translated files is not visible in the codebase -- it runs externally.

### Global Edition

The Global Edition region mechanism uses a `ge_region` cookie plus per-region YAML configuration, not IP geolocation. The implementation is in `lib/cdo/global_edition.rb`, `lib/cdo/brand.rb`, and `lib/cdo/rack/request.rb`. DCDO flag `global_edition_enabled_regions` controls which regions are active.
