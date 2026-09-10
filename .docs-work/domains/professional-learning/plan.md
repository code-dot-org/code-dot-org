# Professional learning domain plan

## Blocking questions

1. **Principal approval form route.** The `pd_application_principal_approval_url` helper is called in `teacher_application.rb:256` but the route does not exist in `routes.rb`. The view (`pd/application/principal_approval_application/new.html.haml`) exists. The URL is generated per-application via `application_guid`. Likely served by a dynamic or conventional route that I have not found, or broken. BLOCKED until verified in browser.
2. **Application window state.** The teacher application form is gated by `Gatekeeper.disallows('pd_teacher_application')` in production only. In development, the form always reports as open. Cannot confirm whether production currently accepts applications.
3. **PLC reviewer matching.** `PLC_REVIEWER` is a flat permission; no scoping model connects reviewers to specific submissions. `PeerReview` has `reviewer_id` and is assignable, but no auto-matching logic was found. Likely manual assignment or first-come. Record as INFERRED.

## Terminology observed

- The PL landing page tab for teachers who manage workshops says **Facilitator Center**, **Workshop Organizer**, or **Regional Partner Center** depending on role (from Cucumber feature).
- The teacher application form header reads "Code.org Administrator/School Leader Approval Form" (from the view).
- Self-paced courses catalog title: "Computer Science and AI Self Paced Professional Development Courses" (from controller).
- Workshop catalog title: "Computer Science and AI Professional Development Workshops" (from controller).
- Enrollment statuses (teacher application): unreviewed, incomplete, reopened, awaiting_admin_approval, pending, pending_space_availability, declined, accepted, withdrawn, enrolled.

## How AUTHORIZED_TEACHER is earned (verdict)

STRONGLY SUPPORTED. Five paths, all in code:

1. **Workshop enrollment.** `Pd::Enrollment#authorize_teacher_account` (after_save callback, enrollment.rb:321): grants AUTHORIZED_TEACHER when the workshop course is CSD, CSP, CSA, or Build Your Own, and the user is a teacher.
2. **PLC course enrollment.** `Plc::UserCourseEnrollment#create_authorized_teacher_user_permission` (after_save callback, user_course_enrollment.rb:106): grants AUTHORIZED_TEACHER when the user is a teacher and not already verified.
3. **School-owned sign-up.** `RegistrationsController#auto_verify_teacher!` (registrations_controller.rb:683-690): grants AUTHORIZED_TEACHER at sign-up if the teacher authenticates via Clever, ClassLink, or LTI.
4. **Google Classroom sync.** `ApiController` (api_controller.rb:142-143): grants AUTHORIZED_TEACHER when a teacher syncs a Google Classroom section and their Google email is not @gmail.com/@googlemail.com/@google.com (school-domain check via `Policies::User.google_verified_teacher_candidate?`).
5. **OAuth sign-in (Clever/ClassLink).** `OmniauthCallbacksController#auto_verify_teacher!` (omniauth_callbacks_controller.rb:469-470): grants AUTHORIZED_TEACHER on Clever or ClassLink OAuth callback if the user is a teacher and not already verified.
6. **LTI account linking.** `Lti::V1::AccountLinkingController` and `Services::Lti::AccountLinker`: grants on LTI link if user is an unverified teacher.
7. **International opt-in.** `Pd::InternationalOptInsController` (international_opt_ins_controller.rb:19): grants AUTHORIZED_TEACHER on international opt-in submission.
8. **Manual grant.** `verify_teacher!` can be called from admin tools.

Paths 1-2 are the PD-specific paths. Paths 3-7 are account-lifecycle paths. The curriculum owner should link to the PL page for "how to get verified through professional learning"; the accounts owner covers paths 3-7.

## Pages

### Teachers (`docs/teachers/professional-learning/`)

| Path | Type | Reader's moment | Inventory IDs |
|---|---|---|---|
| `index.md` | concept | "I want to learn to teach a CodeAI course. Where do I start?" | pl-landing-page |
| `find-a-workshop.md` | task | "I want to find and attend a workshop near me." | pl-find-workshop, pl-enroll-in-workshop |
| `attend-a-workshop.md` | task | "I am at the workshop. How does attendance, surveys, and certificates work?" | pl-attend-workshop, pl-workshop-surveys, pl-workshop-certificate |
| `self-paced-courses.md` | task | "I want to work through training on my own time." | pl-plc-course-enrollment |
| `apply-to-a-program.md` | task | "I want to apply to a professional learning program for next year." | pl-teacher-application |
| `become-a-verified-teacher.md` | concept | "I want access to answer keys. How do I get verified?" | pl-teacher-preverification |
| `manage-workshops.md` | task | "I run workshops and need to manage sessions, rosters, attendance, and reports." | pl-workshop-dashboard, pl-workshop-reports, pl-workshop-user-management, pl-regional-partner-admin |
| `contact-your-regional-partner.md` | task | "I have a question about training in my area." | pl-regional-partner-contact |

### District administrators (`docs/district-administrators/`)

| Path | Type | Reader's moment | Inventory IDs |
|---|---|---|---|
| `approve-a-teacher-application.md` | task | "A teacher asked me to approve their application. What do I do?" | pl-principal-approval |

### Developers (`docs/developers/professional-learning/`)

| Path | Type | Reader's moment | Inventory IDs |
|---|---|---|---|
| `pd-object-model.md` | concept | "I need to understand the PD data model before working in this area." | pl-workshop-dashboard, pl-enroll-in-workshop, pl-attend-workshop, pl-teacher-application, pl-regional-partner-admin |
| `verification-and-permissions.md` | concept | "How does a teacher earn AUTHORIZED_TEACHER, and what other PD permissions exist?" | pl-teacher-preverification, pl-workshop-user-management |
| `surveys-and-foorm.md` | concept | "How does the survey system work for workshops?" | pl-workshop-surveys |

## Inventory items not given a page (and why)

- **plc-peer-review**: low-confidence that this is reachable by a regular teacher today; PLC_REVIEWER is a flat permission with no self-service path. Mention in developer concept page. INFERRED.
- **ai-jit-pl-content**: just-in-time PL content is a levelbuilder/authoring concern, not a teacher-facing task. Omit from teacher pages; mention in developer page if space allows.
- **pl-facilitator-application**: routes exist (`/professional-learning/facilitator/*`) but the form is course-specific and may require facilitator permission. Mention in `index.md` with a link to the facilitator page URLs. INFERRED.
- **pl-amazon-future-engineer**: AFE enrollment is a form submission; mention in `index.md` if reachable. Verify.
- **pl-csta-enrollment**: gated by DCDO `csta-form-extension` (default false). Not reachable in production unless enabled. Omit.
- **pl-international-opt-in**: route exists (`/pd/international_workshop`). Mention in `index.md` if the form renders.

## Screenshots (budget: ~4)

1. **PL landing page** (teacher view, index.md): shows the main entry points. Earns its place as orientation.
2. **Workshop catalog** (find-a-workshop.md): shows the search/filter interface if seeded data exists.
3. **Self-paced course catalog** (self-paced-courses.md): shows the course cards.
4. **Teacher application section headers** (apply-to-a-program.md): shows the form's first step, if reachable.

## Journey

Journey 11 from journeys.md. The spec will create a teacher, visit the PL landing page, browse the workshop catalog, visit the self-paced catalog, and take a screenshot at each. Application and workshop enrollment depend on seeded data; mark BLOCKED if absent.
