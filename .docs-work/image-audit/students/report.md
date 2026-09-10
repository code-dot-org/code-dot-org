# Image audit report -- student (non-lab) and district-administrator

## Classification counts (21 images)

- MATCH: 13 (account settings x5, sign-in x1, create-account x1, share-dialog x1, remix-button x1, actions-menu x1, new-project x1, run/reset/start-over x3)
- EMPTY STATE: 4 (progress-view, status-indicators, projects-page, gallery-filters)
- WRONG REGION: 2 (instructions-panel showed label not panel; show-code-toggle said "Show Text" but image shows "Show Code")
- ORPHAN: 1 (connect-your-lms-registration-form.png -- no markdown reference)
- NOT USEFUL: 0 (button crops reclassified as MATCH per single-button exception)

## Actions taken

**Retaken (projects):** gallery-filters now shows 3 projects in Dance Party, Sprite Lab, and Artist (was 1 untitled). Spec seeds 3 projects before capturing.

**Alt text fixed:** working-on-a-level instructions-panel ("The Instructions button in the toolbar"), show-code-toggle ("The Show Code toggle button"), managing-your-projects-projects-page (matches actual viewport content), gallery-filters (describes 3 projects), your-progress alt text (matches actual empty-state image with legend).

**Deleted then re-wired:** connect-your-lms-registration-form.png was an orphan; added image reference after the form field list in connect-your-lms.md. Spec regenerates it.

**BLOCKED:** Progress circles remain empty. Four approaches attempted (bubble-link click, progress-API levels, direct URL navigation + Run, milestone POST). CSF concept/video levels do not expose appOptions for milestone POSTs. Recorded in evidence with reason. The status legend at the bottom of the viewport image demonstrates all circle states.

**Missing images added (scope addition):** LMS registration form crop wired into connect-your-lms.md. Sign-in provider buttons attempted but image included dev-only OAuth warning -- deleted; provider buttons covered by the single-button exception (large, colorful, labeled).

## State seeding

Projects: 3 throwaway projects created via `/projects/{artist,spritelab,dance}/new` by a fresh student. Progress: teacher creates section, assigns course, student joins. Accounts: throwaway students created with `createStudent` fixture.

## Specs: 18 passed, 0 failed

## Usage

```json
{"session_pct": 87, "week_pct": 87, "tier_pct": 71}
```
