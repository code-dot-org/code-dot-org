# @code-dot-org/authoring

Curriculum domain model, change log, and Levelbuilder importer for the
[Author Mode prototype](../../docs/prototypes/author-mode.md). Pure
TypeScript: no React, no DOM. Safe to import from a Node service or a
browser bundle alike.

## Exports

- `.` — domain model types (`CourseModel`, `Unit`, `Lesson`, `Experience`,
  `GenericLevelData`, `AdaptivePolicy`), `WidgetDescriptor`,
  `CurriculumChange` and its stub/patch types, `applyChange`, and the
  importer's pure functions (`parseScriptJson`, `parseLevelXml`,
  `parseDslLevel`, `buildCourse`).
- `./node` — `loadCourse(repoRoot, courseName)`, the `node:fs` glue that
  resolves a course's on-disk Levelbuilder serialization and feeds it to
  `buildCourse`. Kept off the default export so the browser entry point
  never pulls in `node:fs`.

## Importer

The importer is a read-only projection of Levelbuilder's on-disk
serialization (`.course`, `.script_json`, `.level` XML, and the Ruby-ish
DSL level files under `dashboard/config/scripts/`) into the domain model.
It never rewrites the source files. See `docs/architecture.md` for the
projection rules and `docs/prototypes/author-mode.md` (repo root) for the
domain model contract.

## Usage

```ts
import {applyChange, type AuthoringState} from '@code-dot-org/authoring';
import {loadCourse} from '@code-dot-org/authoring/node';

const {course, levelProperties, warnings} = loadCourse(
  repoRoot,
  'k5-ai-data-2024',
);

const state: AuthoringState = {courses: [course], widgets: []};
const next = applyChange(state, {
  seq: 1,
  at: new Date().toISOString(),
  actor: 'author',
  op: 'updateLesson',
  lessonId: course.units[0].lessons[0].id,
  patch: {goal: 'Introduce supervised learning with a hands-on sort.'},
});
```
