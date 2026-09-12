## ADDED Requirements

### Requirement: Host-seeded current-user slice covers teacher-surface reads
`@code-dot-org/users/redux` SHALL export a `currentUserSlice` (lifted from
`ngfp/music-lab-updated` and extended) whose state covers every field the
teacher home page reads — including `userId`, `displayName`, `gradesTeaching`,
and `aiChatAccessLevel` — seeded explicitly by the host rather than implicitly
via the gon/header bootstrap.

#### Scenario: Standalone host seeds a persona user
- **WHEN** the standalone dev host seeds the slice from the active persona
- **THEN** homepage components render the persona's name, grade bands, and
  AI-chat affordances without any Rails-provided globals

#### Scenario: Missing extension fields are absent, not wrong
- **WHEN** a host seeds only the base fields
- **THEN** extended fields are typed optional and components fall back exactly
  as the legacy page does when gon data is absent
