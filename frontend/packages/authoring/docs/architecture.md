# Architecture

## Layout

```
src/model/      domain model types, WidgetDescriptor, CurriculumChange, applyChange
src/importer/   pure functions: parse .script_json / .level XML / DSL text, assemble a CourseModel
src/node/       node:fs glue (loadCourse) — the only part of the package that touches a filesystem
```

`src/index.ts` re-exports `model` and `importer`. `src/node/index.ts` is a
separate package export (`@code-dot-org/authoring/node`) so a browser
bundle that imports the default entry never pulls in `node:fs`.

## Importer pipeline

```
loadCourse(repoRoot, courseName)          [src/node/loadCourse.ts]
  reads the .course file, follows properties.family_name to the
  course_offering JSON, follows script_names[0] to the .script_json file,
  indexes every DSL file under dashboard/config/scripts/ and every .level
  XML file under dashboard/config/levels/custom/ once (not per level key),
  then walks script_levels — recursing into level_group/bubble_choice
  sub-level references — to resolve every referenced level key to its
  source file.
        |
        v
buildCourse(inputs)                       [src/importer/buildCourse.ts]
  pure: takes file CONTENTS (strings) plus the resolved level-key -> source
  map, parses each with parseScriptJson / parseLevelXml / parseDslLevel,
  and assembles one CourseModel with exactly one Unit.
```

Identity is preserved end to end: `CourseModel.id` is the course's `name`,
`Unit.id` is the script's `name`, `Lesson.lessonKey` is the lesson's `key`,
and every imported `Experience.id` is `lb:<levelKey>` where `levelKey` is
the level's own natural-key `name` — the same strings Levelbuilder's own
seeding uses. Numeric level ids do not exist in the serialized files (the
Rails DB assigns them); the importer assigns synthetic ones
(`levelNumericId`, starting at 9000001, incrementing in encounter order)
only for the `LevelProperties` wire shape that `LabHost` consumes.

## Runtime mapping

Fish and Music XML levels get `runtime: 'labhost'` and a synthetic
`levelNumericId` with an entry in the returned `levelProperties` map.
Every other recognized level type (Multi, Match, External, StandaloneVideo,
LevelGroup, BubbleChoice) gets `runtime: 'generic'` and a `GenericLevelData`
payload. Anything else — an XML level type we don't special-case, or a DSL
extension we don't have a `GenericLevelData` shape for (e.g. `.text_match`)
— gets `runtime: 'unsupported'` with `data: {type: 'opaque', levelType,
properties}`, an honest fallback rather than a silent guess. See the
runtime-mapping table in `docs/prototypes/author-mode.md` (repo root).

A `LevelGroup`'s pages inline each sub-level's `GenericLevelData` directly
(recursively, through the same resolution). A `BubbleChoice`'s choices list
sub-level keys and a peeked `displayName` without inlining — a bubble
choice's sub-levels stay lazily-loadable experiences in their own right.

## CurriculumChange / applyChange

`applyChange` is pure and immutable: given a state tree and one change, it
returns a new tree. It rebuilds only the path from the root to the node
that changed — sibling courses/units/lessons keep their existing object
identity — rather than deep-cloning the whole tree on every change.

`attachExistingLevel` change carries only a `levelKey` (the change log is
serializable JSON; it cannot carry a resolver function). `applyChange`
takes an optional `resolveLevel(levelKey)` callback instead; when it
returns `undefined` (or is omitted), the level is attached as an opaque,
`runtime: 'unsupported'` experience that still preserves the level key —
the author sees an honest "level not found in this session's catalog"
card rather than a silently dropped op.
