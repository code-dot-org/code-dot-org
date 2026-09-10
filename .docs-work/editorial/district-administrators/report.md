# District administrators editorial review

Reviewer: editorial agent (independent, did not write these pages).
Revision: 9793f8d36ae. Date: 2026-09-10.

## Per-page changes

- **index.md**: rewrote opening from reader's moment; replaced bold-label inventory bullets with descriptive link list; added evidence file (was missing); changed "Code.org" link text to "CodeAI support".
- **integration/connect-your-lms.md**: merged what-lms-integration-provides.md into this page as "What connecting provides" and "What is not available" sections. Removed registration-form screenshot (text names each field exactly; image did not disambiguate). Removed redundant Canvas limitation paragraph (now part of "Content selection" and "What is not available"). Simplified dynamic registration section. Evidence file updated with merged sources, routes, flags, and unresolved items.
- **integration/what-lms-integration-provides.md**: DELETED (merged into connect-your-lms.md).
- **integration/images/connect-your-lms-registration-form.png**: DELETED (screenshot removed per image convention).
- **integration/clever-and-google-classroom.md**: rewrote opening from reader's moment; renamed H2 "How it works" to "How teachers import rosters" for specificity.
- **approve-a-teacher-application.md**: collapsed "How the process works" and "If you received an approval email" into one "What the email asks you to do" section. Moved cost answer into bold inline ("Approving does not commit your school to any cost") so the principal sees it before deciding. Collapsed "How to verify the email is legitimate" into shorter section. Removed empty H2-only "Cost" section. Tightened next steps.
- **reporting.md**: rewrote opening from reader's moment; renamed H2 to "How to get district data"; changed "class" to "section" per terminology convention; changed "Code.org's" to "CodeAI's" in regional partner bullet.
- **school-data/how-school-data-works.md**: rewrote opening from reader's moment, leading with what the reader wants to know and immediately stating the key limitation (district staff cannot edit or view this data). Trimmed redundant detail in school-records and teacher-association sections.

## Reconciliations

- **LMS capabilities across pages**: the connect-your-lms page now carries all LMS capability claims (accounts, roster sync, content selection, limitations) that were previously split across two pages. No contradictions remain.
- **Deep linking scope**: consistently stated as Schoology-only, with Music Lab and AI Foundations 2025 as the two content items (STRONGLY SUPPORTED from deep_linking_controller.rb). Canvas limitation stated in three places on the merged page (opening context via "Content selection", "What is not available" bullet, troubleshooting section).
- **Clever admin collapse**: stated on clever-and-google-classroom.md and reporting.md consistently (Clever district_admin and school_admin become standard teacher accounts).

## Removed claims

None removed. All claims retained are at STRONGLY_SUPPORTED or higher.

## Merges

- what-lms-integration-provides.md into connect-your-lms.md (reader experiences these as one moment: "I want to connect our LMS and understand what it does").

## Image changes

- Removed connect-your-lms-registration-form.png. The text lists each field label exactly as the product shows it (VERIFIED by journey test). The image repeated the same information as the bullet list and did not disambiguate any control.

## Evidence parity

Six pages, six evidence files. New: index.json. Deleted: what-lms-integration-provides.json (merged into connect-your-lms.json).

## Build

`npm run build`: 141 pages, 0 errors.
`npm run evidence:check`: passed.
