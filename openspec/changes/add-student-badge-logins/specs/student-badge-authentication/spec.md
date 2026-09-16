## ADDED Requirements

### Requirement: Portable reusable student authentication

The system SHALL allow a valid badge to authenticate its existing student account from any supported browser, without a section code, name selection, password, PIN, school-network restriction, enrolled device, or teacher-opened login window. The credential SHALL be reusable across devices until revoked, replaced, expired, or prohibited by account policy.

#### Scenario: Home login
- **WHEN** a student scans a valid badge on a home device outside school hours
- **THEN** the system authenticates the same account and preserves its existing progress
- **AND** no teacher action or school presence is required

#### Scenario: Caregiver copy
- **WHEN** the same valid printed credential is scanned from a second supported device
- **THEN** the system permits authentication without consuming or invalidating the first copy

### Requirement: Account continuity and restrictions

Badge authentication SHALL NOT require continued enrollment in the issuing section. It SHALL grant ordinary student-account access subject to existing child-account, LMS, and feature restrictions. It SHALL reject deleted accounts, non-student accounts, and accounts whose policies prohibit local badge credentials. It SHALL NOT provision accounts or treat an issuing section as an authorization boundary.

#### Scenario: Original section removed
- **WHEN** the issuing section is removed but the student account and unexpired badge remain valid
- **THEN** the student can still authenticate and reaches student home

#### Scenario: Account restriction applies
- **WHEN** a student with a valid badge is subject to an existing child-account lockout
- **THEN** authentication does not bypass the restricted account experience

#### Scenario: Account becomes a teacher
- **WHEN** the badge's account has become a teacher account
- **THEN** the badge cannot establish or continue an authenticated session

### Requirement: Protected credential verification

The system SHALL authenticate only a bounded, supported badge payload containing a cryptographically random secret. It SHALL verify the current digest, generation, revocation state, expiration, and account eligibility on the primary database. Authentication SHALL require a CSRF-protected HTTPS POST, rotate the browser session, and use normal Devise/Warden authentication checks and hooks. Secrets SHALL NOT be accepted in URLs.

#### Scenario: Successful verification
- **WHEN** a valid payload is submitted with valid CSRF context
- **THEN** the server creates a fresh authenticated session with the badge identifier and generation
- **AND** prior account, pairing, and remember-me state does not carry into the new session

#### Scenario: Invalid credential
- **WHEN** a payload is malformed, unknown, incorrect, revoked, expired, or ineligible
- **THEN** the server does not authenticate it and returns the common invalid-badge response without disclosing student information

#### Scenario: Cross-site submission
- **WHEN** a request lacks valid CSRF protection or supplies a credential through a GET request
- **THEN** the request cannot establish a badge session

### Requirement: Safe post-login navigation

The system SHALL derive login destinations from trusted local state. It SHALL route to usable work assigned through the issuing section only while the student is still enrolled there; otherwise it SHALL route to student home. It SHALL NOT follow a destination embedded in a QR payload or accept an unchecked external return URL.

#### Scenario: Current assignment
- **WHEN** a student authenticates and remains enrolled in the issuing section with a usable assigned course
- **THEN** the student is directed to that assigned work

#### Scenario: Arbitrary QR URL
- **WHEN** the scanner reads an unrelated QR code containing a URL
- **THEN** it does not navigate to that URL or send it as a valid badge credential

### Requirement: Local camera processing and private credential transport

The scanner SHALL request camera access without microphone access, decode frames locally, and submit only the credential payload. It SHALL stop all acquired camera tracks on success, cancellation, navigation, and teardown. Camera frames and badge payloads SHALL NOT be persisted in browser storage, uploaded as images, included in telemetry, or recorded by session replay. Server and infrastructure logging SHALL redact credential-bearing fields.

#### Scenario: Successful scan
- **WHEN** the browser decodes a badge and submits authentication
- **THEN** no camera frame is sent to a server
- **AND** after successful authentication the camera is stopped and the payload is cleared from application state

#### Scenario: Failure reporting
- **WHEN** decoding or authentication fails and diagnostics are recorded
- **THEN** diagnostics contain no camera image, secret, or complete QR payload

### Requirement: Accessible scanner and recovery states

