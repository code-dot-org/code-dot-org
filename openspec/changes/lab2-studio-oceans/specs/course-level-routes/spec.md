# course-level-routes

## ADDED Requirements

### Requirement: Canonical course route
Studio SHALL serve
`/courses/$courseName/units/$unitPosition/lessons/$lessonPosition/levels/$levelPosition`
under the `/frontend-studio` basepath. The loader SHALL fetch the
unit structure (`/api/script_structure/courses/:course/units/:pos`)
and the lesson level-properties map
(`/courses/:course/units/:pos/lessons/:pos/level_properties`),
joined on level id.

#### Scenario: Level page loads
- **WHEN** a user navigates to
  `/frontend-studio/courses/oceans/units/1/lessons/1/levels/2`
- **THEN** the lab for the level at position 2 renders

#### Scenario: Unknown course or position
- **WHEN** the course name or any position does not resolve
- **THEN** the route renders the not-found state

### Requirement: Lab resolution by appName
The route SHALL select the lab entrypoint from
`levelProperties.appName` (`fish` → oceans adapter,
`standalone_video` → video stub), lazy-loading the lab chunk. An
unrecognized appName SHALL render an unsupported-level state naming
the appName.

#### Scenario: Fish level resolves to oceans
- **WHEN** the current level has `appName: "fish"`, `mode: "short"`
- **THEN** the oceans adapter renders `OceansLab` with
  `appMode: "short"`

#### Scenario: Unsupported appName
- **WHEN** a level's appName has no registered entrypoint
- **THEN** an unsupported-level message names the appName and level
  navigation remains usable

### Requirement: In-lesson navigation without reload
Navigating between levels of one lesson SHALL reuse the cached
structure and lesson map and SHALL NOT remount the Studio shell or
level navigation. The lab component MAY remount per level.

#### Scenario: Next level within lesson
- **WHEN** the user advances from level 2 to level 3
- **THEN** no structure or level_properties request is issued and
  the position indicator updates in place

### Requirement: Minimal level navigation
The route SHALL render prev/next level links and a "Level x of y"
indicator derived from script_structure positions.

#### Scenario: Position indicator and navigation
- **WHEN** the user is at position 2 of the oceans lesson
- **THEN** "Level 2 of 8" is shown, prev links to position 1, next
  links to position 3

### Requirement: MSW course scenario
In MSW mode, navigating a course URL SHALL activate a fixture
scenario keyed by course name serving the unit structure and lesson
level-properties map.

#### Scenario: Oceans backend-free
- **WHEN** Studio runs with `VITE_API_MODE=msw` and the user opens
  `/frontend-studio/courses/oceans/units/1/lessons/1/levels/1`
- **THEN** the oceans fixture lesson loads and all eight levels are
  navigable
