# Platform setup

Completed 2026-09-09 by the platform-setup agent (Opus). Revision 9793f8d36ae.

## Final tree

```
docs/
  README.md
  students/
    index.md
    sign-in-example.md              (example; Fable deletes later)
    images/
      sign-in-example-sign-in-page.png  (journey-generated)
  teachers/
    index.md
  district-administrators/
    index.md
  developers/
    index.md
  site/
    .nvmrc                          (22.12.0)
    package.json                    (npm, standalone, engines >= 22.12.0)
    package-lock.json
    tsconfig.json
    astro.config.mjs
    src/
      content.config.ts             (extends docsSchema with `type` enum)
      content/docs/
        students -> ../../../../students
        teachers -> ../../../../teachers
        district-administrators -> ../../../../district-administrators
        developers -> ../../../../developers
    scripts/
      evidence-check.mjs            (39 lines: ajv-cli + parity check)

.docs-evidence/
  README.md
  schema.json                       (JSON Schema 2020-12)
  students/
    sign-in-example.json
  teachers/    (empty)
  district-administrators/  (empty)
  developers/  (empty)

frontend/packages/e2e-tests/
  playwright.docs.config.ts         (testDir: docs-journeys/, chromium, localhost:3000)
  docs-journeys/
    helpers.ts                      (docsScreenshot)
    sign-in-example.spec.ts         (example journey)
  package.json                      (added docs:journeys script)

.gitignore                          (added /docs/site/node_modules, dist, .astro)
```

## Commands

| What | Where | Command |
|---|---|---|
| Install docs site | `docs/site` | `nvm use && npm install` |
| Dev server | `docs/site` | `npm run dev` |
| Build | `docs/site` | `npm run build` |
| Evidence check | `docs/site` | `npm run evidence:check` |
| Journeys | `frontend/` | `yarn workspace @code-dot-org/e2e-tests docs:journeys` |

## Placement decision: journeys

Specs live in `frontend/packages/e2e-tests/docs-journeys/`, a directory
outside the main config's `testDir` (`./tests`). A separate config file
(`playwright.docs.config.ts`) points at `docs-journeys/`.

CI evidence: `e2e-tests-ci.yml` runs `yarn test:ui` which resolves to
`playwright test` (no `--config`), loading the default
`playwright.config.ts` with `testDir: './tests'`. `dtt.yml` calls the
same reusable workflow. Neither mentions `docs-journeys/` or
`playwright.docs.config.ts`. The docs specs are invisible to all CI
invocations.

This approach required no modification to the main config, no `testIgnore`
entries, and no CI changes. The tradeoff is that `docs-journeys/` is not
a workspace package, so its TypeScript is checked only when the e2e-tests
`typecheck` runs (which includes all `.ts` files under the package).

## Loader decision

Symlinks. Starlight 0.42 hardcodes `src/content/docs/` as the content
directory (via `getCollectionPathFromRoot`). The glob loader's `base` is
derived from Astro's `srcDir` and `root`, and Starlight does not expose an
override. Four symlinks in `src/content/docs/` point at the audience roots
two levels above `site/`.

The brief suggested `glob` with a custom `base` and `exclude`. That route
fails because Starlight's `docsLoader()` computes the `base` internally
and does not accept overrides. Symlinks are the standard workaround.

## Bespoke code

1. `scripts/evidence-check.mjs` (39 lines): validates JSON files via
   `npx ajv validate`, then checks page-evidence parity with
   `readdirSync`. Could not be avoided: no off-the-shelf CLI combines
   schema validation with bidirectional parity checking. The script is
   under 40 lines as required.

2. `docs-journeys/helpers.ts` (docsScreenshot): sets viewport, hides the
   dev banner, waits for fonts, writes the PNG. Unavoidable: the
   screenshot conventions (path, naming, viewport, theme) are
   project-specific.

## Open problems

1. **Node version gap.** The repo root `.nvmrc` is 20; `docs/site/.nvmrc`
   is 22.12.0. Contributors must `nvm use` when switching between the
   docs site and the rest of the repo. An `engines` field enforces this
   at install time.

2. **Symlink portability.** Git stores symlinks as text; Windows
   checkouts may need `core.symlinks=true`. Since this is a Linux-primary
   dev environment and the docs site is not part of CI, this is
   acceptable.

3. **Astro warnings.** The build warns about a missing `i18n` collection
   (Starlight default, harmless) and a missing `site` config (sitemap
   generation skipped, fine for now).

4. **Index pages and evidence.** The parity check exempts `index.md`
   files. If a non-stub index page needs evidence later, the script will
   need a flag to include it.

## Docusaurus migration

Completed 2026-09-10. The Astro + Starlight site (`docs/site/`) was replaced
with Docusaurus 3 at `frontend/apps/docs/`, inside the `frontend/` yarn 4
workspace.

### What changed

- Deleted `docs/site/` (Astro 7.3, Starlight 0.42, Node 22, npm).
- Created `frontend/apps/docs/` (Docusaurus 3.10.2, Node >= 20, yarn 4).
- Content stays at `docs/`; Docusaurus reads it via `path: '../../../docs'`.
- Sidebar: one autogenerated sidebar per audience root.
- Search: `@easyops-cn/docusaurus-search-local` (local, no Algolia account).
- Branding: Infima CSS variables set from design-system tokens (brand-purple,
  Geist, Space Grotesk). No MUI/ThemeProvider (no design-system components
  used on the site).
- Dark mode disabled (design-system dark tokens use a different attribute
  convention than Docusaurus).
- Scripts (`evidence:check`, `docs:affected`) moved and adapted for yarn.
- `.gitignore`, `docs/README.md`, developer documentation pages, and
  `.docs-evidence/README.md` updated.

### Why not Starlight

Docusaurus provides better default navigation, sidebar, pagination, and search
out of the box. The Starlight setup required Node 22 and stood outside the
`frontend/` workspace, making design-system integration impractical.
