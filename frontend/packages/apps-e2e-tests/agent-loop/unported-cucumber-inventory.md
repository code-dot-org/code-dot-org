# Unported Cucumber Feature Inventory

Generated from a static comparison of Cucumber features in `dashboard/test/ui/features` and Playwright specs in `frontend/packages/apps-e2e-tests/tests`.

This inventory ignores `Migration Status` markers. A Cucumber feature is treated as referenced only when a Playwright spec cites its exact `dashboard/test/ui/features/...feature` path. Scenario coverage is treated as traceable only when a scenario title appears in a nearby `Scenario:` comment or, for specs with one source feature, as a Playwright test title.

## Summary

| Metric                                                      | Count |
| ----------------------------------------------------------- | ----: |
| Cucumber feature files                                      |   271 |
| Playwright spec files                                       |   125 |
| Feature files referenced by Playwright                      |   164 |
| Feature files with no Playwright source-path reference      |   107 |
| Referenced feature files with all scenario titles traceable |    60 |
| Referenced feature files with some untraced scenario titles |    82 |
| Referenced feature files needing scenario-level audit       |    22 |
| Playwright specs with no Cucumber source-path reference     |     1 |

## Unreferenced Feature Files By Area

| Area                                                           | Files | Scenarios | Eyes-ish files |
| -------------------------------------------------------------- | ----: | --------: | -------------: |
| `teacher_tools/teacher_dashboard`                              |    12 |        24 |              6 |
| `acquisition_products/pd`                                      |     8 |        18 |              5 |
| `platform/global_edition`                                      |     6 |        11 |              3 |
| `teacher_tools/levelbuilder`                                   |     6 |        12 |              0 |
| `teacher_tools/instructions`                                   |     5 |         8 |              5 |
| `star_labs/applab`                                             |     4 |        11 |              4 |
| `teacher_tools/projects`                                       |     4 |        14 |              1 |
| `star_labs/weblab`                                             |     3 |         3 |              0 |
| `student_learning/hour_of_code`                                |     3 |        16 |              0 |
| `teacher_tools/certificates`                                   |     3 |         9 |              3 |
| `teacher_tools/instructor_in_training`                         |     3 |        18 |              0 |
| `code_tools/blockly`                                           |     2 |         2 |              2 |
| `acquisition_products/curriculum_catalog_filters.feature`      |     1 |         5 |              1 |
| `acquisition_products/pl_landing_page.feature`                 |     1 |         6 |              1 |
| `acquisition_products/regional_workshop_catalog.feature`       |     1 |         4 |              0 |
| `acquisition_products/school_info_confirmation_dialog.feature` |     1 |         1 |              0 |
| `acquisition_products/sign_up.feature`                         |     1 |         3 |              1 |
| `code_tools/pythonlab`                                         |     1 |         1 |              1 |
| `eyes.feature`                                                 |     1 |         0 |              1 |
| `foundations/footer.feature`                                   |     1 |         8 |              1 |
| `initial_page_views.feature`                                   |     1 |         1 |              1 |
| `initial_page_views2.feature`                                  |     1 |         1 |              1 |
| `initial_page_views3.feature`                                  |     1 |         2 |              1 |
| `initial_page_views_csf.feature`                               |     1 |         1 |              1 |
| `javalab/code_review_finish_button.feature`                    |     1 |         2 |              0 |
| `javalab/code_review_scenarios.feature`                        |     1 |         1 |              1 |
| `javalab/console_only.feature`                                 |     1 |         1 |              1 |
| `javalab/javalab_demo_mode.feature`                            |     1 |         1 |              1 |
| `javalab/neighborhood.feature`                                 |     1 |         1 |              1 |
| `javalab/prompter.feature`                                     |     1 |         1 |              1 |
| `javalab/theater.feature`                                      |     1 |         1 |              1 |
| `platform/teacher_dashboard`                                   |     1 |         1 |              0 |
| `platform/user_settings.feature`                               |     1 |         1 |              0 |
| `star_labs/artist_autorun.feature`                             |     1 |         1 |              1 |
| `star_labs/gamelab`                                            |     1 |         2 |              1 |
| `star_labs/mobile_portait.feature`                             |     1 |         1 |              0 |
| `star_labs/public_key_cryptography`                            |     1 |         2 |              1 |
| `star_labs/spritelab`                                          |     1 |         1 |              1 |
| `student_learning/weblab2`                                     |     1 |         1 |              0 |
| `teacher_tools/ai_diff`                                        |     1 |         1 |              1 |
| `teacher_tools/below_visualization.feature`                    |     1 |         1 |              1 |
| `teacher_tools/encrypted_level.feature`                        |     1 |         1 |              0 |
| `teacher_tools/hidden_scripts_eyes.feature`                    |     1 |         1 |              1 |
| `teacher_tools/hidden_stages_eyes.feature`                     |     1 |         1 |              1 |
| `teacher_tools/hour_of_code`                                   |     1 |         2 |              1 |
| `teacher_tools/lesson_lock.feature`                            |     1 |         4 |              1 |
| `teacher_tools/lesson_lock_retake.feature`                     |     1 |         2 |              1 |
| `teacher_tools/lesson_show.feature`                            |     1 |         1 |              1 |
| `teacher_tools/level_completion.feature`                       |     1 |         0 |              1 |
| `teacher_tools/level_video.feature`                            |     1 |         1 |              1 |
| `teacher_tools/pl_sections.feature`                            |     1 |        10 |              0 |
| `teacher_tools/plc_course_unit_navigation.feature`             |     1 |         1 |              0 |
| `teacher_tools/progress.feature`                               |     1 |         2 |              0 |
| `teacher_tools/student_not_started_level_warning.feature`      |     1 |         3 |              1 |
| `teacher_tools/submittable_eyes.feature`                       |     1 |         2 |              1 |
| `teacher_tools/teacher_homepage.feature`                       |     1 |         9 |              0 |
| `teacher_tools/teacher_lesson_plan.feature`                    |     1 |         2 |              1 |
| `teacher_tools/teacher_student_toggle.feature`                 |     1 |         3 |              1 |
| `teacher_tools/video`                                          |     1 |         5 |              1 |
| `xteam/race_interstitial.feature`                              |     1 |         1 |              1 |

