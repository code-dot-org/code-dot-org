# Feature Specification: Teacher Dashboard Notes

**Feature Branch**: `lfm/hackathon`
**Created**: 2026-05-12
**Status**: Draft
**Input**: User description: "In a new section on the Lesson Materials page of the teacher dashboard, add notes functionality. A teacher should be able to create, edit, and write sanitized, markdown notes on the lesson materials page. The teacher should be able to write notes that are shared across all of that teacher's sections or specific to a section. A teacher should also be able to write notes that are specific to the course (unitgroup), unit (script), and/or lesson. For example, a teacher should be able to see a section note for the course 'We started on a different platform and switched in october', a note for the unit shared across sections 'Skip lesson 5', and a note for the lesson specific to the section 'Remember that Caleb should be paired with Jared'. These notes should be fully markdown compliant and be able to have long notes. Additionally, a teacher should be able to share notes to the coteachers of a section and view shared notes from their other coteachers in the same place."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write Curriculum Notes (Priority: P1)

A teacher viewing Lesson Materials can add and edit notes for the current course, unit, or lesson so that local teaching decisions live next to the materials they affect.

**Why this priority**: This is the minimum useful feature. It lets teachers record decisions such as course setup history, unit pacing changes, and lesson-level reminders without leaving the materials page.

**Independent Test**: Can be fully tested by signing in as a teacher, opening Lesson Materials for a section, creating notes at the course, unit, and lesson levels, leaving the page, returning, and confirming the notes remain editable in the expected places.

**Acceptance Scenarios**:

1. **Given** a teacher is viewing Lesson Materials for a section and course, **When** the teacher creates a course note, **Then** the note appears in the new notes section for that course context.
2. **Given** a teacher has a saved unit note, **When** the teacher edits and saves it, **Then** the updated note replaces the previous version and remains attached to the same unit.
3. **Given** a teacher has a lesson-level reminder, **When** the teacher opens that lesson in Lesson Materials, **Then** the reminder is visible with the lesson materials and distinguishable from course and unit notes.

---

### User Story 2 - Choose Section Reach (Priority: P2)

A teacher can decide whether a note applies across all of their sections or only to the section currently being viewed.

**Why this priority**: Teachers commonly teach the same course to several sections, but some notes are about one class roster or classroom condition. Both cases must be first-class.

**Independent Test**: Can be fully tested by creating one all-sections note and one section-specific note for the same curriculum item, then viewing Lesson Materials for two different sections and confirming each note appears only where its reach allows.

**Acceptance Scenarios**:

1. **Given** a teacher teaches the same unit in two sections, **When** the teacher creates a unit note shared across all of their sections, **Then** the note appears for that unit in both sections.
2. **Given** a teacher creates a lesson note specific to Section A, **When** the teacher opens the same lesson in Section B, **Then** the Section A note does not appear.
3. **Given** a teacher changes a note from all-sections reach to section-specific reach, **When** the change is saved, **Then** the note is visible only in the selected section.

---

### User Story 3 - Share Notes With Coteachers (Priority: P3)

A teacher can share section notes with coteachers and can read notes shared by coteachers in the same notes section.

**Why this priority**: Coteachers need a shared view of section-specific teaching context, especially student grouping notes, pacing decisions, and classroom reminders.

**Independent Test**: Can be fully tested by using a section with two coteachers, creating a shared note as one teacher, and confirming the other coteacher can view it in the same curriculum and section context.

**Acceptance Scenarios**:

1. **Given** a section has coteachers, **When** the primary teacher shares a section-specific lesson note, **Then** the coteachers can view that note on the same Lesson Materials page.
2. **Given** a coteacher has shared a unit note, **When** another coteacher opens the unit materials for that section, **Then** the shared note appears with author attribution.
3. **Given** a teacher has a private note and a shared note for the same lesson, **When** the teacher views the notes section, **Then** both notes are visible and their sharing state is clear.

---

### User Story 4 - Use Rich Markdown Safely (Priority: P4)

A teacher can write long markdown notes and preview or read the rendered result without unsafe content affecting the page or other users.

**Why this priority**: Teachers need useful formatting for long planning notes, while the page must remain safe when notes are displayed to the author or to coteachers.

**Independent Test**: Can be fully tested by saving long notes containing headings, lists, links, tables, code blocks, and unsafe embedded content, then confirming supported markdown renders and unsafe content is not active or visible as executable content.

**Acceptance Scenarios**:

1. **Given** a teacher writes a note with common markdown formatting, **When** the note is saved and displayed, **Then** the formatting renders consistently in the notes section.
2. **Given** a teacher writes a long note of at least 20,000 characters, **When** the note is saved, **Then** the complete note can be reopened and edited without truncation.
3. **Given** a note contains unsafe embedded content, **When** the note is displayed, **Then** unsafe content is removed or rendered inert while the rest of the note remains readable.

### Edge Cases

