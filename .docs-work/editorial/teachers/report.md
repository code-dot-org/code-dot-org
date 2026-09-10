# Teacher pages editorial review

Reviewer: independent editorial agent (Opus). Date: 2026-09-10.
Rubric: github-docs (primary), govuk (decision pages), microsoft-writing-style (tone).
Evidence: i18n strings in apps/i18n/common/en_us.json, journey specs, mailer code.

## Per-page summary

### Hubs (index.md files)

- teachers/index.md: Reordered links to put home page first. Removed "Everything you need to" opener.
- teachers/account/index.md: Replaced fragment with actionable orientation sentence.
- teachers/classes/index.md: No change.
- teachers/curriculum/index.md: No change.
- teachers/progress/index.md: Replaced "Tools for monitoring" with reader-first orientation.
- teachers/ai/index.md: No change.
- teachers/professional-learning/index.md: Removed orphaned blank line.

### Account pages

- create-a-teacher-account.md: Rewrote opening; linked Next steps; fixed stale blank line.
- sign-in.md: Added situation opening; fixed blank line; corrected Related link text.
- manage-your-settings.md: Deleted Notifications section (inventory, not actionable); fixed blank line.
- delete-your-account.md: Exact labels Delete Account / Delete my Account (i18n).
- switch-to-a-student-account.md: Exact label Switch account type (i18n).

### Classes pages

- import-a-roster.md: Fixed "Create a section" to "New class section" (i18n).
- edit-section-settings.md: Removed "participant type" implementation term; fixed blank line.
- archive-a-section.md: Fixed "Restore" to "Restore Section" (i18n).
- All other classes pages: no change (labels correct after fix wave).

### Curriculum pages

- find-a-course.md: Removed raw /incubator URL.
- prepare-to-teach.md: Removed raw URL paths; removed "verified instructor"; fixed blank line.
- who-can-see-this-course.md: Removed universal instructor, levelbuilders; simplified assignment criteria.

### Progress pages

- tracking-progress.md: Fixed 3 stale blank lines.
- giving-feedback-and-grading.md: Fixed Submit feedback -> Submit Feedback (i18n).

### AI pages

- about-ai-in-codeai.md: Merged AI Lab / Practice problems stubs into one paragraph.
- review-ai-evaluation.md: Fixed 2-group evidence levels to 4 individual levels (i18n).
- control-ai-for-your-class.md: No change.

### Professional learning pages

- become-a-verified-teacher.md: Replaced Related permissions inventory with one sentence.
- self-paced-courses.md: Removed stale Code.org course title.
- All other PL pages: no change.

### Loose pages

- your-home-page.md: Rewrote from passive description to reader-first; added Create link.
- print-certificates.md: Removed raw /certificates/batch path.
- student-projects-and-sharing.md: Fixed blank line; fixed sharing-settings nav flow.

### Images

Deleted 3 orphaned PNGs and empty directory. Retained 4 justified crops in classes/.

## Contradictions reconciled

Evidence levels: 2 groups vs 4 -> reconciled to 4 (i18n).
Button label: Create a section vs New class section -> New class section (i18n).
Submit feedback capitalization -> Submit Feedback (i18n).
Restore -> Restore Section (i18n).

## Product problems (not docs)

1. Login Info page says "Manage Students tab" but sidebar says "Roster" (product inconsistency).
2. pd_application_principal_approval_url dangling mailer helper (removed controller).

## Verification

Build: green (141 pages). Evidence check: green.
Journey specs: 7 teacher tests passed, 1 skipped.

## Usage

session_pct: 54, week_pct: 78, tier_pct: 67
