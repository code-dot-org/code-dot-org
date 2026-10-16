# frontend/

Turborepo workspace for modular frontend packages and apps. New code goes here;
the legacy webpack bundle is in `apps/` at the repo root.

## Structure

```
apps/
  studio/                    # Code Studio — Rails-Vite app (primary architecture);
                             # standalone mode is a supported architectural alternative
packages/
  core/                      # Core application functionality
  audio/                     # Sound and SoundBoard playback classes
  changelogs/                # release-it config: changelogs, versioning, publishing
  component-library/         # Design System React components
  component-library-styles/  # Design System shared styles, variables, colors, mixins
  e2e-tests/                 # Playwright end-to-end suite for studio.code.org
  fonts/                     # Code.org web fonts
  lesson-deep-dive/          # Post-lesson review flow for AI Tutor+
  lint-config/               # Shared ESLint, Prettier, TypeScript configs for frontend/
  markdown/                  # Sanitized markdown rendered as design-system components
  playwright-support/        # Shared Playwright fixtures, config helpers, scripts
  shared-constants/          # Ruby shared constants as generated TypeScript
  users/                     # Account settings feature module
packages/labs/               # Standalone curriculum lab apps
  ailab/                     # AI Lab (ML Playground)
  base/                      # Lab2 framework host (@code-dot-org/lab)
  music/                     # Music Lab
  oceans/                    # AI for Oceans
apps/design-system-storybook/  # Storybook for the design system
```

## README hierarchy

Before editing or creating files in any subdirectory (e.g., `packages/*`,
`packages/labs/*`), read all `README.md` files in the directory path from the
repo root down to and including the target file's directory. This helps
identify local patterns, conventions, and architecture.

**Example:** Before editing `packages/core/src/config/SiteConfig.ts`, read:

- `frontend/README.md` (if exists)
- `frontend/packages/core/README.md` (if exists)

## Commands

Run from `frontend/`.

```bash
yarn build           # build all packages
yarn test            # run all tests
yarn lint:fix        # auto-fix lint in every package (turbo-cached)
yarn lint            # verify after fix
yarn dev             # start Studio in watch mode (Vite + Turborepo)
yarn release:dryrun  # validate before reporting success — runs build, lint
                     # (includes typecheck), and test
```

## Dev loop

Start watch mode before editing:

```bash
yarn dev
```

Capture output once, analyze from file — don't re-run the same command:

```bash
yarn test 2>&1 | tee /tmp/test.log
```

Batch edits across files, then one build — not one build per file.

## Before reporting success

1. `yarn lint:fix`
2. `yarn release:dryrun`

## Conventions

Full detail in `docs/conventions/`. Read before creating or significantly
modifying that area — not before every edit.

| When touching                                                                                   | Read                                 |
| ----------------------------------------------------------------------------------------------- | ------------------------------------ |
| Any `packages/*` or `packages/labs/*` scaffold files                                            | `docs/conventions/packages.md`       |
| Rails config injection, `SiteConfig`, meta tag                                                  | `packages/core/docs/architecture.md` |
| `packages/core` singletons, boot, `./api` or `./plugins/localization` sub-path, or plugin model | `packages/core/docs/architecture.md` |

## Generator ↔ conventions coupling

`turbo/generators/config.ts` (and its `turbo/generators/templates/` directory)
and `docs/conventions/packages.md` are **tightly coupled** — they must always
describe the same scaffold structure.

**Rule:** When you change either, you MUST update the other:

- Changing a template (file content, deps, scripts, etc.) → update `docs/conventions/packages.md`
- Changing the convention docs (scaffold structure, file list, naming) → update the relevant templates

This coupling is intentional: the docs describe what the generator produces, and
the generator enforces what the docs specify.

Key rules that apply everywhere:

- Always `yarn`, never `npx`. Turbo is invoked through workspace scripts.
  Exception: one-off setup commands documented in a package README
  (`npx skills` in `e2e-tests`, `npx msw init` in `core`).
- Externalized deps (`react`, `uuid`, etc.) → `peerDependencies` + `devDependencies`, never `dependencies`
- `packages/*` use Vitest for unit tests and Playwright for UI tests;
  `e2e-tests` is Playwright only. `apps/` (repo root) uses Jest.
- Runtime config (API endpoints, feature flags, DSNs) comes from the Rails
  `<meta name="app-config">` tag via `SiteConfig` — never `import.meta.env`
- Dashboard API calls → use `DashboardApiClient` from `@code-dot-org/core/api`. Do not
  hand-roll `fetch`/`ky` calls to the Rails backend.

## Architecture docs

Packages with non-trivial architecture have `docs/architecture.md`. Read it
before modifying that package.

## Continuous improvement

If you hit a wrong assumption or repeated correction, propose an update to this
file or the relevant `docs/conventions/` doc.
