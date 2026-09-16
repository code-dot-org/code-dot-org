## Context

Code.org already supports teacher-managed picture and word accounts, printable login cards, and Clever OAuth. `SectionsController#log_in` calls `User.authenticate_with_section`, establishes a Devise session, and redirects toward assigned work. `SectionLoginInfo.jsx` renders printable credentials. `Api::V1::SectionsStudentsController` and CanCanCan authorize teacher management. Badge login extends these facilities without making new student accounts or changing roster providers.

The badge must work outside supervised classrooms, including on shared home and library devices. Possession of a copy is sufficient for student login. A caregiver's copy is valid; the system cannot distinguish it from the original or a stolen photograph. Teachers issue credentials, students use them, and caregivers can help use and retain copies without gaining a separate caregiver identity.

Existing account restrictions still apply. `ApplicationController` enforces child-account and LMS policies; Devise/Warden hooks maintain user cookies. Badge sessions must not bypass these paths. The current section controller uses `bypass_sign_in`; the new flow must deliberately preserve normal authentication checks and hooks rather than copy that call unchanged.

## Goals / Non-Goals

**Goals:**

- Let a pre-reader scan a printed credential in a supported browser and continue with the same account and progress from any setting.
- Support school and home copies, controlled reprinting, replacement, revocation, and continuity across section changes.
- Keep secrets out of URLs and telemetry, keep camera images on the device, and invalidate sessions established with revoked credentials.
- Deliver an opt-in student pilot with explicit recovery limits and measurable device usability.

**Non-Goals:**

- Staff badge authentication, native apps, device unlocking, or decoding Clever credentials.
- Mandatory PINs, school-location checks, enrolled devices, or scheduled login windows.
- New caregiver identity or recovery services, new roster types, or access limited to one section.
- Replacing existing picture/word login or claiming stronger overall account security while those fallbacks remain enabled.

## Decisions

### 1. An account credential with narrowly authorized issuance

Add a dedicated `StudentLoginBadge` record associated with a student. Keep at most one current record per user, enforced with a unique database index; replacement advances its generation. Record the original issuing teacher and section as audit context, not as lifetime owners. Do not cascade credential deletion when an issuing section is removed.

Initial issuance requires an authenticated current instructor who can manage both the target picture/word section and its student. The target must be a teacher-managed student, not a teacher, administrator, demo student, or an account governed by an SSO/LTI-only login policy. Enforce eligibility server-side even when UI controls are hidden. Add explicit badge-management abilities rather than trusting an arbitrary section/student pair or generic `manage User` permission alone.

For existing badges, current authorized instructors of an eligible picture/word section can print, replace, renew, or revoke them. Former instructors lose these rights when their relationship ends. When an account is no longer teacher-managed, teacher badge-management rights end. The student can revoke their own existing badge after authenticating by an existing non-badge method; student self-issuance is outside this change.

Changing or deleting a section does not itself revoke a badge. Adding an independent login does not itself invalidate it. Deleting the account, changing it to a non-student role, or imposing a policy that prohibits local credentials prevents both new badge authentication and continued badge sessions. Ordinary child-account restrictions remain in force after login.

Alternative: section-bound credentials would simplify membership checks but could unexpectedly remove home access during classroom transitions. Supporting several independently revocable badges per student is deferred; physical copies of the current credential satisfy the initial school/home requirement.

### 2. Opaque random credentials, with encrypted reprint material

Use a versioned payload containing a random public credential identifier, generation, and 32 random secret bytes encoded without padding. The payload contains no name, email, section code, existing password, or destination URL. Define a strict bounded grammar, supported version, and maximum length; reject other QR formats.

Store the public identifier, user ID, generation, SHA-256 secret digest, encrypted secret, encryption-key version, issuer IDs, issue time, expiration, revocation time, and optional last-use timestamp. Verify a correctly sized digest using constant-time comparison. Do not use a password-stretching function for a uniformly random 256-bit secret.

Use a maintained Rails authenticated-encryption primitive with a dedicated versioned key from application secret configuration, explicit AES-256-GCM, JSON serialization, and purpose binding to the badge identity and generation. Do not store the key alongside the ciphertext or use unauthenticated encryption. Encryption allows unchanged reprints; authentication uses the digest and does not need decryption. Key rotation re-encrypts material without changing printed credentials; retiring a decryption key waits until its records have migrated. Missing keys disable issuance/reprint without falling back to plaintext; digest verification can continue.

Authenticate and manage credentials against the primary database to avoid replica lag after revocation. Serialize issue, replacement, renewal, and revocation per student, and make retried management requests idempotent so network retries cannot silently replace a newly printed badge. Audit credential lifecycle events separately from the mutable current record.

Alternative: digest-only storage prevents unchanged reprinting. A self-contained signed credential still needs revocation state and makes encryption/key rotation harder to separate from printed-card lifetime.

### 3. Explicit reprint, replacement, renewal, and expiration

The proposed initial lifetime is 365 days from issuance. Print the expiration date and show upcoming expiration in teacher management during the last 30 days. This is a proposed product default, not a requirement established by the exploration; review it before pilot launch.

