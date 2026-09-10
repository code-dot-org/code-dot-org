# Cucumber UI-test inventory (dashboard/test/ui/features)

Generated from a grep-based scan of `dashboard/test/ui/features/**/*.feature` on 2026-09-09.

**Totals: 270 feature files, 750 scenarios (incl. Scenario Outline).**


## 1. Distinct tag vocabulary

| Tag | Count | Meaning |
|---|---|---|
| `@no_mobile` | 197 | skip on mobile browsers (iPad/iPhone Safari) |
| `@eyes` | 109 | Applitools visual-regression (screenshot diff) test |
| `@as_student` | 68 | run authenticated as a student user |
| `@playwright` | 44 | ported to / dual-run under Playwright (not just Cucumber+Selenium) |
| `@skip` | 32 | temporarily disabled, not run |
| `@chrome` | 23 | restrict to Chrome only |
| `@dashboard_db_access` | 20 | needs direct DB access (dashboard) not available in all environments |
| `@no_safari` | 18 | skip on Safari |
| `@single_session` | 16 | must run in isolation, not parallel with other browser sessions |
| `@no_ci` | 14 | skip in CI (Drone) |
| `@no_firefox` | 11 | skip on Firefox |
| `@as_taught_student` | 9 | run as a student who is a member of a section taught by a teacher |
| `@only_mobile` | 8 | run only on mobile browsers |
| `@no_phone` | 5 | skip on phone-sized/emulated devices |
| `@properties_encryption_key` | 5 | needs the properties-encryption secret key configured |
| `@eyes_mobile` | 4 | Applitools visual-regression test targeting mobile viewport |
| `@as_teacher` | 4 | run authenticated as a teacher user |
| `@cloudfront_key` | 2 | needs CloudFront signing key configured |
| `@as_young_student` | 2 | run as a student under the age-gated / young-student policy |
| `@only_phone` | 2 | run only on phone-sized devices |
| `@contentful_key` | 2 | needs Contentful CMS API key configured |
| `@no_chrome` | 1 | skip on Chrome |
| `@webpurify` | 1 | needs WebPurify profanity-filter API key configured |
| `@as_authorized_taught_student` | 1 | run as a taught student who has been authorized (e.g. parental permission granted) |
| `@no_device_farm` | 1 | skip when running against AWS Device Farm |

## 2. Per-feature-file listing

Format: `path | Feature: title | tags | role | area | N scenarios`, followed by an indented scenario list.


### (loose top-level)/

- `dashboard/test/ui/features/initial_page_views2.feature` | Feature: Looking at a few things with Applitools Eyes - Part 2 | @eyes @playwright | **developer** | Visual Regression / Dev Tooling | 1 scenario(s)
    - Scenario Outline: Logged in simple page view without instructions dialog
- `dashboard/test/ui/features/initial_page_views_csf.feature` | Feature: Looking at a few things with Applitools Eyes - CSF Levels | @eyes @skip | **developer** | Visual Regression / Dev Tooling | 1 scenario(s)
    - Scenario Outline: Simple blockly level page view
- `dashboard/test/ui/features/initial_page_views.feature` | Feature: Looking at a few things with Applitools Eyes - Part 1 | @eyes @playwright | **developer** | Visual Regression / Dev Tooling | 1 scenario(s)
    - Scenario Outline: Simple blockly level page view
- `dashboard/test/ui/features/initial_page_views3.feature` | Feature: Looking at a few things with Applitools Eyes - Part 3 | @eyes @playwright | **developer** | Visual Regression / Dev Tooling | 2 scenario(s)
    - Scenario Outline: Temporarily circle disabled simple dashboard page view without instructions dialog [@no_ci]
    - Scenario Outline: Logged out simple page view without instructions dialog
- `dashboard/test/ui/features/dcdo_mocking.feature` | Feature: DCDO mocking | @playwright | **developer** | Visual Regression / Dev Tooling | 1 scenario(s)
    - Scenario: Using a cookie to mock DCDO
- `dashboard/test/ui/features/eyes.feature` | Feature: Looking at a few things with Applitools Eyes | @eyes @playwright | **developer** | Visual Regression / Dev Tooling | 7 scenario(s)
    - Scenario: (unnamed)
    - Scenario: (unnamed)
    - Scenario: (unnamed)
    - Scenario: (unnamed)
    - Scenario: (unnamed)
    - Scenario: (unnamed)
    - Scenario: (unnamed)

### acquisition_products/

- `dashboard/test/ui/features/acquisition_products/pd/dashboard_view.feature` | Feature: Basic appearance for Facilitator Survey UI | @dashboard_db_access @eyes | **internal_staff** | Professional Development (PD) Workshops | 2 scenario(s)
    - Scenario: Facilitator View of dashboard is as expected
    - Scenario: Organizer View of dashboard is as expected
- `dashboard/test/ui/features/acquisition_products/pd/workshop_certificates.feature` | Feature: Basic appearance for Workshop Certificates | @dashboard_db_access @eyes | **internal_staff** | Professional Development (PD) Workshops | 1 scenario(s)
    - Scenario: Simple Workshop Certificate
- `dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature` | Feature: Workshop Enrollment | @dashboard_db_access | **teacher** | PD Workshop Enrollment | 4 scenario(s)
    - Scenario: Attempting to join workshop signed-out prompts user to sign in
    - Scenario: Attempting to join workshop as a student prompts user to upgrade account
    - Scenario: Attempting to join invalid workshop as a teacher states it cannot be found
    - Scenario: Attempting to join closed workshop as a teacher states it is closed
- `dashboard/test/ui/features/acquisition_products/pd/daily_survey_results.feature` | Feature: Basic appearance for Daily Survey UI | @dashboard_db_access @eyes @skip | **internal_staff** | Professional Development (PD) Workshops | 1 scenario(s)
    - Scenario: Results view for facilitator survey UI is as expected
- `dashboard/test/ui/features/acquisition_products/pd/regional_partner_mini_contact.feature` | Feature: Regional partner mini-contact | @no_mobile | **internal_staff** | Professional Development (PD) Workshops | 3 scenario(s)
    - Scenario: Teacher submits inline mini-contact form after adding zip
    - Scenario: Teacher tries to submit inline mini-contact form after adding zip with no regional partner match
    - Scenario: Teacher submits inline mini-contact form after adding zip with a regional partner match, email, and notes
- `dashboard/test/ui/features/acquisition_products/school_info_confirmation_dialog.feature` | Feature: School Info Confirmation Dialog | @dashboard_db_access @no_mobile | **teacher** | Account Setup | 1 scenario(s)
    - Scenario: School Info Confirmation Dialog
- `dashboard/test/ui/features/acquisition_products/sign_up.feature` | Feature: Teacher can create a new account in the sign up flow | @eyes | **anonymous** | Account Signup | 3 scenario(s)
    - Scenario: Teacher can create a school associated account in the sign up flow
    - Scenario: Student can create an account in the sign up flow
    - Scenario: 10yo student hits Colorado lockout
- `dashboard/test/ui/features/acquisition_products/curriculum_catalog_assign_unassign.feature` | Feature: Curriculum Catalog Assign and Unassign | (none) | **teacher** | Curriculum Catalog | 2 scenario(s)
    - Scenario: Signed-in teacher with sections assigns and unassigns offerings to sections
    - Scenario: On expanded card, Signed-in teacher with sections assigns and unassigns offerings to sections [@no_mobile]
- `dashboard/test/ui/features/acquisition_products/pl_landing_page.feature` | Feature: Professional Learning landing page | @no_mobile | **anonymous** | PD Marketing Pages | 6 scenario(s)
    - Scenario: New teacher without PL history sees relevant content sections [@eyes]
    - Scenario: Facilitator sees relevant content sections [@eyes @dashboard_db_access]
    - Scenario: Universal Instructor sees relevant content sections
    - Scenario: Regional Partner sees relevant content sections [@dashboard_db_access]
    - Scenario: Workshop Organizer sees relevant content sections [@dashboard_db_access]
    - Scenario: Teacher with Self-paced PL courses sees relevant content sections
- `dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature` | Feature: Curriculum Catalog Page | (none) | **teacher** | Curriculum Catalog | 14 scenario(s)
    - Scenario: Signed-out user is redirected to sign-in page when clicking Assign
    - Scenario: Signed-in student does not see Assign button
    - Scenario: Signed-in teacher without sections is prompted to created sections when clicking Assign
    - Scenario: Signed-out user sees the curriculum catalog with offerings and can expand card and view recommendations [@no_mobile]
    - Scenario: Signed-out user sees course offering page when clicking on see curriculum details on expanded card [@no_mobile]
    - Scenario: Signed-out user can navigate to facilitator led workshop through expanded card [@no_mobile]
    - Scenario: On expanded card, Signed-in teacher sees professional learning section [@no_mobile]
    - Scenario: On expanded card, Signed-in student does not see professional learning section [@no_mobile]
    - Scenario: On expanded card, Signed-out user is redirected to sign-in page when clicking Assign to class sections [@no_mobile]
    - Scenario: On expanded card, Signed-in student does not see Assign button [@no_mobile]
    - Scenario: On the expanded card, Signed-in teacher without sections is prompted to created sections when clicking Assign to class sections [@no_mobile]
    - Scenario: On mobile, Signed-out User sees the Learn More button on Catalog Cards [@only_mobile]
    - Scenario: On mobile, Signed-in teacher sees the Learn More button on Catalog Cards [@only_mobile]
    - Scenario: On mobile, Signed-in student sees the Try Now button on Catalog Cards [@only_mobile]
- `dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature` | Feature: Regional Workshop Catalog page | @no_mobile | **anonymous** | PD Marketing Pages | 4 scenario(s)
    - Scenario: Entering a zip with no matches shows No Workshops Found view
    - Scenario: Entering a zip with a regional partner match allows user to see more info about and contact them
    - Scenario: Entering a zip with a regional partner match shows user the available workshops
    - Scenario: If sent to this page with a zip code url param the page obtains the regional partner and relevant workshops
- `dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature` | Feature: Curriculum Catalog Filters | (none) | **teacher** | Curriculum Catalog | 5 scenario(s)
    - Scenario: Signed-out user sees the curriculum catalog with offerings and can filter [@eyes]
    - Scenario: Signed-out user sees the curriculum catalog with offerings and can filter [@eyes]
    - Scenario: User can Select all and Clear all in Curriculum Catalog filters
    - Scenario: User can use Clear filters button to clear all selected filters
    - Scenario: User can use Tab navigation on filters, Space to select and escape to close [@chrome]
- `dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature` | Feature: Workshop Enrollment 2 | @dashboard_db_access | **teacher** | PD Workshop Enrollment | 4 scenario(s)
    - Scenario: Attempting to join full workshop as a teacher states it is full
    - Scenario: Attempting to join own workshop as a teacher states it is your own workshop
    - Scenario: Attempting to join workshop again as a teacher states you have already enrolled
    - Scenario: Attempting to join workshop as a teacher requires user info then allows enrolling and sends teacher to MyPL page
- `dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_form.feature` | Feature: Workshop Form | @dashboard_db_access @eyes | **internal_staff** | Professional Development (PD) Workshops | 2 scenario(s)
    - Scenario: New workshop: BYOW [@skip]
    - Scenario: Edit workshop: BYOW
- `dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_view.feature` | Feature: Workshop View | @dashboard_db_access @eyes | **internal_staff** | Professional Development (PD) Workshops | 1 scenario(s)
    - Scenario: Workshop Overview, Enrollment, Attendance and Surveys

### code_tools/

- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode.feature` | Feature: Python Lab start mode | @no_mobile | **student** | PythonLab | 1 scenario(s)
    - Scenario: Correct file types are in the dropdown
- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode_eyes.feature` | Feature: Python Lab start mode eyes | @no_mobile @eyes | **student** | PythonLab | 1 scenario(s)
    - Scenario: Basic Start mode
- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_neighborhood.feature` | Feature: Python Lab Neighborhood eyes | @no_mobile @eyes | **student** | PythonLab | 1 scenario(s)
    - Scenario: Can run and see output of Python program
- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run_eyes.feature` | Feature: Python Lab eyes | @no_mobile @eyes | **student** | PythonLab | 2 scenario(s)
    - Scenario: Can run and see output of Python program
    - Scenario: Can write and submit a prediction
- `dashboard/test/ui/features/code_tools/blockly/spritelab_eyes.feature` | Feature: Blockly Sprite Lab Eyes | @no_mobile @eyes | **student** | Code Tools (Blockly) | 1 scenario(s)
    - Scenario: It renders
- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_files.feature` | Feature: Python Lab manage files and folders | @no_mobile | **student** | PythonLab | 2 scenario(s)
    - Scenario: Can add a new, unlocked file
    - Scenario: main.py is locked
- `dashboard/test/ui/features/code_tools/blockly/modal_function_editor_eyes.feature` | Feature: Modal Function Editor Eyes | @no_mobile @eyes | **student** | Code Tools (Blockly) | 1 scenario(s)
    - Scenario: Edit a function
- `dashboard/test/ui/features/code_tools/blockly/modal_function_editor.feature` | Feature: Modal Function Editor | @no_mobile | **student** | Code Tools (Blockly) | 3 scenario(s)
    - Scenario: Can create a function
    - Scenario: Can edit a function
    - Scenario: Can close the editor using the ESC key [@chrome]
- `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_run.feature` | Feature: Python Lab run code | @no_mobile | **student** | PythonLab | 2 scenario(s)
    - Scenario: Can run and see output of Python program
    - Scenario: Continue button and progress status shows up correctly

### foundations/

- `dashboard/test/ui/features/foundations/user_menu.feature` | Feature: Sign In Button and User Menu in Header | @no_mobile @playwright | **anonymous** | Foundational UI Components | 4 scenario(s)
    - Scenario: Signed Out - create account button shows on signed out studio page
    - Scenario: Teacher Signed In - shows display name with correct links
    - Scenario: Student Signed In - shows display name with correct links
    - Scenario: Unicode in display name
- `dashboard/test/ui/features/foundations/markdown_rendering.feature` | Feature: Markdown rendering across the website | @playwright | **anonymous** | Foundational UI Components | 2 scenario(s)
    - Scenario: Visiting an external markdown level with details tag
    - Scenario: Viewing a level with blockly embedded in instructions [@eyes]
- `dashboard/test/ui/features/foundations/create_dropdown.feature` | Feature: Create Dropdown in Header | @no_mobile @no_safari @no_firefox @single_session @playwright | **anonymous** | Foundational UI Components | 5 scenario(s)
    - Scenario: Create Dropdown does NOT show on level pages
    - Scenario: Teacher - Correct Create Links
    - Scenario: Student, Age 13+ - Correct Create Links
    - Scenario: Young Student, Not in Section - Correct Create Links
    - Scenario: Young Student, In Section - Correct Create Links
- `dashboard/test/ui/features/foundations/footer.feature` | Feature: Checking the footer appearance | (none) | **anonymous** | Foundational UI Components | 8 scenario(s)
    - Scenario: Desktop puzzle using light small footer [@eyes]
    - Scenario: Desktop Minecraft puzzle using dark small footer [@eyes]
    - Scenario: Desktop Star Wars share small footer [@eyes]
    - Scenario: Desktop Minecraft share small footer [@eyes @skip]
    - Scenario: Desktop Applab share small footer [@eyes @as_student]
    - Scenario: Mobile Star Wars share small footer [@eyes_mobile @skip]
    - Scenario: Mobile Minecraft share small footer [@eyes_mobile @skip]
    - Scenario: Mobile Applab share small footer [@eyes_mobile @as_student @skip]
- `dashboard/test/ui/features/foundations/i18n.feature` | Feature: Maze, Frozen, and Minecraft:Agent tutorials in various languages | @single_session @playwright | **anonymous** | Foundational UI Components | 16 scenario(s)
    - Scenario: Maze tutorial in Spanish
    - Scenario: Frozen tutorial in Spanish
    - Scenario: Minecraft:Agent tutorial in Spanish
    - Scenario: Toolbox Categories in Spanish
    - Scenario: Translated function names in Spanish
    - Scenario: Maze tutorial in Portuguese
    - Scenario: Frozen tutorial in Portuguese
    - Scenario: Minecraft:Agent tutorial in Portuguese
    - Scenario: Toolbox Categories in Portuguese
    - Scenario: Translated function names in Portuguese
    - Scenario: Maze tutorial in Arabic (RTL)
    - Scenario: Frozen tutorial in Arabic (RTL)
    - Scenario: Minecraft:Agent tutorial in Arabic (RTL)
    - Scenario: Translated function names in Arabic
    - Scenario: Toolbox Categories in Arabic (RTL)
    - Scenario: Pixelation Widget long and short instructions in Spanish

### javalab/

- `dashboard/test/ui/features/javalab/javalab_unverified_teacher.feature` | Feature: Javalab Unverified Teacher | @no_mobile @no_ci | **teacher** | JavaLab Access Gating | 1 scenario(s)
    - Scenario: Unverified teacher is told to get verified
- `dashboard/test/ui/features/javalab/commit_code.feature` | Feature: Commit Code | @no_mobile | **student** | JavaLab | 2 scenario(s)
    - Scenario: Open the commit code dialog, enter commit notes, commit, and see commit in version history.
    - Scenario: Open the commit code dialog and try committing without notes, student should not be able to submit.
- `dashboard/test/ui/features/javalab/finish_button.feature` | Feature: Finish Button | @no_ci @no_phone | **student** | JavaLab | 3 scenario(s)
    - Scenario: Finish button goes from disabled to enabled on run
    - Scenario: Finish button does not become enabled if tests fail
    - Scenario: Finish button becomes enabled if tests succeed
- `dashboard/test/ui/features/javalab/javalab_submittable.feature` | Feature: Submittable JavaLab | @no_mobile | **student** | JavaLab | 2 scenario(s)
    - Scenario: Submit anything, unsubmit, be able to resubmit.
    - Scenario: Submit anything, teacher is able to unsubmit
- `dashboard/test/ui/features/javalab/code_review_finish_button.feature` | Feature: Code review Finish Button | @no_ci @no_mobile | **student** | JavaLab | 2 scenario(s)
    - Scenario: Running code in your own code review does not enable the finish button
    - Scenario: Running code in your peer's code review does not enable the finish button
- `dashboard/test/ui/features/javalab/code_review_scenarios.feature` | Feature: Code review V2 | @no_mobile @eyes | **student** | JavaLab | 1 scenario(s)
    - Scenario: Code review V2
- `dashboard/test/ui/features/javalab/neighborhood.feature` | Feature: NeighborhoodPainting | @eyes | **student** | JavaLab | 1 scenario(s)
    - Scenario: Paint Glomming Shapes [@no_ci]
- `dashboard/test/ui/features/javalab/prompter.feature` | Feature: Prompter | @eyes | **student** | JavaLab | 1 scenario(s)
    - Scenario: Upload an image via the prompter [@no_ci]
- `dashboard/test/ui/features/javalab/theater.feature` | Feature: Theater | @eyes | **student** | JavaLab | 1 scenario(s)
    - Scenario: GIF plays on run [@no_ci]
- `dashboard/test/ui/features/javalab/console_only.feature` | Feature: Console only level | @eyes | **student** | JavaLab | 1 scenario(s)
    - Scenario: Console only level responds to text input from user [@no_ci]

### platform/

- `dashboard/test/ui/features/platform/user_settings.feature` | Feature: Updating account settings | @single_session @skip | **anonymous** | Platform Chrome & Auth | 1 scenario(s)
    - Scenario: Teacher wants to disable AI rubrics
- `dashboard/test/ui/features/platform/global_edition/fa/personal_project_gallery.feature` | Feature: Global Edition - Farsi MVP - Personal Project Gallery | @chrome @no_mobile @single_session @playwright | **anonymous** | Global Edition (Localized/Regional Pages) | 1 scenario(s)
    - Scenario: The student sees only the projects available in Farsi MVP
- `dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature` | Feature: Global Edition - Farsi MVP - Sign In page | @chrome @playwright | **anonymous** | Global Edition (Localized/Regional Pages) | 1 scenario(s)
    - Scenario: I see the Farsi MVP Sign In page [@eyes]
- `dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature` | Feature: Global Edition - Farsi MVP - Professional Learning landing page | @chrome @no_mobile | **anonymous** | PD Marketing Pages | 6 scenario(s)
    - Scenario: New teacher without PL history sees relevant content sections for Farsi MVP [@eyes]
    - Scenario: Facilitator sees Facilitator Center in Farsi MVP [@dashboard_db_access]
    - Scenario: Universal Instructor sees Instructor Center in Farsi MVP
    - Scenario: Regional Partner sees Regional Partner Center in Farsi MVP [@dashboard_db_access]
    - Scenario: Workshop Organizer sees Workshop Organizer Tab in Farsi MVP [@dashboard_db_access]
    - Scenario: Teacher with Self-paced PL courses sees Continue course button in Farsi MVP
- `dashboard/test/ui/features/platform/login_redirect.feature` | Feature: Navigating to a level page with login required | @playwright | **anonymous** | Platform Chrome & Auth | 2 scenario(s)
    - Scenario: Student navigates to provided cached level link with a login_required parameter
    - Scenario: Student already logged in navigates to provided cached level link with a login_required parameter
- `dashboard/test/ui/features/platform/one_trust.feature` | Feature: OneTrust integration | @single_session @playwright | **anonymous** | Platform Chrome & Auth | 8 scenario(s)
    - Scenario: User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org [@eyes]
    - Scenario: OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org
    - Scenario: The dashboard pages load the self hosted OneTrust libraries.
    - Scenario: The dashboard pages load the Onetrust prod libraries.
    - Scenario: The dashboard pages load the test OneTrust libraries.
    - Scenario: The dashboard pages do not load the OneTrust libraries.
    - Scenario Outline: Critical Javascript files are appropriately categorized by OneTrust on dashboard
    - Scenario Outline: Embedded projects do not display the OneTrust banner [@as_student]
- `dashboard/test/ui/features/platform/header.feature` | Feature: Header navigation bar | @no_mobile @playwright | **anonymous** | Platform Chrome & Auth | 6 scenario(s)
    - Scenario: Student in English should see 4 header links
    - Scenario: Teacher in English should see 5 header links
    - Scenario: Student in Spanish should see 2 header links
    - Scenario: Teacher in Spanish should see 3 header links
    - Scenario: Teacher can click on the header links [@chrome]
    - Scenario: Student can click on the header links [@skip @chrome]
- `dashboard/test/ui/features/platform/signing_in.feature` | Feature: Signing in and signing out | @single_session @playwright | **anonymous** | Platform Chrome & Auth | 4 scenario(s)
    - Scenario: Student sign in from studio.code.org
    - Scenario: Student sign in from studio.code.org in the eu
    - Scenario: Teacher sign in from studio.code.org
    - Scenario: Signed-out joining non-picture non-word section from sign in page goes to link account page [@as_taught_student]
- `dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature` | Feature: Policy Compliance and Parental Permission | @no_mobile @playwright | **anonymous** | Child Account Policy (CAP) Compliance | 6 scenario(s)
    - Scenario: New under 13 account should be able to send a parental request.
    - Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
    - Scenario: New under 13 account should be able to resend the email
    - Scenario: New under 13 account should be able to send a different email
    - Scenario: Student should not be able to enter their own email as their parent's email
    - Scenario: Student should be able to enter their parent's email if their parent created their account
- `dashboard/test/ui/features/platform/global_edition/fa/sign_up_page.feature` | Feature: Global Edition - Farsi MVP - Sign Up page | @chrome @playwright | **anonymous** | Global Edition (Localized/Regional Pages) | 1 scenario(s)
    - Scenario: I see the Farsi MVP Sign In page [@eyes]
- `dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature` | Feature: Policy Compliance | @no_mobile @playwright | **anonymous** | Child Account Policy (CAP) Compliance | 7 scenario(s)
    - Scenario: New under 13 account should be able to elect to sign out at the lockout.
    - Scenario: Existing under 13 account in Colorado should not be locked out.
    - Scenario: Teacher should be able to connect a third-party account even without a state specified
    - Scenario: Student should not be able to connect a third-party account until their account is unlocked
    - Scenario: Sponsored student should not be able to add a personal email on an account until providing a state
    - Scenario: Sponsored student should not be able to add a personal email when they supply a policy state
    - Scenario: Sponsored student is able to add a personal email on an unlocked account
- `dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature` | Feature: Child Account Policy Lockout Phase | @no_mobile @playwright | **anonymous** | Child Account Policy (CAP) Compliance | 10 scenario(s)
    - Scenario: Student account Under-13 in Colorado created before CAP start cannot change age and state
    - Scenario: Student account Under-13 not in Colorado created after CAP start can change their age and state
    - Scenario: Student account Under-13 not in Colorado created before CAP start can change their age and state
    - Scenario: Student account Over-13 and in Colorado created after CAP start can change their age and state
    - Scenario: Student account Over-13 and in Colorado created before CAP start can change their age and state
    - Scenario: Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state
    - Scenario: Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state
    - Scenario: Student account under-13 and in Colorado created before CAP start using google cannot change their age and state
    - Scenario: Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state
    - Scenario: Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state
- `dashboard/test/ui/features/platform/global_edition/fa/signed_out.feature` | Feature: Global Edition - Farsi Headers when Signed Out | @skip @no_mobile | **anonymous** | Global Edition (Localized/Regional Pages) | 1 scenario(s)
    - Scenario: Signed out user should see the correct header links on Dashboard
- `dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature` | Feature: Using the manage students tab of the teacher dashboard | @no_mobile @playwright | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Teacher bulk updates US state for all section students
- `dashboard/test/ui/features/platform/global_edition/fa/teacher_dashboard.feature` | Feature: Global Edition - Farsi MVP - Teacher Dashboard | @chrome @playwright @no_mobile | **anonymous** | Global Edition (Localized/Regional Pages) | 1 scenario(s)
    - Scenario: Teacher does not see Teacher Promotion right panel
- `dashboard/test/ui/features/platform/global_edition/region_select.feature` | Feature: Global Edition - Region Select | @no_mobile @playwright | **anonymous** | Global Edition Region Selection | 2 scenario(s)
    - Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    - Scenario: User can switch to regional versions using the language selector on a Lab page

### star_labs/

- `dashboard/test/ui/features/star_labs/artist.feature` | Feature: Playing the Artist Game | @playwright | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Loading the first level
    - Scenario: Winning the first level
    - Scenario: Losing the first level
- `dashboard/test/ui/features/star_labs/jigsaw.feature` | Feature: Visiting a jigsaw page | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Loading the first jigsaw level
    - Scenario: Can't delete blocks or lose them outside the workspace
    - Scenario: Solving puzzle
- `dashboard/test/ui/features/star_labs/sharepage.feature` | Feature: Puzzle share page | @no_mobile | **anonymous** | Project Sharing Pages | 2 scenario(s)
    - Scenario: Share a flappy game, visit the share page, and visit the workspace
    - Scenario: Share and save an artist level to the project gallery [@as_student]
- `dashboard/test/ui/features/star_labs/bee.feature` | Feature: Complete a bee level | @playwright | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Complete Bee Conditions 4-5 Level 3
- `dashboard/test/ui/features/star_labs/angle_helper.feature` | Feature: Angle Helper | @skip @no_mobile | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 4 scenario(s)
    - Scenario: Angle Helper Eyes Tests [@eyes]
    - Scenario: Free Text Input Angle Helper
    - Scenario: Dropdown Angle Helper
    - Scenario: Value Input Angle Helper
- `dashboard/test/ui/features/star_labs/legacy_share_remix.feature` | Feature: Legacy Share Remix | @no_mobile @as_student | **anonymous** | Project Sharing Pages | 1 scenario(s)
    - Scenario: Remixing a legacy /c/ share link
- `dashboard/test/ui/features/star_labs/artist_autorun.feature` | Feature: Artist Autorun | @eyes | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Autorun Eyes Test
- `dashboard/test/ui/features/star_labs/jigsaw2.feature` | Feature: Solving a jigsaw puzzle | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Solving puzzle
- `dashboard/test/ui/features/star_labs/applab/data_tab.feature` | Feature: App Lab Data Tab | @no_mobile @as_student | **student** | App Lab | 3 scenario(s)
    - Scenario: Datasets Panel
    - Scenario: Data Tables Tab
    - Scenario: Key/Value Pairs Tab
- `dashboard/test/ui/features/star_labs/signin_callout.feature` | Feature: Viewing and dismissing the login callout | (none) | **anonymous** | Project Sharing Pages | 2 scenario(s)
    - Scenario: Should be able to clear cookies and session storage to see callout again [@no_mobile]
    - Scenario: Should not see callout on CSF coursea lesson if logged in [@as_student]
- `dashboard/test/ui/features/star_labs/flappy.feature` | Feature: Flappy puzzles can be solved | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Solving puzzle 1
    - Scenario: Solving puzzle 2
    - Scenario: Failing puzzle 2 [@no_mobile]
- `dashboard/test/ui/features/star_labs/sharepage_logo.feature` | Feature: Lab share page logo | @as_student @single_session | **anonymous** | Project Sharing Pages | 4 scenario(s)
    - Scenario: Select the logo on an applab share page while logged in and visit the homepage [@no_mobile]
    - Scenario: Select the logo on a playlab share page while logged in and visit the homepage [@no_mobile]
    - Scenario: Select the logo on a gamelab share page while logged in and visit the homepage [@no_mobile]
    - Scenario: Select the logo on an artist share page while logged in and visit the homepage [@no_mobile]
- `dashboard/test/ui/features/star_labs/applab/embed.feature` | Feature: App Lab Embed | @as_student @no_mobile | **student** | App Lab | 2 scenario(s)
    - Scenario: App Lab Embed
    - Scenario: App Lab Embed without Source
- `dashboard/test/ui/features/star_labs/applab/sharing_from_script_level.feature` | Feature: sharingFromScriptLevel | @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Sharing from an App Lab script level [@no_mobile]
- `dashboard/test/ui/features/star_labs/applab/shared_apps.feature` | Feature: App Lab Scenarios | @single_session @as_student | **student** | App Lab | 7 scenario(s)
    - Scenario: App Lab Share
    - Scenario: Can click a button in shared app
    - Scenario: Can change a dropdown value in shared app
    - Scenario: Can change a radio button value in shared app
    - Scenario: Can change a checkbox value in shared app
    - Scenario: Can type in text input on share page
    - Scenario: Can type in textarea on share page [@no_mobile]
- `dashboard/test/ui/features/star_labs/custom_blocks.feature` | Feature: Blockly Custom Blocks | @chrome | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 2 scenario(s)
    - Scenario: Poetry blocks
    - Scenario: Dance Party blocks
- `dashboard/test/ui/features/star_labs/dance/dance_ai_modal_eyes.feature` | Feature: Dance Party AI Modal Eyes | @no_mobile @eyes | **student** | Dance Party Lab | 1 scenario(s)
    - Scenario: Dance AI Modal
- `dashboard/test/ui/features/star_labs/blocklayout.feature` | Feature: Block auto-layout | @playwright | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Auto-placing malformed start blocks
    - Scenario: Auto-placing blocks
    - Scenario: Auto-placing blocks with XML positioning
- `dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature` | Feature: Public Key Cryptography Eyes | @eyes | **student** | Public Key Cryptography Widget | 2 scenario(s)
    - Scenario: Modulo Clock Appearance
    - Scenario: Cryptography Widget Appearance
- `dashboard/test/ui/features/star_labs/maker_projects.feature` | Feature: Projects Maker API enabling | @as_student @chrome | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: /projects/makerlab enables maker toolkit categories
    - Scenario: /projects/makerlab/new enables maker toolkit categories
    - Scenario: /projects/applab does not enable maker toolkit categories
- `dashboard/test/ui/features/star_labs/pixelation.feature` | Feature: Pixelation levels | @no_mobile | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 6 scenario(s)
    - Scenario: Pixelation version 2 in black and white with no sliders [@as_student]
    - Scenario: Pixelation version 3 in color with sliders [@as_student]
    - Scenario: Pixelation slider input fields are accessible via keyboard keys [@as_student]
    - Scenario: Pixelation version 3 in color with sliders starting in hex mode [@as_student]
    - Scenario: Pixelation version 1 with encoding controls hidden but sliders visible
    - Scenario: Pixelation version 1 with sliders hidden but encoding controls visible
- `dashboard/test/ui/features/star_labs/droplet.feature` | Feature: Droplet levels work as expected | @as_student | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 2 scenario(s)
    - Scenario: Open editcode level and write some autocompleted, tooltipped code
    - Scenario: Open editcode level and verify parameter autocomplete replaces quoted text
- `dashboard/test/ui/features/star_labs/clearpuzzle.feature` | Feature: Clear Puzzle | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 2 scenario(s)
    - Scenario: Deleting start blocks then clearing the puzzle
    - Scenario: Adding blocks then clearing the puzzle
- `dashboard/test/ui/features/star_labs/mobile_portait.feature` | Feature: Look at mobile portait view | @skip @eyes_mobile | **student** | Mobile Layout | 1 scenario(s)
    - Scenario Outline: Simple blockly level page view
- `dashboard/test/ui/features/star_labs/dance/dance_ai_modal.feature` | Feature: Dance Party | (none) | **student** | Dance Party Lab | 1 scenario(s)
    - Scenario: Dance AI Modal
- `dashboard/test/ui/features/star_labs/mix_move_ai.feature` | Feature: Mix & Move with AI | @no_mobile @no_safari @no_firefox @cloudfront_key | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Dancer, music, dance
- `dashboard/test/ui/features/star_labs/applab/eyes1.feature` | Feature: App Lab Eyes -  Part 1 | @eyes @as_student | **student** | App Lab | 4 scenario(s)
    - Scenario: Design elements are visible in local and shared projects
    - Scenario: App Lab UI elements from initial code and html
    - Scenario: Text area with multiple lines, radio button, checkbox
    - Scenario: Applab Instructions Resize
- `dashboard/test/ui/features/star_labs/farmer.feature` | Feature: Playing the Farmer Game | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Loading the first level
    - Scenario: Winning the first level
    - Scenario: Losing the first level [@no_mobile]
- `dashboard/test/ui/features/star_labs/public_key_cryptography/continue_button.feature` | Feature: Public Key Cryptography - Continue Button | (none) | **student** | Public Key Cryptography Widget | 1 scenario(s)
    - Scenario: Clicking the continue button
- `dashboard/test/ui/features/star_labs/signin_callout2.feature` | Feature: Viewing and dismissing the login callout | (none) | **anonymous** | Project Sharing Pages | 5 scenario(s)
    - Scenario: Clicking anywhere should dismiss the login reminder [@no_mobile]
    - Scenario: See age callout, not signin callout on hour of code
    - Scenario: After dismissing the callout, it should not reappear upon refresh [@no_mobile]
    - Scenario: Nested callouts should work as expected [@no_mobile]
    - Scenario: Should be immediately redirected to sign in if pressing sign in button
- `dashboard/test/ui/features/star_labs/applab/clipping.feature` | Feature: App Lab Clipping | @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Load an app to edit and see the blocks unclipped in design mode
- `dashboard/test/ui/features/star_labs/applab/template_backed.feature` | Feature: App Lab Scenarios | @no_mobile @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Template backed level
- `dashboard/test/ui/features/star_labs/maze2.feature` | Feature: Complete a simple maze level | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: Submit an incorrect program missing a block [@no_mobile]
    - Scenario: Submit a program with an empty repeat
    - Scenario: Submit a working program that uses too many blocks
- `dashboard/test/ui/features/star_labs/aichat/chat.feature` | Feature: Model customizations and interactions in AI Chat Lab | @no_mobile | **student** | AI Chat Lab | 3 scenario(s)
    - Scenario: Making chat request gets appropriate response
    - Scenario: Editing system prompt produces success notification and saves
    - Scenario: Publishing model enables published view and saves
- `dashboard/test/ui/features/star_labs/applab/eyes2.feature` | Feature: App Lab Eyes - Part 2 | @eyes @as_student | **student** | App Lab | 4 scenario(s)
    - Scenario: Applab visualization scaling [@skip]
    - Scenario: Applab embedded level
    - Scenario: Applab widget mode
    - Scenario: Applab Instructions in Top Pane
- `dashboard/test/ui/features/star_labs/applab/level_options.feature` | Feature: App Lab Level Options | (none) | **student** | App Lab | 2 scenario(s)
    - Scenario: Table data in level definition appears in data browser [@as_student]
    - Scenario: Level defaults to design mode, students see design mode and teachers see code mode when viewing student work
- `dashboard/test/ui/features/star_labs/netsim_lobby.feature` | Feature: Using the Internet Simulator Lobby | @no_mobile | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 3 scenario(s)
    - Scenario: First user in bit-sending mode can reach lobby
    - Scenario: When not logged in, can connect to a router
    - Scenario: NetSim uses the instructions dialog
- `dashboard/test/ui/features/star_labs/aichat/chat_multimodal.feature` | Feature: Multimodal chat using gpt-4o-mini as base model in AI Chat Lab | @no_mobile @no_ci | **student** | AI Chat Lab | 3 scenario(s)
    - Scenario: Making text chat request gets appropriate response
    - Scenario: Making PDF chat request gets appropriate response
    - Scenario: Making image chat request gets appropriate response
- `dashboard/test/ui/features/star_labs/bounce.feature` | Feature: Complete a bounce level | @single_session | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 5 scenario(s)
    - Scenario: Complete Level 1
    - Scenario: Complete Level 3
    - Scenario: Incomplete Level 5 [@no_mobile]
    - Scenario: Complete Level 5
    - Scenario: Complete Bounce freeplay level
- `dashboard/test/ui/features/star_labs/ai_tutor/chat.feature` | Feature: AI Tutor smoke tests on legacy labs and Lab2 resource panels | @no_mobile @no_ci | **student** | AI Tutor | 3 scenario(s)
    - Scenario: Chat works in the legacy labs AI Tutor
    - Scenario: Chat works in the resource panel AI Tutor tab in Python Lab
    - Scenario: Chat works in the resource panel AI Tutor tab in Weblab2
- `dashboard/test/ui/features/star_labs/manage_assets.feature` | Feature: Manage Assets | @no_mobile | **student** | Project Asset Management | 4 scenario(s)
    - Scenario: The manage assets dialog contains the option to record audio on Chrome [@no_firefox]
    - Scenario: The manage assets dialog displays the audio preview, and toggles between play and pause button.
    - Scenario: The manage assets dialog displays an image thumbnail and opens in a new tab when clicked
    - Scenario: From WebLab, the manage assets dialog does not contain the option to record audio.
- `dashboard/test/ui/features/star_labs/applab/html_sanitization.feature` | Feature: App Lab HTML Sanitization | @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Elements do not become nested
- `dashboard/test/ui/features/star_labs/craft/dialogs.feature` | Feature: Minecraft dialog levels | @skip @chrome | **student** | Craft (Minecraft-style) Lab | 2 scenario(s)
    - Scenario: Playing level 1, seeing character select dialog and re-playing
    - Scenario: Playing level 6, seeing house select dialog [@skip]
- `dashboard/test/ui/features/star_labs/applab/tooltips.feature` | Feature: Applab visualization overlay tooltips | (none) | **student** | App Lab | 2 scenario(s)
    - Scenario: Hovering over elements in design mode [@eyes @as_student]
    - Scenario: Hovering over elements in code mode [@eyes @as_student]
- `dashboard/test/ui/features/star_labs/craft/can_see_finish.feature` | Feature: Make sure we can see the finish button for craft levels on small screens | (none) | **student** | Craft (Minecraft-style) Lab | 1 scenario(s)
    - Scenario: can see finish button on "Minecraft Adventurer" [@no_safari @no_firefox @no_chrome]
- `dashboard/test/ui/features/star_labs/dance/dance_party.feature` | Feature: Dance Party | (none) | **student** | Dance Party Lab | 7 scenario(s)
    - Scenario: Restricted audio content is protected [@cloudfront_key]
    - Scenario: Can toggle run/reset in Dance Party [@no_mobile]
    - Scenario: Can get to level success in Dance Party [@no_mobile]
    - Scenario: Dance Party 12 loads [@no_mobile]
    - Scenario: Dance Party 8 runs new set tint block
    - Scenario: Dance Party Share [@as_student @no_mobile @no_safari]
    - Scenario: Dance Party can share while logged out [@no_mobile]
- `dashboard/test/ui/features/star_labs/gamelab/level_options.feature` | Feature: Game Lab Level Options | @as_student | **student** | Game Lab | 5 scenario(s)
    - Scenario: A level with the animation tab disabled hides the mode toggle
    - Scenario: A level with the animation tab enabled shows the mode toggle
    - Scenario: A new project should always provide the animation tab
    - Scenario: Initial animations are usable with no animation tab
    - Scenario: Initial animations show up in the animation tab
- `dashboard/test/ui/features/star_labs/can_see_finish.feature` | Feature: Make sure we can see the finish button for all LEVEL TYPE levels on small screens | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 12 scenario(s)
    - Scenario: can see finish button on "Dance Party" [@no_mobile]
    - Scenario: can see finish button on "Artist" [@no_mobile]
    - Scenario: can see finish button on "Bounce" [@no_mobile]
    - Scenario: can see finish button on "Flappy" [@no_mobile]
    - Scenario: can see finish button on "Sprite Lab" [@no_mobile]
    - Scenario: can see finish button on "Game Lab" [@no_mobile]
    - Scenario: can see finish button on "Minecraft Adventurer" [@no_mobile]
    - Scenario: can see finish button on "Dance Party" [@only_mobile]
    - Scenario: can see finish button on "Artist" [@only_mobile]
    - Scenario: can see finish button on "Flappy" [@only_mobile]
    - Scenario: can see finish button on "Sprite Lab" [@only_mobile]
    - Scenario: can see finish button on "Game Lab" [@only_mobile]
- `dashboard/test/ui/features/star_labs/weblab/versions.feature` | Feature: Weblab Versions | @skip @no_ci @as_student | **student** | Web Lab | 1 scenario(s)
    - Scenario: Weblab Versions
- `dashboard/test/ui/features/star_labs/spritelab/eyes.feature` | Feature: Sprite Lab Eyes | @eyes @as_student | **student** | Sprite Lab | 1 scenario(s)
    - Scenario: Basic Sprite Lab level
- `dashboard/test/ui/features/star_labs/maze.feature` | Feature: Complete a complicated maze level | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 2 scenario(s)
    - Scenario: Submit an invalid solution [@no_mobile]
    - Scenario: Submit a valid solution [@no_mobile]
- `dashboard/test/ui/features/star_labs/studio.feature` | Feature: Visiting a studio page | (none) | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Resizing Sprites
- `dashboard/test/ui/features/star_labs/applab/eyes4.feature` | Feature: App Lab Eyes -  Part 4 | @eyes @as_student | **student** | App Lab | 2 scenario(s)
    - Scenario: Applab debugging
    - Scenario: Drag to delete
- `dashboard/test/ui/features/star_labs/craft/aquatic.feature` | Feature: Minecraft aquatic | @skip | **student** | Craft (Minecraft-style) Lab | 1 scenario(s)
    - Scenario: Winning the first level
- `dashboard/test/ui/features/star_labs/gamelab/eyes.feature` | Feature: Game Lab Eyes | @eyes @as_student | **student** | Game Lab | 2 scenario(s)
    - Scenario: Basic GameLab level
    - Scenario: Game Lab Embed Level
- `dashboard/test/ui/features/star_labs/gamelab/libraries.feature` | Feature: Libraries | @no_mobile | **student** | Game Lab | 3 scenario(s)
    - Scenario: Publishing and unpublishing a library [@as_student]
    - Scenario: Adding and removing a library from a project
    - Scenario: Assigning a library to a section as a teacher
- `dashboard/test/ui/features/star_labs/weblab/too_young.feature` | Feature: Weblab Too Young | (none) | **student** | Web Lab | 2 scenario(s)
    - Scenario: Weblab Redirected [@as_young_student]
    - Scenario: Weblab Allowed for Student in Teacher's Section
- `dashboard/test/ui/features/star_labs/weblab/weblab.feature` | Feature: Web Lab | @no_mobile | **student** | Web Lab | 1 scenario(s)
    - Scenario: Web Lab iframe contents loads
- `dashboard/test/ui/features/star_labs/step_mode.feature` | Feature: Step Mode | @single_session | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 5 scenario(s)
    - Scenario: Step Only - Failure
    - Scenario: Step Only - Success
    - Scenario: Step Only - Reset while stepping
    - Scenario: Step and Run - Stepping
    - Scenario: Step and Run - Running
- `dashboard/test/ui/features/star_labs/aichat/view_student_chat_history.feature` | Feature: Teacher viewing student chat history in AI Chat Lab | @no_mobile | **student** | AI Chat Lab | 1 scenario(s)
    - Scenario: Teacher views student chat history and interacts with student model
- `dashboard/test/ui/features/star_labs/applab/scenarios2.feature` | Feature: App Lab Scenarios 2 | @as_student | **student** | App Lab | 3 scenario(s)
    - Scenario: Change event works in text input
    - Scenario: Change event works in text area
    - Scenario: Upload Image Asset [@no_mobile]
- `dashboard/test/ui/features/star_labs/dance/save_for_share.feature` | Feature: Saving project before sharing | @no_mobile | **student** | Dance Party Lab | 5 scenario(s)
    - Scenario: Free play level saves when Share is clicked
    - Scenario: Free play level saves when Remix is clicked [@as_student]
    - Scenario: Free play level saves when Finish is clicked
    - Scenario: Project level saves when Share is clicked [@as_student]
    - Scenario: Project level saves when Remix is clicked [@as_student]
- `dashboard/test/ui/features/star_labs/applab/scenarios.feature` | Feature: App Lab Scenarios | @as_student | **student** | App Lab | 3 scenario(s)
    - Scenario: (unnamed)
    - Scenario: Can read and set button text
    - Scenario: Text is preserved when reading and setting newlines in textarea
- `dashboard/test/ui/features/star_labs/applab/libraries.feature` | Feature: Libraries | @no_mobile | **student** | App Lab | 3 scenario(s)
    - Scenario: Publishing and unpublishing a library [@as_student]
    - Scenario: Adding and removing a library from a project
    - Scenario: Assigning a library to a section as a teacher
- `dashboard/test/ui/features/star_labs/craft/hero_logged_out.feature` | Feature: Minecraft hero logged out | (none) | **student** | Craft (Minecraft-style) Lab | 1 scenario(s)
    - Scenario: Signed out finish dialog
- `dashboard/test/ui/features/star_labs/spritelab/loading_costumes.feature` | Feature: Sprite Lab Loading Animations | @as_student | **student** | Sprite Lab | 1 scenario(s)
    - Scenario: Load the project with default animations and load Piskel
- `dashboard/test/ui/features/star_labs/craft/hero_logged_in.feature` | Feature: Minecraft hero logged in | (none) | **student** | Craft (Minecraft-style) Lab | 1 scenario(s)
    - Scenario: Signed in finish dialog [@as_student]
- `dashboard/test/ui/features/star_labs/gamelab/loading_animations.feature` | Feature: Game Lab Loading Animations | @as_student | **student** | Game Lab | 1 scenario(s)
    - Scenario: Check Piskel loads and reload the project with a blank animation
- `dashboard/test/ui/features/star_labs/weblab/weblab_submittable.feature` | Feature: Submittable WebLab | @skip @no_mobile @as_taught_student @no_ci | **student** | Web Lab | 1 scenario(s)
    - Scenario: Submit anything, unsubmit, be able to resubmit.
- `dashboard/test/ui/features/star_labs/applab/eyes3.feature` | Feature: App Lab Eyes -  Part 3 | @eyes @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Data Browser
- `dashboard/test/ui/features/star_labs/dance/age_filter.feature` | Feature: Dance Lab Age Filter | (none) | **student** | Dance Party Lab | 3 scenario(s)
    - Scenario: Song selector is visible and doesn't display pg13 songs for age < 13
    - Scenario: Song selector is visible and displays all songs for age > 13 and teacher flag turns filter on
    - Scenario: Selecting <13 in age dialog turns filter on
- `dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature` | Feature: Music Lab block can be dragged | @skip @no_mobile @no_safari | **student** | Music Lab | 1 scenario(s)
    - Scenario Outline: Dragging play sound block
- `dashboard/test/ui/features/star_labs/musiclab/musiclab_switching_levels.feature` | Feature: Music Lab workspaces load between levels | @eyes | **student** | Music Lab | 1 scenario(s)
    - Scenario: Load a level and load the next
- `dashboard/test/ui/features/star_labs/applab/versions.feature` | Feature: App Lab Versions | @no_phone @as_student | **student** | App Lab | 5 scenario(s)
    - Scenario: Script Level Versions
    - Scenario: Project Load and Reload
    - Scenario: Project Version Checkpoints [@no_mobile]
    - Scenario: Project page refreshes when other client adds a newer version [@no_mobile]
    - Scenario: Project page refreshes when other client replaces current version [@no_mobile]
- `dashboard/test/ui/features/star_labs/gamelab/export_animations.feature` | Feature: Game Lab Export | @as_student | **student** | Game Lab | 1 scenario(s)
    - Scenario: Export library animation [@no_mobile @no_safari]
- `dashboard/test/ui/features/star_labs/spritelab/spritelab.feature` | Feature: Sprite Lab | (none) | **student** | Sprite Lab | 3 scenario(s)
    - Scenario: Loading the first level
    - Scenario: Losing the first level
    - Scenario: Winning the first level [@no_mobile]
- `dashboard/test/ui/features/star_labs/share_buttons.feature` | Feature: Share Buttons | @as_student | **anonymous** | Project Sharing Pages | 4 scenario(s)
    - Scenario: How It Works Button appears for Sprite Lab share page
    - Scenario: How It Works Button does not appear for Game Lab share page
    - Scenario: Dpad does not appear for Sprite Lab Share [@only_phone]
    - Scenario: Dpad appears for Game Lab Share [@only_phone]
- `dashboard/test/ui/features/star_labs/gamelab_submittable.feature` | Feature: Submittable GameLab | @no_mobile @as_taught_student | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 1 scenario(s)
    - Scenario: Submit anything, unsubmit, be able to resubmit.
- `dashboard/test/ui/features/star_labs/applab/data_blocks.feature` | Feature: App Lab Data Blocks | @no_mobile @as_student | **student** | App Lab | 1 scenario(s)
    - Scenario: Evaluate Data Blocks
- `dashboard/test/ui/features/star_labs/musiclab/musiclab_timeline_nav.feature` | Feature: Musiclab timeline is keyboard navigable | (none) | **student** | Music Lab | 1 scenario(s)
    - Scenario: Ensure users can navigate into and out of timeline, and between elements with arrows [@no_mobile @no_safari]
- `dashboard/test/ui/features/star_labs/applab_submittable.feature` | Feature: Submittable AppLab | @no_mobile | **student** | Core Blockly Labs (Maze/Artist/Bee/Bounce/etc) | 2 scenario(s)
    - Scenario: Submit anything, unsubmit, be able to resubmit.
    - Scenario: Submit anything, teacher is able to unsubmit
- `dashboard/test/ui/features/star_labs/dance/age_filter2.feature` | Feature: Dance Lab Age Filter 2 | (none) | **student** | Dance Party Lab | 3 scenario(s)
    - Scenario: Selecting 13 in age dialog turns filter off
    - Scenario: Song selector is hidden when initializing with teacher flag on and teacher flag stays on after level complete
    - Scenario: Song selector is hidden when initializing with teacher flag on for signed in student
- `dashboard/test/ui/features/star_labs/applab/scenarios3.feature` | Feature: App Lab Scenarios 3 | @as_student | **student** | App Lab | 2 scenario(s)
    - Scenario: App Lab absolute image URL
    - Scenario: App Lab Clear Puzzle and Design Mode

### student_learning/

- `dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature` | Feature: Oceans ML HoC | @no_ci @no_mobile @no_safari | **student** | Hour of Code (Minecraft/Starwars/ML) | 4 scenario(s)
    - Scenario: Fish vs. Trash
    - Scenario: Sea Creatures
    - Scenario: Short Word List
    - Scenario: Long Word List
- `dashboard/test/ui/features/student_learning/hour_of_code/minecraft_codebuilder.feature` | Feature: Minecraft CodeBuilder | @skip | **student** | Hour of Code (Minecraft/Starwars/ML) | 2 scenario(s)
    - Scenario: Importing an Agent level from a share link
    - Scenario: Importing an Agent level from a project link
- `dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature` | Feature: Hour of Code 2015 tutorial is completable | @single_session | **student** | Hour of Code (Minecraft/Starwars/ML) | 10 scenario(s)
    - Scenario: Solving puzzle 1 in block mode [@no_mobile]
    - Scenario: Solving puzzle 1 in text mode
    - Scenario: Solving puzzle 2 in text mode
    - Scenario: Solving puzzle 3 in text mode
    - Scenario: Solving puzzle 4 in text mode
    - Scenario: Solving puzzle 5 in text mode
    - Scenario: Solving puzzle 6 in text mode
    - Scenario: Failing puzzle 5 by touching hazard
    - Scenario: Using the "Start Over" button in block mode [@no_mobile]
    - Scenario: Using the "Start Over" button in text mode
- `dashboard/test/ui/features/student_learning/weblab2/weblab2_general.feature` | Feature: Web Lab 2 General | @playwright | **student** | Weblab2 | 1 scenario(s)
    - Scenario: Web Lab 2 Instructions and Editor load [@no_safari @no_mobile]
- `dashboard/test/ui/features/student_learning/maze_reset.feature` | Feature: Reset clears client-side video, callout, and level-progress state | (none) | **student** | Intro Puzzles (Maze) | 1 scenario(s)
    - Scenario: Resetting causes previously seen videos and callouts to reappear
- `dashboard/test/ui/features/student_learning/weblab2/weblab2_preview.feature` | Feature: Web Lab 2 Preview | @playwright | **student** | Weblab2 | 1 scenario(s)
    - Scenario: Web Lab 2 Preview loads [@no_safari @no_mobile @no_ci]
- `dashboard/test/ui/features/student_learning/maze_signed_in.feature` | Feature: Maze level tests for users that are signed in | @as_student | **student** | Intro Puzzles (Maze) | 5 scenario(s)
    - Scenario: Solving a puzzle marks it perfect in the header and unit overview, and level source persists across a client-side reset
    - Scenario: Failing a puzzle and reloading marks it attempted in the header
    - Scenario: Progress on the server that is not on the client
    - Scenario: Video modal is shown once and does not reappear when returning to the puzzle [@no_mobile]
    - Scenario: Callout is shown once and does not reappear when returning to the puzzle
- `dashboard/test/ui/features/student_learning/maze_signed_out.feature` | Feature: Maze level tests for users that are signed out | (none) | **student** | Intro Puzzles (Maze) | 4 scenario(s)
    - Scenario: Solving a puzzle marks it perfect in the header and unit overview, and reset clears the saved progress and code
    - Scenario: Failing a puzzle and reloading marks it attempted in the header and unit overview
    - Scenario: Video modal is shown once and does not reappear when returning to the puzzle [@no_mobile]
    - Scenario: Callout is shown once and does not reappear when returning to the puzzle

### teacher_tools/

- `dashboard/test/ui/features/teacher_tools/course_versions.feature` | Feature: Course versions | (none) | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Version warning announcement on course and script overview pages [@as_student @no_mobile]
    - Scenario: Versions warning announcement on script overview page [@as_student @no_mobile]
    - Scenario: Switch versions using dropdown on script overview page [@as_student @no_mobile]
- `dashboard/test/ui/features/teacher_tools/lesson_show.feature` | Feature: Viewing Lesson Plans | (none) | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Print Mode [@eyes]
- `dashboard/test/ui/features/teacher_tools/course_overview.feature` | Feature: CourseOverview | (none) | **teacher** | Course & Lesson Management | 5 scenario(s)
    - Scenario: Viewing course overview signed out
    - Scenario: Viewing course overview as a student not in a section
    - Scenario: Viewing course overview as a teacher with no sections
    - Scenario: Viewing course overview as a student in a section
    - Scenario: Viewing course overview for a single-unit course
- `dashboard/test/ui/features/teacher_tools/authored_hints.feature` | Feature: Authored Hints | @playwright | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: View Authored Hints
- `dashboard/test/ui/features/teacher_tools/fun_o_meter.feature` | Feature: Fun-O-Meter | @as_student | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Rate a Puzzle
- `dashboard/test/ui/features/teacher_tools/script_overview.feature` | Feature: Unit overview page | @no_safari @no_mobile | **teacher** | Course & Lesson Management | 7 scenario(s)
    - Scenario: Viewing student progress
    - Scenario: Unit overview contents
    - Scenario: Unit overview end-of-lesson
    - Scenario: Unit overview new lesson plan
    - Scenario: Unit overview student resources as teacher
    - Scenario: Unit overview student resources as student
    - Scenario: Unit overview for unit in single-unit course
- `dashboard/test/ui/features/teacher_tools/below_visualization.feature` | Feature: Ensure correct #belowVisualization position | (none) | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Check correct position of video thumbnails [@eyes @as_student]
- `dashboard/test/ui/features/teacher_tools/lesson_lock_retake.feature` | Feature: Lesson Locking Retake | (none) | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Lock settings for retake not submit scenario [@eyes]
    - Scenario: Lock settings for retake after submit scenario [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/hidden_scripts_eyes.feature` | Feature: Hidden Scripts | @skip @eyes | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Hidden Scripts
