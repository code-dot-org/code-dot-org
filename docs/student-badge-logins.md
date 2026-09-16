# Student badge logins

Badges are reusable credentials for existing student accounts. They work at home
and at school without a section code or an open teacher session. A photograph or
second printout has the same authority as the original. This implementation does
not read Clever badges or provide teacher badge authentication.

## Teacher and caregiver instructions

1. A pilot teacher opens **Student badges** from a picture/word section's student
   management or login-information page. **Create missing badges** creates one
   credential per eligible student. Existing picture/word logins still work.
2. Use **Print another copy** or **Print available badges**. Keep the printout
   private. Make school and home copies from the same credential; reprinting
   does not cancel another copy or change the expiration date.
3. Bookmark `https://studio.code.org/badge_login` on the student's device. Open
   it, choose **Start camera**, allow camera access, and hold the badge in view.
   Camera images stay on the device. Use **Switch camera** if needed. The page
   offers another sign-in method when camera access fails.
4. On shared devices, sign out after use. The scanner asks before replacing an
   account that is already signed in. Badge sessions last at most twelve hours
   and end after two hours without interaction.
5. If a badge is lost or copied by someone else, choose **Replace lost badge**.
   Every old copy and every session created from it stops working. Print new
   copies for both school and home. **Revoke badge** stops access without issuing
   a replacement. **Renew badge** also replaces the secret and requires new copies.
6. Badges expire after 365 days. The date appears on the printout; teachers see a
   warning during the last 30 days. A printout does not renew itself.

A badge remains usable after its issuing section is deleted or the student leaves
that section. The former teacher loses management and printing authority. Before
removing a student, explain that the old section login may no longer work and help
them retain an appropriate existing login. A current authorized teacher can issue
a replacement. A student with another login can revoke their badge from account
settings. Without a badge copy, another login, or a current teacher, contact
support; this feature does not guarantee account recovery or create caregiver
accounts.

## Credential and session boundaries

`StudentLoginBadge` stores one row per user. Its QR payload contains only a format
version, random public identifier, generation, and a random 32-byte secret. Login
checks the secret's SHA-256 digest. Reprinting requires AES-256-GCM decryption with
a purpose containing the user, public identifier, and generation. Replacement and
renewal increment the generation. Mutations lock the user row and record a request
UUID, so a retried request cannot rotate a credential twice. No foreign key ties
the credential's lifetime to a section.

Initial issuance requires a teacher-managed account in a current instructor's
picture/word section. Demo accounts, non-students, administrators, accounts with
staff permissions, and restricted LMS accounts cannot use badges. An independently
configured student login does not cancel an existing badge, but removes teacher
management authority. Account deletion and PII scrubbing remove the encrypted
print secret.

`Middleware::StudentBadgeSessions` runs after the Redis session store and before
the legacy project APIs. Each badge-authenticated request checks the primary
database, generation, account policy, expiration, and session deadlines. Rails
controllers reuse that validation. The direct Redis reader in
`lib/cdo/rack/request.rb` validates badge sessions when no middleware result is
available. Non-badge sessions do not acquire badge deadlines or depend on the
badge authentication flag.

The activity endpoint accepts CSRF-protected POSTs. The browser sends them only
for foreground keyboard/pointer interaction, at most once a minute. Polling does
not extend the idle deadline. The absolute deadline never moves. Expiry produces
an API error without navigating an active lesson away from unsaved work. Browser
navigation after expiry returns to the scanner. Badge pages and badge-authenticated
responses use `no-store`; a page restored from the back/forward cache is hidden
until a fresh request revalidates access.

## Sensitive endpoint inventory

Badge possession alone must not grant account recovery or a stronger login.
The following paths require a non-badge session:

| Controller or path | Protected operations |
| --- | --- |
| `RegistrationsController` | Account updates, deletion, personal-login upgrade, email, parent email, role, authentication migration, and signup mutations; settings display remains available. |
| `PasswordsController` | Password recovery and reset actions. |
| `AuthenticationOptionsController` | Provider disconnection. |
| `OmniauthCallbacksController` | Provider callbacks and linking while badge-authenticated. |
| `LtiV1Controller`, `Lti::V1::AccountLinkingController` | LMS linking, account upgrade, and related mutations. |
| Devise invitations | Invitation credential changes. |
| `SessionsController#expire_other` | Account-wide session invalidation. |
| `Pd::SessionAttendanceController` | Enrollment selection and teacher upgrade. |
| `Pd::WorkshopEnrollmentController#confirm_join_session` | Enrollment flow that can upgrade a student to teacher. |
| `DiscourseSsoController` | Creation of an external forum session that cannot enforce badge revocation. |
| `StudentLoginBadgesController` | Printing, management, and self-revocation. |

Reauthentication signs out and remembers the original user ID. Warden and native
section login reject a different account during that flow. A successful same-user
picture/word login clears badge provenance. A badge cannot satisfy the pending
reauthentication. Ordinary sign-out can abandon the flow.

