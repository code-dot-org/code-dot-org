# milestone-reporting

## ADDED Requirements

### Requirement: Activities API domain
`@code-dot-org/core/api` SHALL provide an `activities` domain
posting `{result, testResult}` to
`/milestone/{userId}/{scriptLevelId}/{levelId}`, with `0` as userId
when signed out.

#### Scenario: Signed-in milestone
- **WHEN** a signed-in user completes the level with scriptLevelId
  48872 and levelId 29091
- **THEN** a POST to `/milestone/<userId>/48872/29091` is issued
  with a passing result

#### Scenario: Anonymous milestone
- **WHEN** an anonymous user completes the same level
- **THEN** the POST uses `0` as the userId segment

### Requirement: scriptLevelId sourced from script_structure
The host SHALL obtain `scriptLevelId` from the script_structure
response (lesson level entry `id`; `activeId` is the level id).

#### Scenario: Structure carries scriptLevelId
- **WHEN** `/api/script_structure/courses/oceans/units/1` is fetched
- **THEN** the level entry at position 2 has `id` = script_level id
  and `activeId` matching the level_properties map key

### Requirement: Host reports, labs do not
Milestone reporting SHALL be triggered by Studio adapters on the
lab's completion callback, never by lab packages.

#### Scenario: Oceans continue triggers report then navigation
- **WHEN** `OceansLab` invokes `onContinue`
- **THEN** the adapter posts the milestone and then navigates to the
  next level position

### Requirement: MSW milestone handler records progress
In MSW mode, the milestone handler SHALL record completion in the
scenario store such that `/api/user_progress/:script` reflects it.

#### Scenario: Backend-free completion recorded
- **WHEN** the user completes level 2 in MSW mode
- **THEN** a subsequent `/api/user_progress/oceans` read reports
  level 2 as passed