## Feature Files With No Playwright Source-Path Reference

| Feature                                                                                                               | Scenarios | Flags                  |
| --------------------------------------------------------------------------------------------------------------------- | --------: | ---------------------- |
| `dashboard/test/ui/features/acquisition_products/curriculum_catalog_filters.feature`                                  |         5 | eyes                   |
| `dashboard/test/ui/features/acquisition_products/pd/daily_survey_results.feature`                                     |         1 | eyes, skip             |
| `dashboard/test/ui/features/acquisition_products/pd/dashboard_view.feature`                                           |         2 | eyes                   |
| `dashboard/test/ui/features/acquisition_products/pd/regional_partner_mini_contact.feature`                            |         3 | no_mobile              |
| `dashboard/test/ui/features/acquisition_products/pd/workshop_certificates.feature`                                    |         1 | eyes                   |
| `dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_form.feature`                         |         2 | eyes, skip             |
| `dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_view.feature`                         |         1 | eyes                   |
| `dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature`                                      |         4 | -                      |
| `dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature`                                     |         4 | -                      |
| `dashboard/test/ui/features/acquisition_products/pl_landing_page.feature`                                             |         6 | eyes, no_mobile        |
| `dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature`                                   |         4 | no_mobile              |
| `dashboard/test/ui/features/acquisition_products/school_info_confirmation_dialog.feature`                             |         1 | no_mobile              |
| `dashboard/test/ui/features/acquisition_products/sign_up.feature`                                                     |         3 | eyes                   |
| `dashboard/test/ui/features/code_tools/blockly/modal_function_editor_eyes.feature`                                    |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/code_tools/blockly/spritelab_eyes.feature`                                                |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/code_tools/pythonlab/pythonlab_start_mode_eyes.feature`                                   |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/eyes.feature`                                                                             |         0 | eyes                   |
| `dashboard/test/ui/features/foundations/footer.feature`                                                               |         8 | eyes, skip             |
| `dashboard/test/ui/features/initial_page_views.feature`                                                               |         1 | eyes                   |
| `dashboard/test/ui/features/initial_page_views2.feature`                                                              |         1 | eyes                   |
| `dashboard/test/ui/features/initial_page_views3.feature`                                                              |         2 | eyes, no_ci            |
| `dashboard/test/ui/features/initial_page_views_csf.feature`                                                           |         1 | eyes, skip             |
| `dashboard/test/ui/features/javalab/code_review_finish_button.feature`                                                |         2 | no_mobile, no_ci       |
| `dashboard/test/ui/features/javalab/code_review_scenarios.feature`                                                    |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/javalab/console_only.feature`                                                             |         1 | eyes, no_ci            |
| `dashboard/test/ui/features/javalab/javalab_demo_mode.feature`                                                        |         1 | eyes, no_mobile, no_ci |
| `dashboard/test/ui/features/javalab/neighborhood.feature`                                                             |         1 | eyes, no_ci            |
| `dashboard/test/ui/features/javalab/prompter.feature`                                                                 |         1 | eyes, no_ci            |
| `dashboard/test/ui/features/javalab/theater.feature`                                                                  |         1 | eyes, no_ci            |
| `dashboard/test/ui/features/platform/global_edition/fa/personal_project_gallery.feature`                              |         1 | no_mobile              |
| `dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature`                                       |         6 | eyes, no_mobile        |
| `dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature`                                          |         1 | eyes                   |
| `dashboard/test/ui/features/platform/global_edition/fa/sign_up_page.feature`                                          |         1 | eyes                   |
| `dashboard/test/ui/features/platform/global_edition/fa/signed_out.feature`                                            |         1 | skip, no_mobile        |
| `dashboard/test/ui/features/platform/global_edition/fa/teacher_dashboard.feature`                                     |         1 | no_mobile              |
| `dashboard/test/ui/features/platform/teacher_dashboard/manage_students_tab.feature`                                   |         1 | no_mobile              |
| `dashboard/test/ui/features/platform/user_settings.feature`                                                           |         1 | skip                   |
| `dashboard/test/ui/features/star_labs/applab/eyes1.feature`                                                           |         4 | eyes                   |
| `dashboard/test/ui/features/star_labs/applab/eyes2.feature`                                                           |         4 | eyes, skip             |
| `dashboard/test/ui/features/star_labs/applab/eyes3.feature`                                                           |         1 | eyes                   |
| `dashboard/test/ui/features/star_labs/applab/eyes4.feature`                                                           |         2 | eyes                   |
| `dashboard/test/ui/features/star_labs/artist_autorun.feature`                                                         |         1 | eyes                   |
| `dashboard/test/ui/features/star_labs/gamelab/eyes.feature`                                                           |         2 | eyes                   |
| `dashboard/test/ui/features/star_labs/mobile_portait.feature`                                                         |         1 | skip                   |
| `dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature`                                           |         2 | eyes                   |
| `dashboard/test/ui/features/star_labs/spritelab/eyes.feature`                                                         |         1 | eyes                   |
| `dashboard/test/ui/features/star_labs/weblab/versions.feature`                                                        |         1 | skip, no_ci            |
| `dashboard/test/ui/features/star_labs/weblab/weblab.feature`                                                          |         1 | no_mobile              |
| `dashboard/test/ui/features/star_labs/weblab/weblab_submittable.feature`                                              |         1 | skip, no_mobile, no_ci |
| `dashboard/test/ui/features/student_learning/hour_of_code/minecraft_codebuilder.feature`                              |         2 | skip                   |
| `dashboard/test/ui/features/student_learning/hour_of_code/ml_hoc.feature`                                             |         4 | no_mobile, no_ci       |
| `dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature`                                           |        10 | no_mobile              |
| `dashboard/test/ui/features/student_learning/weblab2/weblab2_preview.feature`                                         |         1 | no_mobile, no_ci       |
| `dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_threads.feature`                                 |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/below_visualization.feature`                                                |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/certificates/certificates.feature`                                          |         3 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/certificates/csf_certificates.feature`                                      |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature`                                      |         4 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/encrypted_level.feature`                                                    |         1 | -                      |
| `dashboard/test/ui/features/teacher_tools/hidden_scripts_eyes.feature`                                                |         1 | eyes, skip             |
| `dashboard/test/ui/features/teacher_tools/hidden_stages_eyes.feature`                                                 |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/hour_of_code/hoc_batch_certificates.feature`                                |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructions/csp_top_instructions_eyes.feature`                             |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructions/feedback_tab_eyes.feature`                                     |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructions/hoc_top_instructions.feature`                                  |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructions/teacher_only_markdown.feature`                                 |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructions/top_instructions.feature`                                      |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_universal_instructor.feature` |         6 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_unverified_teacher.feature`   |         6 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/instructor_in_training/instructor_in_training_verified_teacher.feature`     |         6 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/lesson_lock.feature`                                                        |         4 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/lesson_lock_retake.feature`                                                 |         2 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/lesson_show.feature`                                                        |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/level_completion.feature`                                                   |         0 | eyes, skip             |
| `dashboard/test/ui/features/teacher_tools/level_video.feature`                                                        |         1 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/create_and_delete_data_docs.feature`                           |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/lesson_edit_page.feature`                                      |         4 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/level_edit_page.feature`                                       |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/modular_courses.feature`                                       |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/new_unit_page.feature`                                         |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/levelbuilder/script_edit_page.feature`                                      |         4 | skip, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/pl_sections.feature`                                                        |        10 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/plc_course_unit_navigation.feature`                                         |         1 | -                      |
| `dashboard/test/ui/features/teacher_tools/progress.feature`                                                           |         2 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/projects/applab_project.feature`                                            |         4 | skip, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/projects/prevent_report_abuse_spam.feature`                                 |         6 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/projects/projects.feature`                                                  |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_project_validator.feature`                  |         2 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/student_not_started_level_warning.feature`                                  |         3 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/submittable_eyes.feature`                                                   |         2 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature`                         |         2 | -                      |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_students_modal.feature`                         |         2 | -                      |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/assessment_feedback_download.feature`                     |         2 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/calendar_eyes.feature`                                    |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/lesson_materials_eyes.feature`                            |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/local_nav_v2_standalone_eyes.feature`                     |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/manage_students_tab_views_eyes.feature`                   |         1 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments2.feature`                   |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_code_review_groups.feature`             |         2 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2_eyes.feature`              |         2 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_progress_v2.feature`                    |         8 | eyes, skip, no_mobile  |
| `dashboard/test/ui/features/teacher_tools/teacher_dashboard/view_other_teacher_dashboard_pages.feature`               |         1 | no_mobile              |
| `dashboard/test/ui/features/teacher_tools/teacher_homepage.feature`                                                   |         9 | skip, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_lesson_plan.feature`                                                |         2 | eyes, no_mobile        |
| `dashboard/test/ui/features/teacher_tools/teacher_student_toggle.feature`                                             |         3 | eyes                   |
| `dashboard/test/ui/features/teacher_tools/video/videoplayer_eyes.feature`                                             |         5 | eyes, skip, no_mobile  |
| `dashboard/test/ui/features/xteam/race_interstitial.feature`                                                          |         1 | eyes                   |