- `dashboard/test/ui/features/teacher_tools/modular_courses.feature` | Feature: Using Modular Courses | @no_mobile | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Navigating within modular courses
    - Scenario: Progress is saved across modular courses [@eyes]
- `dashboard/test/ui/features/teacher_tools/report_abuse.feature` | Feature: Report Abuse Form | (none) | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Reporting abuse while signed-out
    - Scenario: Reporting abuse as a signed-in student
    - Scenario: Reporting abuse as a signed-in teacher
- `dashboard/test/ui/features/teacher_tools/multi_submittable.feature` | Feature: Submittable multi | @no_mobile @as_taught_student | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Loading the level
    - Scenario: Submit anything, unsubmit, be able to resubmit.
- `dashboard/test/ui/features/teacher_tools/documentation_landing_page.feature` | Feature: Documentation Landing Page | @no_mobile @single_session @playwright | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Documentation landing page displays
    - Scenario: Applab Documentation landing page displays
- `dashboard/test/ui/features/teacher_tools/disallowedsharing.feature` | Feature: Shared content restrictions | @no_mobile | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Sharing a profane studio game [@webpurify]
    - Scenario: Sharing a phone number studio game
    - Scenario: Sharing an email studio game
- `dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_threads.feature` | Feature: Read and create AI diff threads | @no_firefox @no_mobile | **teacher** | AI Differentiation | 1 scenario(s)
    - Scenario: Teacher can see threads and create new threads [@eyes @chrome]
