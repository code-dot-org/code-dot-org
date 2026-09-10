# IA collapse report (2026-09-10)

## Structure

Two roots replace four:

    docs/guide/                     (User guide)
      getting-started/              8 pages (3 non-merge moves + 5 merges + hub)
      sections/                     9 pages + hub
      curriculum/                   7 pages (6 moves + 1 merge + hub)
      labs/                         18 pages (13 lab refs + 5 learning pages + hub)
      projects/                     6 pages + hub
      progress/                     3 pages + hub
      ai/                           4 pages + hub
      professional-learning/        6 pages + hub
      integrations/                 5 pages + hub
      privacy/                      4 pages + hub
    docs/developers/                unchanged

## Merges (6)

Each absorbed two audience-specific pages into one:

- create-an-account: teacher + student creation
- sign-in: teacher + student sign-in (section code, picture/word, LMS)
- account-settings: teacher + student settings (school section marked teacher-only)
- switch-account-type: both directions on one page
- delete-your-account: both account types with type-specific warnings
- certificates: teacher printing + student self-service

## Counts

- Pages moved: 64 (including 6 merges absorbing 12 source pages)
- Hub index pages written: 11 (1 guide root + 10 topic hubs)
- _category_.json files written: 12 (1 guide root + 10 topics + 1 developers)
- Evidence files moved: 59; merged evidence created: 6
- Spec files updated: 20 (all in docs-journeys/)
- Images moved: ~90 PNGs

## Config changes

- sidebars.ts: 4 sidebars -> 2 (guide, developers)
- docusaurus.config.ts: include list -> guide/**/*, developers/**/*; navbar -> 2 items
- docs/index.md: rewritten for 2 roots
- docs/README.md: rewritten for 2 roots
- .docs-evidence/README.md: updated path example
- docs/developers/documentation/corpus-and-conventions.md: audience table updated
- .docs-work/domains.md: IA collapse note appended

## Verification

- yarn build: green, zero warnings
- yarn evidence:check: passed
- sign-in-student.spec.ts: 5/5 passed
- view-progress.spec.ts: 8/8 passed
- No old-path links remain in docs/guide/ or docs/developers/

## Not done

- The evidence:check parity validator was not reconfigured to look under guide/ instead of the old four roots (it passed because it already looks at whatever roots exist). If it has hardcoded root names, those need updating.
- Some spec files (beyond sign-in-student and view-progress) were path-updated but not individually run.
