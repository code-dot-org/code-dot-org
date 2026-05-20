# Quickstart: Teacher Dashboard Notes

## Read First

- `/Volumes/git/code-dot-org/AGENTS.md`
- `/Volumes/git/code-dot-org/README.md`
- `/Volumes/git/code-dot-org/apps/README.md`
- `/Volumes/git/code-dot-org/TESTING.md`
- `/Volumes/git/code-dot-org/.agents/skills/design-system/SKILL.md`

## Implementation Order

1. Add `TeacherDashboardNote` migration, model, serializer, API controller, routes, and factories.
2. Add model tests for context validation, section-sharing validation, all-sections private notes, global-share candidate flag persistence, and optimistic locking.
3. Add controller tests for list/create/update/delete permissions:
   - owner can manage own notes;
   - active coteacher can read shared section notes;
   - removed coteacher and unrelated teacher cannot read shared notes;
   - unrelated teachers still cannot read notes marked shareable globally;
   - coteacher cannot edit or delete another teacher's note;
   - stale update returns conflict.
4. Extend lesson materials summary with `unitGroupId`.
5. Add lesson materials notes UI:
   - fetch visible notes for selected section/unit/lesson/course;
   - show course, unit, and lesson groups;
   - create/edit/delete owned notes;
   - let section notes toggle shared-with-coteachers;
   - let owned notes toggle shareable-globally candidate state;
   - render markdown preview/read mode through the note-safe renderer.
6. Add React unit tests for loading, empty state, create, edit, coteacher share toggle, global-share candidate toggle, coteacher read-only display, stale edit error, and markdown sanitizer behavior.
7. Run targeted tests and lint.

## Targeted Test Commands

Run Rails tests from `/Volumes/git/code-dot-org/dashboard`:

```bash
bundle exec spring testunit ./test/models/teacher_dashboard_note_test.rb
bundle exec spring testunit ./test/controllers/api/v1/teacher_dashboard_notes_controller_test.rb
```

Run frontend tests from `/Volumes/git/code-dot-org/apps`:

```bash
yarn test:unit test/unit/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotesTest.tsx
yarn test:unit test/unit/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainerTest.tsx
yarn run typecheck
```

Run changed-file lint from `/Volumes/git/code-dot-org`:

```bash
./tools/hooks/pre-commit
```

## Manual Verification

Use a teacher account with two sections assigned to the same course/unit and a second active coteacher on one section.

1. Open `/teacher_dashboard/sections/:section_id/materials`.
2. Create a course note with all-sections reach. Confirm it appears in the other matching section for the same teacher.
3. Create a unit note scoped to one section. Confirm it does not appear in another section.
4. Create a lesson note scoped to one section and shared with coteachers. Confirm the coteacher sees it in read-only form with author attribution.
5. Confirm an unrelated teacher and a removed coteacher cannot see the shared note.
6. Mark a private note as shareable globally. Confirm the flag persists for the owner and the note is still invisible to unrelated teachers.
7. Save a note containing headings, lists, links, tables, block quotes, code blocks, and unsafe embedded content. Confirm supported markdown renders and unsafe content is inert or removed.
8. Open the same owned note in two tabs, save in one tab, then save stale content in the other. Confirm the second save reports a conflict and does not overwrite the current body.

## Browser Targets

Try the webpack proxy first when dashboard and apps are running:

```text
http://localhost-studio.code.org:9000/teacher_dashboard/sections/:section_id/materials
```

Use the direct dashboard server if apps are already built:

```text
http://localhost-studio.code.org:3000/teacher_dashboard/sections/:section_id/materials
```