## Referenced Feature Files With Untraced Scenario Titles

These feature files have at least one Playwright source-path reference, but not every Cucumber scenario title was found in Playwright comments or single-source spec test titles. Some may be ported under renamed test titles; inspect before porting.

### `dashboard/test/ui/features/foundations/markdown_rendering.feature`

Traced 0 of 2 scenario titles.

- Visiting an external markdown level with details tag
- Viewing a level with blockly embedded in instructions

### `dashboard/test/ui/features/platform/global_edition/region_select.feature`

Traced 0 of 2 scenario titles.

- User can switch between the international and regional versions using the language selector on a Studio page
- User can switch to regional versions using the language selector on a Lab page

### `dashboard/test/ui/features/platform/global_edition/region_switch_confirm.feature`

Traced 0 of 1 scenario titles.

- The modal is shown on studio.code.org (Studio) domain

### `dashboard/test/ui/features/platform/header.feature`

Traced 4 of 6 scenario titles.

- Teacher can click on the header links
- Student can click on the header links

### `dashboard/test/ui/features/platform/one_trust.feature`

Traced 5 of 8 scenario titles.

- User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org
- Critical Javascript files are appropriately categorized by OneTrust on dashboard
- Embedded projects do not display the OneTrust banner

### `dashboard/test/ui/features/platform/policy_compliance/lockout_phase.feature`

