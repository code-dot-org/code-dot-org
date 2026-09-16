## Why

Young students can struggle to enter section codes, select their names, and supply picture or word passwords. A reusable printed QR badge would let them open their existing Code.org account at school, at home, in a library, or with a caregiver without reading or typing credentials.

## What Changes

- Add browser-based badge scanning and Rails authentication for existing student accounts, preserving progress and account restrictions.
- Initially allow authorized teachers to issue badges for teacher-managed students in picture or word sections. Badges are account credentials; using one does not require school presence, an active class session, or continued membership in the issuing section.
- Add class-set printing, unchanged reprinting, individual replacement, revocation, and renewal. School and home copies can coexist; replacing a credential invalidates every copy of it.
- Retain encrypted credential material for authorized reprinting and a digest for authentication. Never upload camera images or include badge secrets in telemetry.
- Record badge authentication in the session, support revocation of established badge sessions, and require another existing authentication method for changes to account credentials or recovery settings.
- Keep picture/word login as a fallback. Explain the limits of recovery when a student has no current teacher or independent login.
- Roll out behind separate issuance and authentication controls, starting with an opt-in pilot on iPads and Chromebooks.

## Capabilities

### New Capabilities

- `student-badge-authentication`: Reusable badge authentication from supported browsers in any setting, session handling, privacy, and accessible scanning.
- `student-badge-management`: Teacher authorization, printing, credential lifecycle, continuity across sections, and recovery boundaries.

### Modified Capabilities

None. The local OpenSpec root has no existing capability specifications.

## Impact

- Rails: a badge credential model and migration, management endpoints, an authentication endpoint, CanCanCan permissions, session provenance and invalidation, credential-change guards, and parameter filtering.
- Frontend: a scanner entry point, a QR decoder dependency selected against the supported browser matrix, and changes to existing student-management and printable-login-card surfaces. Use the repository design system and accessibility conventions.
- Operations: dedicated encryption-key configuration and rotation, credential audit events, rate limits, feature controls, and support documentation.
- Existing integration points include `SectionsController#log_in`, `User.authenticate_with_section`, `SectionLoginInfo.jsx`, `Api::V1::SectionsStudentsController`, and Devise session expiration. Existing Clever SSO remains separate and already supports entry through Clever badges.
- No new student accounts, roster provider, or section login type is required. This work is independent of `classlink-roster-support`.

## Non-goals

- Teacher or administrator badge-only login; Clever badge decoding; OS/device login; a native mobile application.
- Mandatory PINs, school-network restrictions, approved-device enrollment, or teacher-opened login windows.
- New caregiver accounts or identity recovery based only on a student's name, birthday, or section code.
- Authentication through arbitrary camera-app URLs, or restricting a student session to one section.
