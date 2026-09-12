# admin-section-lookup

## ADDED Requirements

### Requirement: Section lookup including deleted sections
The system SHALL expose an admin-gated GET endpoint that resolves a
section by code or id, including soft-deleted sections flagged
`deleted: true`, returning owner, participants summary, and the
legacy-parity fields.

#### Scenario: Live section by code
- **WHEN** an admin looks up a valid section code
- **THEN** the section is returned with its owner and enrollment summary

#### Scenario: Deleted section
- **WHEN** an admin looks up a soft-deleted section
- **THEN** it is returned with `deleted: true` (enabling the undelete
  tool that ports in admin-user-lifecycle)

### Requirement: Section lookup page in the admin SPA
The admin SPA SHALL provide a section lookup page replacing
admin_search#lookup_section, showing deleted state and linking to owner
and member inspectors.

#### Scenario: Lookup from the SPA
- **WHEN** an admin submits a section code on the SPA page
- **THEN** the section details render from the JSON endpoint