Child-account lockout and LMS policies still apply. The badge switch and
reauthentication paths remain reachable from child-account lockout. Parental
consent follows its existing emailed-token process; badges do not establish
parental identity. Pairing state and unchecked return URLs are cleared on badge
login. Navigation comes from the issuing section's current assignment or home.

## Controls and deployment

Both controls default off:

| Control | Effect |
| --- | --- |
| Gatekeeper `student_badge_issuance`, matched on `user_id` | Allows the selected teacher to issue, replace, or renew. Revocation and reprinting existing badges remain available when issuance is paused. |
| DCDO `student_badge_authentication` | Enables scanner login. Disabling it also rejects established badge sessions on their next request. |

Apply migration `20260916190000` before deploying application code that queries
the new tables. There is no user backfill. Deploy application code and assets
with both controls off. Provision the dedicated keys through the approved host
secret configuration before enabling issuance. Do not put keys in the repository,
command history, badge documents, telemetry, or tickets.

Configuration:

- `student_badge_encryption_keys`: a map, or JSON object string, from version to
  base64-encoded 32-byte key. It is empty by default so ordinary application boot
  does not require a badge key.
- `student_badge_encryption_key_version`: the version used for new encryption;
  default `"1"`.
- Lifetime and session defaults are named constants in `Policies::StudentBadges`.
- Login uses the existing shared-cache throttle: 300 attempts per source address
  per minute and 20 per public badge identifier per minute. Limits do not use
  school-network membership. The existing throttle is best-effort, not an atomic
  distributed quota; load-test it before expanding the pilot.

To rotate encryption keys without replacing printed badges:

1. Provision the new key version alongside all versions still in use.
2. Set the current encryption version on every application host.
3. On the primary database, run `rotate_encryption_key!` for badge rows with
   encrypted material and an older key version, in bounded batches. The method
   locks each row, preserving the secret, generation, and expiration.
4. Verify the old versions have no remaining printable rows and verify reprinting
   and authentication with synthetic credentials before retiring old keys. Account
   for retained encrypted backups in the key-retention policy.

If a key is unavailable, issuance/replacement rolls back and printing returns a
generic unavailable error. Digest-based authentication continues to work. Never
log a decoded payload while diagnosing a key problem.

Lifecycle audit rows contain user/actor IDs, operation, generation, request UUID,
and timestamps. They contain no payload or camera image. Rails filters
`badge_payload`, `encrypted_secret`, and `secret_digest`. Scanner and print pages
disable Statsig session replay and mark their content private. Before rollout,
verify deployed proxy, APM, error-reporting, and response-body capture settings;
application parameter filtering cannot configure those services.

For an issuance pause, disable the Gatekeeper rule. For emergency shutdown,
disable the DCDO authentication flag. Keep the badge middleware and direct-session
validation deployed: reverting to code that ignores provenance would restore
ordinary access to some badge-created sessions. Expire those sessions before any
such rollback. Leave the additive tables in place until credentials are retired.

## Verification and pilot gate

Focused tests live in `dashboard/test/models/student_login_badge*_test.rb`,
`dashboard/test/controllers/*badge*_test.rb`, and
`apps/test/unit/templates/badges/`. The backend tests cover lifecycle rollback,
concurrent writes, authority changes, direct sensitive requests, CSRF, session
invalidation, reauthentication, and shared-source attempts. Frontend tests cover
scanner cleanup, cancellation races, local decoding, account switching,
confirmation, reprint retrieval, SVG copying, and encoder/decoder round trips.

The decoder fallback is pinned to `jsqr` 1.4.0. Tests with synthetic camera frames
do not establish a supported browser/device floor. Before enabling the pilot:

- Confirm lifetime defaults and exact iPadOS Safari and ChromeOS versions with
  product and support owners. Assign owners for badge recovery and key rotation.
- Test printed and laminated cards, front/rear cameras, glare, low light, folds,
  camera denial, missing native QR support, and home/school networks.
- Check keyboard operation, screen readers, enlarged text, and pre-reader use.
  Verify print layout and Back-after-sign-out behavior in each supported browser.
- Exercise key rotation, key loss, primary-database consistency, and emergency
  shutdown in a deployed environment. Measure query load and login latency.
- Verify telemetry redaction and prohibit camera-frame or credential capture.

Proposed expansion thresholds, to approve before collecting pilot results: at
least 95% scan-to-lesson completion within 30 seconds on supported devices; at
most 10% of attempts needing adult help after initial setup; fewer than 5% camera
or decode failures; fewer than two badge-related support cases per 100 students
per week; no confirmed wrong-account or unauthorized-access incident. Track
replacement frequency separately from reprint frequency. Any security incident
pauses expansion. Use aggregate counts and observed timings; do not collect badge
secrets or children's camera images. These thresholds are proposals, not measured
results or approval to enable production controls.
