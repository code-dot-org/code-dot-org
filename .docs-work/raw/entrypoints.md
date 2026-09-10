# studio.code.org UI-side entry points

## 1. Top navigation / header

## Sources
- `dashboard/app/views/layouts/_header.html.haml` — renders header shell, computes `user_type` (teacher/student/nil) from `current_user` or `_user_type` cookie, builds `hamburger_options`/`header_contents_options`, calls `Hamburger.get_header_contents` for the main nav links and renders `shared/haml/user_header.haml` for the sign-in/user menu.
- `lib/cdo/hamburger.rb` — `Hamburger.get_header_contents(options)` (main header links, keyed by `user_type`) and `Hamburger.get_hamburger_contents(options)` (mobile/overflow menu, includes header items plus a hamburger-only list plus Legal/About/Help submenus). Also computes responsive visibility classes (`show/hide-mobile`, `show/hide-small-desktop`).
- `shared/haml/user_header.haml` — Create-project dropdown, signed-in user menu (My Projects, My Scrapbook (experiment-gated), Pair Programming, Settings, Log Out), signed-out Sign In / Create Account buttons.
- `shared/haml/help_button.haml`, `lib/cdo/help_header.rb` — Help menu contents (not enumerated in depth; feeds into the hamburger's help section).
- `config/global_editions/us.yml` (`header:` block, lines 3-260+) — the actual link data (title key, url, domain) for `top.signed_out`, `top.signed_out_marketing` (rebrand/marketing nav variant), `top.student`, `top.teacher`, and `hamburger.signed_out_marketing`, `hamburger.student`, `hamburger.teacher`. Per-region overrides live in sibling files (`ar.yml`, `in.yml`, etc.) consumed via `Cdo::GlobalEdition.region_config`.
- i18n: link titles are looked up as `I18n.t("nav.header.#{title_key}")` (or `nav.hamburger.` equivalents) — `loc_prefix` is `"nav.header."` for header, hamburger reuses the same prefix per `hamburger_options[:loc_prefix]`. English strings live under the `nav:` key in dashboard's locale yml (not fully resolved here; see `dashboard/config/locales/**/*.yml`, search key path `nav.header.<key>` per title above, e.g. `nav.header.my_dashboard`, `nav.header.course_catalog`).

Condition selection logic (`_header.html.haml` lines 19-35): `user_type` is `"teacher"`/`"student"`/`nil` from `current_user.teacher?`/`.student?`, or from the `_user_type` cookie when signed out. `marketing_nav` (codeai_next rebrand + region has a `signed_out_marketing` list + no user_type) swaps in the marketing link set and drops the `hide-*` visibility classes.

## Header top-nav items (signed out, default/us region), `top.signed_out` — us.yml:6-33
| label (i18n key) | href | shown when | source |
|---|---|---|---|
| learn | code.org/students | signed out, non-marketing nav | config/global_editions/us.yml:7-9 |
| teach | code.org/teach | signed out, non-marketing nav | us.yml:11-13 |
| districts | code.org/administrators | signed out, non-marketing nav | us.yml:15-17 |
| stats | code.org/promote | signed out, non-marketing nav | us.yml:19-21 |
| donate | code.org/donate | signed out, non-marketing nav | us.yml:23-25 |
| incubator | code.org/incubator | signed out, non-marketing nav | us.yml:27-29 |
| about | code.org/about | signed out, non-marketing nav | us.yml:31-33 |

## Header top-nav items (signed out, marketing/rebrand nav), `top.signed_out_marketing` — us.yml:36-66
| label | href | shown when | source |
|---|---|---|---|
| teachers | code.org/teachers | signed out AND `Cdo::Brand.codeai_next?` rebrand nav active AND region configures a marketing list | us.yml:37-39 |
| districts | code.org/districts | same | us.yml:41-43 |
| advocacy | https://advocacy.code.org | same | us.yml:45-46 |
| hour_of_ai | code.org/hour-of-ai | same | us.yml:48-50 |
| parents | code.org/parents | same | us.yml:52-54 |
| students | code.org/students | same | us.yml:56-58 |
| about | code.org/about | same | us.yml:60-62 |
| donate | code.org/donate | same | us.yml:64-66 |

## Header top-nav items (student), `top.student` — us.yml:69-84
| label | href | shown when | source |
|---|---|---|---|
| my_dashboard | studio.code.org/home | current_user.student? | us.yml:70-72 |
| course_catalog | code.org/students | student | us.yml:74-76 |
| project_gallery | studio.code.org/projects | student | us.yml:78-80 |
| incubator | code.org/incubator | student | us.yml:82-84 |

## Header top-nav items (teacher), `top.teacher` — us.yml:87-106
| label | href | shown when | source |
|---|---|---|---|
| my_dashboard | studio.code.org/home | current_user.teacher? | us.yml:88-90 |
| course_catalog | studio.code.org/catalog | teacher | us.yml:92-94 |
| project_gallery | studio.code.org/projects | teacher | us.yml:96-98 |
| professional_learning | studio.code.org/my-professional-learning | teacher | us.yml:100-102 |
| incubator | code.org/incubator | teacher | us.yml:104-106 |

Visibility note: when there are >5 links total, links past the first 3 get `hide-small-desktop` (collapse into hamburger on medium widths); otherwise all get `hide-mobile` (collapse only on mobile). (`lib/cdo/hamburger.rb:259-274`)

## Hamburger-only items (overflow / mobile menu) — us.yml:110-260+
Includes everything from the corresponding `top.*` list (re-shown with inverted visibility) PLUS, per `hamburger.<user_type>`:
- **signed_out_marketing**: `legal` (submenu: legal_privacy /privacy, legal_cookie_notice /cookies, legal_tos /terms-of-service) — us.yml:111-124
- **student**: learn, teach (submenu: educate_overview, course_catalog, educate_elementary, educate_middle, educate_high, hour_of_ai, educate_beyond, educate_community, educate_requirements, educate_tools), districts, stats, donate, incubator, about (submenu: about_us, about_leadership, about_donors, about_partners, about_team, about_news, about_jobs, about_contact, about_faqs), legal (submenu as above) — us.yml:126-224
- **teacher**: learn, teach (submenu incl. course_catalog -> studio.code.org/catalog), districts, stats, donate, incubator, about, legal — us.yml:228-260+ (truncated in this pass; mirrors student list with course_catalog pointed at studio.code.org/catalog)

Plus a Help section (`HelpHeader.get_help_contents`, `lib/cdo/help_header.rb` — not expanded here) shown between the teacher/student items and the Pegasus (marketing) items for signed-in users, and at the bottom for signed-out users.

## Signed-in user menu (`shared/haml/user_header.haml:88-112`)
| label | href | shown when | source |
|---|---|---|---|
| Create (+) dropdown | opens `.create_options` picker of project types, "View All" -> studio.code.org/projects | not on `/users/sign_up`, gated by `Cdo::GlobalEdition::DEFAULT_REGION` | user_header.haml:56-72 |
| My Projects | studio.code.org/projects | current_user present | user_header.haml:91 |
| My Scrapbook | studio.code.org/scrapbook | current_user present AND `student-scrapbook` experiment enabled (query param/localStorage; hidden by default via inline `display:none` + JS unhide) | user_header.haml:95, 133-158 |
| Pair Programming | `#` (JS-driven) | `current_user.can_pair?` | user_header.haml:98-113 |
| Settings | studio.code.org/users/edit | current_user present | user_header.haml:114 |
| Log Out | studio.code.org/users/sign_out | current_user present | user_header.haml:115 |

## Signed-out buttons (`shared/haml/user_header.haml:117-125`)
| label | href | shown when |
|---|---|---|
| Sign In | studio.code.org/users/sign_in | no current_user |
| Create Account | studio.code.org/users/sign_up/account_type | no current_user AND not already on `/users/sign_up` |

## 2. Home page

`HomeController#index` (`dashboard/app/controllers/home_controller.rb:64-80`) is the entry point behind the studio home URL. It never renders its own view: signed out it redirects to `/users/sign_in`; signed in, if the user is a student who should resume in-progress work (`should_redirect_to_script_overview?`, same file:108-117) it redirects straight to the script/course-unit overview page; otherwise it redirects to `home_path` (`/home`), handled by `HomeController#home` (same file:84-94). `#home` re-checks auth, redirects a teacher to `/teacher_dashboard/home` (owned by `TeacherDashboardController`, see section 3), otherwise calls `init_homepage` (same file:121-168) and renders `home/index.html.haml`, which renders `home/_homepage.html.haml` for a signed-in user. That partial emits a `<script data-homepage="...">` tag pointing at webpack entry `js/home/_homepage.js` and a `#homepage-container` mount div (`dashboard/app/views/home/_homepage.html.haml:1-22`). The entry (`apps/src/sites/studio/pages/home/_homepage.js:13-53`) mounts `StudentHomepage` (`apps/src/templates/studioHomepages/StudentHomepage.jsx`) — the comment on line 13-14 of that file is explicit that teachers are redirected before this ever renders, so this is a **student-only** page despite the generic controller name.

### 2.1 Signed-out visitor

There is no dedicated marketing/landing controller in `dashboard/`; a signed-out hit on `/` or `/home` redirects to Devise's sign-in page (`HomeController#index`/`#home`, both branches above), rendered by `dashboard/app/views/devise/sessions/new.html.haml` → `_login.html.haml`. That view is the effective signed-out "home".

| card/section | links to | condition | source file:line |
|---|---|---|---|
| Sign-in form (email/password, React `SignInPage` mounted on `#sign-in-page-layout`) | posts to `session_path` (Devise sessions#create) | always | `dashboard/app/views/devise/sessions/_login.html.haml:14-29` |
| "Sign up" button (in SignInPage data) | `users_sign_up_account_type_path` | `show_sign_up` = `devise_mapping.registerable?` (true) | same file:23-25 |
| "Forgot password" link (in SignInPage data) | `new_password_path` | `devise_mapping.recoverable?` | same file:26-27 |
| OAuth continue buttons: Google, Microsoft, Facebook, Clever, ClassLink | `omniauth_authorize_path(resource_name, provider)` (button_to, POST) | `devise_mapping.omniauthable?`; provider list is hardcoded | `dashboard/app/views/devise/shared/_oauth_links.haml:23-34` |
| "Already signed up? Sign in" link | `new_session_path(resource_name)` | shown unless `controller_name` is `sessions` or `registrations` (so not shown on this exact page) | same file:5-9 |
| Section-code entry (React, mounted `#section-code-entry-mount`) — join a section by code as a new student | form posts to `student_user_new_path` | `controller_name == 'sessions'` (true here) | same file:11-21 |
| "Try it without signing in" course blocks — Dance Party, Minecraft Aquatic, Oceans (English) / Frozen (non-English), Flappy (English) / Hour of Code (non-English) | each block's `url` from `CourseBlockHelper.get_tall_course_block(id, family_name)` (unresolved — depends on that helper's lookup, not read) | `@is_english` picks the 4-course list (course_blocks array differs by locale) | `dashboard/app/views/devise/sessions/_login.html.haml:38-47`; block rendering in `dashboard/app/views/shared/_course_tall_block.haml:1-17` |

Note: the code.org marketing home page proper (the public-facing "what is code.org" splash at the root domain) is served by `pegasus/`, out of scope per repo instructions ("ignore pegasus/ unless explicitly instructed"); the table above is the studio-side signed-out surface only.

### 2.2 Student (signed in, `/home`)

`StudentHomepage.jsx` (121 lines) renders, top to bottom:

| card/section | links to | condition | source file:line |
|---|---|---|---|
| `HeaderBanner` — heading "My Dashboard" (i18n `homepageHeading`) with hero background image | none (decorative banner) | always | `StudentHomepage.jsx:74-78`; i18n key resolved in `apps/i18n/common/en_us.json:1572` |
| Parental permission banner (`ParentalPermissionBanner`, passed via `topComponents`) | internal to that component (not traced) | `homepage_data[:parentalPermissionBanner]` present — server-computed in `parental_permission_banner_data` | `home_controller.rb:167`; `StudentHomepage.jsx:80` |
| Marketing announcement banner (`MarketingAnnouncementBanner`, region-overridable via `GlobalEditionWrapper`) | driven by CMS announcement content (unresolved) | `specialAnnouncement` present — `Announcements.get_localized_announcement_for_page("/student-home")` | `home_controller.rb:166`; `StudentHomepage.jsx:83-92` |
| "Student marked as verified teacher" warning notification | external support article `https://support.code.org/hc/en-us/articles/360023222371-...` | `showVerifiedTeacherWarning` — student account also carries `AUTHORIZED_TEACHER` permission | `home_controller.rb:136`; `StudentHomepage.jsx:93-102` |
| Feedback notification (`ParticipantFeedbackNotification`) | internal to that component (not traced) | `hasFeedback` — `TeacherFeedback.has_feedback?(current_user.id)` | `home_controller.rb:140`; `StudentHomepage.jsx:103-105` |
| "My Courses" section (`RecentCourses`, heading i18n `myCourses` = "My Courses") — top assigned course + up to 4 recent course cards + "see more" overflow | Top course: `linkToOverview` / `linkToLesson` = `script_path`/`script_next_path` or, if course modularity is enabled, `course_unit_path`/`course_unit_next_path` (`home_controller.rb:148-162`). Each `CourseCard`'s button ("View course", i18n `viewCourse`) uses `course.link` from `current_user.recent_student_courses` → `summarize_short` (not traced further) | `topCourse` present, or `courses` non-empty | `home_controller.rb:138,148-162`; `StudentHomepage.jsx:106-111`; `RecentCourses.jsx:44-79`; `CourseCard.jsx:20-46`; `TopCourse.jsx:47,57` |
| "Join a section" area (`JoinSectionArea`/`JoinSection`) — enter a section code to join a class | POSTs to `/api/v1/sections/require_captcha` then `/api/v1/sections/:code/join` (action, not a page link) | always rendered; also lists already-joined sections (`ParticipantSections`) | `StudentHomepage.jsx:112`; `JoinSection.jsx:29,58` |
| Projects widget (`ProjectWidgetWithData` → `ProjectWidget`) — "My Projects" gallery preview | "See all projects" link → `/projects` | `canViewFullList={true}` always passed here | `StudentHomepage.jsx:113-116`; `ProjectWidget.jsx:40` |

### 2.3 Teacher (signed in, `/teacher_dashboard/home`)

`TeacherDashboardController#show` renders `dashboard/app/views/teacher_dashboard/show.html.haml`, mounted by `apps/src/sites/studio/pages/teacher_dashboard/show.js`. That entry chooses between two top-level React trees (`show.js:97-109`): if the teacher has **zero** sections (and the `demo-section` experiment isn't enabled), it mounts `TeacherHomepage` (`apps/src/templates/studioHomepages/teacherHomepageV2/TeacherHomepage.tsx`) full-page; otherwise it mounts `TeacherNavigationRouter` (documented in section 3 of this doc). The rest of this table covers `TeacherHomepage.tsx`, i.e. the true "new/section-less teacher" home surface.

| card/section | links to | condition | source file:line |
|---|---|---|---|
| Welcome heading (i18n `welcomeWithoutName` = "Welcome", or a personalized variant) | none | always | `TeacherHomepage.tsx:339-341` |
| `TempRebrandBanner` | not traced | `showRebrandBanner` flag | `TeacherHomepage.tsx:344-346` |
| Personalization invitation alert (link text i18n `personalizationLinkText`) | `/users/personalization_information` | `shouldShowPersonalizationAlert` | `TeacherHomepage.tsx:348-361` |
| Teacher-verification alert ("Learn how to get verified") | `VERIFIED_TEACHER_SUPPORT_LINK` constant (not read; external support URL) | `shouldShowVerificationAlert` | `TeacherHomepage.tsx:362-370` |
| `Header` — "My Sections" area: Create-section button (opens `AddSectionDialog`), roster-sync action (POST `/api/v1/roster/clever/sections/sync`), archived/active segmented toggle | actions/dialogs, not page links | always | `TeacherHomepage.tsx:373-378`; `Header.tsx:60-90` |
| `CoteacherInviteNotification` | not traced (own component) | always rendered (`isForPl={false}`) | `TeacherHomepage.tsx:380-383` |
| `EmptyHomepage` — "It's a bit empty here..." / "You haven't created any class sections yet." (i18n `emptySectionHeadline`, `emptyClassSections`) | no link (illustration only, `button={null}`) | `numSections === 0` and not in demo-section mode | `TeacherHomepage.tsx:384-386`; `EmptyHomepage.tsx:15-35` |
| `OnboardingChecklist` | internal (not traced) | `showOnboardingChecklist` | `TeacherHomepage.tsx:390-396` |
| `SectionList` / `DemoSectionCard` | section cards route into the section-scoped teacher dashboard (`studioUrlPrefix`-relative; exact per-card href not resolved from these two files) | shown once `numSections > 0`, or in demo-section mode | `TeacherHomepage.tsx:397-425` |
| `TeacherPromotions` (right rail) — CMS-driven promo cards fetched from `/marketing/teacher/promotions/55R4y1NlZ0qJG9O0qgyq0Q` | `buttonTarget` per promo, sourced from Contentful (unresolved — server/CMS data, not in repo) | promo not previously dismissed (tracked in `localStorage` key `teacherPromotionClosed`) | `TeacherPromotions.tsx:16-17,33-45,110-125` |
| `PermanentPromotions` static card — "Grow your knowledge" / "Explore professional learning" | `/my-professional-learning` (opens in new tab) | always (hardcoded single entry) | `PermanentPromotions.tsx:11-27,40-43` |
| `TeacherHomepagePopups` | dialogs (not traced) | always mounted | `TeacherHomepage.tsx:428` |

i18n keys resolved against `apps/i18n/common/en_us.json`: `homepageHeading`→"My Dashboard", `myCourses`→"My Courses", `viewCourse`→"View course", `emptySectionHeadline`→"It's a bit empty here...", `emptyClassSections`→"You haven't created any class sections yet.", `welcomeWithoutName`→"Welcome". `signin.try_heading` (the "Try it without signing in" label on the sign-in page) is a Rails-side i18n key, not in `apps/i18n/common/en_us.json`, and was left unresolved.

## 3. Teacher dashboard navigation

The shell is `TeacherNavigationRouter` (`apps/src/templates/teacherNavigation/TeacherNavigationRouter.tsx`), a `react-router-dom` `createBrowserRouter` tree mounted at `/teacher_dashboard` (basename built from `TEACHER_NAVIGATION_BASE_URL`, `TeacherNavigationRouter.tsx:359-368`). It is bootstrapped by the webpack entry `apps/src/sites/studio/pages/teacher_dashboard/show.js`, which the Rails `TeacherDashboardController#show` action (`dashboard/app/controllers/teacher_dashboard_controller.rb`) serves via `dashboard/app/views/teacher_dashboard/show.html.haml` (`#teacher-dashboard` mount point, script tag `js/teacher_dashboard/show.js`). `show.js` picks between two top-level React trees: if the signed-in teacher has zero sections it renders `TeacherHomepage` directly; otherwise it renders `TeacherNavigationRouter`, whose `/sections/:sectionId/*` branch wraps every content route in `TeacherNavigationBar` (the actual sidebar, `apps/src/templates/teacherNavigation/TeacherNavigationBar.tsx`) plus `PageLayout`. Route path strings and their sidebar labels/icons live in `apps/src/templates/teacherNavigation/TeacherNavigationPaths.tsx` (`TEACHER_NAVIGATION_PATHS` / `LABELED_TEACHER_NAVIGATION_PATHS`); `TeacherNavigationBar` groups a subset of those keys into three sidebar sections (Course Content, Performance, Classroom) and renders each as a `SidebarOption` (`apps/src/templates/teacherNavigation/SidebarOption.tsx`).

| label | path | shown when | source file:line |
|---|---|---|---|
| Course (course overview) | `/teacher_dashboard/sections/:sectionId/courses/:courseVersionName?` | selected section has no unit assigned (no `unitName`) | `TeacherNavigationBar.tsx:117,123-124`; `TeacherNavigationPaths.tsx:120-125` |
| Course (unit overview, legacy) | `/teacher_dashboard/sections/:sectionId/unit/:unitName?` | selected section has a `unitName` AND `experiments.isEnabled(experiments.MODULARITY)` is false | `TeacherNavigationBar.tsx:117-122`; `TeacherNavigationPaths.tsx:132-137` |
| Course (nested unit overview) | `/teacher_dashboard/sections/:sectionId/courses/:courseVersionName/units/:unitPosition` | selected section has a `unitName` AND the `modularity` experiment is enabled (`experiments.MODULARITY`, `apps/src/util/experiments.js:49`) | `TeacherNavigationBar.tsx:117-119`; `TeacherNavigationPaths.tsx:126-131` |
| Lesson Materials | `.../materials` | always shown (Course Content group) | `TeacherNavigationBar.tsx:119,121,124,150` |
| Calendar | `.../calendar` | always shown (Course Content group) | same |
| Progress | `.../progress` | always shown (Performance group); also the redirect target for the bare section URL and any unmatched sub-path | `TeacherNavigationBar.tsx:129-137,154`; `TeacherNavigationRouter.tsx:152-170` |
| Assessments | `.../assessments` | always shown (Performance group) | `TeacherNavigationBar.tsx:129-137` |
| Student Projects | `.../projects` | always shown (Performance group) | same |
| Stats | `.../stats` | always shown (Performance group) | same |
| Text Responses | `.../text_responses` | always shown (Performance group) | same |
| Student Snapshot | `.../student_snapshot` | always shown (Performance group); carries a static "Beta" tag in the UI, not flag-gated | `TeacherNavigationBar.tsx:136`; `TeacherNavigationPaths.tsx:156-162` |
| Roster | `.../roster` | always shown (Classroom group) | `TeacherNavigationBar.tsx:140-141,158` |
| Settings | `.../settings` | always shown (Classroom group) | same |
| AI Settings | `.../ai_chat_settings` | Classroom group, shown when `showAiChatSettings` — passed down as `!!selectedSection`, i.e. effectively always once a section is selected; a red error dot is added when `shouldShowAiChatEssentialAlert(...)` is true for the section/teacher's AI chat access levels | `TeacherNavigationRouter.tsx:100-103`; `TeacherNavigationBar.tsx:142-145,221-235`; route-level fallback redirects to Progress if `showAiChatSettings` is false, `TeacherNavigationRouter.tsx:324-335` |
| Skills (In Development) | `.../skills_in_dev` | route only registered when `DCDO.get('skills-dashboard', false)` is true; the key is **not** included in any of `courseContentKeys` / `defaultPerformanceContentKeys` / `classroomContentKeys`, so even with the flag on it never appears in the sidebar — reachable only by typing the URL directly | `TeacherNavigationRouter.tsx:336-341`; `TeacherNavigationPaths.tsx:26,150-155` |
| Login Info | `.../login_info` | route exists but is deliberately excluded from the sidebar ("this is not part of the navigation sidebar so it doesn't need a label or icon") — reached from elsewhere in the UI (e.g. a section card action), not the nav bar | `TeacherNavigationPaths.tsx:101-107`; `TeacherNavigationRouter.tsx:175-183` |
| Teacher home page | `/teacher_dashboard/home` | a separate top-level route rendered *without* the sidebar (`TeacherNavigationBar` is only mounted under `/sections/*`); it's also the entire page shown to a teacher with zero sections, bypassing the router altogether | `TeacherNavigationRouter.tsx:120-136`; `apps/src/sites/studio/pages/teacher_dashboard/show.js:99-110` |
| (legacy redirect) manage_students → Roster | `.../manage_students` | old bookmarked URL, immediately `<Navigate>`s to `roster` | `TeacherNavigationRouter.tsx:313-322` |

Notes:
- `SimpleDropdown` at the top of `TeacherNavigationBar` is the class-section switcher (label "Class Sections", `i18n.classSections()`), not a nav tab itself, but it drives which section's tabs are being viewed and re-navigates to the equivalent tab for the newly chosen section (`navigateToDifferentSection`, `TeacherNavigationBar.tsx:162-204`).
- No `DCDO.get` calls appear in `TeacherNavigationBar.tsx` itself; the only DCDO check in this shell is the `skills-dashboard` flag in `TeacherNavigationRouter.tsx:336`, gating route registration only (see Skills row above). A second, unrelated DCDO flag (`hide-teacher-dashboard-logo-animation`) in `dashboard/app/views/teacher_dashboard/show.html.haml` only toggles a logo-morph animation, not nav content.
- i18n keys resolved against `apps/i18n/common/en_us.json`: `progress`→"Progress", `teacherTabStatsTextResponses`→"Text Responses", `assessments`→"Assessments", `studentProjects`→"Student Projects", `teacherTabStats`→"Stats", `roster`→"Roster", `loginInfo`→"Login Info", `lessonMaterials`→"Lesson Materials", `calendar`→"Calendar", `course`→"Course", `settings`→"Settings", `aiSettings`→"AI Settings", `classSections`→"Class Sections", `courseContent`→"Course Content", `performance`→"Performance", `classroom`→"Classroom", `teacherHomePage`→"Teacher home page". "Skills (In Development)" and "Student Snapshot" are hardcoded English strings in `TeacherNavigationPaths.tsx`, not i18n keys.

## 4. Account / settings pages

### Route and controller

`GET /users/edit` -> `RegistrationsController#edit` (`dashboard/app/controllers/registrations_controller.rb:454`), a `Devise::RegistrationsController` subclass (`registrations_controller.rb:9`), registered ahead of the devise route block at `dashboard/config/routes.rb:329` (`devise_for :users, controllers: {registrations: 'registrations'}` at `routes.rb:331`). `authenticate_scope!` is a `prepend_before_action` on `:edit` (`registrations_controller.rb:14`), so the action 404/redirects an unauthenticated visitor before rendering.

Related mutation endpoints on the same controller, each backing one settings widget below:
- `PATCH /dashboardapi/users` -> `#update` (`registrations_controller.rb:121`, `routes.rb:315`) — main account-information form
- `PATCH /users/email` -> `#set_email` (`routes.rb:318`)
- `PATCH /users/parent_email` -> `#set_parent_email` (`routes.rb:319`)
- `PATCH /users/user_type` -> `#set_user_type` (`routes.rb:320`)
- `PATCH /users/upgrade` -> `#upgrade` (`routes.rb:316`)

### View and React mount (production UI — legacy `apps/`)

Template: `dashboard/app/views/devise/registrations/edit.html.haml`. It is a shell of `<div id="...">` mount points plus a few native `form_for` forms (for password/email/parent-email/user-type submissions), each hydrated by `apps/src/sites/studio/pages/devise/registrations/edit.js`, which reads `getScriptData('edit')` (JSON blob built in the haml's `script_data` local, `edit.html.haml:186-232`) and mounts one React component per `#id`. Components live under `apps/src/accounts/` (module referenced directly in `AGENTS.md` as prior art). This is the current production `/users/edit` UI.

### Newer UI (experimental, not yet production)

`frontend/packages/users` is a standalone "My Account" package (`README.md`: *"the Account Details page ... Consumed by the Studio app (apps/studio), which lazy-loads it at /users/edit"*). It is wired into `frontend/apps/studio/src/routes/users/edit.tsx`, which lazy-imports `@code-dot-org/users`'s default export `UsersSettingsPage`. Sections live under `frontend/packages/users/src/sections/`: `MyInformation.tsx`, `LoginInformation.tsx`, `ParentGuardianEmail.tsx`, `UsersActions.tsx`.

Condition: `frontend/apps/studio` is explicitly the **experimental** host app (`frontend/apps/studio/README.md:3`: *"Studio is the experimental host React application ... The current frontend is called apps"*), served entirely under the `/frontend-studio/` path prefix (both dev modes and production), not at the bare `/users/edit` studio.code.org path — so today's real `/users/edit` traffic still hits the legacy `apps/` UI described above; the `frontend/packages/users` page is reachable only via `/frontend-studio/users/edit`.

### Settings sections / tabs

| section | controls | source file:line |
|---|---|---|
| Account edit header (title + back link) | page chrome only | `apps/src/accounts/AccountEditHeader.jsx`; mounted at `edit.js:52-64`, `#account-edit-header` (`edit.html.haml:12`) |
| Migrate to multi-auth banner | prompts pre-migration users to upgrade auth; links to `migrate_to_multi_auth` action | `apps/src/accounts/MigrateToMultiAuth.jsx`; mount `edit.js:67-79`; controller action `registrations_controller.rb:440` |
| Account Information | display name (`user[name]`), first/last name (`user[given_name]`/`user[family_name]`), username (`user[username]`), educator role dropdown, facilitator bio, email (`user[email]`) + "update email" modal, new password / password confirmation / current password, student age dropdown (`user[age]`), gender (optional, `user[gender_student_input]`, gated by `showGenderInput` experiment), US state dropdown (`user[us_state]`) | `apps/src/accounts/AccountInformation/index.tsx:292-624`; mount `#account-information` (`edit.html.haml:22`), `edit.js:82-92`; submits to `PATCH /dashboardapi/users` |
| School Information | school country/name/zip/type via `SchoolDataInputs`; hidden for students | `apps/src/accounts/SchoolInformation/index.tsx:112-159`; mount `#school-information` (`edit.html.haml:25`), `edit.js:95-105` |
| Add password (migrated users only) | sets a password for accounts without one | `apps/src/accounts/AddPasswordController.js`; mount `#add-password-fields`, gated by `current_user.should_see_add_password_form?` (`edit.html.haml:28`); posts to `/users` via hidden `#add-password-form` |
| For Parents and Guardians (students only) | link/update/remove a parent email; "Update"/"Remove" links wired to `AddParentEmailController`/`RemoveParentEmailController` | `apps/src/accounts/ForParentsAndGuardians.jsx`; mount `#add-parent-email` (`edit.html.haml:44-59`), controllers `edit.js:108-149`; submits `PATCH /users/parent_email` |
| LTI section-sync settings (LTI teachers only) | toggle `lti_roster_sync_enabled` | `apps/src/accounts/LtiRosterSyncSettings.jsx`; mount `#lti-sync-settings` (`edit.html.haml:63-70`), gated on `current_user.teacher? && Policies::Lti.lti?(current_user)`; submits via `#lti-sync-settings-form` (`PUT registration_path`) |
| Lockout / linked-accounts (Child Account Protection) | shows parent-permission status, pending request date, provider list for underage/locked-out students | `apps/src/templates/policy_compliance/LockoutLinkedAccounts.jsx`; mount `#lockout-linked-accounts` (`edit.html.haml:72-82`), gated on `!@personal_account_linking_enabled \|\| ComplianceState.permission_granted?` |
| Manage Linked Accounts | list/disconnect SSO providers: Google, Microsoft, Facebook, Clever, ClassLink, LTI (`i18n` keys `manageLinkedAccounts_*`); blocks disconnect when student is in a Google Classroom/Clever-managed section | `apps/src/accounts/ManageLinkedAccounts.jsx:151-252` via `ManageLinkedAccountsController.js`; mount `#manage-linked-accounts` (`edit.html.haml:84-86`), gated `current_user.migrated? && !Policies::Lti.restricted_user?` |
| Turn off AI teaching assistant (teachers only) | toggles AI differentiation feature per teacher | `apps/src/accounts/TurnOffAiDiff.tsx`; mount `#turn-off-ai-diff` (`edit.html.haml:88-89`), gated on `current_user.teacher?` **and** `experiments.isEnabled('ai-differentiation')` (`edit.js:222-234`) |
| Create Personal Login (student self-service upgrade) | username/password/secret-words/parent-email flow to attach a personal login to a managed account | `apps/src/accounts/CreatePersonalLogin.tsx`; mount `#create-personal-login` (`edit.html.haml:91-115`), gated on `current_user.can_create_personal_login?`; posts `PATCH /users/upgrade` |
| Change account type | dropdown to change own `user_type` (e.g. student -> teacher) | `apps/src/accounts/ChangeUserTypeSection.jsx`; mount `#change-user-type` (`edit.html.haml:118-135`), gated on `resource.can_change_own_user_type?`; submits `PATCH /users/user_type` |
| Expire other sessions | signs out all other active sessions | `apps/src/accounts/ExpireOtherSessions.jsx`; mount `#expire-other-sessions` (`edit.html.haml:138`), always rendered; posts to `expire_other_path` |
| Delete account | deletes own account, or shows a "managed account" notice if teacher-managed | `apps/src/accounts/DeleteAccount.jsx` (+`DeleteAccountDialog.jsx`); mount `#delete-account` (`edit.html.haml:140-146`), `canDelete` driven by `current_user.can_delete_own_account?` |
| Change email (modal, hidden form) | async email change with CSRF-safe hidden form, backing the "update email" link in Account Information | hidden `form_for` at `edit.html.haml:152-163`, id `#change-email-modal-form`; submits `PATCH /users/email`, gated on `resource.can_edit_email?` |
| Parent-email add/remove (hidden forms) | backing forms for the "For Parents and Guardians" section | `edit.html.haml:166-179`, ids `#add-parent-email-modal-form` / `#remove-parent-email-form`, gated on `resource.student?` |

### Newer `frontend/packages/users` sections (experimental, `/frontend-studio/users/edit` only)

| section | controls | source file:line |
|---|---|---|
| My Information | display name, first/last name, gender (optional) | `frontend/packages/users/src/sections/MyInformation.tsx:35-109` |
| Login Information | username, email address, password | `frontend/packages/users/src/sections/LoginInformation.tsx:44-114` |
| Parent/Guardian Email | linked parent email management | `frontend/packages/users/src/sections/ParentGuardianEmail.tsx` |
| Account actions | account-type dropdown, delete-account modal | `frontend/packages/users/src/sections/UsersActions.tsx:30-104` |

## 5. Footer and legal links

`dashboard/app/views/layouts/_footer.html.haml` (full footer) builds its link list dynamically via `Cdo::Footer.get_footer_contents` (`lib/cdo/footer.rb:9-40`), reading the `footer.links.studio` array out of the active Global Edition region config — default is `config/global_editions/us.yml:385-403`. Each link's label comes from `I18n.t("footer.<key>")` (or `landing.<key>` for `help_support`), so exact copy lives in locale files, not the haml. `_small_footer.html.haml` instead mounts a React component (`js/layouts/_small_footer.js`) with a "more" menu and no hardcoded links of its own (`menuItems: []`).

| label (i18n key) | href | source file:line |
|---|---|---|
| `footer.privacy` | `code.org/privacy` | `config/global_editions/us.yml:389-393` |
| `footer.cookie_notice` | `code.org/cookies` | `config/global_editions/us.yml:394-396` |
| `footer.translate` | `code.org/translate` | `config/global_editions/us.yml:397-399` |
| `landing.help_support` | `https://support.code.org` (opens in new tab) | `config/global_editions/us.yml:400-403` |
| `footer.tos_short` | `code.org/terms-of-service` | `config/global_editions/us.yml:404-405` |
| `footer.help_from_html_old` (sanitized inline HTML) | n/a (static fine-print text) | `dashboard/app/views/layouts/_footer.html.haml:23` |
| `footer.art_from_html_old` (sanitized inline HTML) | n/a (static fine-print text) | `dashboard/app/views/layouts/_footer.html.haml:25` |
| `footer.built_on_github` (sanitized inline HTML) | n/a (static fine-print text) | `dashboard/app/views/layouts/_footer.html.haml:29` |
| "Powered by AWS Cloud Computing" (image link, not i18n) | `https://aws.amazon.com/what-is-cloud-computing` | `dashboard/app/views/layouts/_footer.html.haml:30-32` |
| Locale selector (`footer.locale_select`) | posts to `locale_url` | `dashboard/app/views/layouts/_footer.html.haml:37-40` |

Note: when `DCDO.get('recent_privacy_policy_update', nil)` is set, the `privacy` link's key swaps to `privacy_updated` (`lib/cdo/footer.rb:22-25`), changing its label/copy without changing its URL.

## 6. Emails that deep-link into the product

All mailers below inherit from `dashboard/app/mailers/application_mailer.rb`
(`ApplicationMailer < ActionMailer::Base`, just mixes in `ActionMailerMetrics`
— no shared views or deep-link behavior lives there).

## FollowerMailer (`dashboard/app/mailers/follower_mailer.rb`)

Only one live method. Three templates exist under
`dashboard/app/views/follower_mailer/` (`invite_new_student`,
`invite_student`, `teacher_disassociated_notify_student`) with no
corresponding method in the mailer class and no callers anywhere in
`dashboard/app` — orphaned, not wired to any current send path.

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `student_disassociated_notify_teacher` (`student_disassociated_notify_teacher.html.erb`) | teacher | a student removes themself from the teacher's section (self-service unenroll) | none — body mentions the `/join` URL as plain text, not a link | `dashboard/app/models/sections/section.rb:551` |

## InactiveUserPurgeMailer (`dashboard/app/mailers/inactive_user_purge_mailer.rb`)

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `teacher_inactivity_soft_delete_warning_email` (`teacher_inactivity_soft_delete_warning_email.html.haml`) | teacher | intended: warn a teacher 30 days before soft-deletion for 3-year inactivity | none — no `_url`/`_path`, just a support mailto link | not called from any production code path; only referenced from `dashboard/test/mailers/inactive_user_purge_mailer_test.rb` and `dashboard/test/mailers/previews/inactive_user_purge_mailer_preview.rb` |

## LtiMailer (`dashboard/app/mailers/lti_mailer.rb`)

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `lti_integration_confirmation` (`lti_integration_confirmation.html.haml`) | LMS admin | admin creates an LTI integration | `@catalog_url = CDO.studio_url('/catalog')`, interpolated into the I18n body as `course_offering_url` | `dashboard/app/controllers/lti/v1/integrations_controller.rb:48` |

## ParentMailer (`dashboard/app/mailers/parent_mailer.rb`)

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `student_associated_with_parent_email` (`student_associated_with_parent_email.html.haml`) | parent | student upgrades to username/password account and adds a parent email | `https://studio.code.org/home`, `https://studio.code.org/projects/public` (hardcoded, not `CDO.studio_url`) | `dashboard/app/controllers/registrations_controller.rb:334` |
| `parent_email_added_to_student_account` (`parent_email_added_to_student_account.haml`) | parent | a parent email is added to an existing student account | `https://studio.code.org/projects/public` (hardcoded) | `dashboard/app/controllers/registrations_controller.rb:182,371` |
| `parent_permission_request` (`parent_permission_request.html.haml`) | parent | student under 13 signs up; COPPA permission needed | `@permission_url` (passed in by caller, a signed permission-grant link) | not found under `dashboard/app` (no `ParentMailer.parent_permission_request` call site in-repo — likely invoked from a service/job outside the grepped set, or currently dormant) |
| `parent_permission_reminder` (`parent_permission_reminder.html.haml`) | parent | reminder — permission not yet granted | `@permission_url` (same as above) | not found under `dashboard/app` |
| `parent_permission_confirmation` (`parent_permission_confirmation.html.haml`) | parent | parent has granted COPPA permission | none — legal/support links only (ToS, privacy policy, support mailto) | not found under `dashboard/app` |

Note: `parent_permission_request`/`parent_permission_reminder`/`parent_permission_confirmation` have no call sites under `dashboard/app` matched by `ParentMailer\.` — either triggered from a path outside that grep scope (e.g. a background job class name that doesn't literally read `ParentMailer.`) or currently unused; worth a follow-up grep on `permission_url` / `ChildAccount` flows if this matters.

## PeerReviewMailer (`dashboard/app/mailers/peer_review_mailer.rb`)

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `review_completed_receipt` (`review_completed_receipt.html.haml`) | student/submitter (`peer_review.submitter`) | a peer review of the student's submission is completed | `CDO.studio_url(@peer_review.submission_path)` — links "Log in to CodeAI to see your results." | `dashboard/app/models/peer_review.rb:83` |

## PlaceholderMailer (`dashboard/app/mailers/placeholder_mailer.rb`)

Test/dev scaffolding only ("placeholder mailer initially used to test out active job... can delete this file"). `placeholder_email` has no deep-link and no production caller. Skip for product cataloging purposes.

## TeacherMailer (`dashboard/app/mailers/teacher_mailer.rb`)

| method (template) | recipient | trigger event | deep-link URL(s) | source file:line |
|---|---|---|---|---|
| `delete_teacher_email` (`delete_teacher_email.html.haml`) | teacher | teacher self-deletes their account (cascades to dependent students) | none — plain text, support-email mention only | `dashboard/app/controllers/registrations_controller.rb:248` |
| `verified_teacher_email` (`verified_teacher_email.haml`) | teacher | teacher's account gets the "verified teacher" permission granted | none (`_url`/`_path` only appear for static images via `CDO.studio_url(image_url(...))`); external forum/curriculum links only | `dashboard/app/models/user_permission.rb:73` |
| `hoc_tutorial_email` (`hour_of_code_tutorial_email.html.haml`) | prospective/potential teacher (pre-account, arbitrary name+email from a form) | someone signs up for Hour-of-Code tutorial info via the "potential teachers" form | `CDO.studio_url('/users/sign_up/account_type')`, `CDO.studio_url('/home?openAddSectionDialog=true&participantType=student')`, `CDO.studio_url('/catalog?marketingInitiative=hoc')`, `CDO.studio_url(@lesson_plan_html_url)`, `CDO.studio_url('/certificates/batch')`, `CDO.studio_url('/catalog')` | `dashboard/app/controllers/potential_teachers_controller.rb:29` |

---

### PD (professional-development workshop) mailers — terse coverage

These are internal-facing teacher/facilitator/regional-partner workshop
logistics emails, not core student/teacher product flows. Listed for
completeness per the cataloging request, kept brief.

## Pd::RegionalPartnerMiniContactMailer (`dashboard/app/mailers/pd/regional_partner_mini_contact_mailer.rb`)

3 methods: `matched`, `unmatched`, `receipt` — all triggered from
`dashboard/app/models/pd/regional_partner_mini_contact.rb:54,57` when a
"contact a regional partner" form is submitted (matched vs. unmatched to a
program manager). Recipients: program manager (`matched`) or the form
submitter (`unmatched`, `receipt`). Deep-links are mostly `code.org` marketing
pages (`CDO.code_org_url('educate/professional-learning/contact-regional-partner', ...)`,
`CDO.code_org_url('/educate/professional-learning', ...)`); one studio
deep-link: `CDO.studio_url('/courses')` in `receipt.html.haml`.

## Pd::WorkshopMailer (`dashboard/app/mailers/pd/workshop_mailer.rb`)

12 live methods (`teacher_survey_reminder` and `teacher_follow_up` are
defined but have no caller anywhere under `dashboard/` — dead code).
Recipients split across teacher (enrollee), facilitator, and organizer
(workshop admin). Triggers are workshop lifecycle events fired from
`dashboard/app/models/pd/workshop.rb` (enrollment/cancellation reminders at
3/10 days out via `send_reminder_for_upcoming_in_days`, run from a cron rake
task; `send_reminder_to_close`; `teacher_pre_workshop_csa`) and from
enrollment/detail-change controller actions
(`dashboard/app/controllers/api/v1/pd/workshop_enrollments_controller.rb:85-138`,
`dashboard/app/controllers/api/v1/pd/workshops_controller.rb:300-302`).
Deep-links: `@workshop.workshop_dashboard_url` (organizer/facilitator
receipts), `@cancel_url = url_for(controller: 'pd/workshop_enrollment',
action: :cancel, code: enrollment.code)` (teacher cancel link, built in
`teacher_enrollment_receipt`), `CDO.studio_url("/pd/workshop_dashboard/workshops/#{@workshop.id}")`
(`organizer_should_close_reminder`, `organizer_cancel_receipt`).

## Pd::WorkshopMailjetMailer (`dashboard/app/mailers/pd/workshop_mailjet_mailer.rb`)

Not an `ActionMailer` — a plain class (`class Pd::WorkshopMailjetMailer`,
no Rails view templates) that calls the Mailjet API directly
(`lib/cdo/mailjet`) with externally-hosted email templates; deep-link URLs
are passed as `email_vars` instead of rendered in a Rails view. 6 methods:
`send_teacher_workshop_reminder`, `send_rp_workshop_reminder`,
`send_teacher_workshop_detail_change_notification`,
`send_rp_workshop_detail_change_notification`,
`send_teacher_post_workshop_survey`, `send_facilitator_post_workshop_survey`.
Recipients: enrolled teacher, regional partner contact, or facilitator.
Triggered from `dashboard/app/models/pd/workshop.rb` (reminders, detail-change
notifications, and `send_exit_surveys` at workshop close) and
`dashboard/app/controllers/api/v1/pd/workshops_controller.rb:291-303` (detail
change). Deep-links seen in `send_teacher_post_workshop_survey`'s
`email_vars`: `enrollment.exit_survey_url` and
`CDO.studio_url("/pd/generate_workshop_certificate/#{enrollment.code}")`.

## Pd::Application::TeacherApplicationMailer (`dashboard/app/mailers/pd/application/teacher_application_mailer.rb`)

12 methods (`confirmation`, `admin_approval_teacher_reminder`,
`needs_admin_approval`, `admin_approval`, `admin_approval_completed`,
`admin_approval_completed_partner`, `admin_approval_completed_teacher_receipt`,
`accepted`, `registration_reminder`, `complete_application_initial_reminder`,
`complete_application_final_reminder`, `declined`), all invoked
dynamically via `TeacherApplicationMailer.send(email.email_type,
self).deliver_now` from `dashboard/app/models/pd/application/teacher_application.rb:420`
(`deliver_email`, called from `Pd::Application::Email.send!` — `email_type`
maps 1:1 to a mailer method name). Recipient: the applying teacher (and, for
approval-flow methods, the school admin/principal or regional partner).
Deep-links: `@application.principal_approval_url` (admin approval templates),
hardcoded `https://studio.code.org/professional-learning/workshops/#{@application.workshop.id}`
(`accepted`, `registration_reminder`), hardcoded
`https://studio.code.org/pd/application/teacher`
(`complete_application_initial_reminder`, `complete_application_final_reminder`),
`CDO.studio_url("/pd/application_dashboard/#{@application.id}")`
(`admin_approval_completed_partner`).

## 7. Levelbuilder navigation

A curriculum author (`current_user.levelbuilder?` true) sees an extra-links
box injected into several pages, gated by that same predicate. The header's
`levelbuilder-header` CSS class (from `rack_env?(:levelbuilder)` in
`dashboard/app/views/layouts/_header.html.haml`) marks a whole environment as
a levelbuilder box, but on any environment the per-page links below only
render for a user with the `levelbuilder?` permission.

| label | path pattern | shown when | source file:line |
|---|---|---|---|
| Videos | `videos_path` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:3` |
| Images | `/images/new` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:4` |
| Scripts (+ Update all) | `scripts_path` / `scripts_path(rake: '1')` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:6-7` |
| Courses | `all_courses_path` (→ `CoursesController#all`) | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:8` |
| Manage (levels) | `levels_path` (`t('builder.manage')`) | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:9` |
| Block Pools | `pools_path` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:10` |
| Shared Functions | `shared_blockly_functions_path` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:11` |
| Helper Libraries | `libraries_path` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:12` |
| Gallery | `projects/public` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:13` |
| Foorm Surveys (preview) | `foorm/forms/editor` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:14` |
| (BETA) Sprite Lab Sprite Management | `sprites` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:15` |
| Helpful Links | `helpful_links_path` | `current_user.levelbuilder?` | `dashboard/app/views/home/_levelbuilder.html.haml:16` |
| Edit (unit) | `edit_course_path(unit_group)` | `current_user.try(:levelbuilder?)` and `Rails.application.config.levelbuilder_mode` | `dashboard/app/views/courses/show.html.haml:24-29` |
| Unit levels/instructions box | (in-page extra-links list of the unit's levels) | `current_user.try(:levelbuilder?)` | `dashboard/app/views/scripts/show.html.haml:39-41` |
| Level admin box (edit level) | `level_path(@level)` | `current_user.levelbuilder?` (or `project_validator?` / editor experiment) | `dashboard/app/views/levels/_admin.html.haml:1-5` |

This "extra links" box is rendered via the shared `shared/extra_links` layout
partial and appears on `home/index` (`dashboard/app/views/home/index.html.haml:38`
renders `home/_levelbuilder`), plus on course, unit (script), and level show
pages, so the same gating check shows author-only navigation at each level of
the content hierarchy rather than only from one home menu.

Overall authoring flow: dashboard home (`/home`) → **Courses** link
(`all_courses_path`, `CoursesController#all`, authorized via
`authorize! :manage, UnitGroup`) lists every `UnitGroup` → clicking a course
name opens the course/unit-group overview page (`course_path`), whose
levelbuilder extra-links box offers **Edit** (`edit_course_path`, gated
additionally by `Rails.application.config.levelbuilder_mode`) for the unit
group itself, or a link straight to a unit (`Unit`/"script") within it → the
unit's show page (`scripts_path`/`script_path`, `ScriptsController#show`)
carries its own levelbuilder box listing every level/lesson in that unit, and
`ScriptsController#edit` opens the unit/script editor (`edit_script_path`)
used to add/reorder lessons → within a unit, `LessonsController#edit` opens
the lesson editor, and from there (or from the unit's level list) a
particular level's show page (`level_path`) surfaces `levels/_admin.html.haml`,
whose own extra-links box is the jumping-off point to edit that level's
content (level editor, blocks editor via `LevelsController#edit`/`#edit_blocks`).
Separately, `levels_path` (`LevelsController#index`, labeled "Manage" via
`t('builder.manage')`) is a flat, filterable search across all levels
(by name, type, script, owner) rather than following the course→unit→lesson
hierarchy.

## 8. Curriculum catalog / course pages

| label | path | source |
|---|---|---|
| Curriculum catalog | `GET /catalog` | `dashboard/app/controllers/curriculum_catalog_controller.rb:2-3` (`CurriculumCatalogController#index`) |
| Catalog course card (React) | `pathToCourse` from `course_version_path` | `apps/src/templates/curriculumCatalog/CurriculumCatalog.jsx:217,247`, rendered by `apps/src/templates/curriculumCatalog/CurriculumCatalogCard.jsx:385,414` |
| Self-paced PL variant of a course | `self_paced_pl_course_offering_path` | `apps/src/templates/curriculumCatalog/CurriculumCatalog.jsx:229,259` |

`CurriculumCatalogController#index` (`dashboard/app/controllers/curriculum_catalog_controller.rb`)
builds `@catalog_data.curriculaData` from
`CourseOffering.assignable_published_for_students_course_offerings`, mapping
each `CourseOffering` through `summarize_for_catalog` (`dashboard/app/models/course_offering.rb:416-444`).
That summary is what the React catalog (`apps/src/templates/curriculumCatalog/CurriculumCatalog.jsx`)
renders as cards; it also carries teacher-only fields (`@is_teacher`,
`@sections_for_teacher`) used to let a signed-in teacher assign a course to a
section straight from the catalog card, and `@is_signed_out` to gate that
assignment flow behind a sign-in prompt (`noSectionsToAssignDialogs.jsx`).

Each card's `course_version_path` is `course_offering.path_to_latest_published_version`
(`dashboard/app/models/course_offering.rb:162-165`), which resolves to
`latest_published_version.content_root.link` — i.e. the content root's own
`link` method: a `UnitGroup#link` returns `course_path(self)`
(`dashboard/app/models/unit_group.rb:403-405`) for a multi-unit course, or a
`Unit#link` returns `script_path(self)` (or `course_unit_path` under the
modularity policy) for a single-unit course
(`dashboard/app/models/unit.rb:585-590`).

From there, the course/unit-group overview page
(`apps/src/templates/courseOverview/CourseOverview.js`, backed by
`CoursesController#show`) lists the course's units and links onward to each
unit's own overview; a unit (script) overview page lists its lessons
(`apps/src/templates/lessonOverview/LessonOverview.jsx`) and each lesson
lists its levels/puzzles as progress bubbles
(`apps/src/templates/progress/ProgressBubble.jsx`, using a `level.url` built
server-side). That per-level URL comes from
`LevelsHelper#build_script_level_path` (`dashboard/app/helpers/levels_helper.rb:44-67`),
which picks one of two URL families:
- legacy/non-modular: `/s/:script_name/:lesson_position/:script_level_position`
  (`script_lesson_script_level_path`, see `build_script_level_path_deprecated`
  at `dashboard/app/helpers/levels_helper.rb:18-39`)
- modular course units (`Policies::Courses.modularity_enabled?` true):
  `/courses/:unit_group/units/:unit_position/lessons/:lesson_position/levels/:script_level_position`
  (`course_unit_lesson_script_level_path`)

Click path summary: **catalog** (`/catalog`) → **course/unit-group overview**
(`/courses/:course_name` for a multi-unit course, or straight to
`/s/:script_name` for a single-unit course) → **lesson**, reached by
scrolling/clicking within the unit overview's lesson list (no separate lesson
URL segment in the legacy pattern; lesson position becomes part of the level
URL) → **level/puzzle**, at `/s/:script_name/:lesson_position/:level_position`
(legacy) or `/courses/:unit_group/units/:n/lessons/:lesson_position/levels/:level_position`
(modular course units).
