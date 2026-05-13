# Tasks: Teacher Dashboard Notes

**Input**: Design documents from `/Volumes/git/code-dot-org/specs/001-teacher-dashboard-notes/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/teacher-dashboard-notes-api.md](./contracts/teacher-dashboard-notes-api.md), [quickstart.md](./quickstart.md)

**Tests**: Included. The specification and quickstart require model, controller, frontend, markdown safety, permission, and conflict tests.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment after the shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase when dependencies are satisfied.
- **[Story]**: Maps to a user story from [spec.md](./spec.md).
- Every task names the exact file or directory it changes or validates.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm local conventions and create the shared skeleton for dashboard and apps work.

- [X] T001 Read required guidance in `/Volumes/git/code-dot-org/AGENTS.md`, `/Volumes/git/code-dot-org/README.md`, `/Volumes/git/code-dot-org/apps/README.md`, `/Volumes/git/code-dot-org/TESTING.md`, and `/Volumes/git/code-dot-org/.agents/skills/design-system/SKILL.md`
- [X] T002 Create the timestamped migration file for teacher dashboard notes in `/Volumes/git/code-dot-org/dashboard/db/migrate/`
- [X] T003 [P] Create empty Rails implementation files in `/Volumes/git/code-dot-org/dashboard/app/models/teacher_dashboard_note.rb`, `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`, and `/Volumes/git/code-dot-org/dashboard/app/serializers/api/v1/teacher_dashboard_note_serializer.rb`
- [X] T004 [P] Create empty frontend implementation files in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes.tsx`, `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`, `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx`, `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherNoteMarkdown.tsx`, `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesApi.ts`, and `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesTypes.ts`
- [X] T005 [P] Create empty test files in `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb`, `/Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb`, and `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared data model, routes, type contracts, and API helpers required by every story.

**Critical**: No user story work should begin until this phase is complete.

- [X] T006 Implement the `teacher_dashboard_notes` table with `teacher_id`, `section_id`, `shared_with_section`, `shareable_globally`, `context_type`, `unit_group_id`, `unit_id`, `lesson_id`, `body`, `lock_version`, timestamps, and indexes in `/Volumes/git/code-dot-org/dashboard/db/migrate/`
- [X] T007 Implement `TeacherDashboardNote` associations, context enum constants, ownership helpers, visibility scopes, and validation rules in `/Volumes/git/code-dot-org/dashboard/app/models/teacher_dashboard_note.rb`
- [X] T008 Add `teacher_dashboard_note` factory coverage for course, unit, lesson, section-specific, shared, and shareable-globally notes in `/Volumes/git/code-dot-org/dashboard/test/factories/factories.rb`
- [X] T009 Add the dashboard API route for `/dashboardapi/v1/teacher_dashboard_notes` CRUD actions in `/Volumes/git/code-dot-org/dashboard/config/routes.rb`
- [X] T010 Implement `Api::V1::TeacherDashboardNoteSerializer` with `body`, context ids, `sectionId`, `sharedWithSection`, `shareableGlobally`, `isOwner`, `authorName`, timestamps, and `lockVersion` in `/Volumes/git/code-dot-org/dashboard/app/serializers/api/v1/teacher_dashboard_note_serializer.rb`
- [X] T011 Implement shared request parameter normalization and permission helpers in `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`
- [X] T012 [P] Define TypeScript API and view types for notes in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesTypes.ts`
- [X] T013 [P] Implement typed `index`, `create`, `update`, and `destroy` helpers using `HttpClient` in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesApi.ts`
- [X] T014 [P] Add `unitGroupId` to `LessonMaterialsData` and `Lesson` context types in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/LessonMaterialTypes.ts`
- [X] T015 Extend `Unit#summarize_for_lesson_materials_view` to include `unitGroupId` when available in `/Volumes/git/code-dot-org/dashboard/app/models/unit.rb`

**Checkpoint**: Foundation ready. CRUD routing, model shape, serialization, frontend types, and unit group context exist.

---

## Phase 3: User Story 1 - Write Curriculum Notes (Priority: P1) MVP

**Goal**: Teachers can create, view, edit, and delete their own course, unit, and lesson notes on Lesson Materials.

**Independent Test**: Sign in as a teacher, open Lesson Materials, create notes for course, unit, and lesson contexts, leave and return, edit each note, and delete one note.

### Tests for User Story 1

- [X] T016 [P] [US1] Add model tests for required body, body length, course/unit/lesson context validation, and author ownership in `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb`
- [X] T017 [P] [US1] Add controller tests for owner list/create/update/delete of course, unit, and lesson notes in `/Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb`
- [X] T018 [P] [US1] Add frontend tests for loading, empty state, create, edit, delete, and context grouping in `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`
- [X] T019 [P] [US1] Update container tests to assert the notes component receives section, course, unit, and selected lesson context in `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainerTest.tsx`

### Implementation for User Story 1

