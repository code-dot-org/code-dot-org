---
title: Verification and permissions
description: How AUTHORIZED_TEACHER and other PD permissions are earned, checked, and used.
type: concept
---

The PD subsystem is the primary source of the `AUTHORIZED_TEACHER` permission and interacts with several other permissions.

## AUTHORIZED_TEACHER

`AUTHORIZED_TEACHER` is the permission that makes a teacher "verified." It unlocks answer keys, exemplar code, and instructor-only locked content across all courses the teacher can instruct.

### Grant paths

The permission is granted by calling `user.verify_teacher!` (defined in `User::Verifiable`, `dashboard/app/models/concerns/user/verifiable.rb`), which sets `user.permission = UserPermission::AUTHORIZED_TEACHER`. This triggers a verification email from the `UserPermission` model.

Seven code paths call `verify_teacher!` or set the permission directly:

1. **Workshop enrollment** (`Pd::Enrollment#authorize_teacher_account`, `enrollment.rb:321`): `after_save` callback. Grants when the workshop course is CSD, CSP, CSA, or Build Your Own and `user.teacher?` is true.

2. **PLC course enrollment** (`Plc::UserCourseEnrollment#create_authorized_teacher_user_permission`, `user_course_enrollment.rb:106`): `after_save` callback. Grants when `user.teacher?` and not already `verified_teacher?`.

3. **School-owned sign-up** (`RegistrationsController#auto_verify_teacher!`, `registrations_controller.rb:683`): grants at registration when the teacher authenticates via Clever, ClassLink, or LTI (the `SCHOOL_OWNED_TYPES` set in `Policies::User`).

4. **Google Classroom sync** (`ApiController`, `api_controller.rb:142`): grants after the first successful Google Classroom section sync, if the teacher's Google email is not `@gmail.com`, `@googlemail.com`, or `@google.com` (the `Policies::User.google_verified_teacher_candidate?` check).

5. **OAuth callback** (`OmniauthCallbacksController#auto_verify_teacher!`, `omniauth_callbacks_controller.rb:469`): grants on Clever or ClassLink OAuth sign-in if the teacher is not already verified.

6. **LTI account linking** (`Lti::V1::AccountLinkingController`, `Services::Lti::AccountLinker`): grants when an unverified teacher links their account through LTI.

7. **International opt-in** (`Pd::InternationalOptInsController`, `international_opt_ins_controller.rb:19`): grants on form submission if the user is a teacher and not already verified.

Paths 1-2 are PD-specific. Paths 3-7 are account-lifecycle triggers managed outside the PD subsystem.

### Check methods

- `user.verified_teacher?` -- returns true if the user holds `AUTHORIZED_TEACHER` specifically.
- `user.verified_instructor?` -- returns true if the user holds any of: `UNIVERSAL_INSTRUCTOR`, `PLC_REVIEWER`, `FACILITATOR`, `AUTHORIZED_TEACHER`, or `LEVELBUILDER`. Use this when gating access to locked instructor content, since all five permissions indicate a trusted instructor.

The constant list is defined in `User::Verifiable::INSTRUCTOR_ACCESS_PERMISSIONS`.

## Other PD permissions

| Permission | Granted by | Scope |
|---|---|---|
| `FACILITATOR` | CodeAI staff or regional partner | Manage workshops where the user is a facilitator; access facilitator-audience courses |
| `WORKSHOP_ORGANIZER` | CodeAI staff | Create and manage workshops; scoped to the user's regional partners |
| `PROGRAM_MANAGER` | Automatic via `RegionalPartnerProgramManager` join row | Same abilities as `WORKSHOP_ORGANIZER`; scoped to the user's regional partners |
| `WORKSHOP_ADMIN` | CodeAI staff | Manage all workshops, regional partners, and applications globally (unscoped) |
| `PLC_REVIEWER` | CodeAI staff | Manage `PeerReview` records; review PLC coursework |

All PD permissions are checked via `user.permission?(name)`, which returns `false` for any `student`-type account regardless of what `UserPermission` rows exist.

## CanCanCan abilities

PD permissions map to CanCanCan rules in `dashboard/app/models/ability.rb`:

- `FACILITATOR` (lines 257-262): manage attendance for workshops where the user is a facilitator or organizer.
- `WORKSHOP_ORGANIZER` / `PROGRAM_MANAGER` (lines 264-291): create/manage own workshops; if the user has `regional_partners`, also manage workshops and applications scoped to those partners.
- `WORKSHOP_ADMIN` (lines 293-308): `can :manage` on `Pd::Workshop`, `Pd::CourseFacilitator`, `RegionalPartner`, and all application types -- unscoped.
- `PLC_REVIEWER` (lines 314-319): `can :manage, PeerReview`.

## Related

- [PD object model](/developers/professional-learning/pd-object-model/)
- [Surveys and Foorm](/developers/professional-learning/surveys-and-foorm/)
