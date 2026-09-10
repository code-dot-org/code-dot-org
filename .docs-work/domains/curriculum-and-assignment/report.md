# curriculum-and-assignment report

Rev 9793f8d36ae. Date 2026-09-09.

## Pages written

| Path | Type | Grade |
|---|---|---|
| teachers/curriculum/browse-the-catalog.md | task | VERIFIED |
| teachers/curriculum/course-overview.md | task | STRONGLY_SUPPORTED |
| teachers/curriculum/unit-overview.md | task | STRONGLY_SUPPORTED |
| teachers/curriculum/lesson-plan.md | task | STRONGLY_SUPPORTED |
| teachers/curriculum/download-pdfs.md | task | STRONGLY_SUPPORTED |
| teachers/curriculum/who-can-see-this-course.md | concept | STRONGLY_SUPPORTED |
| teachers/curriculum/incubator.md | concept | STRONGLY_SUPPORTED |
| teachers/classes/assign-a-course.md | task | VERIFIED |
| teachers/home/teacher-home-page.md | task | STRONGLY_SUPPORTED |
| teachers/certificates/print-certificates.md | task | STRONGLY_SUPPORTED |
| students/learning/see-your-assignments.md | task | VERIFIED |
| students/learning/student-lesson-plan.md | concept | STRONGLY_SUPPORTED |
| students/learning/code-documentation.md | task | STRONGLY_SUPPORTED |
| students/activities/hour-of-code.md | task | VERIFIED |
| students/activities/get-a-certificate.md | task | VERIFIED |

15 pages, 5 VERIFIED, 10 STRONGLY_SUPPORTED.

## Journeys

| Spec | Result |
|---|---|
| browse-catalog.spec.ts | PASS |
| assign-course.spec.ts | PASS |
| hour-of-code.spec.ts (2 tests) | PASS |

## Screenshots

browse-the-catalog-catalog.png, assign-a-course-catalog-assign.png

## published_state matrix

in_development: levelbuilder only. pilot: levelbuilder + pilot teacher + assigned students. beta/preview/stable/sunsetting/deprecated: everyone by URL. Catalog: preview+stable only, assignable, student audience.

## Omitted items

scrapbook (experiment), teacher-promotions (DCDO off), hour-of-code-app-download (low confidence), curriculum-legacy-proxy (internal), home-page-signed-out (brand-router-gated), global-edition-region (no visible picker).

## Questions for Fable

1. Standardize on "section" (UI mixes section/class section/classroom section).
2. Delete stale docs/pdf-lesson-plan-generation.md.
3. Global edition: no visible region picker; region set by URL path.
4. create-a-section.md referenced but belongs to classrooms-and-progress.