Traced 0 of 10 scenario titles.

- Student account Under-13 in Colorado created before CAP start cannot change age and state
- Student account Under-13 not in Colorado created after CAP start can change their age and state
- Student account Under-13 not in Colorado created before CAP start can change their age and state
- Student account Over-13 and in Colorado created after CAP start can change their age and state
- Student account Over-13 and in Colorado created before CAP start can change their age and state
- Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state
- Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state
- Student account under-13 and in Colorado created before CAP start using google cannot change their age and state
- Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state
- Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state

### `dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature`

Traced 0 of 6 scenario titles.

- New under 13 account should be able to send a parental request.
- New under 13 account should be able to provide state and see lockout page to send parental request.
- New under 13 account should be able to resend the email
- New under 13 account should be able to send a different email
- Student should not be able to enter their own email as their parent's email
- Student should be able to enter their parent's email if their parent created their account

### `dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature`

Traced 0 of 7 scenario titles.

- New under 13 account should be able to elect to sign out at the lockout.
- Existing under 13 account in Colorado should not be locked out.
- Teacher should be able to connect a third-party account even without a state specified
- Student should not be able to connect a third-party account until their account is unlocked
- Sponsored student should not be able to add a personal email on an account until providing a state
- Sponsored student should not be able to add a personal email when they supply a policy state
- Sponsored student is able to add a personal email on an unlocked account

### `dashboard/test/ui/features/platform/signing_in.feature`

Traced 2 of 4 scenario titles.

- Student sign in from studio.code.org in the eu
- Signed-out joining non-picture non-word section from sign in page goes to link account page

### `dashboard/test/ui/features/star_labs/angle_helper.feature`

Traced 3 of 4 scenario titles.

- Angle Helper Eyes Tests

### `dashboard/test/ui/features/star_labs/applab/libraries.feature`

Traced 0 of 3 scenario titles.

- Publishing and unpublishing a library
- Adding and removing a library from a project
- Assigning a library to a section as a teacher

### `dashboard/test/ui/features/star_labs/applab/shared_apps.feature`

Traced 0 of 7 scenario titles.

- App Lab Share
- Can click a button in shared app
- Can change a dropdown value in shared app
- Can change a radio button value in shared app
- Can change a checkbox value in shared app
- Can type in text input on share page
- Can type in textarea on share page

### `dashboard/test/ui/features/star_labs/applab/template_backed.feature`

Traced 0 of 1 scenario titles.

- Template backed level

### `dashboard/test/ui/features/star_labs/applab/versions.feature`

Traced 0 of 5 scenario titles.

- Script Level Versions
- Project Load and Reload
- Project Version Checkpoints
- Project page refreshes when other client adds a newer version
- Project page refreshes when other client replaces current version

### `dashboard/test/ui/features/star_labs/can_see_finish.feature`

Traced 11 of 12 scenario titles.

- can see finish button on "Minecraft Adventurer"

### `dashboard/test/ui/features/star_labs/craft/dialogs.feature`

