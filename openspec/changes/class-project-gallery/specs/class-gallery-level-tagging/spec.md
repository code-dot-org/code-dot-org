## ADDED Requirements

### Requirement: Script levels carry a class gallery flag
Each script level SHALL carry a boolean `class_gallery` property, false when
absent. The flag belongs to the script level, not the level, so the same
level used in two units MAY be tagged in one and not the other.

#### Scenario: Flag defaults to off
- **WHEN** a script level has no `class_gallery` key in its properties
- **THEN** `ScriptLevel#class_gallery` is falsy and the level contributes no projects to the class gallery

#### Scenario: Flag is per unit
- **WHEN** one level appears in units A and B and only unit A's script level has `class_gallery: true`
- **THEN** students' saved work on that level appears in the class gallery for unit A and not for unit B

### Requirement: Levelbuilders set the flag in the lesson editor
The lesson editor SHALL offer a "Class Gallery" checkbox on each level
token, beside Bonus, Assessment and Challenge. Saving the lesson SHALL
persist the checkbox to the script level, and a tagged token SHALL show a
"class gallery" tag when collapsed.

#### Scenario: Levelbuilder tags a level
- **WHEN** a levelbuilder checks "Class Gallery" on a level token and saves the lesson
- **THEN** the script level's `class_gallery` property is true, and reopening the editor shows the box checked

#### Scenario: Levelbuilder untags a level
- **WHEN** a levelbuilder clears the box on a tagged level and saves
- **THEN** the script level's `class_gallery` property is false

### Requirement: The flag round-trips through unit JSON
The flag SHALL be serialized in the script level's `properties` object in
`dashboard/config/scripts_json/<unit>.script_json`, and seeding a unit from
that file SHALL set it, so tagging can ship as a config change without a
levelbuilder session.

#### Scenario: Seeding a tagged unit
- **WHEN** a unit is seeded from a `.script_json` whose script level `properties` contain `"class_gallery": true`
- **THEN** the seeded script level's `class_gallery` is true

#### Scenario: Serializing a tagged unit
- **WHEN** a unit with a tagged script level is written back to `.script_json`
- **THEN** that script level's `properties` contain `"class_gallery": true`

### Requirement: A tagged level resolves to the channels students save into
A tagged script level SHALL be resolved to the set of levels whose channel
tokens hold students' work: for a level that saves a channel, its host level
(the project template level when it has one, otherwise itself); for a bubble
choice level, the host level of each sublevel that saves a channel. A level
that saves no channel SHALL resolve to nothing.

#### Scenario: Levels sharing a project template
- **WHEN** the tagged level uses project template T, as do three other levels in the lesson
- **THEN** the gallery looks up each student's channel for T, so the student's one project appears once

#### Scenario: Bubble choice
- **WHEN** the tagged level is a bubble choice whose four sublevels are Python Lab levels
- **THEN** the gallery looks up each student's channels for all four sublevels

#### Scenario: Level without a channel
- **WHEN** the tagged level is a Panels or External level
- **THEN** the gallery lists no projects for it and reports no error
