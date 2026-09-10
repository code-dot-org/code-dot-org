# CodeAI documentation

User and developer documentation for the CodeAI platform (studio.code.org).

## Where pages live

Two audience roots under `docs/`:

    docs/guide/              — user-facing help (teachers, students, district administrators)
    docs/developers/         — engineering and internal-tools documentation

The guide is organized by topic: getting-started, sections, curriculum, labs,
projects, progress, ai, professional-learning, integrations, privacy.

One page per file, `kebab-case.md`. Images beside the page in `images/`,
named `<page-slug>-<what>.png`. Existing loose files in `docs/*.md` and
`docs/plc/` are legacy; leave them alone.

## Frontmatter

Every page carries exactly this frontmatter:

```yaml
---
title: Sign in to CodeAI
description: One sentence a search result can show.
type: task
---
```

`type` is one of: `concept`, `task`, `reference`, `troubleshooting`, `tutorial`.
No other fields. Evidence metadata lives in `.docs-evidence/`, not in frontmatter.

## Preview the site

The renderer is Docusaurus 3, in `frontend/apps/docs/`. It runs on the
`frontend/` yarn 4 workspace (Node >= 20).

```sh
cd frontend
yarn install
cd apps/docs
yarn dev         # http://localhost:4321
```

## Build

```sh
cd frontend/apps/docs
yarn build       # output in frontend/apps/docs/build/
yarn serve       # serve production build on :4321
```

## Evidence

`.docs-evidence/<root>/<page>.json` mirrors each page under the two
audience roots. Schema: `.docs-evidence/schema.json`. Agents maintain
these files; do not edit by hand.

Validate all evidence files and check page-evidence parity:

```sh
cd frontend/apps/docs
yarn evidence:check
```

Index pages are exempt from the parity check. Every other page needs a
matching evidence file and vice versa.

## Documentation journeys

Browser-verification specs live in
`frontend/packages/e2e-tests/docs-journeys/`, using a separate Playwright
config (`playwright.docs.config.ts`). They target
`http://localhost-studio.code.org:3000` only and are invisible to CI (the
main e2e config's `testDir` is `./tests`; these are outside it).

Run from `frontend/`:

```sh
yarn workspace @code-dot-org/e2e-tests docs:journeys
```

The `docsScreenshot` helper (in `docs-journeys/helpers.ts`) sets viewport
1280x800, forces light theme, hides the dev banner, waits for fonts, and
writes the PNG into `docs/<root>/.../images/`.

Screenshots committed to `images/` directories are referenced from pages
via relative markdown image links.

## Stylebook mapping

| Audience | Primary | Supplements |
|---|---|---|
| User (teacher, student, district admin) | `github-docs` | `govuk` (eligibility/decision), `microsoft-writing-style` (UI text) |
| Developer | `gitlab-docs` | `google-developer-docs` (setup/how-to), `mdn-web-docs` (technical) |

The six stylebooks are pinned in `skills-lock.json` at the repo root and not vendored; once per checkout run `npx skills experimental_install` from the repo root to restore them under `.agents/skills/`. Load the matching skill before writing. Where a stylebook conflicts with
the source guide or the product, the source guide and the product win.

## Evidence grades

VERIFIED (browser), OBSERVED (rails runner / db / curl),
STRONGLY SUPPORTED (code + tests), INFERRED, AMBIGUOUS, BLOCKED,
CONTRADICTED. A page states as fact only what is VERIFIED, OBSERVED, or
STRONGLY SUPPORTED.
