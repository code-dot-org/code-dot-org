## ADDED Requirements

### Requirement: Authorized issuance for eligible students

The system SHALL initially allow badge issuance only by a current instructor authorized to manage both the target picture/word section and its teacher-managed student. It SHALL reject staff, demo students, ineligible independently managed accounts, and accounts governed by policies prohibiting local credentials. Eligibility SHALL be enforced server-side. Issuance SHALL attach a badge to the existing account without creating an account or changing section type.

#### Scenario: Teacher issues a class set
- **WHEN** an authorized teacher requests badges for eligible students in a picture-password section
- **THEN** the system creates credentials for their existing accounts and reports any ineligible students without issuing them credentials

#### Scenario: Forged student or section identifier
- **WHEN** a teacher supplies a student or section outside their management authority
- **THEN** the server refuses issuance, reprint, replacement, renewal, and revocation for that target without revealing credential material

#### Scenario: SSO-only student
- **WHEN** a teacher requests a badge for an account whose policy requires provider authentication
- **THEN** the server refuses to create an alternate local badge credential

### Requirement: One current credential with protected storage

The system SHALL maintain at most one current badge record per student, with a unique random public identifier, generation, 32-byte cryptographically random secret, verification digest, authenticated-encrypted reprint material, key version, issuance metadata, and lifecycle timestamps. The payload SHALL exclude personal information and existing passwords. Encryption keys SHALL be managed separately from stored credentials.

#### Scenario: Stored credential inspected
- **WHEN** a badge is issued
- **THEN** its stored record contains a digest and encrypted secret rather than a plaintext secret
- **AND** its QR payload contains no name, email, section code, or existing password

#### Scenario: Concurrent issuance and retried requests
- **WHEN** authorized issuance requests race or a management request is retried after a network failure
- **THEN** the database retains one current credential and retries do not silently rotate the credential produced by the original request

### Requirement: Unchanged reprinting for school and home

Authorized teachers SHALL be able to print individual badges or class sets and reprint the current valid credential without rotating its secret, advancing its generation, extending its expiration, or invalidating copies or sessions. Print views SHALL be authenticated, private, uncached, and excluded from session replay. Printed cards SHALL identify the student with minimal personal information, include the scanner address and expiration date, and explain that copies grant account access.

#### Scenario: Home copy printed
- **WHEN** an authorized teacher prints another copy of a valid badge for a caregiver
- **THEN** school and home copies authenticate with the same current credential
- **AND** existing badge sessions remain valid

#### Scenario: Unauthorized print request
- **WHEN** an unauthenticated or unauthorized user requests a print view
- **THEN** no badge payload or printable credential is returned

### Requirement: Replacement and revocation

Replacement SHALL atomically advance the generation and issue a new random secret, invalidating all old copies and affected badge sessions. Revocation SHALL make the current credential unusable and remove its recoverable secret material. Both actions SHALL explain their consequences before submission and require CSRF protection. Failed or rolled-back replacement SHALL NOT invalidate the previously committed credential.

#### Scenario: Lost badge replaced
- **WHEN** an authorized teacher replaces a lost badge
- **THEN** all old copies cease authenticating, established old-generation sessions end on their next request, and only the replacement credential remains current

#### Scenario: Revocation without replacement
- **WHEN** an authorized teacher revokes a badge
- **THEN** all its copies and subsequent requests from its badge sessions are rejected without affecting independent login credentials

#### Scenario: Replacement transaction fails
- **WHEN** replacement fails before committing
- **THEN** the previous committed badge remains in its previous state and no incomplete replacement is presented as usable

### Requirement: Expiration and explicit renewal

New and renewed badges SHALL expire 365 days after issuance. Management views SHALL warn current authorized teachers during the final 30 days. Renewal SHALL create a new secret and generation with a new term, explain that existing copies will stop working, and require new printing. Reprinting SHALL NOT renew a badge. Expiration enforcement SHALL NOT depend on background cleanup.

#### Scenario: Reprint near expiration
- **WHEN** a teacher reprints a badge within 30 days of expiration
- **THEN** the expiration warning is shown and the printed copy retains the existing expiration date

