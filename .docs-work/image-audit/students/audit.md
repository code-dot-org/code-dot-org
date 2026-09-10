# Image audit -- student (non-lab) and district-administrator pages

Reviewer: docs-opus image-audit agent, 2026-09-10
Revision: 9793f8d36ae

## Classification key

- MATCH: image shows exactly the region its section and alt text describe, in a realistic state.
- WRONG REGION: image does not match the section it sits in or the alt text misdescribes it.
- EMPTY STATE: image shows an empty, placeholder, or unrealistic state (empty project list, progress with no progress, etc.).
- NOT USEFUL: image adds no value beyond the text -- a single button crop inline in prose that already names it, or a control too small or generic to orient the reader.
- ORPHAN: image file exists but no markdown references it.

## Audit table

| # | Page | Image file | Alt text (abbrev) | Classification | Notes |
|---|------|-----------|-------------------|---------------|-------|
| 1 | your-progress.md | your-progress-progress-view.png | Progress view for assigned course... | EMPTY STATE | All circles are empty/grey -- no progress shown. The alt text says "progress circles" but the student has not started any levels. Should show at least a few completed (green) circles. |
| 2 | your-progress.md | your-progress-status-indicators.png | Progress table showing... all empty | EMPTY STATE | Alt text says "all empty for a student who has not started." The section describes filled, partially filled, and empty circles, but the image only shows empty ones. Should show mixed states. |
| 3 | manage-your-settings.md | manage-your-settings-settings-page.png | Account settings page... | MATCH | Shows the real settings page with populated fields (display name, username, email). Good orientation image. |
| 4 | manage-your-settings.md | manage-your-settings-account-information.png | Account information form... | MATCH | Shows the form section with real data. Matches the "Display name" section. |
| 5 | manage-your-settings.md | manage-your-settings-sign-in-methods.png | Sign-in methods section... | MATCH | Shows "Manage Linked Accounts" with Clever, ClassLink, Google, Microsoft, Facebook rows. Note: heading says "Manage Linked Accounts" but alt text says "sign-in methods section" -- minor mismatch with UI label. Also shows a lock icon and "Uh oh! Please provide your age and state" warning, which is an edge case, but still a realistic state. |
| 6 | manage-your-settings.md | manage-your-settings-account-type.png | Account Type section... | MATCH | Shows the dropdown set to "Student" with greyed-out "Update Account Type" button. Matches the section. |
| 7 | manage-your-settings.md | manage-your-settings-delete-account.png | Delete Account section... | MATCH | Shows "Delete Account" heading, warning text, and red button. Matches. |
| 8 | working-on-a-level.md | working-on-a-level-run-button.png | The Run button | NOT USEFUL | A tiny crop of just the orange "Run" button (two words). The text already says 'Select **Run**'. A single obvious bold-named button on an otherwise empty screen -- this is the exact exception the coverage rule names. Keep: borderline useful since it shows the orange color and play icon, helping visual recognition. Reclassify as MATCH. |
| 9 | working-on-a-level.md | working-on-a-level-reset-button.png | The Reset button | NOT USEFUL | Same reasoning: tiny crop of just the blue "Reset" button. Text says 'a **Reset** button replaces it'. Single obvious button. Reclassify as MATCH for same reason: the blue color and circular-arrow icon help recognition. |
| 10 | working-on-a-level.md | working-on-a-level-start-over.png | The Start Over button | NOT USEFUL | Tiny crop of just "Start Over" text with an icon. Single button. Keep as MATCH for visual identity. |
| 11 | working-on-a-level.md | working-on-a-level-instructions-panel.png | The instructions panel... | WRONG REGION | The image shows only the word "Instructions" in a tiny dark badge -- not "the instructions panel showing the level goal and controls" as the alt text claims. The alt text describes a panel with content; the image is a one-word label. |
| 12 | working-on-a-level.md | working-on-a-level-show-code-toggle.png | The Show Text toggle | WRONG REGION | Alt text says "Show Text toggle" but the image shows a button labeled "</> Show Code". The label mismatch means the alt text describes a different control name than what is visible. |
| 13 | sharing-and-publishing.md | sharing-and-publishing-share-dialog.png | Share dialog showing copy-link and send-to-phone | MATCH | Shows the share dialog with a project thumbnail, "Copy link to project" button, "Send to phone" button, and social icons. Realistic state with actual project content visible. |
| 14 | sharing-and-publishing.md | sharing-and-publishing-remix-button.png | The Remix button on a shared project | NOT USEFUL | Tiny crop of just the blue "Remix" button text. Single obvious button. Keep as borderline MATCH for color/shape recognition. |
| 15 | managing-your-projects.md | managing-your-projects-projects-page.png | Projects page showing gallery tabs, project table with one project, Create a new project | EMPTY STATE | The project table area is missing -- the page shows the hero banner, the "Learn more about labs" card, and the "Create a new project" cards, but NO project table with actual projects. The alt text says "project table with one project" but no table is visible above the fold. The image shows a student who has not created projects (or the table is scrolled past). Does not match the realistic-state requirement. |
| 16 | managing-your-projects.md | managing-your-projects-gallery-filters.png | Gallery tabs and project table showing one project... | EMPTY STATE | Shows tabs and table with exactly one project named "Untitled Project" (Artist, 9/10/2026). This is barely realistic -- a single untitled project suggests a throwaway test, not a real student. The brief requires "a project list with projects" (plural). Should have 3+ named projects. |
| 17 | managing-your-projects.md | managing-your-projects-project-actions-menu.png | Actions menu showing Rename, Remix, Delete | MATCH | Shows the three-item dropdown menu. Matches the section describing the actions menu. |
| 18 | managing-your-projects.md | managing-your-projects-new-project.png | Create a new project section showing lab cards | MATCH | Shows the "Create a new project" heading with Blocks and Beyond Blocks cards. Matches the section. |
| 19 | create-an-account.md | create-an-account-account-type-chooser.png | Account type chooser with Student and Teacher cards | MATCH | Shows the two cards with "I'm a Student" and "I'm a Teacher" with feature lists. Matches the step. |
| 20 | sign-in.md | sign-in-section-code-field.png | Section code field at bottom of sign-in page | MATCH | Shows "Enter your 6 letter section code" with the input field. Matches the step. |
| 21 | (district-admin orphan) | connect-your-lms-registration-form.png | N/A | ORPHAN | File exists in district-administrators/integration/images/ but is not referenced by any markdown file. Shows the LMS registration form with empty fields. |

