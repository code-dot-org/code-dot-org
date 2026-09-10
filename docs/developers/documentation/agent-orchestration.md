---
title: Agent orchestration
description: How the documentation system is maintained -- domain owners, the working area, evidence grades, and what is disposable.
type: concept
---

The documentation corpus is maintained by a combination of human engineers and coding agents. A future maintainer can continue the work from the roles and conventions below without reading the full orchestration history.

## Roles

Three roles participate in a documentation pass:

- **Orchestrator (Fable):** coordinates the pass, assigns pages to domain owners, reconciles naming and scope conflicts, and runs the editorial review. One orchestrator per pass.
- **Domain owner (Opus worker):** writes and maintains all pages within a domain. Each domain has exactly one owner per pass. The owner investigates the codebase, writes pages, creates evidence files, and runs journeys.
- **Researcher (Sonnet worker):** performs bounded evidence collection for an owner -- file lookups, route lists, string searches, permission checks. Returns concise evidence, never prose.

## The eleven domains

Each domain owns a slice of the documentation corpus and the inventory items within it. The full list and their scopes are documented in `.docs-work/domains.md`.

## The working area

`.docs-work/` at the repo root holds orchestration artifacts. Nothing in this directory is documentation; it is scaffolding.

| Path | Purpose | Disposable? |
|---|---|---|
| `domains.md` | Shared conventions, domain assignments, wave schedule. | No (conventions are binding). |
| `inventory.yaml` | Feature inventory with `assigned_domain` per item. | Regenerable from the codebase. |
| `recut-brief.md` | The editorial rewrite brief. | Yes. |
| `decisions.md` | Decision log (why things were done). | Useful history, but not required to continue. |
| `raw/` | Research artifacts from Sonnet sweeps. | Yes. |
| `domains/<name>/plan.md` | Each domain owner's page plan. | Yes after pages are written. |
| `domains/<name>/report.md` | Each domain owner's final report. | Yes. |
| `verification-infra.md` | How to create accounts, run suites, what blocks you. | Regenerable. |
| `roles-and-permissions.md` | Permission model research. | Regenerable. |
| `existing-docs.md` | Staleness audit of existing docs. | Regenerable. |

The Markdown pages under `docs/` and the evidence files under `.docs-evidence/` are the canonical outputs. Everything in `.docs-work/` can be regenerated from the codebase and the pages.

## Evidence grades

Every claim in a page must be backed by evidence at a publishable grade: VERIFIED (browser), OBSERVED (rails runner, database, curl), or STRONGLY SUPPORTED (code and tests agree). Claims at lower grades (INFERRED, AMBIGUOUS, BLOCKED, CONTRADICTED) are left out of the page and recorded in the evidence file's `unresolved` array. See [Verification](/developers/documentation/verification/) for the full grade definitions.

## The per-deploy update cycle

After a deploy, the [update workflow](/developers/documentation/update-after-deploy/) finds affected pages by intersecting changed files with evidence `sources`, routes the pages to domain owners, and produces a focused update PR. This is the primary maintenance mechanism.

## Related

- [Corpus and conventions](/developers/documentation/corpus-and-conventions/) -- where pages live and what rules they follow.
- [Update after a deploy](/developers/documentation/update-after-deploy/) -- the primary maintenance workflow.
- [docs/README.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/README.md) -- site commands.