Traced 1 of 2 scenario titles.

- Playing level 6, seeing house select dialog

### `dashboard/test/ui/features/star_labs/custom_blocks.feature`

Traced 0 of 2 scenario titles.

- Poetry blocks
- Dance Party blocks

### `dashboard/test/ui/features/star_labs/dance/dance_ai_modal_eyes.feature`

Traced 0 of 1 scenario titles.

- Dance AI Modal

### `dashboard/test/ui/features/star_labs/dance/dance_party.feature`

Traced 4 of 7 scenario titles.

- Restricted audio content is protected
- Dance Party Share
- Dance Party can share while logged out

### `dashboard/test/ui/features/star_labs/dance/save_for_share.feature`

Traced 2 of 5 scenario titles.

- Free play level saves when Remix is clicked
- Project level saves when Share is clicked
- Project level saves when Remix is clicked

### `dashboard/test/ui/features/star_labs/droplet.feature`

Traced 0 of 2 scenario titles.

- Open editcode level and write some autocompleted, tooltipped code
- Open editcode level and verify parameter autocomplete replaces quoted text

### `dashboard/test/ui/features/star_labs/maker_projects.feature`

Traced 0 of 3 scenario titles.

- /projects/makerlab enables maker toolkit categories
- /projects/makerlab/new enables maker toolkit categories
- /projects/applab does not enable maker toolkit categories

### `dashboard/test/ui/features/star_labs/manage_assets.feature`

Traced 0 of 4 scenario titles.

- The manage assets dialog contains the option to record audio on Chrome
- The manage assets dialog displays the audio preview, and toggles between play and pause button.
- The manage assets dialog displays an image thumbnail and opens in a new tab when clicked
- From WebLab, the manage assets dialog does not contain the option to record audio.

### `dashboard/test/ui/features/star_labs/netsim_lobby.feature`

Traced 1 of 3 scenario titles.

- When not logged in, can connect to a router
- NetSim uses the instructions dialog

### `dashboard/test/ui/features/star_labs/pixelation.feature`

Traced 4 of 6 scenario titles.

- Pixelation version 1 with encoding controls hidden but sliders visible
- Pixelation version 1 with sliders hidden but encoding controls visible

### `dashboard/test/ui/features/star_labs/share_buttons.feature`

Traced 2 of 4 scenario titles.

- Dpad does not appear for Sprite Lab Share
- Dpad appears for Game Lab Share

### `dashboard/test/ui/features/star_labs/sharepage.feature`

Traced 1 of 2 scenario titles.

- Share and save an artist level to the project gallery

### `dashboard/test/ui/features/star_labs/sharepage_logo.feature`

Traced 0 of 6 scenario titles.

- Select the logo on an applab share page while logged in and visit the homepage
- Select the logo on a playlab share page while logged in and visit the homepage
- Select the logo on a gamelab share page while logged in and visit the homepage
- Select the logo on an artist share page while logged in and visit the homepage
- When on an applab share page while logged out on mobile, there is no logo.
- When on a gamelab share page while logged out on mobile, there is no logo.

### `dashboard/test/ui/features/star_labs/signin_callout2.feature`

Traced 1 of 5 scenario titles.

- Clicking anywhere should dismiss the login reminder
- After dismissing the callout, it should not reappear upon refresh
- Nested callouts should work as expected
- Should be immediately redirected to sign in if pressing sign in button

### `dashboard/test/ui/features/star_labs/weblab/too_young.feature`

Traced 0 of 2 scenario titles.

- Weblab Redirected
- Weblab Allowed for Student in Teacher's Section

### `dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code_signed_in.feature`

Traced 0 of 4 scenario titles.

- Failing at puzzle 6, refreshing puzzle 6, bubble should show up as attempted
- Progress on the server that is not on the client
- Go to puzzle 10, see video, go somewhere else, return to puzzle 10, should not see video
- Go to puzzle 9, see callouts, go somewhere else, return to puzzle 9, should not see callouts

### `dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature`

Traced 1 of 4 scenario titles.

- Teacher sees welcome screen for AI Differentiation
- Teacher can type messages and leave feedback in AI Differentiation chat
- Teacher sees notification

### `dashboard/test/ui/features/teacher_tools/assign_modular_course.feature`

Traced 0 of 2 scenario titles.

- Assign unit in modular course from unit overview page
- Assign unit in modular course from course overview page

### `dashboard/test/ui/features/teacher_tools/authored_hints.feature`

Traced 0 of 1 scenario titles.

- View Authored Hints

### `dashboard/test/ui/features/teacher_tools/cached_level_page.feature`

Traced 0 of 1 scenario titles.

- View cached level page as teacher

### `dashboard/test/ui/features/teacher_tools/callouts.feature`

Traced 0 of 6 scenario titles.

- Callouts having correct content and being dismissable via the target element
- Callouts having correct content and being dismissable via the x-button
- Modal ordering
- Closing using "x" button
- Only showing seen callouts once
- Opening the Show Code dialog

