# Screenshot pass plan (updated for expanded scope)

## Summary

46 image references across 45 pages. 47 image files (2 orphans deleted).
3 new journey specs added; 0 pre-existing specs modified.

## New journey specs

- `teacher-dashboard-screenshots.spec.ts` -- teacher home, roster, settings, assessments, text responses, login info, student projects (7 tests)
- `student-screenshots.spec.ts` -- section code field, join page, student home, account settings, projects page, progress bubbles (6 tests)
- `misc-screenshots.spec.ts` -- teacher sign-in, unit overview, HoC puzzle, teacher account settings, congrats page (5 tests)

## Images placed (by page)

### Teacher pages (19 images across 15 pages)
1. teachers/home/teacher-home-page.md -> home-sections: orientation screenshot near top
2. teachers/account/sign-in.md -> sign-in-page: sign-in form with provider buttons
3. teachers/account/create-a-teacher-account.md -> teacher-sign-up-form: email/password fields
4. teachers/account/change-your-display-name.md -> account-settings: account settings page
5. teachers/account/change-your-password.md -> account-settings: account settings page
6. teachers/account/change-your-email-address.md -> account-settings: account settings page
7. teachers/account/update-your-school.md -> account-settings: account settings page
8. teachers/account/email-preferences.md -> account-settings: account settings page
9. teachers/classes/manage-students.md -> sidebar-roster: dashboard with Roster tab active
10. teachers/classes/edit-section-settings.md -> settings-form: full settings form
11. teachers/classes/add-a-co-teacher.md -> co-teacher-settings: settings page co-teacher area
12. teachers/classes/share-sign-in-info.md -> login-info-page: login info with printable cards
13. teachers/classes/assign-a-course.md -> catalog-assign: catalog with assign buttons (pre-existing)
14. teachers/curriculum/find-a-course.md -> catalog: catalog page (pre-existing)
15. teachers/curriculum/prepare-to-teach.md -> unit-overview-tabs: unit overview with teacher tools
16. teachers/progress/view-progress.md -> progress-table: progress grid (pre-existing)
17. teachers/progress/review-assessments.md -> sidebar-assessments: dashboard with Assessments tab
18. teachers/progress/read-text-responses.md -> sidebar-text-responses: dashboard with Text Responses tab
19. teachers/projects/see-student-projects.md -> student-projects-tab: dashboard with Student Projects tab

### Student pages (27 images across 30 pages)
20. students/account/sign-in.md -> sign-in-page: sign-in form
21. students/account/create-an-account.md -> account-type-chooser + student-sign-up-form: two images
22. students/account/sign-in-with-a-section-code.md -> section-code-field: section code area
23. students/account/change-your-display-name.md -> account-settings: account settings page
24. students/account/change-your-password.md -> account-settings: account settings page
25. students/account/change-your-email-address.md -> account-settings: account settings page
26. students/classes/join-a-section.md -> join-page: /join code entry
27. students/learning/start-your-course.md -> home-course-card: student home with course
28. students/learning/watch-a-video.md -> video-level: video player on a level
29. students/progress/see-your-progress.md -> progress-bubbles: unit overview with circles
30. students/activities/try-an-hour-of-code.md -> hoc-puzzle: Blockly puzzle level
31. students/activities/get-your-certificate.md -> congrats-page: certificate name entry
32. students/projects/start-a-new-project.md -> projects-page: projects page with lab cards
33. students/projects/browse-the-public-gallery.md -> gallery: public gallery
34-45. students/labs/ and students/projects/ pages with pre-existing images placed by other agents

## Rejected (not capturable locally or not needed)

- give-feedback, evaluate-with-a-rubric, set-up-code-review-groups: require submitted student work; BLOCKED
- read-feedback, review-a-classmates-code: require teacher feedback or code review groups; BLOCKED
- import-a-roster: requires Google/Clever OAuth; BLOCKED
- lock-a-lesson, hide-units-and-lessons: curriculum-data-dependent; fragile
- incubator: /incubator redirects to external URL; BLOCKED
- archive-a-section, create-a-section, move-students-between-sections: actions are self-explanatory menu items
- choose-a-login-type, who-can-see-this-course: concept pages without specific controls
- parent-permission, what-teachers-can-see, terms-and-privacy, sign-in-from-an-lms: concept pages
- notifications: concept page; notification bell is self-explanatory
- print-certificates: /certificates/batch may not render without completed courses
- delete-your-account, switch-to-a-teacher-account, upgrade-to-a-personal-account: thin settings actions
- leave-a-section: settings page, self-explanatory
- link-a-sign-in-method: requires OAuth provider
- reset-your-password: reCAPTCHA blocks locally
- district-administrators/ concept pages: no UI to screenshot in local dev
- look-up-a-block: /docs reference page; unpredictable local content
- train-an-ai-model, use-ai-chat: AI features; out of scope per brief
