# integrations-schools-districts plan

## Blocking questions

1. The roster-import page links to `/district-administrators/lms-integration/`;
   the student LMS sign-in page links to `/district-administrators/integration/lms-setup/`.
   I will use `/district-administrators/integration/connect-your-lms/` as the
   canonical LMS setup page. Both inbound paths need patching by the orchestrator.
2. Deep linking is gated behind `schoology_deep_linking_enabled` (default false)
   and returns `:not_implemented` when off. The controller's `build_content_items`
   method is hardcoded to two links (Music Lab, AI Foundations 2025). I will
   document deep linking as "available for Schoology when enabled" and note the
   current limitation. If it is not reachable in production, it goes to unresolved.
3. Discourse SSO and Zendesk SSO are in my inventory slice. They are outbound
   SSO integrations (studio signs you into another service), not LMS integrations.
   I will include them as a short concept page under the developer audience
   and omit them from the district-admin pages, since no district admin action
   is involved.

## Terminology observed

- The integration creation page heading says "Register Your LMS with Code.org".
  The form labels: "Integration Name", "LMS Client ID", "Admin Email",
  "LMS" (dropdown: Canvas, Canvas - Beta, Canvas - Test, Schoology).
  The button says "Register LMS". I will use "register" when describing this form.
- The product name in LTI config is "CodeAI".
- Sections synced from LMS are login type `lti_v1`. Code says "LTI" section.
- Clever sections are login type `clever`. Google Classroom sections are
  login type `google_classroom`.
- The UI says "class" on teacher home, "section" in section settings.
  The roster-import page uses both. I will follow the adjacent page convention
  and say "section" for the container, "roster" for the student list.

## Pages

### District administrator audience (`docs/district-administrators/`)

| # | Path | Type | Question it answers | Inventory ids | Journey |
|---|---|---|---|---|---|
| 1 | `district-administrators/index.md` | concept | Landing: "I work for a school or district. What can I do here?" | district-admin-role-gap | J16 |
| 2 | `district-administrators/integration/connect-your-lms.md` | task | "How do I connect CodeAI to our Canvas or Schoology?" | lms-admin-integration-setup | J7 step 1 |
| 3 | `district-administrators/integration/what-lms-integration-provides.md` | concept | "What happens after I connect? What do teachers and students get?" | lms-deep-linking, account-linking-lti | J7 steps 2-6 |
| 4 | `district-administrators/integration/clever-and-google-classroom.md` | concept | "We use Clever / Google Classroom. What happens for our teachers and students?" | (cross-ref to classrooms-and-progress roster tasks) | -- |
| 5 | `district-administrators/school-data/how-school-data-works.md` | concept | "What data does CodeAI hold about my school and district?" | school-association-signup, school-info-reconfirm, school-census-submission, school-district-data-model | J16 step 6 |
| 6 | `district-administrators/reporting.md` | concept | "How do I see what our schools are doing?" | district-admin-role-gap | J16 step 7 |

### Developer audience (`docs/developers/`)

| # | Path | Type | Question it answers | Inventory ids |
|---|---|---|---|---|
| 7 | `developers/integrations/lti-integration.md` | concept | "How does the LTI 1.3 integration work in this codebase?" | lms-admin-integration-setup, lms-deep-linking, lms-jwks-endpoint, account-linking-lti |
| 8 | `developers/integrations/roster-sync-architecture.md` | concept | "How do Clever, Google Classroom, and LTI roster sync work?" | (cross-domain reference) |
| 9 | `developers/integrations/school-and-district-data-model.md` | reference | "How are schools, districts, and teacher associations modeled?" | school-district-data-model |

### Screenshots

- connect-your-lms: crop of the registration form on `/lti/v1/integrations/new` (VERIFIED, anyone can load it). Earns its place: the reader needs to know what fields to fill in.
- No other screenshot is warranted. LTI launch, deep linking, and account linking all require an active LMS session that cannot be reproduced locally without external secrets.

### Inventory items not documented as pages

- `discourse-sso`, `zendesk-sso`: outbound SSO, no district-admin action.
  Mentioned in the developer LTI page as related integrations, but not given
  their own page. They are tiny (one controller action each) and do not serve
  any reader moment in the district-admin or teacher audience.

## Canonical LMS setup path

`/district-administrators/integration/connect-your-lms/`

Inbound links to patch (orchestrator):
- `/district-administrators/integration/lms-setup/` (from `docs/students/account/sign-in-from-an-lms.md`)
- `/district-administrators/lms-integration/` (from `docs/teachers/classes/import-a-roster.md`)