- `dashboard/test/ui/features/teacher_tools/level_navigation.feature` | Feature: Continue button on levels | (none) | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: External Video Level
    - Scenario: External Markdown Level
    - Scenario: Complete an auto-success level signed-out, continue, the auto-success level should show up as completed
- `dashboard/test/ui/features/teacher_tools/level_completion.feature` | Feature: Looking at completing different level types | @eyes | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: (unnamed)
    - Scenario: (unnamed) [@skip]
    - Scenario: (unnamed)
- `dashboard/test/ui/features/teacher_tools/cached_level_page.feature` | Feature: Cached level page | @no_mobile | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: View cached level page as teacher
- `dashboard/test/ui/features/teacher_tools/send_lesson.feature` | Feature: Send Lesson | @as_teacher | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Send lesson dialog renders properly [@eyes]
    - Scenario: Send lesson dialog opens and closes [@no_mobile]
    - Scenario: Send lesson dialog copy link button works [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/hidden_stages_eyes.feature` | Feature: Hidden Stages | @eyes | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Hidden Stages - lesson 2 hidden
- `dashboard/test/ui/features/teacher_tools/instructions/top_instructions.feature` | Feature: Eyes Tests for Top Instructions | @eyes @as_student | **student** | Level Instructions & Feedback | 2 scenario(s)
    - Scenario: CSF Top Instructions
    - Scenario: CSF hint top instructions
- `dashboard/test/ui/features/teacher_tools/certificates/certificates.feature` | Feature: Certificate page features | (none) | **teacher** | Certificates | 3 scenario(s)
    - Scenario: share page preserves certificate when redirecting
    - Scenario: certificate page with no course name [@no_mobile]
    - Scenario: customized dashboard certificate pages with no course name [@eyes]
- `dashboard/test/ui/features/teacher_tools/pairing.feature` | Feature: Student pairing | (none) | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Pair Programming submits levels for both students
    - Scenario: Pair Programming attempts levels for both students
    - Scenario: Pairing group is correctly displayed in user menu on cached levels
- `dashboard/test/ui/features/teacher_tools/assign_modular_course.feature` | Feature: Assigning Modular Courses | @no_mobile | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Assign unit in modular course from unit overview page
    - Scenario: Assign unit in modular course from course overview page
- `dashboard/test/ui/features/teacher_tools/student_lesson_plan.feature` | Feature: Student Lesson Plan | @no_safari @no_mobile | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Viewing Student Lesson Plan
- `dashboard/test/ui/features/teacher_tools/feedback.feature` | Feature: Recommended/Required Blocks Feedback | @as_student | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Solve without recommended blocks
- `dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature` | Feature: Send and receive messages in the AI differentiation chat | @no_firefox @no_mobile | **teacher** | AI Differentiation | 4 scenario(s)
    - Scenario: Teacher sees welcome screen for AI Differentiation [@skip @eyes @chrome]
    - Scenario: Teacher can type messages and leave feedback in AI Differentiation chat [@chrome]
    - Scenario: Teacher can disable AI chat feature [@chrome]
    - Scenario: Teacher sees notification [@chrome]
- `dashboard/test/ui/features/teacher_tools/teacher_homepage.feature` | Feature: Using the teacher homepage sections feature | @skip @as_teacher @no_mobile @no_firefox @no_safari | **teacher** | Course & Lesson Management | 9 scenario(s)
    - Scenario: See a section creation dialog when logging for the first time
    - Scenario: Do not see a section creation dialog when logging after first time
    - Scenario: Loading the teacher homepage with new sections
    - Scenario: Assign hidden unit to section
    - Scenario: Assign a Course assigns first Unit in Course by default [@skip]
    - Scenario: Assign a CSF course with multiple versions
    - Scenario: Navigate to course pages with course versions enabled
    - Scenario: Loading the print certificates page for a section
    - Scenario: Do not see the unit when a section is assigned a single-unit course
- `dashboard/test/ui/features/teacher_tools/level_video.feature` | Feature: Related video on level | @eyes | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Sprite lab level [@as_student]
- `dashboard/test/ui/features/teacher_tools/submittable_eyes.feature` | Feature: Submittable level | @eyes @as_authorized_taught_student | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Submittable level
    - Scenario: Lockable level
- `dashboard/test/ui/features/teacher_tools/hour_of_code/hoc_batch_certificates.feature` | Feature: Print batch certificates | @as_teacher | **teacher** | Hour of Code Certificates | 2 scenario(s)
    - Scenario: Printing a batch of certificates
    - Scenario: Eyes test for oceans certificate on bulk print page [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_lesson_plan.feature` | Feature: Teacher Lesson Plan | @no_mobile | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Viewing Teacher Lesson Plan [@eyes]
    - Scenario: Viewing Level Details Dialogs [@eyes]
- `dashboard/test/ui/features/teacher_tools/instructions/teacher_only_markdown.feature` | Feature: Teacher Only Markdown | @eyes | **teacher** | Level Instructions & Feedback | 1 scenario(s)
    - Scenario: Applab level with teacher only markdown
- `dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature` | Feature: CSP Instructions | @no_mobile @single_session | **student** | Level Instructions & Feedback | 9 scenario(s)
    - Scenario: 'Help & Tips' and 'Instruction' tabs are visible if level has videos
    - Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
    - Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has reference links
    - Scenario: Do not display resources tab when there are no videos, map references, or reference links
    - Scenario: Resources tab displays videos, map references, and reference links with correct text and link
    - Scenario: Instructions can be collapsed and expanded
    - Scenario: Instructions have a resizer for non-embedded levels
    - Scenario: Instructions do not show a resizer on embedded levels
    - Scenario: Resources tab is clickable and displays correct text for contained levels
- `dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature` | Feature: Looking at curriculum reference levels Applitools Eyes | @eyes | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 1 scenario(s)
    - Scenario Outline: Load iframe then take screenshot
- `dashboard/test/ui/features/teacher_tools/instructions/csp_top_instructions_eyes.feature` | Feature: Eyes Tests for Top Instructions CSP | @eyes @as_teacher | **student** | Level Instructions & Feedback | 2 scenario(s)
    - Scenario: CSD and CSP Top Instructions
    - Scenario: Resizing CSD and CSP Top Instructions
- `dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature` | Feature: BubbleChoice | (none) | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Viewing BubbleChoice progress [@no_mobile]
    - Scenario: Lab2 BubbleChoice progress [@no_mobile @no_firefox @no_safari]
    - Scenario: Navigating between a Lab2 sublevel and another Lab2 level
- `dashboard/test/ui/features/teacher_tools/level_types/level_swap.feature` | Feature: Swapped levels | (none) | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Signed-out user sees active version
    - Scenario: Signed-in student without progress sees active version [@as_student]
    - Scenario: Student with progress sees old version [@as_student @no_mobile]
- `dashboard/test/ui/features/teacher_tools/level_types/multi2.feature` | Feature: Playing multi2 levels | @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Loading the level
    - Scenario: Clicking an option enables submit but submitting only one answer gets a warning
    - Scenario: Clicking an option enables submit and submitting the correct answer (two checkboxes) wins
- `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature` | Feature: Self Paced PL Instructor in Training - Universal Instructor | @no_phone | **teacher** | Instructor-in-Training Gating | 6 scenario(s)
    - Scenario: View Instructor In Training Applab Level as Universal Instructor [@properties_encryption_key]
    - Scenario: View Instructor In Training Dance Level as Universal Instructor [@no_mobile]
    - Scenario: View Instructor In Training Free Response Level as Universal Instructor [@no_mobile @properties_encryption_key]
    - Scenario: View Instructor In Training External Level as Universal Instructor [@no_mobile]
    - Scenario: View Instructor In Training Bubble Choice Level as Universal Instructor [@no_mobile]
    - Scenario: View Instructor In Training LevelGroup Level as Universal Instructor [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/levelbuilder/modular_courses.feature` | Feature: Creating and Editing Modular Courses | @no_mobile | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 1 scenario(s)
    - Scenario: Create a new course assigned to a shared unit
- `dashboard/test/ui/features/teacher_tools/projects/blockly_project.feature` | Feature: Blockly Project | (none) | **student** | Student Projects & Galleries | 1 scenario(s)
    - Scenario: Save Blockly Project
- `dashboard/test/ui/features/teacher_tools/projects/starwars_project.feature` | Feature: Starwars Project | (none) | **student** | Student Projects & Galleries | 1 scenario(s)
    - Scenario: Starwars Flow [@as_student @no_mobile]
- `dashboard/test/ui/features/teacher_tools/level_types/map_level.feature` | Feature: Map Levels | @no_mobile @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 1 scenario(s)
    - Scenario: Map level displays content
- `dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature` | Feature: Teacher Student Toggle | (none) | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Toggle on Multi Level [@eyes]
    - Scenario: Toggle on Hidden Maze Level [@eyes]
    - Scenario: Toggle on Lockable Level [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/manage_students_tab_views_eyes.feature` | Feature: Using the manage students tab of the teacher dashboard | @no_mobile @eyes | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Viewing the manage students tab in normal and edit mode
- `dashboard/test/ui/features/teacher_tools/levelbuilder/new_unit_page.feature` | Feature: Using the New Unit Page | @no_mobile | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 1 scenario(s)
    - Scenario: Create a new unit
- `dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page_dots.feature` | Feature: Level Group | @no_mobile @as_taught_student | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 2 scenario(s)
    - Scenario: Submit three pages as... 1. all, 2. none, 3. some questions answered.
    - Scenario: optional free play level
- `dashboard/test/ui/features/teacher_tools/certificates/csf_certificates.feature` | Feature: After completing a CSF course, the student is directed to a congratulations page | (none) | **teacher** | Certificates | 2 scenario(s)
    - Scenario: CSF uncustomized dashboard certificate pages
    - Scenario: CSF certificate pages [@eyes]
- `dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature` | Feature: Announcement for AI Assessments | @no_mobile | **teacher** | AI Rubrics & Assessment | 2 scenario(s)
    - Scenario: Teacher views and closes announcement
    - Scenario: Teacher views announcement and clicks learn more
- `dashboard/test/ui/features/teacher_tools/level_types/free_response_contained_levels.feature` | Feature: Free Response Contained Levels | (none) | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 6 scenario(s)
    - Scenario: Applab with free response contained level [@eyes]
    - Scenario: Javalab with free response contained level [@eyes]
    - Scenario: Authorized Teacher on Maze with free response contained level [@eyes]
    - Scenario: Authorized Teacher on App Lab with free response contained level [@eyes]
    - Scenario: Teacher can reset progress on free response contained level
    - Scenario: Student can attempt retriable free response contained level multiple times
- `dashboard/test/ui/features/teacher_tools/levelbuilder/level_edit_page.feature` | Feature: Using the Level Edit Page | @no_mobile | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 1 scenario(s)
    - Scenario: Update a Multi level
- `dashboard/test/ui/features/teacher_tools/callouts.feature` | Feature: Callouts | @single_session @playwright | **teacher** | Course & Lesson Management | 6 scenario(s)
    - Scenario Outline: Callouts having correct content and being dismissable via the target element
    - Scenario Outline: Callouts having correct content and being dismissable via the x-button [@no_mobile]
    - Scenario: Modal ordering
    - Scenario: Closing using "x" button
    - Scenario: Only showing seen callouts once
    - Scenario: Opening the Show Code dialog [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/level_types/multi3.feature` | Feature: Playing multi levels 3 | @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 4 scenario(s)
    - Scenario: Rendering in another language
    - Scenario: Does not scroll horizontally
    - Scenario: Can render without a question
    - Scenario: Standalone level without retries locks after answer is submitted
- `dashboard/test/ui/features/teacher_tools/level_types/multi4.feature` | Feature: Playing multi levels 4 | @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Submitting an incorrect option
    - Scenario: Pressing three options unselects the oldest
    - Scenario: Pressing an option again toggles it
- `dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature` | Feature: Public Project Gallery - Signed Out | @playwright | **anonymous** | Student Projects & Galleries | 2 scenario(s)
    - Scenario: Public Gallery Shows Expected Elements
    - Scenario: Public Gallery Shows Expected Project Types
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/local_nav_v2_standalone_eyes.feature` | Feature: V2 teacher dashboard local navigation - single-unit course - Eyes | @no_mobile @eyes | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Local navigation on single-unit course
- `dashboard/test/ui/features/teacher_tools/encrypted_level.feature` | Feature: Encrypted Level | (none) | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Load Encrypted Play Lab Level [@properties_encryption_key]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature` | Feature: Using the assessments tab in the teacher dashboard | @no_mobile | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Assessments tab initialization
- `dashboard/test/ui/features/teacher_tools/join_section_signup.feature` | Feature: Using the join section page while not signed in | (none) | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Attempt to join section while signed out
    - Scenario: Attempt to join section while signed in
- `dashboard/test/ui/features/teacher_tools/instructions/feedback_tab.feature` | Feature: Feedback Tab Visibility | @dashboard_db_access @no_mobile | **student** | Level Instructions & Feedback | 2 scenario(s)
    - Scenario: As student 'Feedback' tab is not visible if no feedback
    - Scenario: As teacher, when viewing a level with student work,
- `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature` | Feature: Self Paced PL Instructor in Training - Unverified Instructor | @no_phone | **teacher** | Instructor-in-Training Gating | 6 scenario(s)
    - Scenario: View Instructor In Training Applab Level as Unverified Teacher
    - Scenario: View Instructor In Training Dance Level as Unverified Teacher [@no_mobile]
    - Scenario: View Instructor In Training Free Response Level as Unverified Teacher [@no_mobile]
    - Scenario: View Instructor In Training External Level as Unverified Teacher [@no_mobile]
    - Scenario: View Instructor In Training Bubble Choice Level as Unverified Teacher [@no_mobile]
    - Scenario: View Instructor In Training LevelGroup Level as Unverified Teacher [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature` | Feature: Teachers can see and give feedback on Rubrics | @no_mobile | **teacher** | AI Rubrics & Assessment | 4 scenario(s)
    - Scenario: Teachers can give and send feedback on the rubric to students.
    - Scenario: Teacher views rubric product tour
    - Scenario: Teacher views Rubric and Settings tabs [@eyes]
    - Scenario: Teacher views product tour [@eyes @skip]
- `dashboard/test/ui/features/teacher_tools/level_types/match.feature` | Feature: Playing match levels | (none) | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Loading the level
    - Scenario: Solving puzzle [@no_mobile]
    - Scenario: Submitting an incorrect solution [@no_mobile @as_student]
- `dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature` | Feature: Submittable free response | @no_mobile @as_taught_student | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Loading the level
    - Scenario: Submit anything, unsubmit, be able to resubmit.
    - Scenario: Level without multiple attempts allowed is locked after submit
- `dashboard/test/ui/features/teacher_tools/projects/personal_project_gallery.feature` | Feature: Personal Project Gallery | @no_mobile @single_session | **student** | Student Projects & Galleries | 4 scenario(s)
    - Scenario: Can Toggle to the Public Project Gallery
    - Scenario: Can Rename a Project
    - Scenario: Can Remix a Project [@no_safari]
    - Scenario: Can Delete a Project
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2.feature` | Feature: Using the V2 teacher dashboard local navigation | @no_mobile | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Modifying settings on the teacher dashboard
    - Scenario: Single-unit course overview
- `dashboard/test/ui/features/teacher_tools/projects/gamelab_project.feature` | Feature: Gamelab Projects | (none) | **student** | Student Projects & Galleries | 2 scenario(s)
    - Scenario: Gamelab Flow [@as_taught_student @no_mobile]
    - Scenario: Remix project creates and redirects to new channel [@as_student @no_mobile]
- `dashboard/test/ui/features/teacher_tools/pl_sections.feature` | Feature: Professional learning Sections | @no_mobile | **teacher** | Course & Lesson Management | 10 scenario(s)
    - Scenario: Create new professional learning section as universal instructor
    - Scenario: Create new professional learning section as plc reviewer
    - Scenario: Create new professional learning section as facilitator
    - Scenario: Teacher can not create professional learning section
    - Scenario: Teacher tries to join professional learning section for teachers
    - Scenario: Teacher tries to join professional learning section for facilitators
    - Scenario: Facilitator tries to join professional learning section for teachers
    - Scenario: Facilitator tries to join professional learning section for facilitators
    - Scenario: Universal Instructor tries to join professional learning section for teachers
    - Scenario: Universal Instructor tries to join professional learning section for facilitators
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature` | Feature: Age Gated Sections Modal and Banner | (none) | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Teacher viewing their section with no at risk age gated students should not see age gated sections banner
    - Scenario: Teacher viewing their sections with at risk age gated students should not see age gated sections banner
- `dashboard/test/ui/features/teacher_tools/level_summary.feature` | Feature: Level summary | @dashboard_db_access | **teacher** | Course & Lesson Management | 8 scenario(s)
    - Scenario: Free Response level 1 [@eyes]
    - Scenario: Free Response level 2 [@eyes]
    - Scenario: Free Response level 3 [@eyes]
    - Scenario: Multi level 1 [@eyes]
    - Scenario: Multi level 2 [@eyes]
    - Scenario: Check for Understanding summaries
    - Scenario: Check free response AI [@skip]
    - Scenario: Check for Understanding summaries eyes [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_students_modal.feature` | Feature: Age Gated Students Modal and Banner | (none) | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Teacher viewing a section with no at risk age gated students should not see age gated students banner
    - Scenario: Teacher viewing a section with at risk age gated students should see age gated students banner and can click and see modal
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2_eyes.feature` | Feature: Using the V2 teacher dashboard local navigation - Eyes | @no_mobile @eyes | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Local navigation on Progress v2
    - Scenario: Local navigation on Unit and Course overview pages
- `dashboard/test/ui/features/teacher_tools/contextual_hints.feature` | Feature: Contextual Hints | @playwright | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Blocks render in contextual hints
    - Scenario: Contextual hints in level without Authored Hints
- `dashboard/test/ui/features/teacher_tools/challenge_level.feature` | Feature: Challenge level shows different dialogs | (none) | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Submit passing and perfect solutions
    - Scenario: Press the skip button
- `dashboard/test/ui/features/teacher_tools/plc_course_unit_navigation.feature` | Feature: Basic navigation for PLC stuff | @dashboard_db_access | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Basic navigation and ribbon changing works as expected
- `dashboard/test/ui/features/teacher_tools/progress.feature` | Feature: Level Progress | @no_mobile @playwright | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Progress is saved for signed-in student
    - Scenario: Progress is saved for signed-out student
- `dashboard/test/ui/features/teacher_tools/instructions/help_and_tips.feature` | Feature: Help and Tips Map Link | @no_mobile | **student** | Level Instructions & Feedback | 1 scenario(s)
    - Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
- `dashboard/test/ui/features/teacher_tools/unnumbered_lessons.feature` | Feature: Unnumbered Lessons | @playwright | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: Units with Unnumbered Lessons
- `dashboard/test/ui/features/teacher_tools/lesson_extras_teacher_panel.feature` | Feature: Lesson extras teacher panel | @no_mobile | **teacher** | Course & Lesson Management | 1 scenario(s)
    - Scenario: View student lesson extras progress
- `dashboard/test/ui/features/teacher_tools/text_to_speech.feature` | Feature: Text To Speech | (none) | **teacher** | Course & Lesson Management | 5 scenario(s)
    - Scenario: Check that TTS player is displayed [@no_mobile]
    - Scenario: Listen to TTS Audio in CSF [@chrome]
    - Scenario: Listen to TTS Audio in CSF contained level [@chrome]
    - Scenario: Listen to TTS Audio in CSD [@chrome]
    - Scenario: Listen to TTS Audio in CSP and CSP contained level [@chrome]
- `dashboard/test/ui/features/teacher_tools/instructions/hoc_top_instructions.feature` | Feature: Eyes Tests for HOC Top Instructions | @eyes @as_student | **student** | Level Instructions & Feedback | 1 scenario(s)
    - Scenario: HOC Top Instructions
- `dashboard/test/ui/features/teacher_tools/student_not_started_level_warning.feature` | Feature: Student Has Not Started Level Warning | @eyes | **teacher** | Course & Lesson Management | 3 scenario(s)
    - Scenario: Game lab level where student has not started
    - Scenario: Maze level where student has not started
    - Scenario: Contained level
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature` | Feature: Using the V2 progress page | @no_mobile | **teacher** | Teacher Dashboard | 8 scenario(s)
    - Scenario: Teacher can open and close Icon Key and details [@no_device_farm]
    - Scenario: Viewing student metadata
    - Scenario: Teacher can open and close lessons and see level data cells
    - Scenario: Teacher can navigate to student work by clicking level cell.
    - Scenario: Teacher can open lesson data, refresh the page, and lesson data will still be shown [@skip]
    - Scenario: Teacher can view lesson progress for when students have completed a lesson and when they have started a lesson but not finished [@eyes]
    - Scenario: Teacher can view student work, ask student to keep working, on rubric level [@eyes]
    - Scenario: Teacher can view choice levels [@eyes]
- `dashboard/test/ui/features/teacher_tools/lesson_lock.feature` | Feature: Lesson Locking | @no_mobile | **teacher** | Course & Lesson Management | 4 scenario(s)
    - Scenario: Stage Locking Dialog [@eyes]
    - Scenario: Readonly view does not show teacher only boxes
    - Scenario: Lock settings for students in survey
    - Scenario: Lock settings for students who never submit
- `dashboard/test/ui/features/teacher_tools/version_history.feature` | Feature: Version History in Teacher View | @no_mobile | **teacher** | Course & Lesson Management | 2 scenario(s)
    - Scenario: Teacher can view student versions
    - Scenario: Teacher can view own versions
- `dashboard/test/ui/features/teacher_tools/level_types/standalone_video.feature` | Feature: Standalone video levels | @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 1 scenario(s)
    - Scenario: Progress is posted when continue is clicked [@as_student]
- `dashboard/test/ui/features/teacher_tools/level_types/multi.feature` | Feature: Playing multi levels | @playwright | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Loading the level
    - Scenario: Clicking an option enables submit and submitting the correct answer wins
    - Scenario: Submitting an incorrect option
- `dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature` | Feature: Using the Unit Edit Page | @no_mobile @no_safari | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 4 scenario(s)
    - Scenario: View the unit edit page
    - Scenario: View the unit edit page in locale besides en-US [@skip]
    - Scenario: Save changes to a unit
    - Scenario: Navigate from unit edit page for migrated unit to lesson edit page
- `dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature` | Feature: Multiple Choice Contained Levels | (none) | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 5 scenario(s)
    - Scenario: GameLab with a submittable contained level [@eyes]
    - Scenario: Gamelab with multiple choice contained level [@eyes]
    - Scenario: Unauthorized Teacher on CSF Maze with multiple choice contained level [@eyes]
    - Scenario: Teacher can reset progress on multiple choice contained level
    - Scenario: Student can retry multiple choice contained level that allows multiple attempts
- `dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature` | Feature: Project Sharing - Young Students | @no_mobile @as_young_student | **student** | Student Projects & Galleries | 4 scenario(s)
    - Scenario: Share dialog can be opened and closed
    - Scenario: Young Student Can Share Non-Open-ended Projects via URL
    - Scenario: Young Student Not In Teacher Section Cannot Share Open-ended Projects via URL
    - Scenario: Young Students Can Not By Default Make App Lab Projects
- `dashboard/test/ui/features/teacher_tools/level_types/level_group.feature` | Feature: Level Group | @no_mobile | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 3 scenario(s)
    - Scenario: Submit three answers. [@as_student]
    - Scenario: Match levels within level group
    - Scenario: Submit all answers, including match levels
- `dashboard/test/ui/features/teacher_tools/projects/projects.feature` | Feature: Projects | (none) | **student** | Student Projects & Galleries | 2 scenario(s)
    - Scenario: My Projects [@eyes @as_student]
    - Scenario: Project Ownership
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/calendar_eyes.feature` | Feature: Calendar page - Eyes | @no_mobile @eyes | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Lesson materials page
- `dashboard/test/ui/features/teacher_tools/instructions/feedback_tab_eyes.feature` | Feature: Feedback Tab Visibility | @dashboard_db_access @eyes | **student** | Level Instructions & Feedback | 2 scenario(s)
    - Scenario: As student 'Feedback' tab is the 'Key Concept' tab if no feedback
    - Scenario: As teacher, when viewing a level with student work,
- `dashboard/test/ui/features/teacher_tools/level_types/level_group_activity_guide.feature` | Feature: Level Group Activity Guide | @no_mobile | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 4 scenario(s)
    - Scenario: Submit activity guide and go to next level. [@as_student]
    - Scenario: Teacher can view student summary of responses.
    - Scenario: Teacher can view student summary of responses on level marked as assessment
    - Scenario: Student can see level numbers for level group levels in header.
- `dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature` | Feature: After completing the Hour of Code, the player is directed to a congratulations page | (none) | **teacher** | Certificates | 4 scenario(s)
    - Scenario: Completing UI Test Artist HoC should go to certificate page and generate a certificate
    - Scenario: non-mee 3rd party tutorial redirects to congrats page with params [@no_safari @contentful_key]
    - Scenario: flappy course certificates [@eyes @contentful_key]
    - Scenario: oceans course certificates [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/demo_section_card.feature` | Feature: Demo section card on the teacher homepage | @no_mobile @playwright | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Teacher with zero sections can create a practice section from the homepage
- `dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page.feature` | Feature: Level Group | @no_mobile @as_taught_student | **student** | Level Types (Bubble Choice/Multi/Match/etc) | 2 scenario(s)
    - Scenario: multi page level numbering
    - Scenario: Submit three pages.
- `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature` | Feature: Self Paced PL Instructor in Training - Verified Instructor | @no_phone | **teacher** | Instructor-in-Training Gating | 6 scenario(s)
    - Scenario: View Instructor In Training Applab Level as Verified Teacher [@properties_encryption_key]
    - Scenario: View Instructor In Training Dance Level as Verified Teacher [@no_mobile]
    - Scenario: View Instructor In Training Free Response Level as Verified Teacher [@properties_encryption_key @no_mobile]
    - Scenario: View Instructor In Training External Level as Verified Teacher [@no_mobile]
    - Scenario: View Instructor In Training Bubble Choice Level as Verified Teacher [@no_mobile]
    - Scenario: View Instructor In Training LevelGroup Level as Verified Teacher [@no_mobile]
- `dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature` | Feature: Fallback player caption dialog link | @no_mobile | **student** | Video Player | 2 scenario(s)
    - Scenario: Standalone level with fallback video player has captions popup
    - Scenario: Level with fallback video player in dialog has captions popup
- `dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature` | Feature: Student can complete rubric-enabled level | (none) | **student** | AI Rubrics & Assessment | 2 scenario(s)
    - Scenario: Student of verified teacher can complete rubric-enabled level
    - Scenario: Student of unverified teacher can complete rubric-enabled level
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/lesson_materials_eyes.feature` | Feature: Lesson materials page - Eyes | @no_mobile @eyes | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Lesson materials page
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_code_review_groups.feature` | Feature: Managing code review groups in the "Manage Students" tab of the teacher dashboard | @no_mobile | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Create a code review group, add a student to it, save it, and unassign all from group
    - Scenario: Enable code review for a section
- `dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature` | Feature: Using the Lesson Edit Page | @no_mobile | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 4 scenario(s)
    - Scenario: Save changes using the lesson edit page for lesson without lesson plan
    - Scenario: Save changes using the lesson edit page
    - Scenario: Add a level using the lesson edit page
    - Scenario: Update script level properties [@no_firefox]
- `dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_project_validator.feature` | Feature: Public Project Gallery - Project Validator | @dashboard_db_access @no_mobile @chrome @single_session | **student** | Student Projects & Galleries | 2 scenario(s)
    - Scenario: Can Toggle to the Personal Project Gallery
    - Scenario: Can See Special Topics and View More with Experiment enabled
- `dashboard/test/ui/features/teacher_tools/levelbuilder/create_and_delete_data_docs.feature` | Feature: Creating and deleting data docs | @no_mobile | **levelbuilder** | Levelbuilder (Curriculum Authoring) | 1 scenario(s)
    - Scenario: Create new data doc, see it on index page, and delete it
- `dashboard/test/ui/features/teacher_tools/projects/prevent_report_abuse_spam.feature` | Feature: Prevent Report Abuse Spam | @dashboard_db_access @no_mobile @no_firefox @no_safari | **anonymous** | Student Projects & Galleries | 6 scenario(s)
    - Scenario: Report Abuse link hidden if the user already reported AppLab project - studio
    - Scenario: Report Abuse link hidden if the user already reported AppLab project - share page
    - Scenario: Report Abuse link hidden if the user already reported GameLab project - studio
    - Scenario: Report Abuse link hidden if the user already reported Game Lab project - share page
    - Scenario: Abuse reports from verified teachers block a project for other viewers
    - Scenario: Projects made by project validators are protected from abuse reports
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/view_other_teacher_dashboard_pages.feature` | Feature: Views the pages on the teacher dashboard that are untested elsewhere | @no_mobile | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Viewing teacher dashboard pages
- `dashboard/test/ui/features/teacher_tools/projects/applab_project.feature` | Feature: Applab Project | (none) | **student** | Student Projects & Galleries | 4 scenario(s)
    - Scenario: Applab Flow [@as_taught_student @no_mobile]
    - Scenario: Save Project After Signing Out [@skip @no_mobile]
    - Scenario: Save Script Level After Signing Out [@skip]
    - Scenario: Remix project creates and redirects to new channel [@as_student @no_mobile]
- `dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature` | Feature: Evaluate student code against rubrics using AI | @no_firefox @no_mobile | **teacher** | AI Rubrics & Assessment | 6 scenario(s)
    - Scenario: Validate Rubric AI Config [@chrome]
    - Scenario: Student code is evaluated by AI when student submits project
    - Scenario: Student code is evaluated by AI when teacher requests individual evaluation
    - Scenario: Student code is evaluated by AI when teacher requests evaluation for entire class
    - Scenario: Alerts are shown when AI scores are available to review
    - Scenario: Alerts are shown when AI scores are available to review [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/assessment_feedback_download.feature` | Feature: Using the assessments tab in the teacher dashboard to get feedback for script | @no_mobile | **teacher** | Teacher Dashboard | 2 scenario(s)
    - Scenario: Assessments tab has feedback download
    - Scenario: Assessments tab does not have feedback download
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature` | Feature: Using the teacher homepage | @no_mobile | **teacher** | Teacher Dashboard | 8 scenario(s)
    - Scenario: Teacher can access section pages from section options dropdown
    - Scenario: Teacher can archive and restore sections from the section options dropdown
    - Scenario: Teacher can delete a section from the section options dropdown
    - Scenario: Teacher can assign a course from the "Assign a course" button and access lessons from the "Jump to" dropdown
    - Scenario: Teacher can access section roster from the "Add students" button on the section card
    - Scenario: Teacher can view student progress from the "View progress" button on the section card
    - Scenario: Teacher can view lesson materials from the "View lesson materials" button on the section card
    - Scenario: Teacher can view sections on new teacher homepage [@eyes]
- `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments2.feature` | Feature: Using the assessments tab in the teacher dashboard | @no_mobile | **teacher** | Teacher Dashboard | 1 scenario(s)
    - Scenario: Assessments tab survey submissions
- `dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature` | Feature: The video fallback player works as expected | (none) | **student** | Video Player | 5 scenario(s)
    - Scenario: Fallback player [@eyes]
    - Scenario: Fallback player for unplugged [@eyes]
    - Scenario: Fallback player for embedded [@eyes]
    - Scenario: Flash fallback player gets injected in Chrome (assuming Flash is available) [@skip]
    - Scenario: Normal player [@no_mobile]

### xteam/

- `dashboard/test/ui/features/xteam/gdpr_dialog.feature` | Feature: GDPR Dialog - data transfer agreement | @no_mobile @playwright | **anonymous** | Legal/Compliance Overlays | 5 scenario(s)
    - Scenario: EU user sees the GDPR Dialog on dashboard, opt out
    - Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
    - Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
    - Scenario: GDPR Dialog privacy link works from dashboard
    - Scenario: Accept, sign out, sign in again, no dialog
- `dashboard/test/ui/features/xteam/cookie_banner.feature` | Feature: Cookie banner on various sites | @eyes @playwright | **anonymous** | Legal/Compliance Overlays | 1 scenario(s)
    - Scenario Outline: Show cookie banner, dismiss it and confirm it's dismissed
- `dashboard/test/ui/features/xteam/race_interstitial.feature` | Feature: Race Interstitial | @as_student @playwright | **anonymous** | Legal/Compliance Overlays | 1 scenario(s)
    - Scenario: Race Interstitial Shown And Dismissed [@eyes]## 3. step_definitions inventory

Location: `dashboard/test/ui/features/step_definitions/*.rb` (42 files, Cucumber/Selenium glue code shared by every `.feature` file).

| File | Lines | Purpose |
|---|---|---|
| `steps.rb` | 1749 | Generic catch-all steps: navigation, clicking/selectors, waits, form fill, page assertions, cookies, mocking DCDO/experiments. The default home for a new step. |
| `pd.rb` | 603 | Professional-development workshop steps: creating/joining workshops, enrollment, facilitator/organizer surveys, certificates. |
| `section_management_steps.rb` | 445 | Teacher section CRUD: creating sections, adding/removing students, login-type/section settings. |
| `blockly.rb` | 430 | Blockly workspace steps: dragging/inspecting blocks, running code, checking block XML/state. |
| `applab.rb` | 358 | App Lab steps: design mode, screen/component manipulation, running an App Lab app. |
| `account_steps.rb` | 337 | Account/auth steps: sign up, sign in, sign out, account-type switching. |
| `levelbuilder_steps.rb` | 285 | Levelbuilder steps: editing/saving levels, lessons, scripts, units in the curriculum-authoring UI. |
| `progress.rb` | 153 | Student progress steps: level/lesson completion state, progress-bubble assertions. |
| `project_steps.rb` | 157 | Student project steps: creating/saving/sharing/remixing projects, project gallery assertions. |
| `droplet_steps.rb` | 145 | Droplet-editor (text-based code editor) steps used by older text-based labs. |
| `blockly_initialization_blocks.rb` | 140 | Steps for verifying a level's initial/starter block layout. |
| `gamelab.rb` | 135 | Game Lab steps: sprite/animation manipulation, canvas assertions. |
| `eyes_steps.rb` | 117 | Applitools Eyes steps: taking/checking visual snapshots, region exclusions. |
| `publicKeyCryptography_steps.rb` | 95 | Public Key Cryptography widget steps. |
| `header_steps.rb` | 74 | Site header steps: nav links, user menu, mobile header state. |
| `lesson_management_steps.rb` | 52 | Lesson-level teacher steps: showing/hiding, locking, extras panel. |
| `solutions.rb` | 51 | Steps for checking a level against its authored solution. |
| `top_instructions.rb` | 39 | Level instructions panel steps (open/close, content assertions). |
| `check_finish_button.rb` | 39 | Assertions on the level "finish"/submit button state. |
| `pixelation.rb` | 43 | Pixelation-lab specific canvas/image steps. |
| `angleHelper.rb` | 43 | Angle Helper widget steps. |
| `browser_control.rb` | 32 | Low-level browser control: window size, alerts, tab switching. |
| `settings_cog_steps.rb` | 31 | User-settings-cog menu steps. |
| `match_steps.rb` | 31 | Match-level-type steps (matching pairs). |
| `authoredHints.rb` | 27 | Authored-hints panel steps. |
| `callouts.rb` | 28 | Onboarding/callout tooltip steps. |
| `flappy_steps.rb` | 26 | Flappy-game level steps. |
| `footer_steps.rb` | 26 | Site footer steps. |
| `netsim.rb` | 27 | Netsim (networking simulator) widget steps. |
| `experiment_steps.rb` | 24 | Feature-experiment (A/B test bucket) mocking steps. |
| `dropdown.rb` | 21 | Generic dropdown-menu steps. |
| `geolocation_steps.rb` | 20 | Browser geolocation mocking steps. |
| `global_edition_steps.rb` | 12 | Switches the `ge_region` query param to simulate a Global Edition region. |
| `studio.rb` | 12 | Legacy Blockly-studio sprite/teacher-panel steps. |
| `lesson_lock.rb` | 11 | Asserts whether a lesson row shows locked/unlocked in the teacher UI. |
| `cap_steps.rb` | 10 | Child Account Policy (CAP) lockout/phase date mocking. |
| `check_finish_button.rb` | 39 | (see above) |
| `script_data_steps.rb` | 5 | Reads a level page's `script[data-*]` JSON blob and waits for a field to match. |
| `codebridge_steps.rb` | 6 | Opens a file-row's dropdown/kebab menu in the CodeBridge file browser. |
| `spritelab.rb` | 6 | Starts a new Sprite Lab project. |
| `farmer_steps.rb` | 4 | Farmer (maze-variant) map-state assertion. |
| `minecraft.rb` | 4 | Waits for the Craft/Minecraft Phaser engine to finish loading. |

## 4. How to run (from `dashboard/test/ui/README.md` and `dashboard/test/ui/config/README.md`)

**Runner**: `dashboard/test/ui/runner.rb`, a Cucumber wrapper. Run from `dashboard/test/ui/`.

**Local iteration (fastest)**:
- `./runner.rb -l` — local chromedriver against local dashboard/pegasus domains, headless by default.
  - `--headed` shows the Chrome window.
  - `-f features/path/to/test.feature` (or `-f features/foo.feature:40` for one scenario at that line) runs a single feature/scenario.
  - `rake test:ui feature=path/to/test.feature` is the one-liner equivalent.
  - `tail -f log/*.log` (or `-f log/*.html` with `--html`) to watch results.
- First time only: `bundle install && rbenv rehash`; if data is missing, `bundle exec rake seed:ui_test` (dashboard/).

**Remote browsers**:
- Sauce Labs: needs `sauce connect proxy` (`bin/sauce_connect`) tunneling to localhost, plus `saucelabs_username`/`saucelabs_authkey`/`saucelabs_tunnel_name` in `locals.yml`. Run with `-c Chrome --html` (no `-l` needed, but `-l` plus `-c` also works for pointing at localhost).
- AWS Device Farm: no tunnel support, so it can't hit a dev machine directly. Use it to reproduce a failure against `test-studio.code.org`: `runner.rb --html --device-farm -c Chrome -f ...`. To reproduce against modified app code, use `bin/drone/shell` (drone container) or Device Farm against an adhoc.
- `-e` / `--eyes` restricts the run to Applitools Eyes (`@eyes`-tagged) visual-diff tests; needs Eyes API key (see `docs/testing-with-applitools-eyes.md`).

**Domain flags** (what "local vs test-studio" means): with no `-d`/`-p` override, tests point at the deployed `test.code.org`/`test-studio.code.org`. `-d`/`--dashboard <domain>` and `-p`/`--pegasus <domain>` override the studio/pegasus domain, e.g. `-d localhost-studio.code.org:3000` to point at a local Rails server instead. `-l`/`--local` is shorthand that sets local domains **and** switches to the local webdriver (unless `-c` is also given).

**Other flags of note**: `-c` (browser config name), `-n <N>` (parallel browsers), `--ci` (skip CI-excluded tests, i.e. respects `@no_ci`), `--db` (allow DB-access scripts outside dev/test env), `--auto_retry`/`--retry_count`/`--magic_retry` (flaky-test reruns), `--dry-run` (parse without executing), `--first-run-local` (local webdriver on first attempt, remote provider on reruns — used to debug Drone failures).

**CI behavior**: Drone runs all UI/Eyes tests against Chrome only by default; commit-message tags (`[test firefox]`, `[test all browsers]`, `[skip chrome]`) force other browsers, which also forces the run off Device Farm and onto Sauce Labs (see `lib/rake/ci.rake`). DTT (deploy-to-test) runs three parallel suites: Chrome+Firefox on Device Farm, Safari+iPad+iPhone on Sauce Labs, and Eyes (Chrome only) on Sauce Labs.

**Curriculum content for these tests** (`dashboard/test/ui/config/README.md`): lives in `dashboard/test/ui/config`, mirroring `dashboard/config`'s layout, seeded by `rake seed:ui_test`. It's a separate partition from production curriculum data so CI/dev containers can seed only this tree. Course offerings/courses/units are named `ui-test-*`; levels are named `UI Test *` (case-insensitive) with DSL files like `ui_test_foo.multi`. A `UI Test ` level may only be referenced by a `ui-test-` unit (not vice versa); parent/child levels must stay on the same side of the partition; `grep -r ui_test_name? dashboard` finds the enforcement points. Developers author this content locally with `levelbuilder_mode` enabled (curriculum authors cannot save/destroy `UI Test ` levels). A unit needing publicly cacheable level pages needs an entry in `CACHED_UI_TEST_UNITS` (`lib/cdo/http_cache.rb`).