The scanner SHALL provide illustrated instructions, keyboard-operable labeled controls, visible focus, non-color-only status feedback, screen-reader announcements, camera switching, and an accessible route to existing login methods. Optional spoken guidance SHALL have an equivalent visible instruction. Supported browsers SHALL have a working decoder even without native QR detection. Permission denial, unanswered permission prompts, absent or busy cameras, and network failures SHALL leave a usable retry, cancel, or fallback path.

#### Scenario: Native barcode detection absent
- **WHEN** a supported browser lacks native QR detection
- **THEN** local fallback decoding still supports badge authentication

#### Scenario: Camera permission unavailable
- **WHEN** the camera permission request is denied or remains unanswered
- **THEN** the user can cancel or choose an existing login method without waiting for a scan

#### Scenario: Screen-reader interaction
- **WHEN** a user operates the scanner controls using keyboard and a screen reader
- **THEN** control names, focus changes, success, and actionable error states are perceivable and operable

### Requirement: Explicit shared-device account switching

The scanner SHALL identify an existing signed-in state before starting a new login. It SHALL offer continuation as the current user or explicit sign-out and scanning for another user, without silently overwriting the session. Badge sessions SHALL expose a clear sign-out action, disable persistent remember-me login, and expire after two hours idle or twelve hours absolute, subject to shorter existing account limits. Background polling SHALL NOT extend the idle deadline.

#### Scenario: Previous user remains signed in
- **WHEN** a student opens the scanner on a device already signed in to another account
- **THEN** camera authentication does not begin until the user explicitly chooses to sign out and switch accounts

#### Scenario: Session deadline
- **WHEN** a badge session reaches its idle or absolute deadline
- **THEN** the next protected request requires authentication even if background polling continued

#### Scenario: Sign-out and browser Back
- **WHEN** a student signs out and navigates Back on a shared device
- **THEN** protected account content cannot be used without reauthentication

### Requirement: Revocation applies to established sessions

Every authenticated request made through a badge session SHALL validate its credential ID, generation, lifecycle state, and account eligibility against current primary-database state. Revocation, replacement, renewal, expiry, or an authentication emergency disable SHALL terminate affected badge sessions on their next request. Unrelated non-badge sessions SHALL remain valid unless an independent account-wide restriction applies.

#### Scenario: Copied badge already used
- **WHEN** a teacher replaces a badge after someone used a copy to sign in
- **THEN** the old badge session cannot authorize its next protected request
- **AND** the new badge can authenticate normally

#### Scenario: Login races with replacement
- **WHEN** verification of an old generation overlaps replacement
- **THEN** no resulting old-generation session can authorize a protected request after replacement has committed

#### Scenario: Independent login remains
- **WHEN** a badge is revoked while the student also has a valid password-authenticated session
- **THEN** badge revocation alone does not invalidate that independent session

### Requirement: Badge sessions cannot change account credentials

A badge-authenticated session SHALL NOT authorize badge issuance/reprinting, login or recovery credential changes, provider linking/unlinking, role changes, or account deletion. Sensitive account actions SHALL require authentication by an existing non-badge method to the same account, subject to existing account policy. This rule SHALL apply at all relevant server endpoints, including alternate and OAuth callback paths.

#### Scenario: Attempt to add a recovery address
- **WHEN** a user authenticated only by badge submits a recovery-address change directly to its API
- **THEN** the server requires non-badge authentication and leaves the recovery address unchanged

#### Scenario: Reauthentication to another account
- **WHEN** a sensitive action begun for one account is followed by authentication to a different account
- **THEN** that authentication does not authorize the original account's pending action

### Requirement: Abuse controls and operational disablement

The system SHALL rate-limit authentication attempts by source and credential identifier without imposing permanent account lockout. Issuance and authentication controls SHALL be independent. Turning issuance off SHALL preserve valid existing badges; emergency authentication disablement SHALL stop both new badge logins and established badge sessions on their next request.

#### Scenario: Issuance paused
- **WHEN** operators pause badge issuance without disabling authentication
- **THEN** already issued valid credentials continue to authenticate from school and non-school settings

#### Scenario: Authentication disabled
- **WHEN** operators disable badge authentication
- **THEN** new badge logins and subsequent protected requests from existing badge sessions are rejected
- **AND** existing non-badge login methods remain available under their ordinary policies

#### Scenario: Repeated failures from one source
- **WHEN** attempts exceed configured abuse thresholds
- **THEN** the system throttles the attempts without permanently locking the student account
