# Teacher image audit report

Date: 2026-09-10. Revision: 9793f8d36ae.

## Classification counts (17 files)

- MATCH: 4
- EMPTY STATE: 6
- WRONG REGION: 3
- NOT USEFUL: 1
- ORPHAN: 3

## Actions taken

### Retaken (EMPTY STATE to realistic)

- tracking-progress-progress.png: four students in a progress grid with lesson columns for csd1-2024.
- tracking-progress-sidebar-tabs.png: sidebar with named section "Period 3 - CS Discoveries".
- your-home-page-home.png: section card showing assigned course and action links.
- your-home-page-section-cards.png: section card crop with course and section code.
- managing-your-roster-roster.png: roster with four students.
- manage-your-settings-settings.png: settings page with teacher "Maria Santos".

### Fixed (WRONG REGION alt text corrected)

- managing-your-roster-roster-row-controls.png: re-cropped to a full tr row.
- manage-your-settings-account-info.png: alt text corrected.
- manage-your-settings-school-info.png: alt text corrected.

### Deleted

- add-a-co-teacher-co-teacher-settings.png: retaken with wider crop.
- 3 orphan PNGs deleted.

### Missing images added

- edit-section-settings.md: settings-form.png (step 1)
- assign-a-course.md: course-catalog.png (step 1)
- hide-units-and-lessons.md: lesson-visibility.png (step 1)

### BLOCKED

- giving-feedback-and-grading.md, review-ai-evaluation.md, control-ai-for-your-class.md, import-a-roster.md: require credentials or browser-level completion.
- archive-a-section.md: menu locator unreliable; control is obvious from bold text.

## Progress seeding

Teacher Ms. Chen, section "Period 3 - CS Discoveries" (email, grades 7-8), four students enrolled, csd-2024 unit 1 assigned via test API. Grid shows student rows with lesson columns.

## Verification

- 19 specs pass, 5 skipped (AI/feedback blocked).
- npm run build green (141 pages).
- npm run evidence:check green.

## Usage

session_pct: 46, week_pct: 87, tier_pct: 71