- A teacher has no existing notes for the current Lesson Materials page.
- A teacher teaches the same course or unit in several sections with a mixture of all-sections and section-specific notes.
- A note is attached to a course, unit, or lesson that is no longer visible in the current section's assigned materials.
- A teacher loses coteacher access to a section after creating or sharing a note.
- A section has multiple coteachers who share notes for the same curriculum item.
- A note body is empty, whitespace-only, extremely long, or contains only unsupported or unsafe content.
- A teacher opens the same note in two tabs and saves conflicting edits.
- A teacher attempts to view, edit, or share notes for a section they cannot access.
- A teacher marks a note as shareable globally; the note still must not become visible to unrelated teachers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a notes section on the Lesson Materials page for teachers with access to the section.
- **FR-002**: Teachers MUST be able to create, view, edit, and delete their own notes from the Lesson Materials page.
- **FR-003**: Teachers MUST be able to attach each note to exactly one curriculum context: course, unit, or lesson.
- **FR-004**: The system MUST preserve the relationship between a lesson note and its parent unit and course when displaying the note.
- **FR-005**: Teachers MUST be able to choose whether a note applies across all of their sections or only to one section.
- **FR-006**: Section-specific notes MUST appear only when viewing the matching section.
- **FR-007**: All-sections notes MUST appear in every section where the author has access and where the note's curriculum context is present.
- **FR-008**: Teachers MUST be able to mark a section-specific note as shared with the coteachers of that section.
- **FR-009**: The system MUST show shared coteacher notes in the same notes section as the teacher's own notes.
- **FR-010**: Shared notes MUST show enough attribution for a teacher to identify the note's author.
- **FR-011**: Teachers MUST NOT be able to view notes for sections or curriculum contexts they cannot access.
- **FR-012**: Teachers MUST NOT be able to edit or delete another teacher's note unless that permission is explicitly granted in a later feature.
- **FR-013**: Notes MUST support standard markdown authoring and rendered display for headings, emphasis, lists, links, tables, block quotes, and code blocks.
- **FR-014**: Rendered notes MUST be sanitized so unsafe content cannot run, alter the page, or expose another user's data.
- **FR-015**: Notes MUST support bodies of at least 20,000 characters without truncation in creation, editing, storage, or display.
- **FR-016**: The system MUST make note reach, curriculum context, sharing state, and author clear when notes are listed.
- **FR-017**: The system MUST provide useful empty, loading, saving, saved, validation, and error states for note creation and editing.
- **FR-018**: If two edits conflict, the system MUST avoid silently overwriting saved note content and MUST tell the teacher how to proceed.
- **FR-019**: The system MUST let teachers find the notes relevant to the current page without requiring navigation away from Lesson Materials.
- **FR-020**: The system MUST keep private notes private from coteachers unless the author explicitly shares them.
- **FR-021**: Teachers MUST be able to mark their own notes as shareable globally by Code.org.
- **FR-022**: Marking a note as shareable globally MUST NOT make the note visible to non-coteacher teachers or otherwise change teacher-facing visibility.
- **FR-023**: The system MUST persist the shareable-globally state so Code.org staff or engineers can find candidate notes for later manual review or sharing.

### Key Entities

- **Teacher Note**: A teacher-authored markdown note. Key attributes include body, rendered-safe display content, author, curriculum context, section reach, coteacher sharing state, global-share candidate state, timestamps, and edit state.
- **Curriculum Context**: The course, unit, or lesson a note describes. Course notes apply to a course; unit notes apply to a unit and its course; lesson notes apply to a lesson, its unit, and its course.
- **Section Reach**: Whether a note is visible across all of the author's sections or only within one section.
- **Shared Section Note**: A section-specific note whose author has made it visible to the section's coteachers.
- **Global Share Candidate**: A note whose author has marked it as eligible for possible future Code.org-wide reuse. This state is a backend marker only and does not grant visibility to unrelated teachers.
- **Coteacher**: A teacher who has teaching access to a section and may view notes shared with that section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of teachers in usability testing can create and save a note for a course, unit, or lesson in under 2 minutes without help.
- **SC-002**: 90% of teachers in usability testing can correctly predict whether a note will appear in another section before saving it.
- **SC-003**: 95% of notes up to 20,000 characters save and reopen with complete content and expected markdown formatting.
- **SC-004**: 100% of tested unsafe markdown or embedded content is rendered inert or removed when displayed.
- **SC-005**: A coteacher can see a newly shared section note in the correct Lesson Materials context within 10 seconds of page refresh.
- **SC-006**: No private note is visible to another teacher in permission tests covering section owners, coteachers, unrelated teachers, and teachers who lost section access.
- **SC-007**: Teachers can distinguish author, curriculum context, section reach, and sharing state for each listed note with at least 90% accuracy in usability testing.
- **SC-008**: In permission tests, marking a note as shareable globally changes the persisted candidate flag but produces no new visibility for unrelated teachers.

## Assumptions

- "Teacher's sections" means sections where the teacher currently has teacher access.
- All-sections notes are personal to the author unless the note is also saved as section-specific and explicitly shared.
- Sharing is scoped to a section because coteacher relationships are section-specific.
- Coteachers can view shared notes but cannot edit or delete another teacher's note in the first version.
- The global-share candidate marker is not a publishing workflow in the first version; Code.org staff or engineers will find marked notes manually.
- Marking a note as shareable globally does not imply consent to expose student names or other sensitive classroom details without later Code.org review.
- Course, unit, and lesson contexts use the curriculum assigned or visible in the current Lesson Materials page.
- Markdown support means common markdown rendering with unsafe embedded content removed or made inert.
- Note history beyond current created and updated timestamps is outside the first version.
