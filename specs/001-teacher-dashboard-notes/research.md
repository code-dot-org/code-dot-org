# Research: Teacher Dashboard Notes

## Decision: Add a new `TeacherDashboardNote` Rails model

**Rationale**: Notes have their own ownership, sharing, curriculum context, body, and optimistic locking behavior. A dedicated model keeps permission and validation rules local. It also avoids overloading AI artifacts or teacher feedback, whose existing meaning and access patterns differ.

**Alternatives considered**:

- Reuse `AidiffArtifact`: rejected because artifacts are generated resources associated with AI threads and custom lesson resources.
- Store notes in section metadata: rejected because notes can be all-sections and can apply to course, unit, or lesson contexts independent of one section record.
- Store rendered HTML only: rejected because teachers need editable markdown source and safe rendering should happen at display time.

## Decision: Store raw markdown, render through a note-specific sanitizer

**Rationale**: The app already has markdown rendering infrastructure, but `SafeMarkdown` intentionally allows Code.org curriculum extensions such as style/class attributes and Blockly XML. Teacher-authored notes are user-generated content, so the notes UI should use the same parser family but a stricter schema that supports ordinary markdown, tables, links, block quotes, and code blocks without curriculum-only relaxations.

**Alternatives considered**:

- Use `SafeMarkdown` directly: rejected because its schema is broader than required for user-generated notes.
- Sanitize on save and store only sanitized HTML: rejected because it makes future markdown editing lossy and couples storage to display.
- Add a new markdown package: rejected because existing dependencies already cover parsing and sanitization.

## Decision: Use section instructor membership for coteacher visibility

**Rationale**: `Section` already has `active_section_instructors` and `instructors`, and CanCanCan grants teachers `:manage` on sections they instruct. Shared note visibility should follow the same active instructor relationship.

**Alternatives considered**:

- Copy shared notes to each coteacher: rejected because access changes would leave stale copies.
- Add a separate note sharing table: rejected for v1 because sharing is binary and scoped to one section.

## Decision: One REST-style dashboard API resource

**Rationale**: A dedicated `/dashboardapi/v1/teacher_dashboard_notes` resource gives the frontend predictable CRUD operations and keeps permission checks close to the model. Existing teacher dashboard code already uses `HttpClient.fetchJson` against dashboard API routes.

**Alternatives considered**:

- Extend `/dashboardapi/lesson_materials/:unit_id`: rejected because notes need create/update/delete and permission behavior separate from curriculum material summaries.
- Use a non-v1 dashboard route: rejected because nearby teacher-facing JSON resources use `/dashboardapi/v1`.

## Decision: Fetch page-relevant notes by section, course, unit, and lesson

**Rationale**: Lesson Materials already knows selected section, selected unit, and selected lesson. Extending the lesson-materials summary with `unitGroupId` gives the frontend the course context. The notes index can return all notes matching the current page contexts in one call, grouped by course, unit, and lesson.

**Alternatives considered**:

- Fetch notes separately per context: rejected because it adds extra request orchestration and more loading states.
- Fetch all notes for the teacher: rejected because it increases response size and leaves filtering logic in the client.

## Decision: Use optimistic locking for edit conflicts

**Rationale**: The feature requires stale edits not to silently overwrite newer note content. Rails optimistic locking with `lock_version` is conventional and requires no new infrastructure. The client sends the last seen `lockVersion`; stale updates return a conflict response with the current note.

**Alternatives considered**:

- Last write wins: rejected because it violates the specification.
- Full revision history: rejected as outside v1 scope.

## Decision: Keep all-sections notes private to the author in v1

**Rationale**: Coteacher relationships are section-scoped. The spec asks teachers to share notes to coteachers of a section, so sharing all-sections notes would have ambiguous recipients. A note must be section-specific before it can be shared.

**Alternatives considered**:

- Share an all-sections note with every coteacher in every section: rejected because this can expose content more broadly than the author expects.
- Add per-note recipient selection: rejected as unnecessary for the requested v1.

## Decision: Add a global-share candidate flag without global teacher visibility

**Rationale**: Product wants teachers to mark notes as potentially reusable by Code.org, but those notes must not appear to unrelated teachers automatically. A boolean `shareable_globally` marker on the note is enough for engineers or staff to find candidates manually later. It keeps consent/candidate state distinct from publication.

**Alternatives considered**:

- Immediately show marked notes to all teachers using the same course, unit, or lesson: rejected because the requirement explicitly forbids visibility to non-coteacher teachers.
- Build an admin review and publishing workflow now: rejected because the requirement only asks for a backend flag and later manual sharing.
- Reuse the coteacher sharing flag: rejected because coteacher visibility and Code.org review candidacy are independent states.

## Decision: Integrate notes as a new section inside Lesson Materials

**Rationale**: The page currently renders a main column containing header, teacher resources, student resources, and custom resources, plus an optional lesson summary side panel. A notes section in the main column can use the existing selected lesson and stay visible near lesson resources without competing with AI lesson summaries.

**Alternatives considered**:

- Add notes to the right-side summary panel: rejected because that panel is optional and AI-specific.
- Add a separate teacher dashboard navigation tab: rejected because the request is specifically for the Lesson Materials page.
