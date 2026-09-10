---
title: PD object model
description: Workshops, sessions, enrollments, attendance, applications, and regional partners -- how the professional learning data model fits together.
type: concept
---

The professional development (PD) subsystem manages workshops, enrollments, attendance, surveys, applications, and the organizations that deliver them. All PD models live under `dashboard/app/models/pd/` and `dashboard/app/models/plc/`.

## Workshops and sessions

`Pd::Workshop` is the central object. A workshop has a course (CS Fundamentals, CS Principles, CS Discoveries, CS A, etc.), a subject (Intro, 5-day Summer, etc.), a capacity, and an organizer (`organizer_id` pointing to a `User`). It belongs to an optional `RegionalPartner`.

Each workshop has one or more `Pd::Session` records, each representing a single day or time block. Sessions carry a `code` used for attendance URLs.

Workshop state follows a lifecycle: Not Started, In Progress, Ended. The `started_at` and `ended_at` timestamps track this.

## Enrollments

`Pd::Enrollment` ties a user to a workshop. It carries its own `code` (used for survey and certificate URLs), tracks the user's school info, and records scholarship eligibility.

Key callbacks on enrollment:

- `after_save :authorize_teacher_account` -- grants `AUTHORIZED_TEACHER` when the workshop course is CSD, CSP, CSA, or Build Your Own and the user is a teacher. This is one of the two PD-specific paths to verification.

## Attendance

`Pd::Attendance` records a user's presence at a specific session. The `Pd::SessionAttendanceController` handles the `/pd/attend/:session_code` URL, which participants visit to mark themselves present.

## Applications

`Pd::Application::ApplicationBase` is the STI base for all PD applications, stored in the `pd_applications` table. Two concrete subclasses matter:

- `Pd::Application::TeacherApplication` -- the year-long program application. Statuses: `unreviewed`, `incomplete`, `reopened`, `awaiting_admin_approval`, `pending`, `pending_space_availability`, `declined`, `accepted`, `withdrawn`. An `enrolled` virtual status is derived from workshop assignment.
- `Pd::Application::PrincipalApprovalApplication` -- the form the applicant's school administrator fills out. It shares the same `application_guid` as the teacher application and is linked via that GUID rather than a foreign key.

The public-facing application forms and their routes were removed in September 2025 (commits `2f2f2700ad3` and `15fdd07b819`). The models, admin API endpoints (`Api::V1::Pd::ApplicationsController`), and mailer templates remain, but no controller or route serves the teacher application, facilitator application, or principal approval forms to end users. Production teacher intake is external at `https://code.org/apply`.

**Known hazard:** `Pd::Application::TeacherApplication#principal_approval_url` (`teacher_application.rb:255-256`) calls `pd_application_principal_approval_url`, a route helper that no longer exists. Four mailer templates reference this method and would raise `NoMethodError` if rendered.

Application windows are controlled by the `pd_teacher_application` Gatekeeper flag, which blocks non-workshop-admins in production when set to disallow.

## Regional partners

`RegionalPartner` represents an organization that delivers PD in a geographic area. Regional partners are mapped to ZIP codes and school districts via `RegionalPartnersSchoolDistrict`.

`RegionalPartnerProgramManager` is a join table linking a `User` to a `RegionalPartner`. Creating this row automatically grants the `PROGRAM_MANAGER` permission via an `after_create` callback; destroying it revokes the permission if the user has no remaining partners.

## PLC courses (self-paced)

The `Plc::` namespace models self-paced professional learning:

- `Plc::Course` -- a course (e.g., "Teaching Computer Science Principles")
- `Plc::CourseUnit` -- corresponds to a `Unit` in the curriculum structure
- `Plc::LearningModule` -- a component of a course unit
- `Plc::UserCourseEnrollment` -- maps a user to a course. The `after_save` callback `create_authorized_teacher_user_permission` grants `AUTHORIZED_TEACHER` when the user is a teacher and not already verified. This is the second PD-specific verification path.
- `Plc::EnrollmentModuleAssignment` -- tracks which modules the user must complete

Self-paced PL courses are regular curriculum content with `participant_audience: 'teacher'` (or `'facilitator'`). Teachers join them through sections with `participant_type: 'teacher'`.

## Surveys (Foorm)

Workshop surveys use two systems:

- **Foorm** (`dashboard/config/foorm/`, `Foorm::SimpleSurveyForm`) -- the current survey engine. Foorm forms are JSON-defined, rendered client-side, and stored as `Foorm::SimpleSurveySubmission` records. The `foorm_simple_survey_disabled` DCDO flag can disable specific forms.
- **Jotform** (legacy) -- an external form provider. The `jotform_redirect` DCDO flag controls whether surveys redirect to Jotform instead of Foorm. Default is off.

Survey types include daily surveys, pre-workshop surveys, post-workshop surveys, post-course surveys, and facilitator post surveys. Each has its own controller action under `Pd::WorkshopDailySurveyController`.

## Mailers

`Pd::Application::TeacherApplicationMailer` sends emails at application status transitions: initial receipt, admin approval request, acceptance, decline, reminders, and completion. `Pd::WorkshopMailer` handles enrollment confirmation and workshop detail emails.

## Related

- [Verification and permissions](/developers/professional-learning/verification-and-permissions/)
- [Surveys and Foorm](/developers/professional-learning/surveys-and-foorm/)