| Operation | Credential | Existing copies | Existing badge sessions |
|---|---|---|---|
| Print another copy | Unchanged | Remain valid | Remain valid |
| Replace lost/compromised badge | New secret and generation | Stop working | End on next authenticated request |
| Renew | New secret and generation, new 365-day term | Stop working | End on next authenticated request |
| Revoke | Mark unusable and remove encrypted secret | Stop working | End on next authenticated request |
| Expire | Reject after expiration | Stop working | End on next authenticated request |

Show the consequences before replacement or renewal. Reprint neither extends expiration nor resets a secret. Revoke and replacement remove obsolete recoverable secret material; lifecycle audit events contain metadata, never QR payloads. Account erasure must remove credential secrets under the existing deletion process. Expiration is checked at use time, so correctness does not depend on a cleanup job.

An expired or revoked record can be replaced by a currently authorized teacher, producing a new generation. A saved PDF is itself a credential copy. Serve print views privately with `Cache-Control: no-store`; never publish them to public object storage or a shared CDN.

### 4. Scan locally, authenticate with a protected POST

Proposed route responsibilities:

| Route | Purpose |
|---|---|
| `GET /badge_login` | Public scanner page with CSRF context; no credential in the URL |
| `POST /badge_login` | Verify payload and establish a session |
| Section/student badge management routes | Authorized issue, reprint, replace, renew, and revoke operations |
| Account badge revocation route | Revoke the current user's badge after non-badge authentication |

Exact controller grouping can follow local conventions. State-changing endpoints require CSRF protection and authorization; printable responses require authentication and `no-store`. Do not copy CSRF exemptions from older student-management actions.

```text
Teacher authorization -> issue credential -> private print view -> physical copies
                                                                    |
School / home / library browser -> local QR decoding ----------------+
                |
                +-> CSRF-protected HTTPS POST
                         |
                   validate badge and account
                         |
                   fresh Devise session
                         |
                   assigned work or student home
```

The client submits only the decoded payload. The server parses it, checks the current digest/generation and lifecycle state, applies student eligibility, and creates a fresh session through Devise/Warden with normal hooks and tracked login fields. Reset prior session state and pairing/client identity state; retain only explicitly approved nonidentity navigation information. Prevent open redirects: destinations are server-derived local paths.

Prefer assigned work from the issuing section only while the student remains enrolled and the assignment is usable; otherwise use student home. No public name picker or section-code entry is required. A badge grants ordinary student access, subject to existing restrictions, rather than an authorization boundary around the issuing section.

Return a common invalid-badge response for unknown, incorrect, revoked, expired, or ineligible credentials. Give teachers detailed lifecycle information only after authorization. Add rate limits by source and credential identifier without permanent account lockout, and verify that shared school NAT traffic is not blocked during simultaneous legitimate login.

Filter the entire payload and secret fields from Rails, proxy/APM logging, errors, analytics, and session replay. Disable session replay on scanner and print surfaces. Audit successful login and credential-management events by internal IDs, never raw credential material. Do not persist camera frames, payloads in browser storage, or secrets in URL/history state.

### 5. Track the credential that created the session

Store badge record ID, generation, authentication method, authenticated-at time, and last activity in the server session. On each authenticated request from a badge session, check the current credential on the primary database, account eligibility, and badge-session age. Missing, revoked, expired, or superseded credentials end that session. This ensures a concurrent login cannot leave a usable session after replacement commits; an already executing request is not retroactively cancelled.

Proposed badge-session defaults are two hours idle and twelve hours absolute, with no persistent remember-me credential. Existing shorter account limits still apply. Background polling must not count as student activity. Provide an expiry warning and preserve unsaved work through existing mechanisms where available. Clear any prior remember-me state when switching accounts. Keep these limits local to badge sessions rather than changing global Devise timeouts.

Keep `expire_all_sessions!` available for broader account compromise. Badge replacement normally ends badge sessions only, preserving sessions created by password or SSO. A global badge-authentication emergency switch also rejects established badge sessions on their next request. Turning off issuance alone does not interrupt current badges.

Alternative: account-wide session expiration is simpler, but unnecessarily signs out independent home sessions. Redis deletion by current browser ID is insufficient because a credential may have created several sessions.

### 6. Separate ordinary learning from credential changes

A badge session cannot issue or reprint credentials, change login/recovery credentials, add or remove authentication providers, change account role, or delete the account. Require authentication by an existing non-badge method for these actions, enforced on every relevant Rails endpoint, including OAuth linking callbacks and legacy alternatives. Routine learning, project editing, and existing allowed student features retain their ordinary permissions.

Use an explicit reauthentication continuation bound to the same user; successful authentication to another account must not authorize an operation on the original account. Do not treat badge possession as proof for adding a new recovery address. Existing picture/word authentication can qualify under its present account policy, but it does not establish a verified caregiver identity or constitute strong MFA.

### 7. Design the whole pre-reader path