- [X] T020 [US1] Implement owner-visible index, create, update, and destroy behavior for private notes in `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`
- [X] T021 [US1] Implement stale update handling with `lock_version` and `409 Conflict` responses in `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`
- [X] T022 [US1] Implement core notes list, empty state, context grouping, and fetch lifecycle in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes.tsx`
- [X] T023 [P] [US1] Implement owned note display, edit, delete, author metadata, context labels, and save-state UI in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`
- [X] T024 [P] [US1] Implement the note editor for body text, context selection, validation messages, save, cancel, and delete confirmation in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx`
- [X] T025 [US1] Integrate `TeacherDashboardNotes` below lesson resources using selected section, selected unit, selected lesson, and `unitGroupId` in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainer.tsx`
- [X] T026 [US1] Add note layout styles for list, editor, metadata, actions, loading, error, and empty states in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/lesson-materials.module.scss`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP.

---

## Phase 4: User Story 2 - Choose Section Reach (Priority: P2)

**Goal**: Teachers can choose whether a note applies across all of their sections or only to the current section, and can mark notes as Code.org global-share candidates without changing visibility.

**Independent Test**: Create one all-sections note and one section-specific note for the same curriculum context, switch sections, and confirm visibility. Mark a note shareable globally and confirm unrelated teachers still cannot see it.

### Tests for User Story 2

- [X] T027 [P] [US2] Add model tests for all-sections notes, section-specific notes, section instructor validation, and `shareable_globally` persistence in `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb`
- [X] T028 [P] [US2] Add controller tests proving section-specific filtering, all-sections visibility, and no unrelated-teacher visibility from `shareable_globally` in `/Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb`
- [X] T029 [P] [US2] Add frontend tests for section reach controls, all-sections display, section-specific display, and global-share candidate toggling in `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`

### Implementation for User Story 2

- [X] T030 [US2] Implement section reach validation and page-visible filtering for all-sections versus section-specific notes in `/Volumes/git/code-dot-org/dashboard/app/models/teacher_dashboard_note.rb`
- [X] T031 [US2] Permit and persist `sectionId`, `sharedWithSection`, and `shareableGlobally` updates without granting unrelated-teacher visibility in `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`
- [X] T032 [US2] Add reach controls and global-share candidate toggle to the editor in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx`
- [X] T033 [US2] Display reach labels and global-share candidate state on owned notes in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`
- [X] T034 [US2] Ensure list refresh and local state reconciliation preserve reach and global-share candidate state in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Share Notes With Coteachers (Priority: P3)

**Goal**: Teachers can share section notes with active coteachers, and active coteachers can read those notes in the same notes section without edit/delete access.

**Independent Test**: Use a section with two coteachers, create a section-specific shared note as one teacher, and confirm another active coteacher can view it read-only with author attribution.

### Tests for User Story 3

- [X] T035 [P] [US3] Add model tests for active coteacher read visibility, removed coteacher loss of visibility, and unrelated teacher denial in `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb`
- [X] T036 [P] [US3] Add controller tests for shared note index visibility and edit/delete denial for non-owner coteachers in `/Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb`
- [X] T037 [P] [US3] Add frontend tests for read-only coteacher notes, author attribution, sharing labels, and absent edit/delete controls in `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`

### Implementation for User Story 3

- [X] T038 [US3] Implement shared coteacher visibility scopes using active section instructors in `/Volumes/git/code-dot-org/dashboard/app/models/teacher_dashboard_note.rb`
- [X] T039 [US3] Enforce owner-only update/delete while allowing shared read access in `/Volumes/git/code-dot-org/dashboard/app/controllers/api/v1/teacher_dashboard_notes_controller.rb`
- [X] T040 [US3] Serialize `isOwner` and `authorName` correctly for owned and coteacher-visible notes in `/Volumes/git/code-dot-org/dashboard/app/serializers/api/v1/teacher_dashboard_note_serializer.rb`
- [X] T041 [US3] Add shared-with-coteachers controls for section-specific notes in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx`
- [X] T042 [US3] Render coteacher notes read-only with author attribution and no owner actions in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`
- [X] T043 [US3] Merge owned and coteacher-visible notes into the same grouped list in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes.tsx`

**Checkpoint**: User Stories 1, 2, and 3 all work independently.

---

## Phase 6: User Story 4 - Use Rich Markdown Safely (Priority: P4)

**Goal**: Teachers can write long notes using ordinary markdown, and rendered notes remain safe for authors and coteachers.

**Independent Test**: Save a note with headings, lists, links, tables, block quotes, code blocks, unsafe embedded content, and at least 20,000 characters; confirm formatting renders and unsafe content is inert or removed.

### Tests for User Story 4

- [X] T044 [P] [US4] Add model tests for 20,000-character note bodies and blank/whitespace-only rejection in `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb`
- [X] T045 [P] [US4] Add frontend markdown tests for headings, lists, links, tables, block quotes, code blocks, and unsafe embedded content in `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`

### Implementation for User Story 4

- [X] T046 [US4] Implement a strict note markdown renderer without curriculum-only schema relaxations in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherNoteMarkdown.tsx`
- [X] T047 [US4] Wire markdown preview and rendered read mode through `TeacherNoteMarkdown` in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx`
- [X] T048 [US4] Render saved markdown bodies through `TeacherNoteMarkdown` in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`
- [X] T049 [US4] Add markdown-specific typography, table, code, link, and overflow styles in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/lesson-materials.module.scss`

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate implementation quality, accessibility, and repo gates.