### `dashboard/test/ui/features/teacher_tools/challenge_level.feature`

Traced 0 of 2 scenario titles.

- Submit passing and perfect solutions
- Press the skip button

### `dashboard/test/ui/features/teacher_tools/contextual_hints.feature`

Traced 0 of 2 scenario titles.

- Blocks render in contextual hints
- Contextual hints in level without Authored Hints

### `dashboard/test/ui/features/teacher_tools/course_overview.feature`

Traced 1 of 5 scenario titles.

- Viewing course overview signed out
- Viewing course overview as a student not in a section
- Viewing course overview as a teacher with no sections
- Viewing course overview for a single-unit course

### `dashboard/test/ui/features/teacher_tools/course_versions.feature`

Traced 0 of 3 scenario titles.

- Version warning announcement on course and script overview pages
- Versions warning announcement on script overview page
- Switch versions using dropdown on script overview page

### `dashboard/test/ui/features/teacher_tools/disallowedsharing.feature`

Traced 0 of 3 scenario titles.

- Sharing a profane studio game
- Sharing a phone number studio game
- Sharing an email studio game

### `dashboard/test/ui/features/teacher_tools/documentation_landing_page.feature`

Traced 0 of 2 scenario titles.

- Documentation landing page displays
- Applab Documentation landing page displays

### `dashboard/test/ui/features/teacher_tools/fun_o_meter.feature`

Traced 0 of 1 scenario titles.

- Rate a Puzzle

### `dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature`

Traced 3 of 9 scenario titles.

- 'Help & Tips' and 'Instruction' tabs are visible if level has videos
- 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
- 'Help & Tips' and 'Instruction' tabs are visible if the level has reference links
- Do not display resources tab when there are no videos, map references, or reference links
- Resources tab displays videos, map references, and reference links with correct text and link
- Resources tab is clickable and displays correct text for contained levels

### `dashboard/test/ui/features/teacher_tools/instructions/feedback_tab.feature`

Traced 0 of 2 scenario titles.

- As student 'Feedback' tab is not visible if no feedback
- As teacher, when viewing a level with student work,

### `dashboard/test/ui/features/teacher_tools/instructions/help_and_tips.feature`

Traced 0 of 1 scenario titles.

- 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference

### `dashboard/test/ui/features/teacher_tools/join_section_signup.feature`

Traced 0 of 2 scenario titles.

- Attempt to join section while signed out
- Attempt to join section while signed in

### `dashboard/test/ui/features/teacher_tools/lesson_extras_teacher_panel.feature`

Traced 0 of 1 scenario titles.

- View student lesson extras progress

### `dashboard/test/ui/features/teacher_tools/level_navigation.feature`

Traced 0 of 3 scenario titles.

- External Video Level
- External Markdown Level
- Complete an auto-success level signed-out, continue, the auto-success level should show up as completed

### `dashboard/test/ui/features/teacher_tools/level_summary.feature`

Traced 1 of 8 scenario titles.

- Free Response level 1
- Free Response level 2
- Free Response level 3
- Multi level 1
- Multi level 2
- Check free response AI
- Check for Understanding summaries eyes

### `dashboard/test/ui/features/teacher_tools/level_types/curriculum_reference.feature`

Traced 0 of 1 scenario titles.

- Load iframe then take screenshot

### `dashboard/test/ui/features/teacher_tools/level_types/free_response_contained_levels.feature`

Traced 2 of 6 scenario titles.

- Applab with free response contained level
- Javalab with free response contained level
- Authorized Teacher on Maze with free response contained level
- Authorized Teacher on App Lab with free response contained level

### `dashboard/test/ui/features/teacher_tools/level_types/free_response_submittable.feature`

Traced 0 of 3 scenario titles.

- Loading the level
- Submit anything, unsubmit, be able to resubmit.
- Level without multiple attempts allowed is locked after submit

### `dashboard/test/ui/features/teacher_tools/level_types/level_group.feature`

Traced 0 of 3 scenario titles.

- Submit three answers.
- Match levels within level group
- Submit all answers, including match levels

### `dashboard/test/ui/features/teacher_tools/level_types/level_group_activity_guide.feature`

Traced 0 of 4 scenario titles.

- Submit activity guide and go to next level.
- Teacher can view student summary of responses.
- Teacher can view student summary of responses on level marked as assessment
- Student can see level numbers for level group levels in header.

### `dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page.feature`

Traced 0 of 2 scenario titles.

- multi page level numbering
- Submit three pages.

### `dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page_dots.feature`

Traced 0 of 2 scenario titles.

- Submit three pages as... 1. all, 2. none, 3. some questions answered.
- optional free play level

### `dashboard/test/ui/features/teacher_tools/level_types/map_level.feature`

Traced 0 of 1 scenario titles.

- Map level displays content

### `dashboard/test/ui/features/teacher_tools/level_types/match.feature`

Traced 0 of 3 scenario titles.

- Loading the level
- Solving puzzle
- Submitting an incorrect solution

