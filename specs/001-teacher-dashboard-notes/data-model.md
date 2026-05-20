# Data Model: Teacher Dashboard Notes

## TeacherDashboardNote

Represents one markdown note authored by a teacher for a course, unit, or lesson context.

### Fields

- `id`: primary key
- `teacher_id`: required user id for the author
- `section_id`: optional section id; null means the note is private across all of the author's sections
- `shared_with_section`: boolean, default false
- `shareable_globally`: boolean, default false; marks the note as a candidate for later Code.org-wide review or sharing without changing teacher-facing visibility
- `context_type`: required enum string: `course`, `unit`, `lesson`
- `unit_group_id`: optional course id; required when `context_type` is `course`
- `unit_id`: optional unit id; required when `context_type` is `unit`
- `lesson_id`: optional lesson id; required when `context_type` is `lesson`
- `body`: required markdown source text
- `lock_version`: integer for optimistic locking
- `created_at`: creation timestamp
- `updated_at`: last update timestamp

### Relationships

- Belongs to `User` as `teacher`.
- Optionally belongs to `Section`.
- Optionally belongs to `UnitGroup`.
- Optionally belongs to `Unit`.
- Optionally belongs to `Lesson`.

### Validation Rules

- `teacher_id`, `context_type`, and `body` are required.
- `body` must not be blank after trimming whitespace.
- `body` length must allow at least 20,000 characters.
- `context_type` must be one of `course`, `unit`, or `lesson`.
- Exactly one context foreign key must be set, and it must match `context_type`.
- `shared_with_section` may be true only when `section_id` is present.
- `shareable_globally` may be true for any note owned by the teacher.
- If `section_id` is present, the author must be an active instructor for that section.
- If `shared_with_section` is true, visible readers are the active instructors of that section.
- `shareable_globally` must not affect note visibility.
- Course, unit, and lesson ids must refer to existing curriculum records.

### Visibility Rules

- The author can read all of their notes.
- The author can create, edit, and delete only their own notes.
- A coteacher can read another teacher's note only when all of these are true:
  - the note has a `section_id`;
  - `shared_with_section` is true;
  - the coteacher is an active instructor for the same section.
- Unrelated teachers cannot read, edit, or delete the note.
- Removed coteachers lose access to shared notes immediately because visibility is computed from active section instructor membership.
- A note marked `shareable_globally` is still visible only to its author and, when also section-shared, active coteachers for that section.
- Code.org staff or engineers may locate `shareable_globally` notes through backend data access for later manual review; this model does not publish them globally.

### State Transitions

```text
draft in editor -> saved private note
saved private section note -> saved shared section note
saved shared section note -> saved private section note
saved note -> saved note marked shareable_globally
saved note marked shareable_globally -> saved note not marked shareable_globally
saved all-sections note -> saved section-specific note
saved section-specific note -> saved all-sections note, only when shared_with_section is false
saved note -> deleted
```

Updates must include the last seen `lock_version`. A stale update is rejected with a conflict response and must not overwrite the current note.

## Note Context

Represents the curriculum location where a note appears.

### Course Context

- Uses `unit_group_id`.
- Appears when the current Lesson Materials page is inside that course.
- Can be all-sections or section-specific.

### Unit Context

- Uses `unit_id`.
- Appears when the current Lesson Materials page is showing that unit.
- Can be all-sections or section-specific.

### Lesson Context

- Uses `lesson_id`.
- Appears when that lesson is selected.
- Can be all-sections or section-specific.

## API View Model

The frontend receives notes in a shape that does not expose unrelated user data.

### TeacherDashboardNoteSummary

- `id`
- `body`
- `contextType`
- `unitGroupId`
- `unitId`
- `lessonId`
- `sectionId`
- `sharedWithSection`
- `shareableGlobally`
- `isOwner`
- `authorName`
- `createdAt`
- `updatedAt`
- `lockVersion`

### Page Notes Response

- `notes`: all notes visible to the current teacher for the requested page
- `contexts`: the course, unit, and lesson ids used to filter the response

## Indexing

- Index by author and context for the author's private/all-sections notes.
- Index by section and sharing state for coteacher-visible notes.
- Index by `shareable_globally` for manual Code.org review queries.
- Index each context foreign key used by the page filter: `unit_group_id`, `unit_id`, and `lesson_id`.
- Keep index names explicit and short enough for MySQL.