- [X] T050 [P] Add analytics constants for note create, update, delete, share toggle, and global-share candidate toggle in `/Volumes/git/code-dot-org/apps/src/metrics/AnalyticsConstants.js`
- [X] T051 Wire analytics events into note actions in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes.tsx`
- [X] T052 [P] Review labels, keyboard access, focus flow, and semantic controls in `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx` and `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx`
- [ ] T053 [P] Update lesson materials eyes or UI coverage notes if visual layout changed in `/Volumes/git/code-dot-org/dashboard/test/ui/features/teacher_tools/teacher_dashboard/lesson_materials_eyes.feature`
- [ ] T054 Run Rails targeted tests from `/Volumes/git/code-dot-org/dashboard` for `/Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb` and `/Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb`
- [X] T055 Run apps targeted tests and typecheck from `/Volumes/git/code-dot-org/apps` for `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx`, `/Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainerTest.tsx`, and `/Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/`
- [ ] T056 Run changed-file lint from `/Volumes/git/code-dot-org` with `/Volumes/git/code-dot-org/tools/hooks/pre-commit`
- [ ] T057 Manually verify the quickstart scenarios in `/Volumes/git/code-dot-org/specs/001-teacher-dashboard-notes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundation. Delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundation and integrates with US1 UI/model paths.
- **User Story 3 (Phase 5)**: Depends on Foundation and the section-specific reach model from US2.
- **User Story 4 (Phase 6)**: Depends on Foundation and can be implemented after US1 note rendering exists.
- **Polish (Phase 7)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 Write Curriculum Notes**: First increment; no dependency on other user stories after Foundation.
- **US2 Choose Section Reach**: Requires the base note CRUD from US1 for UI integration, but its model/controller behavior can be developed after Foundation.
- **US3 Share Notes With Coteachers**: Requires section-specific reach from US2.
- **US4 Use Rich Markdown Safely**: Requires base note display/edit surfaces from US1; can proceed in parallel with US2 or US3 once those surfaces exist.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel after T001 and T002.
- T012, T013, T014, and T015 can run in parallel with backend serializer/controller work after the migration shape is known.
- Test tasks within each user story are parallelizable because they touch separate model, controller, or frontend test files.
- UI card/editor/markdown tasks can run in parallel after `TeacherDashboardNotes.tsx` defines the shared props and state shape.
- Polish accessibility, analytics constants, UI coverage notes, and test runs can be split once implementation stabilizes.

---

## Parallel Example: User Story 1

```text
Task: "T016 [US1] Add model tests in /Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb"
Task: "T017 [US1] Add controller tests in /Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb"
Task: "T018 [US1] Add frontend tests in /Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx"
```

```text
Task: "T023 [US1] Implement note display in /Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteCard.tsx"
Task: "T024 [US1] Implement editor in /Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherDashboardNoteEditor.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T027 [US2] Add model tests in /Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb"
Task: "T028 [US2] Add controller tests in /Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb"
Task: "T029 [US2] Add frontend tests in /Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T035 [US3] Add model tests in /Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb"
Task: "T036 [US3] Add controller tests in /Volumes/git/code-dot-org/dashboard/test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb"
Task: "T037 [US3] Add frontend tests in /Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx"
```

## Parallel Example: User Story 4

```text
Task: "T044 [US4] Add model tests in /Volumes/git/code-dot-org/dashboard/test/models/teacher_dashboard_note_test.rb"
Task: "T045 [US4] Add markdown renderer tests in /Volumes/git/code-dot-org/apps/test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx"
Task: "T046 [US4] Implement note-safe markdown in /Volumes/git/code-dot-org/apps/src/templates/teacherNavigation/lessonMaterials/TeacherNoteMarkdown.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for private course, unit, and lesson note CRUD.
3. Run model, controller, and frontend tests for US1.
4. Demo the Lesson Materials page with private note create/edit/delete.

### Incremental Delivery

1. Deliver US1 for basic owned notes.
2. Deliver US2 for all-sections, section-specific, and global-share candidate state.
3. Deliver US3 for coteacher read sharing.
4. Deliver US4 for long, safe markdown rendering.
5. Run polish validation and quickstart manual checks.

### Parallel Team Strategy

1. One engineer completes the Rails foundation while another prepares frontend skeleton/types.
2. After Foundation, split by story or layer:
   - Backend owner: model/controller/serializer behavior and tests.
   - Frontend owner: notes list, editor, cards, and RTL tests.
   - Markdown/accessibility owner: strict renderer, styles, and keyboard/focus checks.
3. Merge at story checkpoints, not only at the final polish phase.

## Notes

- Tasks marked [P] do not depend on incomplete tasks in the same phase and touch different files or clearly separable test scopes.
- Tests are listed before implementation tasks inside each story.
- The global-share candidate flag is persistence and review metadata only. It must never add visibility for unrelated teachers.
- Do not run full Rails or apps test suites unless targeted tests indicate broader risk.