### `dashboard/test/ui/features/teacher_tools/level_types/multiple_choice_contained_levels.feature`

Traced 2 of 5 scenario titles.

- GameLab with a submittable contained level
- Gamelab with multiple choice contained level
- Unauthorized Teacher on CSF Maze with multiple choice contained level

### `dashboard/test/ui/features/teacher_tools/modular_courses.feature`

Traced 0 of 2 scenario titles.

- Navigating within modular courses
- Progress is saved across modular courses

### `dashboard/test/ui/features/teacher_tools/multi_submittable.feature`

Traced 0 of 2 scenario titles.

- Loading the level
- Submit anything, unsubmit, be able to resubmit.

### `dashboard/test/ui/features/teacher_tools/pairing.feature`

Traced 0 of 3 scenario titles.

- Pair Programming submits levels for both students
- Pair Programming attempts levels for both students
- Pairing group is correctly displayed in user menu on cached levels

### `dashboard/test/ui/features/teacher_tools/projects/gamelab_project.feature`

Traced 1 of 2 scenario titles.

- Gamelab Flow

### `dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature`

Traced 0 of 2 scenario titles.

- Public Gallery Shows Expected Elements
- Public Gallery Shows Expected Project Types

### `dashboard/test/ui/features/teacher_tools/report_abuse.feature`

Traced 0 of 3 scenario titles.

- Reporting abuse while signed-out
- Reporting abuse as a signed-in student
- Reporting abuse as a signed-in teacher

### `dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature`

Traced 1 of 2 scenario titles.

- Teacher views announcement and clicks learn more

### `dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature`

Traced 0 of 6 scenario titles.

- Validate Rubric AI Config
- Student code is evaluated by AI when student submits project
- Student code is evaluated by AI when teacher requests individual evaluation
- Student code is evaluated by AI when teacher requests evaluation for entire class
- Alerts are shown when AI scores are available to review
- Alerts are shown when AI scores are available to review

### `dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature`

Traced 1 of 2 scenario titles.

- Student of unverified teacher can complete rubric-enabled level

### `dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature`

Traced 1 of 4 scenario titles.

- Teachers can give and send feedback on the rubric to students.
- Teacher views Rubric and Settings tabs
- Teacher views product tour

### `dashboard/test/ui/features/teacher_tools/script_overview.feature`

Traced 0 of 7 scenario titles.

- Viewing student progress
- Unit overview contents
- Unit overview end-of-lesson
- Unit overview new lesson plan
- Unit overview student resources as teacher
- Unit overview student resources as student
- Unit overview for unit in single-unit course

### `dashboard/test/ui/features/teacher_tools/send_lesson.feature`

Traced 1 of 3 scenario titles.

- Send lesson dialog opens and closes
- Send lesson dialog copy link button works

### `dashboard/test/ui/features/teacher_tools/student_lesson_plan.feature`

Traced 0 of 1 scenario titles.

- Viewing Student Lesson Plan

### `dashboard/test/ui/features/teacher_tools/teacher_dashboard/demo_section_card.feature`

Traced 0 of 1 scenario titles.

- Teacher with zero sections can create a practice section from the homepage

### `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_assessments1.feature`

Traced 0 of 1 scenario titles.

- Assessments tab initialization

### `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_dashboard_local_nav_v2.feature`

Traced 0 of 2 scenario titles.

- Modifying settings on the teacher dashboard
- Single-unit course overview

### `dashboard/test/ui/features/teacher_tools/teacher_dashboard/teacher_homepage_v2.feature`

Traced 0 of 8 scenario titles.

- Teacher can access section pages from section options dropdown
- Teacher can archive and restore sections from the section options dropdown
- Teacher can delete a section from the section options dropdown
- Teacher can assign a course from the "Assign a course" button and access lessons from the "Jump to" dropdown
- Teacher can access section roster from the "Add students" button on the section card
- Teacher can view student progress from the "View progress" button on the section card
- Teacher can view lesson materials from the "View lesson materials" button on the section card
- Teacher can view sections on new teacher homepage

### `dashboard/test/ui/features/teacher_tools/text_to_speech.feature`

Traced 0 of 5 scenario titles.

- Check that TTS player is displayed
- Listen to TTS Audio in CSF
- Listen to TTS Audio in CSF contained level
- Listen to TTS Audio in CSD
- Listen to TTS Audio in CSP and CSP contained level

### `dashboard/test/ui/features/teacher_tools/unnumbered_lessons.feature`

Traced 0 of 1 scenario titles.

- Units with Unnumbered Lessons

### `dashboard/test/ui/features/teacher_tools/version_history.feature`

Traced 0 of 2 scenario titles.

- Teacher can view student versions
- Teacher can view own versions

### `dashboard/test/ui/features/xteam/cookie_banner.feature`

Traced 0 of 1 scenario titles.

- Show cookie banner, dismiss it and confirm it's dismissed

