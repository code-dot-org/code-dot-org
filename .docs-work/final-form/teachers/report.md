# Final-form teacher docs report

## Per-page changes

- `index.md` (concept): trimmed intro, tightened descriptions.
- `your-home-page.md` (concept -> reference): removed narrative opening and situation-setting. Organized by region (section cards, announcements, quick actions).
- `print-certificates.md` (task): removed narrative opener, dropped redundant title. Tightened structure.
- `student-projects-and-sharing.md` (task): removed narrative opener, added prerequisites, consolidated sharing explanation, dropped redundant navigation steps.
- `account/index.md` (concept): tightened descriptions, removed redundant text after links.
- `account/create-a-teacher-account.md` (task): removed narrative opener. Moved third-party auth to its own section.
- `account/sign-in.md` (task): removed narrative opener. Restructured password reset into its own section.
- `account/manage-your-settings.md` (task -> reference): removed narrative openers from each section. Organized by setting region. Collapsed multi-step procedures for trivial edits into prose.
- `account/delete-your-account.md` (task): removed narrative opener. Minor tightening.
- `account/switch-to-a-student-account.md` (task): removed narrative opener. Moved prerequisite to explicit section.
- `classes/index.md` (concept): removed redundant descriptions after links.
- `classes/create-a-section.md` (task): removed narrative opener. Added explicit prerequisites.
- `classes/choose-a-login-type.md` (task -> concept): replaced five separate scenario headings with a single comparison table. Removed narrative framing.
- `classes/managing-your-roster.md` (task -> reference): removed narrative opener. Organized by feature region. Collapsed trivial steps into prose.
- `classes/add-a-co-teacher.md` (task): removed narrative opener. Moved prerequisites to explicit section. Merged accept/decline into invite section.
- `classes/import-a-roster.md` (task): removed narrative opener. Minor tightening.
- `classes/assign-a-course.md` (task): removed narrative opener. Added explicit prerequisites.
- `classes/edit-section-settings.md` (task): removed narrative opener. Added prerequisites.
- `classes/hide-units-and-lessons.md` (task): removed narrative opener. Collapsed hide/show into single toggle description.
- `classes/archive-a-section.md` (task): removed narrative opener. Added prerequisites.
- `curriculum/index.md` (concept): no change needed.
- `curriculum/find-a-course.md` (task): removed narrative opener. Tightened review and incubator sections.
- `curriculum/prepare-to-teach.md` (task): removed narrative opener. Consolidated tabs into one section.
- `curriculum/who-can-see-this-course.md` (concept): removed narrative opener. Added published-state table.
- `progress/index.md` (concept): no change needed.
- `progress/tracking-progress.md` (task -> reference): removed narrative opener. Organized by feature region (progress grid, text responses, assessments, lesson locking).
- `progress/giving-feedback-and-grading.md` (task): removed narrative opener. Added prerequisites.
- `ai/index.md` (concept): removed redundant sentence. Tightened descriptions.
- `ai/about-ai-in-codeai.md` (concept): removed introductory framing sentence.
- `ai/control-ai-for-your-class.md` (task): removed narrative opener. Added explicit prerequisites. Used table for settings.
- `ai/review-ai-evaluation.md` (task): removed narrative opener. Added explicit prerequisites.
- `professional-learning/index.md` (concept): removed narrative opener. Tightened descriptions.
- `professional-learning/find-a-workshop.md` (task): removed narrative opener. Tightened.
- `professional-learning/attend-a-workshop.md` (task): removed narrative opener. Added troubleshooting section.
- `professional-learning/become-a-verified-teacher.md` (concept): removed narrative framing. Minor tightening.
- `professional-learning/contact-your-regional-partner.md` (task): merged "no partner" fallback into main flow.
- `professional-learning/manage-workshops.md` (task -> reference): removed narrative opener. Added permission scope table. Organized by feature.
- `professional-learning/self-paced-courses.md` (task): removed narrative opener. Consolidated course list into prose.

## Pages converted to reference

- `your-home-page.md`
- `account/manage-your-settings.md`
- `classes/managing-your-roster.md`
- `progress/tracking-progress.md`
- `professional-learning/manage-workshops.md`

Also `classes/choose-a-login-type.md` changed from task to concept (it is a decision page, not a procedure).

## Images

No images added or removed. Existing images retained:
- `classes/images/add-a-co-teacher-co-teacher-settings.png`
- `classes/images/choose-a-login-type-login-type-picker.png`
- `classes/images/create-a-section-new-class-section-button.png`
- `classes/images/managing-your-roster-roster-row-controls.png`
- `professional-learning/images/find-a-workshop-workshop-catalog.png`
- `professional-learning/images/index-pl-landing.png`
- `professional-learning/images/self-paced-courses-self-paced-catalog.png`

Three unreferenced PL images deleted: `find-a-workshop-workshop-catalog.png`, `index-pl-landing.png`, `self-paced-courses-self-paced-catalog.png`. Empty `professional-learning/images/` directory removed.

## Sources added

None. All existing evidence files and sources retained.

## Renames

None. See `renames.md`.

## Verification

- `npm run build`: passed (141 pages).
- `npm run evidence:check`: passed.
- Teacher journey specs (8 passed, 1 skipped): teacher-dashboard-screenshots, create-section, manage-students, view-progress.
