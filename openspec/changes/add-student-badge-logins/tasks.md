## 1. Verify integration boundaries and pilot defaults

- [x] 1.1 Inventory native login, section login, OAuth linking, credential/recovery changes, role changes, account deletion, pairing state, and session hooks; record every endpoint that needs badge provenance or a sensitive-action guard.
- [x] 1.2 Map existing teacher-managed, demo, staff, child-account, and SSO/LTI policy checks into explicit badge issuance, management, and authentication eligibility rules.
- [ ] 1.3 Evaluate local QR decoding on supported iPadOS Safari and ChromeOS devices; select and pin a fallback decoder and document the tested browser floor.
- [ ] 1.4 Record the proposed 365-day credential lifetime, 30-day warning, two-hour idle limit, and twelve-hour absolute limit as named settings; arrange product review before pilot launch without making school presence a prerequisite.

## 2. Add credential storage and lifecycle services

- [x] 2.1 Add `StudentLoginBadge` storage with unique user/public-identifier indexes, generation, digest, encrypted secret, key version, origin metadata, and lifecycle timestamps; preserve the badge when an issuing section disappears.
- [x] 2.2 Implement the bounded versioned payload, secure 32-byte secret generation, digest verification, and constant-time comparison; cover malformed versions, lengths, and incorrect secrets.
- [x] 2.3 Add dedicated versioned authenticated-encryption configuration, purpose-bound encryption/decryption, missing-key failure handling, and a rotation procedure that preserves printed credentials.
- [x] 2.4 Implement serialized and idempotent issuance, replacement, renewal, and revocation services; cover concurrent issuance, repeated requests, transaction failure, and old-generation rejection.
- [x] 2.5 Add use-time expiration checks, account-policy invalidation, and secret removal on replacement/revocation/account erasure; cover section transfer, independent-login conversion, and non-student role conversion.

## 3. Implement authorized management and private printing APIs

- [x] 3.1 Add explicit CanCanCan badge abilities requiring current section and student management authority, student eligibility, and an eligible picture/word section; test unauthorized IDs, former instructors, co-teachers, demo users, and restricted accounts.
- [x] 3.2 Add CSRF-protected issue, replace, renew, and revoke endpoints plus authorized individual/class-set print retrieval; return per-student eligibility results without exposing unauthorized records.
- [x] 3.3 Return credential material only through authorized print responses with `no-store`; keep routine roster/status responses free of secrets and verify that reprint preserves generation and expiration.
- [x] 3.4 Add student self-revocation through an existing non-badge-authenticated session, with same-account authorization and no self-issuance or reprint capability.
- [ ] 3.5 Add secret-free lifecycle audit events and payload redaction across Rails, proxy/APM errors, analytics, and print/scanner session replay; verify representative captured events contain no usable credential.

## 4. Implement authentication and session enforcement

- [x] 4.1 Add scanner-page delivery and the CSRF-protected badge-login POST; verify current credentials and account eligibility on the primary database and return uniform invalid-badge failures.
- [x] 4.2 Establish fresh Devise/Warden sessions with login tracking, identity-cookie hooks, badge provenance, and explicit clearing of prior session, pairing, and remember-me state; test switching between accounts.
- [x] 4.3 Add server-derived local navigation to a usable issuing-section assignment or student home; test removed memberships, missing assignments, and external redirect attempts.
- [x] 4.4 Add per-request badge generation, revocation, expiration, account-policy, and emergency-disable checks; cover all authenticated request paths, login/replacement races, and continued validity of unrelated non-badge sessions.
- [x] 4.5 Enforce badge-specific idle and absolute deadlines without persistent remember-me; exclude background polling from activity and provide expiry warning behavior using existing work-preservation mechanisms where available.
- [x] 4.6 Guard every credential/recovery, provider-linking, role-change, and account-deletion endpoint identified in 1.1; implement same-account non-badge reauthentication and ensure successful alternate login updates provenance correctly.
- [x] 4.7 Add source/credential abuse limits and independent issuance/authentication controls; test burst login behind a shared school NAT, issuance pause, authentication shutdown, and unaffected existing login methods.

## 5. Build the accessible browser scanner

- [x] 5.1 Add sign-in and section-page badge entry points and a bookmarkable scanner URL using current design-system components, SCSS modules, and localized strings.
- [x] 5.2 Implement explicit current-account continuation or sign-out before scanning; test that a student cannot silently replace a teacher or previous student's session.
- [x] 5.3 Implement camera-only acquisition, front/rear camera switching, native QR feature detection, fallback decoding, strict payload acceptance, duplicate-scan suppression, and camera teardown on every exit.
- [x] 5.4 Add illustrated guidance, keyboard/focus behavior, screen-reader announcements, non-color-only feedback, and visible equivalents for any spoken instructions.
- [x] 5.5 Add actionable permission-denied/pending, camera-unavailable/busy, network-failure, invalid-badge, and unsupported-device states with retry/cancel and existing-login fallback; keep images and payloads out of persistent browser state.

## 6. Extend teacher and account interfaces

