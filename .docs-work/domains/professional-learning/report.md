# Professional learning domain report

## Pages written

### Teachers (docs/teachers/professional-learning/)

| Path | Type | Grade |
|---|---|---|
| index.md | concept | VERIFIED |
| find-a-workshop.md | task | VERIFIED |
| attend-a-workshop.md | task | STRONGLY_SUPPORTED |
| self-paced-courses.md | task | VERIFIED |
| apply-to-a-program.md | task | STRONGLY_SUPPORTED |
| become-a-verified-teacher.md | concept | STRONGLY_SUPPORTED |
| manage-workshops.md | task | STRONGLY_SUPPORTED |
| contact-your-regional-partner.md | task | VERIFIED |

### District administrators (docs/district-administrators/)

| Path | Type | Grade |
|---|---|---|
| approve-a-teacher-application.md | task | STRONGLY_SUPPORTED |

### Developers (docs/developers/professional-learning/)

| Path | Type | Grade |
|---|---|---|
| pd-object-model.md | concept | STRONGLY_SUPPORTED |
| verification-and-permissions.md | concept | STRONGLY_SUPPORTED |
| surveys-and-foorm.md | concept | STRONGLY_SUPPORTED |

Total: 11 pages (7 teacher, 1 district admin, 3 developer).

## How verification is earned (verdict)

STRONGLY_SUPPORTED. Seven code paths grant AUTHORIZED_TEACHER. Paths 1-2 are PD-specific (workshop enrollment, PLC course enrollment). Paths 3-7 are account-lifecycle (Clever/ClassLink/LTI sign-up, Google Classroom sync, OAuth callback, LTI linking, international opt-in).

The curriculum owner should link "how to get verified" to /teachers/professional-learning/become-a-verified-teacher/.

## Journey

professional-learning.spec.ts: 1 test, passed 15.8s. 3 screenshots generated.

## Screenshots

| File | Page | Shows |
|---|---|---|
| index-pl-landing.png | index.md | PL landing with Getting Started, Joined Sections, Recommended |
| self-paced-courses-self-paced-catalog.png | self-paced-courses.md | Course cards with Start buttons |
| find-a-workshop-workshop-catalog.png | find-a-workshop.md | ZIP search and Submit |

## Contradictions

Teacher application and principal approval form routes 404 locally. Views exist but routes not found in routes.rb.

## Questions for Fable

1. Are teacher application/principal approval form routes intentionally absent?
2. Should AFE/CSTA be documented as teacher tasks?
3. PLC peer review omitted from teacher pages (no self-service path). Confirm.

## Slice items not documented

- plc-peer-review: no self-service path
- ai-jit-pl-content: levelbuilder concern
- pl-facilitator-application: mentioned in index, no standalone page
- pl-amazon-future-engineer: no walkable UI
- pl-csta-enrollment: gated off in production

## Cross-domain edits

Added one bullet to docs/district-administrators/index.md.

## Correction (post-review)

Sonnet research (`.docs-work/raw/pd-application-routing.md`) confirmed that the teacher application, facilitator application, and principal approval routes were removed from `routes.rb` by commit `2f2f2700ad3` (2025-09-03) and controllers deleted by `15fdd07b819` (2025-09-04). The haml views are orphaned. `pd_application_principal_approval_url` is undefined; four mailer templates would raise if rendered. Production intake is external at `code.org/apply`.

Changes made:
- Deleted `apply-to-a-program.md` and its evidence file; folded the useful content (external application at code.org/apply, verification after acceptance) into `become-a-verified-teacher.md`.
- Rewrote `approve-a-teacher-application.md` to state that approval happens through the external process at code.org/apply and by email, with no in-product form.
- Updated `pd-object-model.md` to document the route removal (with commit hashes) and the dangling `pd_application_principal_approval_url` hazard.
- Updated all affected evidence files.
- Wrote `.docs-work/domains/professional-learning/renames.md`.
- Updated `index.md` links.
- Build and evidence:check pass.

Page count: 10 (was 11; apply-to-a-program deleted).