#### Scenario: Expired badge renewed
- **WHEN** an authorized current teacher renews an expired badge
- **THEN** the new credential works for a new 365-day term and the expired copies remain invalid

### Requirement: Account continuity and changing management authority

The badge SHALL belong to the student account, with issuer and section retained as origin metadata. Removing or archiving a section, transferring a student, removing an instructor, or adding an independent login SHALL NOT alone invalidate an otherwise valid badge. Management authorization SHALL be evaluated at request time; former instructors SHALL lose access when their relationship ends, and teacher management SHALL end when the student is no longer teacher-managed. Account deletion, non-student role conversion, or a policy prohibiting local credentials SHALL prevent badge use.

#### Scenario: Student changes classes
- **WHEN** a student leaves the original section while retaining their account
- **THEN** their valid badge continues to work until its lifecycle or account policy makes it invalid
- **AND** the former teacher cannot retrieve or manage it through the former relationship

#### Scenario: New teacher manages an existing badge
- **WHEN** a current instructor of an eligible picture/word section has credential-management authority over the teacher-managed student
- **THEN** that instructor can manage the existing badge without requiring the original teacher

#### Scenario: Student gains an independent login
- **WHEN** the student's account becomes independently managed after a valid badge was issued
- **THEN** the badge remains usable until expiration or revocation unless account policy prohibits it
- **AND** teacher badge-management access ends

### Requirement: Recovery uses existing authority

Current authorized teachers SHALL be able to replace unusable badges. Students SHALL be offered existing picture/word or independent login methods under their normal prerequisites. A student authenticated through an existing non-badge method SHALL be able to revoke their own badge. Possession of a badge SHALL NOT establish caregiver authority or authorize self-service replacement. The system SHALL explain the absence of a new recovery path when no copy, current authorized teacher, or independent login remains.

#### Scenario: Student can use another login
- **WHEN** a student authenticates by an existing non-badge method and revokes their own compromised badge
- **THEN** the badge and its sessions are invalidated without requiring a current teacher

#### Scenario: No remaining recovery method
- **WHEN** a student has no usable badge copy, current authorized teacher, or independent login
- **THEN** the interface directs them to existing support without promising self-service recovery or accepting name, birthday, or section code as identity proof

#### Scenario: Section removal guidance
- **WHEN** a teacher removes a badged student from a section
- **THEN** guidance distinguishes the badge's remaining lifetime from the possible loss of section-based fallback login and teacher recovery

### Requirement: Key rotation and credential erasure

The system SHALL support rotating encryption keys without changing valid printed credentials. Missing decryption keys SHALL fail issuance/reprint safely without storing plaintext; digest-based authentication of otherwise valid badges SHALL remain independent of decryption availability. Obsolete recoverable material SHALL be removed on replacement, revocation, and account erasure under the existing deletion process.

#### Scenario: Encryption key rotates
- **WHEN** stored secrets are re-encrypted under a new key
- **THEN** current printed credentials, generations, and expiration dates remain unchanged

#### Scenario: Decryption key unavailable
- **WHEN** a reprint is requested while the required decryption key is unavailable
- **THEN** no plaintext fallback is used and the teacher receives a recoverable service error
- **AND** otherwise valid badge authentication can continue using the digest

### Requirement: Auditable management without secret disclosure

The system SHALL audit issuance, reprint access, replacement, renewal, revocation, and successful badge login using internal identifiers and timestamps. Audit events, errors, support diagnostics, analytics, and request logs SHALL exclude secrets, camera frames, and complete payloads. Management responses SHALL expose credential material only to a currently authorized print operation.

#### Scenario: Management history reviewed
- **WHEN** an authorized operator reviews a badge's lifecycle events
- **THEN** the record identifies the action, actor, student, generation, and time without exposing a usable credential

#### Scenario: Routine roster response
- **WHEN** a teacher loads a student roster outside an authorized print operation
- **THEN** the response can include badge status but contains no decryptable or plaintext badge secret
