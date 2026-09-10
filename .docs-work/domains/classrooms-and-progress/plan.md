# classrooms-and-progress: page plan

## Blocking questions

1. The UI uses both "section" and "class section" interchangeably.
   The button says "Create a section"; labels say "class section" in
   archive warnings and empty states. The join page says "section code".
   Sidebar tab says "Roster". Proposal: use "section" throughout
   (matching the most frequent UI label), and note that some screens
   say "class section". Fable to reconcile.

2. Is section progress V1 still reachable? The code path exists
   (`sectionProgressV2` directory is the default), but I cannot confirm
   V1 is accessible via any UI entry point.

3. `skills-dashboard` DCDO flag defaults false; nav item unreachable.
   Not documenting per brief. `teacher-demo-section` is experiment-gated
   (`demo-section`). Not documenting (not GA).

4. Cross-domain link target for "assign a course":
   assumed `docs/teachers/curriculum/assign-a-course.md`.

## Terminology observed

| UI context | Label |
|---|---|
| Create button | "Create a section" |
| Archive dialog | "Archive all class sections" |
| Teacher sidebar | Progress, Text Responses, Assessments, Student Projects, Stats, Roster, Settings |
| Login Info | "Login Info" (not in sidebar, routed separately) |
| Join page | "Enter section code" |
| Co-teacher dialog | "Add Co-Teachers" |
| Section code format | 6 uppercase letters (ABCDEF) |

## Teacher pages: `docs/teachers/classes/`

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `create-a-section.md` | task | Create a section, pick login type, set grade and participant type | teacher-section-create, teacher-section-choose-login-type, teacher-section-participant-type | create-section.spec.ts | no |
| `manage-students.md` | task | Add students, edit accounts, reset passwords, remove students | teacher-add-students-manually, teacher-edit-student-account, teacher-remove-student, teacher-roster-view | manage-students.spec.ts | no |
| `section-login-info.md` | task | Print or share login cards and parent letters | teacher-section-login-info, teacher-parent-letter | none | no |
| `co-teachers.md` | task | Invite, accept, remove a co-teacher | teacher-coinstructor-invite | none | no |
| `edit-section-settings.md` | task | Rename, change grade, change login type, restrict joining | teacher-section-edit-settings | none | no |
| `move-students.md` | task | Transfer students between sections | teacher-section-transfer | none | no |
| `archive-a-section.md` | task | Archive and restore a section | teacher-section-archive | none | no |
| `import-roster.md` | task | Import from Google Classroom, Clever, or an LMS | teacher-roster-sync-google, teacher-roster-sync-clever, teacher-roster-sync-lti | none (external OAuth) | no |
| `hide-units-and-lessons.md` | task | Hide units or lessons from students | teacher-hide-units-and-lessons | none | no |

## Teacher pages: `docs/teachers/progress/`

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `view-progress.md` | task | See how a section is progressing | teacher-section-progress, level-status-vocabulary | view-progress.spec.ts | yes: progress table |
| `assessments-and-surveys.md` | task | Review assessment and survey results | teacher-section-assessments, teacher-survey-results | none | no |
| `text-responses.md` | task | Read free-response answers | teacher-text-responses | none | no |
| `give-feedback.md` | task | Leave feedback on student work | teacher-give-feedback | give-feedback.spec.ts | no |
| `rubrics-and-evaluation.md` | task | Use rubrics and grade with AI assistance | rubric-view, rubric-teacher-evaluation | none | no |
| `teacher-scores.md` | task | Enter a score for a student | teacher-scores | none | no |
| `lock-a-lesson.md` | task | Lock and unlock an assessment lesson | teacher-lesson-lock | none | no |
| `code-review-groups.md` | task | Organize students into code review groups | teacher-section-code-review-groups | none | no |

## Student pages: `docs/students/classes/`

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `join-a-section.md` | task | Join a section with a code | student-join-section-by-code | join-section.spec.ts | no |
| `leave-a-section.md` | task | Leave a section | student-leave-section | none | no |

## Student pages: `docs/students/progress/`

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `see-your-progress.md` | task | See which lessons you finished | student-progress-view, level-status-vocabulary | none | no |
| `read-feedback.md` | task | Read your teacher's feedback | student-read-feedback | none | no |
| `peer-code-review.md` | task | Review a classmate's code | peer-code-review | none | no |

## Inventory items not documented and why

| Id | Reason |
|---|---|
| skills-tracking | DCDO `skills-dashboard` default false, nav unreachable. Not GA. |
| teacher-demo-section | Experiment `demo-section` gated. Not GA. |
| level-milestone-post | Implementation detail; student sees progress, not the POST. |
| level-group-assessment | Student assessment-taking is a lab experience, not a classroom task. Covered by labs domain. |
| project-submit-for-assignment | Project submission covered by labs domain. |
| lesson-reflection | Student reflection is a lab experience, not a classroom task. |
| teacher-section-stats | Stats tab exists but is thin (completion numbers). Covered implicitly by progress page. |

## Journeys planned

| Spec | What it verifies |
|---|---|
| create-section.spec.ts | Teacher creates a section, gets a code |
| manage-students.spec.ts | Teacher adds a student to the roster |
| join-section.spec.ts | Student joins with a section code |
| view-progress.spec.ts | Teacher sees progress table (screenshot) |
| give-feedback.spec.ts | Teacher gives feedback on student work |

## Cross-domain links assumed

| Target | Owner |
|---|---|
| `docs/teachers/curriculum/assign-a-course.md` | curriculum-and-assignment |
| `docs/students/account/sign-in.md` | accounts-and-access |
| `docs/teachers/account/sign-in-types.md` | accounts-and-access |
