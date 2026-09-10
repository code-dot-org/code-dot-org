---
title: Verification
description: Journeys, docsScreenshot crops, evidence files, and evidence grades -- how facts are verified before they reach a page.
type: concept
---

Every claim on a documentation page must be backed by evidence at a known grade.

## Evidence grades

| Grade | Source | May appear as fact on a page? |
|---|---|---|
| VERIFIED | Walked in the browser via a journey spec. | Yes |
| OBSERVED | `rails runner`, database query, `curl`. | Yes |
| STRONGLY_SUPPORTED | Code and tests agree on the behavior. | Yes |
| INFERRED | Reasonable conclusion from partial evidence. | No |
| AMBIGUOUS | Evidence conflicts or is incomplete. | No |
| BLOCKED | Investigation could not proceed (missing credentials, server down). | No |
| CONTRADICTED | Evidence disproves the claim. | No |

A page states as fact only what is VERIFIED, OBSERVED, or STRONGLY SUPPORTED. Anything at a lower grade is either left out or recorded in the evidence file's `unresolved` array for future investigation.

## Evidence files

Each page (except hub `index.md` files) has a matching JSON file under `.docs-evidence/`:

```
docs/developers/operations/testing.md
  -> .docs-evidence/developers/operations/testing.json
```

The schema is `.docs-evidence/schema.json`. Fields:

| Field | Purpose |
|---|---|
| `sources` | File paths examined as evidence. |
| `tests` | Test files that cover the described behavior. |
| `routes` | HTTP routes relevant to the page. |
| `flags` | Feature flags gating described behavior. |
| `journey` | Path to the Playwright spec that verifies the page, or `null`. |
| `verification` | `{result, revision, date, notes}` -- the grade and when it was last checked. |
| `screenshots` | `[{path, journey, revision}]` -- images produced by journeys. |
| `unresolved` | Open questions or issues. |

Run `yarn evidence:check` from `frontend/apps/docs/` to validate all evidence files against the schema and check page-evidence parity.

## Journeys

A journey is a Playwright spec in `frontend/packages/e2e-tests/docs-journeys/` that verifies a page's claims by driving the browser. Journeys target `http://localhost-studio.code.org:3000` only. They use the e2e suite's `createUser` fixtures to create throwaway accounts.

A separate Playwright config (`playwright.docs.config.ts`) in the e2e-tests package points at the `docs-journeys/` directory. This config is invisible to CI (the main e2e config's `testDir` is `./tests`).

Run all journeys from `frontend/`:

```sh
yarn workspace @code-dot-org/e2e-tests docs:journeys
```

### Screenshots

The `docsScreenshot` helper (`docs-journeys/helpers.ts`) captures images with these defaults:

- Viewport: 1280x800
- Theme: light
- The dev environment banner (`#environment_tag`) is hidden.
- Fonts are waited on before capture.

To crop to a specific control, pass `{locator}`:

```ts
await docsScreenshot(page, 'developers/operations/staff-tools.md', 'permissions-form', {
  locator: page.locator('#permissions-form')
});
```

Screenshots are saved into `docs/<audience>/.../images/` and referenced from pages via relative markdown image links.

A journey that cannot run (missing credentials, unreachable server, required data not seeded) records BLOCKED with the reason. Nobody fabricates a screenshot.

## Related

- [Corpus and conventions](/developers/documentation/corpus-and-conventions/) -- where pages live and what metadata they carry.
- [Update after a deploy](/developers/documentation/update-after-deploy/) -- using evidence to find pages that need refreshing.