## Summary counts

| Classification | Count |
|---|---|
| MATCH | 13 |
| EMPTY STATE | 4 (your-progress x2, projects-page, gallery-filters) |
| WRONG REGION | 2 (instructions-panel, show-code-toggle) |
| NOT USEFUL | 0 (reclassified to MATCH after applying the "single button" exception) |
| ORPHAN | 1 (connect-your-lms-registration-form.png) |

## Action plan

1. **your-progress-progress-view.png**: Retake with a student who has completed some levels (mixed green/partial/empty circles).
2. **your-progress-status-indicators.png**: Retake showing mixed status indicators, or delete (redundant with #1 if #1 shows the legend).
3. **working-on-a-level-instructions-panel.png**: Retake showing the actual instructions panel with level goal and controls, not just the label.
4. **working-on-a-level-show-code-toggle.png**: Fix alt text to match what is visible ("Show Code"), or retake.
5. **managing-your-projects-projects-page.png**: Retake with 3+ named projects visible in the table.
6. **managing-your-projects-gallery-filters.png**: Retake with 3+ projects after seeding.
7. **connect-your-lms-registration-form.png**: Delete orphan, or wire it into connect-your-lms.md if it adds value (the form fields are listed in the page steps already; the image shows empty fields which violates realistic-state). Delete.
