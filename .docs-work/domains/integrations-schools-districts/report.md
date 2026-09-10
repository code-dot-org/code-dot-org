# integrations-schools-districts domain report

## Pages

| # | Path | Type | Grade |
|---|---|---|---|
| 1 | district-administrators/index.md | concept | STRONGLY_SUPPORTED |
| 2 | district-administrators/integration/connect-your-lms.md | task | VERIFIED (form screenshot) |
| 3 | district-administrators/integration/what-lms-integration-provides.md | concept | STRONGLY_SUPPORTED |
| 4 | district-administrators/integration/clever-and-google-classroom.md | concept | STRONGLY_SUPPORTED |
| 5 | district-administrators/school-data/how-school-data-works.md | concept | STRONGLY_SUPPORTED |
| 6 | district-administrators/reporting.md | concept | STRONGLY_SUPPORTED |
| 7 | developers/integrations/lti-integration.md | concept | STRONGLY_SUPPORTED |
| 8 | developers/integrations/roster-sync-architecture.md | concept | STRONGLY_SUPPORTED |
| 9 | developers/integrations/school-and-district-data-model.md | reference | STRONGLY_SUPPORTED |

Total: 9 pages (6 district-admin, 3 developer). 1 index page (rewritten).

## Journeys

- lms-integration.spec.ts: GREEN. Loads /lti/v1/integrations/new, captures form screenshot.
- LTI launch, deep linking, account linking, Clever OAuth, Google Classroom OAuth: BLOCKED (environment). Require external LMS/provider credentials.

## Screenshots

1 screenshot: connect-your-lms-registration-form.png (crop of the manual registration form). Shows field labels: School or district name, LMS Client ID, Your email, What LMS are you using?, Register LMS button. Earns its place because the reader must know exactly what to fill in.

## Canonical LMS setup path

`/district-administrators/integration/connect-your-lms/`

Inbound paths to patch:
- `/district-administrators/integration/lms-setup/` (from students/account/sign-in-from-an-lms.md)
- `/district-administrators/lms-integration/` (from teachers/classes/import-a-roster.md)

## Terminology observed

- UI says "Register Your LMS with Code.org" (heading), "Register LMS" (button)
- Form labels: "School or district name", "LMS Client ID", "Your email", "What LMS are you using?"
- LMS dropdown options: Canvas, Canvas - Beta, Canvas - Test, Schoology
- Section login types: lti_v1, clever, google_classroom
- Product name in dynamic registration config: "CodeAI"

## Contradictions

None found. The inventory's open question about who can reach /lti/v1/integrations/new is answered: no auth gate, anyone can load it. Documented as such.

## Questions for Fable

1. The student LMS sign-in page mentions "school administrator may need to finish the LMS integration setup" but the integration form requires no special role. Should the student page be softened?
2. Deep linking content items are hardcoded (Music Lab, AI Foundations 2025). This appears to be a development placeholder. Should the page caveat this or omit deep linking entirely from the admin-facing docs?

## Inventory items not documented as standalone pages

- discourse-sso: mentioned in developer LTI page as a related integration. No district-admin action; no reader moment for its own page.
- zendesk-sso: same treatment. One-liner in the developer LTI page.
- school-info-reconfirm: covered within how-school-data-works.md (confirmation banner).
- school-census-submission: covered within how-school-data-works.md (census section).

## Final usage

Session 20%, week 62%, tier 61%.