### `dashboard/test/ui/features/xteam/gdpr_dialog.feature`

Traced 0 of 5 scenario titles.

- EU user sees the GDPR Dialog on dashboard, opt out
- EU user sees the GDPR Dialog on dashboard, opt in, don't show again
- EU student who accepted on sign up doesn't see the GDPR Dialog
- GDPR Dialog privacy link works from dashboard
- Accept, sign out, sign in again, no dialog

## Referenced Feature Files Needing Scenario-Level Audit

These feature files are cited by one or more Playwright specs, but the static inventory could not find scenario-title mappings. Treat them as coverage unknown, not complete.

| Feature                                                                                      | Scenarios | Referencing specs                                                                                                                     |
| -------------------------------------------------------------------------------------------- | --------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature`                 |        14 | `frontend/packages/apps-e2e-tests/tests/catalog/catalog.spec.ts`                                                                      |
| `dashboard/test/ui/features/javalab/commit_code.feature`                                     |         2 | `frontend/packages/apps-e2e-tests/tests/legacy/javalab/javalab.spec.ts`                                                               |
| `dashboard/test/ui/features/javalab/finish_button.feature`                                   |         3 | `frontend/packages/apps-e2e-tests/tests/legacy/javalab/javalab.spec.ts`                                                               |
| `dashboard/test/ui/features/javalab/javalab_submittable.feature`                             |         2 | `frontend/packages/apps-e2e-tests/tests/legacy/javalab/javalab.spec.ts`                                                               |
| `dashboard/test/ui/features/star_labs/applab/clipping.feature`                               |         1 | `frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts`                                                                        |
| `dashboard/test/ui/features/star_labs/applab/data_blocks.feature`                            |         1 | `frontend/packages/apps-e2e-tests/tests/applab/applab-data.spec.ts`<br>`frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts` |
| `dashboard/test/ui/features/star_labs/applab/data_tab.feature`                               |         3 | `frontend/packages/apps-e2e-tests/tests/applab/applab-data.spec.ts`                                                                   |
| `dashboard/test/ui/features/star_labs/applab/html_sanitization.feature`                      |         1 | `frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts`                                                                        |
| `dashboard/test/ui/features/star_labs/applab/level_options.feature`                          |         2 | `frontend/packages/apps-e2e-tests/tests/applab/applab-data.spec.ts`<br>`frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts` |
| `dashboard/test/ui/features/star_labs/applab/scenarios.feature`                              |         2 | `frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts`                                                                        |
| `dashboard/test/ui/features/star_labs/applab/scenarios2.feature`                             |         3 | `frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts`                                                                        |
| `dashboard/test/ui/features/star_labs/applab/scenarios3.feature`                             |         2 | `frontend/packages/apps-e2e-tests/tests/applab/applab.spec.ts`                                                                        |
| `dashboard/test/ui/features/star_labs/musiclab/musiclab_drag_block.feature`                  |         1 | `frontend/packages/apps-e2e-tests/tests/lab2/music/music.spec.ts`                                                                     |
| `dashboard/test/ui/features/student_learning/hour_of_code/hoc_reset.feature`                 |         1 | `frontend/packages/apps-e2e-tests/tests/legacy/hoc/hoc.spec.ts`                                                                       |
| `dashboard/test/ui/features/student_learning/hour_of_code/hour_of_code.feature`              |         4 | `frontend/packages/apps-e2e-tests/tests/legacy/hoc/hoc.spec.ts`                                                                       |
| `dashboard/test/ui/features/student_learning/weblab2/weblab2_general.feature`                |         1 | `frontend/packages/apps-e2e-tests/tests/lab2/weblab/weblab.spec.ts`                                                                   |
| `dashboard/test/ui/features/teacher_tools/level_types/multi.feature`                         |         3 | `frontend/packages/apps-e2e-tests/tests/legacy/multi/multi.spec.ts`                                                                   |
| `dashboard/test/ui/features/teacher_tools/level_types/multi2.feature`                        |         3 | `frontend/packages/apps-e2e-tests/tests/legacy/multi/multi.spec.ts`                                                                   |
| `dashboard/test/ui/features/teacher_tools/level_types/multi3.feature`                        |         4 | `frontend/packages/apps-e2e-tests/tests/legacy/multi/multi.spec.ts`                                                                   |
| `dashboard/test/ui/features/teacher_tools/level_types/multi4.feature`                        |         3 | `frontend/packages/apps-e2e-tests/tests/legacy/multi/multi.spec.ts`                                                                   |
| `dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature`                  |         4 | `frontend/packages/apps-e2e-tests/tests/legacy/project-sharing/project-sharing.spec.ts`                                               |
| `dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature` |         2 | `frontend/packages/apps-e2e-tests/tests/legacy/video-fallback-player/video-fallback-player.spec.ts`                                   |

## Playwright Specs Without Cucumber Source-Path Reference

- `frontend/packages/apps-e2e-tests/tests/teacher/teacher-panel.spec.ts`
