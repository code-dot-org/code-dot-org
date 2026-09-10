# Teacher image audit

Revision: 9793f8d36ae. Date: 2026-09-10.

## Classification

| # | Image file | Referenced from | Classification | Reason |
|---|---|---|---|---|
| 1 | your-home-page-home.png | your-home-page.md | EMPTY STATE | Section card shows "Assign a course" and "Add students" -- no course, no students, no activity summary |
| 2 | your-home-page-section-cards.png | your-home-page.md | EMPTY STATE | Same bare card cropped -- no course, no students |
| 3 | your-home-page-new-class-section.png | your-home-page.md | MATCH | Shows exactly the button described |
| 4 | create-a-section-new-class-section-button.png | create-a-section.md | MATCH | Same button crop, matches alt and context |
| 5 | choose-a-login-type-login-type-picker.png | choose-a-login-type.md | MATCH | Shows login type cards as described |
| 6 | tracking-progress-progress.png | tracking-progress.md | EMPTY STATE | "It's a bit empty here" -- no students, no course, no progress grid visible at all |
| 7 | tracking-progress-sidebar-tabs.png | tracking-progress.md | MATCH | Shows sidebar tabs; "Untitled Section" is slightly unrealistic but region is correct |
| 8 | manage-workshops-workshop-dashboard.png | manage-workshops.md | EMPTY STATE | Loading spinners, no workshops listed in any category |
| 9 | managing-your-roster-roster.png | managing-your-roster.md | EMPTY STATE | Only one auto-generated student with robotic name "AlexStudent" |
| 10 | managing-your-roster-roster-row-controls.png | managing-your-roster.md | WRONG REGION | Alt says "Show words button and three-dot actions menu" but neither is visible in the crop |
| 11 | manage-your-settings-settings.png | manage-your-settings.md | EMPTY STATE | Test email (user1789...@test.xx), empty first/last names, robotic display name |
| 12 | manage-your-settings-account-info.png | manage-your-settings.md | WRONG REGION | Alt says "authentication type fields" but shows password fields instead |
| 13 | manage-your-settings-school-info.png | manage-your-settings.md | WRONG REGION | Alt says "school search field" but shows only a country dropdown |
| 14 | add-a-co-teacher-co-teacher-settings.png | add-a-co-teacher.md | NOT USEFUL | Shows only the "Add Co-Teachers" heading text, no context or controls |
| 15 | find-a-workshop-workshop-catalog.png | (orphan) | ORPHAN | File exists but no MD references it |
| 16 | index-pl-landing.png | (orphan) | ORPHAN | File exists but no MD references it |
| 17 | self-paced-courses-self-paced-catalog.png | (orphan) | ORPHAN | File exists but no MD references it |

## Summary

- MATCH: 4
- EMPTY STATE: 6
- WRONG REGION: 3
- NOT USEFUL: 1
- ORPHAN: 3

## Task pages missing images entirely

| Page | Steps that name a control or panel needing an image |
|---|---|
| giving-feedback-and-grading.md | Feedback area, rubric panel, evidence levels, "Run AI Assessment for Project/Class" buttons, code review groups |
| assign-a-course.md | Course catalog, assign button on course card, section settings course selector |
| edit-section-settings.md | Settings form with section name, grade, restrict section |
| hide-units-and-lessons.md | Visibility toggle on a lesson/unit |
| archive-a-section.md | Section menu with "Archive Section" |
| add-a-co-teacher.md | Has image but NOT USEFUL; needs the co-teacher section with email input |
| import-a-roster.md | Login type picker (Google Classroom/Clever cards); OAuth blocks the rest |
| control-ai-for-your-class.md | AI Settings tab with toggle controls |
| review-ai-evaluation.md | Rubric panel with AI suggestions, evidence indicators |

## Action plan

1. Delete 3 orphan PNGs.
2. Retake EMPTY STATE images against seeded section with 4 students, assigned course, progress data.
3. Fix WRONG REGION crops with correct locators and accurate alt text.
4. Delete NOT USEFUL image (add-a-co-teacher heading-only crop).
5. Add missing images to task pages where a control, panel, or dialog is named in a procedure step.
6. For AI-provider-dependent images (AI evaluation, AI Chat): mark BLOCKED in evidence, take no image.
7. For OAuth-dependent images (Google Classroom/Clever import): mark BLOCKED in evidence, take no image.
