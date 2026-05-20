# Implementation Plan: Teacher Dashboard Notes

**Branch**: `lfm/hackathon` | **Date**: 2026-05-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Volumes/git/code-dot-org/specs/001-teacher-dashboard-notes/spec.md`

**Note**: `.specify/scripts/bash/setup-plan.sh --json` was run first. It resolved the feature directory from `.specify/feature.json`, then refused the branch name because `lfm/hackathon` is not a numbered Spec Kit branch. The user explicitly requested this branch, so this plan preserves `lfm/hackathon` and uses the standard Spec Kit artifact layout.

## Summary

Add teacher-authored notes to the Teacher Dashboard Lesson Materials page. Notes are markdown text attached to a course, unit, or lesson. A note is either private across the author's sections or scoped to one section; section-scoped notes may be shared read-only with active coteachers. Teachers can also mark a note as a Code.org global-share candidate, which is persisted for later manual review and does not change note visibility.

The implementation extends dashboard with a small Rails model and JSON API under `/dashboardapi/v1/teacher_dashboard_notes`, then adds a React notes section to `apps/src/templates/teacherNavigation/lessonMaterials/`. The page already loads section, unit, and selected lesson context, so the notes component can fetch all notes relevant to the current course/unit/lesson selection in one request. Markdown is stored as source text and rendered through a note-specific sanitized renderer in the client.

## Technical Context

**Language/Version**: Ruby/Rails dashboard; TypeScript + React in `apps/`; SCSS modules for styling
**Primary Dependencies**: Rails ActiveRecord, CanCanCan authorization, ActiveModelSerializers, `HttpClient`, React Testing Library/Jest, MUI and DSCO design-system components, existing markdown parser/sanitizer packages in `apps/`
**Storage**: MySQL table for teacher dashboard notes with explicit foreign keys to user, section, unit group, unit, and lesson
**Testing**: Dashboard Minitest for model/controller; Apps Jest + React Testing Library for UI; pre-commit hook for changed Ruby/JS/TS/SCSS
**Target Platform**: studio.code.org teacher dashboard
**Project Type**: Rails-backed web application with React frontend
**Performance Goals**: Lesson Materials fetches notes for course, unit, and selected lesson in one lightweight request; page remains usable with dozens of notes and notes up to 20,000 characters
**Constraints**: No new service; no new package dependency; teacher-only access; private notes never leak to unrelated teachers or coteachers; global-share candidate flags do not grant teacher-facing access; stale edits must not silently overwrite newer note bodies
**Scale/Scope**: One teacher-facing page, one persistence model, one REST-style JSON resource, focused tests for ownership, sharing, context filtering, markdown safety, and long note bodies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo + Monolith**: Pass. Work stays in `dashboard/` and `apps/`.
- **Continuous Integration of All Parts**: Pass. Plan adds dashboard and apps unit tests and keeps changed files covered by pre-commit lint.
- **Boring, Conventional Stack**: Pass. Rails/MySQL plus existing React app code. No new services, package ecosystems, or persistence engines.
- **Design System**: Pass. Use MUI Typography/Button/IconButton and DSCO form components where available; custom UI is limited to feature composition and markdown note layout.
- **README Hierarchy**: Pass. Root `README.md`, root `AGENTS.md`, `apps/README.md`, and `TESTING.md` were read. `dashboard/` has no README in the edited path.
- **Test Discipline**: Pass. Plan includes model/controller tests, RTL UI tests, apps typecheck, and targeted lint.

No constitution violations are present.

## Project Structure

### Documentation (this feature)

```text
specs/001-teacher-dashboard-notes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── teacher-dashboard-notes-api.md
└── tasks.md
```

### Source Code (repository root)

```text
dashboard/
├── app/
│   ├── controllers/api/v1/
│   │   └── teacher_dashboard_notes_controller.rb
│   ├── models/
│   │   └── teacher_dashboard_note.rb
│   └── serializers/api/v1/
│       └── teacher_dashboard_note_serializer.rb
├── config/
│   └── routes.rb
├── db/migrate/
│   └── create_teacher_dashboard_notes.rb (timestamped migration)
└── test/
    ├── controllers/api/v1/
    │   └── teacher_dashboard_notes_controller_test.rb
    ├── factories/
    │   └── factories.rb
    └── models/
        └── teacher_dashboard_note_test.rb

apps/
├── src/templates/teacherNavigation/lessonMaterials/
│   ├── LessonMaterialsContainer.tsx
│   ├── LessonMaterialTypes.ts
│   ├── TeacherDashboardNotes.tsx
│   ├── TeacherDashboardNoteCard.tsx
│   ├── TeacherDashboardNoteEditor.tsx
│   ├── teacherDashboardNotesApi.ts
│   ├── teacherDashboardNotesTypes.ts
│   ├── TeacherNoteMarkdown.tsx
│   └── lesson-materials.module.scss
└── test/unit/templates/teacherNavigation/lessonMaterials/
    ├── LessonMaterialsContainerTest.tsx
    └── TeacherDashboardNotesTest.tsx
```

**Structure Decision**: Keep the server work in dashboard API v1 because it is teacher-specific JSON behavior with authorization and persistence. Keep the UI beside the existing Lesson Materials components so it can use the current selected section, selected unit, selected lesson, styles, and test harness.

## Complexity Tracking

No constitution violations require complexity tracking.

## Phase 0 Research

See [research.md](./research.md). All technical unknowns are resolved there.

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/teacher-dashboard-notes-api.md](./contracts/teacher-dashboard-notes-api.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Monorepo + Monolith**: Pass. The design adds one model, one controller, one migration, one serializer, and colocated frontend components.
- **Continuous Integration of All Parts**: Pass. Planned tests cover Rails policy/data behavior and React page behavior.
- **Boring, Conventional Stack**: Pass. No new dependency or nonstandard storage.
- **Design System**: Pass. Planned controls use the component-library guidance; markdown rendering is feature-specific only because user-generated notes need a stricter sanitizer than curriculum markdown.
- **README Hierarchy**: Pass. No additional edited directories with unread README files were introduced.
- **Test Discipline**: Pass. Quickstart lists the targeted tests and lint/typecheck commands to run during implementation.

No gate failures remain.