Add a recognizable badge entry point to sign-in and section login pages. Provide a stable URL that an adult can bookmark or add to the home screen. On a signed-in device, require an explicit choice to continue as the current user or sign out and scan for another user; never silently overwrite a teacher or another student's session.

Use camera-only `getUserMedia`, local decoding, illustrated guidance, large labeled controls, and optional spoken guidance paired with visible text. Stop camera tracks on success, navigation, cancellation, and component unmount. Handle denied permission, ignored permission prompts, absent/busy cameras, decoder errors, and unavailable networks. Include camera switching and an accessible route to existing login methods.

Use native `BarcodeDetector` only when QR support is detected, with a reviewed browser-compatible decoder fallback. Select and pin the decoder during implementation against actual supported iPadOS Safari and ChromeOS versions; do not assume the existing `qrcode.react` encoder also scans codes. Render printable QR graphics as SVG or another format preserved by the existing print iframe; canvas bitmap content does not survive a plain `outerHTML` copy.

Use current design-system components, SCSS modules, keyboard navigation, visible focus, screen-reader status announcements, and non-color-only success/error feedback. Badge cards need high-contrast codes, a clear quiet zone, a recognizable student label with minimal printed personal data, the scanner address, expiration, and a short explanation that anyone with a copy can sign in. Test actual printed/laminated cards, glare, folds, low light, front/rear cameras, and enlarged text.

### 8. Keep recovery boundaries honest

Students can use existing picture/word login where they still have an eligible section, or an independently configured login. Current authorized teachers can replace a lost badge. Students with independent non-badge access can revoke a compromised badge even without a current teacher.

A student with no remaining badge copy, no current authorized teacher, and no independent login has no new self-service recovery path in this change. Direct them to existing support processes without promising recovery or accepting public biographical data as proof. Show teachers this boundary during issuance and explain continuity options before section removal. The badge can survive section removal until expiration, but the old section-based fallback may not.

## Risks / Trade-offs

- A copied badge grants account access from anywhere -> Explain the bearer-secret model, make replacement easy, restrict credential changes, and invalidate established badge sessions.
- Encrypted secrets remain recoverable by the application -> Use a dedicated authenticated-encryption key, tightly authorize reprints, audit access, and exclude payloads from telemetry and backups of generated print files.
- A weaker picture/word fallback remains -> Treat the pilot as an accessibility improvement; do not claim that badge entropy secures every login path.
- Shared devices retain account access -> Avoid remember-me, enforce badge-specific session limits, make sign-out prominent, and test browser Back behavior and cached content.
- Annual expiration may interrupt a student without a current teacher -> Print the date, warn current teachers, explain recovery limits, and review the lifetime during the pilot rather than silently extending it.
- Primary-database validation adds work on each badge-authenticated request -> Measure query volume and latency in the pilot; do not add a revocation cache with an unstated stale-access window.
- Camera prompts and poor print quality defeat a technically correct scanner -> Validate with pre-readers on actual target devices and retain accessible alternative login.
- Legacy account endpoints could miss the badge-session guard -> Inventory all credential, provider-linking, role, and deletion paths and require negative integration coverage before enabling the pilot.

## Migration Plan

1. Add the credential table/indexes and dedicated key configuration. No existing user needs a backfill, and all controls default off.
2. Deploy credential services, protected management APIs, session provenance/validation, sensitive-action guards, and safe telemetry before exposing issuance.
3. Deploy scanner and printing UI; verify with synthetic accounts and actual pilot devices. Exercise key rotation, replacement races, account restrictions, and shared-device logout.
4. Enable issuance for a small teacher cohort and permit authentication for its issued credentials from any setting. Keep returning students enabled even if their issuing section disappears.
5. Measure scan-to-lesson completion, decoding failures, permission failures, support/replacement frequency, and adult intervention in school and home use. Set rollout thresholds with the pilot owners before expanding.
6. Roll back UI/issuance independently of authentication. For a security rollback, disable badge authentication and reject existing badge sessions; retain the session guard or expire affected sessions before reverting code that understands badge provenance. Leave additive schema in place until credentials are retired. Existing login methods remain available subject to their normal requirements.

## Open Questions

- Confirm the proposed 365-day badge lifetime, 30-day warning, and two-hour idle/twelve-hour absolute session limits with product and pilot participants before launch. They are explicit implementation defaults, not unresolved behavior.
- Select the decoder and exact browser/device support floor through a compatibility spike. Implementation must provide a fallback or unsupported-device recovery path before rollout.
- Confirm the production secret-provisioning and key-rotation procedure with infrastructure owners; the credential format does not depend on a particular secret manager.
- Decide whether a later change should add verified caregiver management or separately revocable school/home badges. Neither is required for this pilot, and neither is implied by possession of a copy.

## References

- Existing Clever badge entry into Code.org: https://support.code.org/hc/en-us/articles/115002716091-Adding-CodeAI-to-the-Clever-Dashboard
- Clever's historical engineering description, not a claim about current internals: https://engineering.clever.com/2016/05/12/clever-badges-our-commitment-to-security/
- Camera permission and secure-context behavior: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Native barcode API compatibility: https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
