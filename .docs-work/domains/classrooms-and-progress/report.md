# classrooms-and-progress: domain report

## Pages written

### Teacher pages: docs/teachers/classes/

| Path | Type | Grade |
|---|---|---|
| create-a-section.md | task | VERIFIED |
| manage-students.md | task | VERIFIED |
| section-login-info.md | task | STRONGLY SUPPORTED |
| co-teachers.md | task | STRONGLY SUPPORTED |
| edit-section-settings.md | task | STRONGLY SUPPORTED |
| move-students.md | task | STRONGLY SUPPORTED |
| archive-a-section.md | task | STRONGLY SUPPORTED |
| import-roster.md | task | STRONGLY SUPPORTED |
| hide-units-and-lessons.md | task | STRONGLY SUPPORTED |

### Teacher pages: docs/teachers/progress/

| Path | Type | Grade |
|---|---|---|
| view-progress.md | task | VERIFIED |
| assessments-and-surveys.md | task | STRONGLY SUPPORTED |
| text-responses.md | task | STRONGLY SUPPORTED |
| give-feedback.md | task | STRONGLY SUPPORTED |
| rubrics-and-evaluation.md | task | STRONGLY SUPPORTED |
| teacher-scores.md | task | STRONGLY SUPPORTED |
| lock-a-lesson.md | task | STRONGLY SUPPORTED |
| code-review-groups.md | task | STRONGLY SUPPORTED |

### Student pages: docs/students/classes/

| Path | Type | Grade |
|---|---|---|
| join-a-section.md | task | VERIFIED |
| leave-a-section.md | task | STRONGLY SUPPORTED |

### Student pages: docs/students/progress/

| Path | Type | Grade |
|---|---|---|
| see-your-progress.md | task | STRONGLY SUPPORTED |
| read-feedback.md | task | STRONGLY SUPPORTED |
| peer-code-review.md | task | STRONGLY SUPPORTED |

## Journeys

| Spec | Result |
|---|---|
| create-section.spec.ts | PASSED |
| manage-students.spec.ts | PASSED |
| join-section.spec.ts | PASSED |
| view-progress.spec.ts | PASSED (screenshot) |
| give-feedback.spec.ts | BLOCKED (skipped; needs real level) |

## Screenshot

view-progress-progress-table.png: progress table is the densest page; screenshot orients rows=students, columns=lessons faster than prose.

## UI labels

section (dominant), class section (archive warnings), Roster, Progress, Assessments, Text Responses, Stats, Login Info, Settings, Add Co-Teachers, Enter section code, 6-letter code [A-Z]{6}.

## Questions for Fable

1. Unify on section vs class section across all domains.
2. Is section progress V1 still reachable?
3. archive_all CSRF skip rationale is unrecoverable from shallow clone.

## Not documented

skills-tracking (flag off), teacher-demo-section (experiment), level-milestone-post (implementation), level-group-assessment/project-submit/lesson-reflection (labs domain), teacher-section-stats (thin, covered by progress).

## Cross-domain links assumed

docs/teachers/curriculum/assign-a-course.md, docs/students/account/sign-in.md, docs/teachers/ai/evaluation.md, docs/district-administrators/lms-integration.md.