- [x] 6.1 Add opt-in badge issuance and badge status to eligible student-management and login-info surfaces; preserve existing section types and block demo issuance.
- [x] 6.2 Extend individual and class-set login-card printing with a print-safe QR representation, minimal student label, scanner address, expiration, and bearer-credential guidance; verify the existing iframe print path preserves QR graphics.
- [x] 6.3 Add distinct reprint, replace, renew, and revoke actions with clear consequences for all copies and badge sessions; show expiration warnings without silently renewing credentials.
- [x] 6.4 Add self-revocation and non-badge reauthentication guidance in account settings, plus recovery/continuity explanations at issuance and section removal.
- [ ] 6.5 Make shared-device sign-out discoverable and verify private content is unavailable after sign-out and browser Back navigation.

## 7. Verify behavior and operational readiness

- [x] 7.1 Run focused Rails model, controller, and integration tests covering both capability specs, including authority changes, lifecycle boundaries, session races, CSRF, account restrictions, and direct sensitive-action requests; use `bundle exec spring testunit` from `dashboard/` for targeted files.
- [ ] 7.2 Run focused frontend unit tests for scanner states, track cleanup, print behavior, and account switching with `yarn test:unit` from `apps/`; add browser coverage where camera and printing behavior cannot be verified in unit tests.
- [ ] 7.3 Verify real printed/laminated badges on target iPads and Chromebooks in low light and glare, with damaged cards and front/rear cameras; include school and home networks and missing native decoder support.
- [ ] 7.4 Complete keyboard and screen-reader checks, enlarged-text checks, and pre-reader usability observation; record scan-to-lesson completion and adult interventions without capturing badge secrets or children's camera images.
- [ ] 7.5 Exercise encryption-key rotation/unavailability, database consistency during replacement, authentication emergency shutdown, and rollback with pre-existing badge sessions; measure primary-database query load and login latency.
- [x] 7.6 Run `yarn run typecheck` in `apps/` for TypeScript changes and `./tools/hooks/pre-commit` from the repository root for modified application files; report any required device, credential, or CI checks that cannot run locally.

## 8. Document and launch the pilot

- [x] 8.1 Publish teacher/caregiver instructions for bookmarking, camera permissions, school/home copies, sign-out, replacement, expiration, and recovery limitations; do not promise caregiver identity management or unlimited access after expiration.
- [ ] 8.2 Confirm lifetime/session defaults and browser support, provision production keys through the approved secret process, and assign owners for badge support and key rotation before enabling issuance.
- [ ] 8.3 Define pilot success and expansion thresholds for login completion, adult assistance, scan errors, replacements, support load, and wrong-account incidents; deploy with both feature controls off.
- [ ] 8.4 Enable a small teacher cohort, verify issued badges work outside school and after section changes, and review measured results before expansion; keep a documented issuance-pause and authentication-disable rollback path.

## Implementation record

Application code, migrations, tests, and the repository guide are implemented.
See `docs/student-badge-logins.md` for endpoint boundaries, teacher/caregiver
instructions, key rotation, feature controls, proposed pilot thresholds, and
rollback. Both feature controls default off. No production keys or controls were
changed and no deployment was performed.

Unchecked tasks retain work that cannot be established by these local tests:

- 1.3, 7.3: `jsqr` 1.4.0 is pinned and passes an encoder/decoder round trip;
  target iPadOS/ChromeOS versions and physical-card behavior remain unverified.
- 1.4, 8.2: Lifetime/session defaults are named and documented; product approval,
  production key provisioning, and support/rotation ownership remain outstanding.
- 3.5: Application filtering, secret-free audit rows, private print responses,
  and replay exclusion are implemented. Deployed proxy/APM/response capture
  settings still need verification.
- 6.5, 7.2, 7.4: Sign-out, cache restrictions, Back restoration protection,
  scanner focus, and announcements are implemented. Actual browser printing,
  keyboard/screen-reader/zoom checks, and pre-reader observation remain pending.
- 7.5: Local tests cover concurrency, stale-generation sessions, key rotation,
  missing keys, and emergency disable. Deployed rollback and load/latency
  measurements remain pending.
- 8.3, 8.4: Proposed thresholds and an off-by-default rollout are documented.
  Production deployment, cohort enablement, measurements, and expansion approval
  have not occurred.

Local verification uses an isolated `dashboard_test_badges` database, the new
migration, and picture/word seed data. Git LFS locale/fixture pointers prevent the
checkout's ordinary eager fixture load. Tests therefore use the existing lazy
locale setting and the already-prepared database, with Spring disabled. The same
Rails test classes run through `test_helper`; no application checks are stubbed
outside each test's explicit fixtures and mocks. Frontend tests use the installed
workspace dependencies and regenerated shared constants.

Ruby, JavaScript, SCSS, and Haml linters run directly over the changed files. The
pre-commit hook also ran; it only inspects staged files, so direct linting is the
working-tree verification. No TypeScript source changed.

Verification results (2026-09-16): 58 Rails tests, 283 assertions, no failures;
31 frontend tests across badge and affected student-management suites, no
failures. OpenSpec strict validation passes. Physical-device and deployed-service
checks listed above remain open.
