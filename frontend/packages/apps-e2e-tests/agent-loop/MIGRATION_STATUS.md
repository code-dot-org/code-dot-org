# Cucumber → Playwright Migration Status

Source: `dashboard/test/ui/features/` (all sub-directories)  
Target: `frontend/packages/apps-e2e-tests/tests/`  
As of: 2026-05-09 (updated 2026-05-09 — pass 19: tt auth wave 2: pairing + version_history + assign_modular_course)

---

## Summary

| Status                                         | Count                                                                                                                                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ported                                         | 129 feature files (C+F for pythonlab + mixmoveai; Chromium-only for maker; @no_ci for ai_tutor; @no_mobile for pairing + version_history + assign_modular_course; C+F+W for rest) |
| Fixme stubs — test infra                       | 3 (applab asset upload — needs test fixture file; disallowedsharing profanity — @webpurify API not configured; gamelab export — animation picker CDN blocked)                     |
| Covered by ported (rolled in)                  | 5 (maze2, jigsaw2, multi2/3/4 rolled into existing specs)                                                                                                                         |
| Partial — @eyes (visual checkpoints annotated) | 5 ported up to snapshot; @eyes auth blocked 3                                                                                                                                     |
| Fixme stubs — @eyes / auth only                | 6 (curriculum_reference ×2, level_group_multi_page_dots ×1, applab_submittable ×1, gamelab_submittable ×1, curriculum_catalog_assign_unassign ×1)                                 |
| Skipped — auth required                        | ~35                                                                                                                                                                               |
| Skipped — @skip / @eyes_mobile                 | 3                                                                                                                                                                                 |
| Skipped — cookie/session manipulation          | 2                                                                                                                                                                                 |
| Out of scope — non-CSF labs                    | 5 labs, ~15 feature files (spritelab + craft hero_logged_out now ported)                                                                                                          |
| Out of scope — lab2 cross-origin               | WebLab full tests (Bramble cross-origin iframe); weblab/too_young ported                                                                                                          |
| Out of scope — other areas                     | javalab (3/10 ported; 7 @no_ci + @eyes), weblab2, pd/pl, xteam, levelbuilder, global_edition, policy_compliance                                                                   |
| Out of scope — standalone tools                | 0 (netsim/pixelation/pkc/studio/sharepage/modal-fn-editor/mix-move-ai all ported)                                                                                                 |
| Porteable, not yet done                        | 0                                                                                                                                                                                 |

---

## Ported

| Feature file                                                   | Playwright spec                                                    | Browsers | Notes                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `maze.feature`                                                 | `tests/legacy/maze/maze.spec.ts`                                   | C+F+W    |                                                                                                                  |
| `maze2.feature`                                                | `tests/legacy/maze/maze.spec.ts`                                   | C+F+W    | Rolled into Maze — level 4 describe                                                                              |
| `farmer.feature`                                               | `tests/legacy/farmer/farmer.spec.ts`                               | C+F+W    |                                                                                                                  |
| `bee.feature`                                                  | `tests/legacy/bee/bee.spec.ts`                                     | C+F+W    |                                                                                                                  |
| `artist.feature`                                               | `tests/legacy/artist/artist.spec.ts`                               | C+F+W    |                                                                                                                  |
| `bounce.feature`                                               | `tests/legacy/bounce/bounce.spec.ts`                               | C+F+W    |                                                                                                                  |
| `flappy.feature`                                               | `tests/legacy/flappy/flappy.spec.ts`                               | C+F+W    |                                                                                                                  |
| `jigsaw.feature`                                               | `tests/legacy/jigsaw/jigsaw.spec.ts`                               | C+F+W    |                                                                                                                  |
| `jigsaw2.feature`                                              | `tests/legacy/jigsaw/jigsaw.spec.ts`                               | C+F+W    | Rolled into level 2/3 describes                                                                                  |
| `step_mode.feature`                                            | `tests/legacy/step/step-mode.spec.ts`                              | C+F+W    | All 5 scenarios ported                                                                                           |
| `clearpuzzle.feature`                                          | `tests/legacy/clearpuzzle/clearpuzzle.spec.ts`                     | C+F+W    | All 2 scenarios ported                                                                                           |
| `musiclab/musiclab_timeline_nav.feature`                       | `tests/lab2/music/music.spec.ts`                                   | C+F+W    | @no_safari; webkit skipped                                                                                       |
| `code_tools/pythonlab/pythonlab_files.feature`                 | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | @no_safari; webkit skipped                                                                                       |
| `musiclab/musiclab_switching_levels.feature` (@eyes)           | `tests/lab2/music/music.spec.ts`                                   | C+F+W    | visual checkpoints annotated                                                                                     |
| `code_tools/pythonlab/pythonlab_run_eyes.feature`              | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | visual checkpoints annotated                                                                                     |
| `code_tools/pythonlab/pythonlab_neighborhood.feature`          | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | visual checkpoints annotated                                                                                     |
| `dance/dance_party.feature`                                    | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | 4 scenarios; age dialog bypassed                                                                                 |
| `dance/dance_ai_modal.feature`                                 | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | AI modal full flow                                                                                               |
| `dance/dance_ai_modal_eyes.feature` (@eyes)                    | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | @visual; visual checkpoints LTR+RTL                                                                              |
| `dance/save_for_share.feature`                                 | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | non-@as_student scenarios only                                                                                   |
| `spritelab/spritelab.feature`                                  | `tests/legacy/activities/spritelab/spritelab.spec.ts`              | C+F+W    | 3 scenarios; p5 barrier; grid dropdown                                                                           |
| `craft/hero_logged_out.feature`                                | `tests/legacy/activities/craft/craft.spec.ts`                      | C+F+W    | Phaser ready signal; signed-out UI check                                                                         |
| `craft/hero_logged_in.feature`                                 | `tests/legacy/activities/craft/craft.spec.ts`                      | C+F+W    | signed-in student sees continue + save-to-gallery                                                                |
| `share_buttons.feature`                                        | `tests/legacy/share-buttons/share-buttons.spec.ts`                 | C+F+W    | 2 scenarios: Sprite Lab "How it Works" present; Game Lab absent                                                  |
| `applab/clipping.feature`                                      | `tests/applab/applab.spec.ts`                                      | C+F+W    | design mode canvas clip-content CSS class                                                                        |
| `applab/sharing_from_script_level.feature`                     | `tests/applab/applab.spec.ts`                                      | C+F+W    | share URL must point to /projects/applab/                                                                        |
| `applab/scenarios.feature` (all 3 scenarios)                   | `tests/applab/applab.spec.ts`                                      | C+F+W    | free-project icon + setText/getText + textarea newline preservation                                              |
| `applab/scenarios2.feature` (scenarios 1-2)                    | `tests/applab/applab.spec.ts`                                      | C+F+W    | change event on blur + enter (text input + text area); asset upload → test.fixme                                 |
| `applab/embed.feature`                                         | `tests/applab/applab.spec.ts`                                      | C+F+W    | embed player play + "How it Works" new tab; hide-source hides that link                                          |
| `custom_blocks.feature`                                        | `tests/legacy/custom-blocks/custom-blocks.spec.ts`                 | C+F+W    | Poetry + Dancelab block pools render with no unknown blocks                                                      |
| `droplet.feature`                                              | `tests/legacy/droplet/droplet.spec.ts`                             | C+F+W    | ACE autocomplete navigation + param-completion; consecutive key presses avoid debounce                           |
| `applab/versions.feature` (scenarios 1–3)                      | `tests/applab/applab-versions.spec.ts`                             | C+F+W    | version restore + load-reload checkpoint + version-interval checkpoint; 2 fixme (multi-tab)                      |
| `applab/data_blocks.feature`                                   | `tests/applab/applab-data.spec.ts`                                 | C+F+W    | data storage API labels visible after run                                                                        |
| `applab/level_options.feature` (scenario 1)                    | `tests/applab/applab-data.spec.ts`                                 | C+F+W    | pre-populated table data visible in data browser; teacher/student scenario → fixme                               |
| `applab/data_tab.feature`                                      | `tests/applab/applab-data.spec.ts`                                 | C+F+W    | dataset import + table create/add/edit + key-value add/edit; ColumnHeader focus-steal fix                        |
| `applab/template_backed.feature`                               | `tests/applab/applab-template.spec.ts`                             | C+F+W    | code persists across levels sharing the same template; `.projectTemplateWorkspaceIcon` → `.first()`              |
| `applab/libraries.feature` (scenario 1)                        | `tests/applab/applab-libraries.spec.ts`                            | C+F+W    | publish + unpublish library; 2 fixme stubs (multi-user scenarios)                                                |
| `applab/shared_apps.feature`                                   | `tests/applab/applab-shared-apps.spec.ts`                          | C+F+W    | 7 scenarios: share page no-editor, button click, dropdown, radio, checkbox, text input, textarea                 |
| `teacher_tools/instructions/csp_instructions.feature`          | `tests/legacy/csp-instructions/csp-instructions.spec.ts`           | C+F+W    | 9 scenarios: help/tips tab, instructions tab, collapse/expand, resizer, contained levels                         |
| `applab/scenarios3.feature`                                    | `tests/applab/applab.spec.ts`                                      | C+F+W    | HTTP image proxy + clear-puzzle restore                                                                          |
| `applab/html_sanitization.feature`                             | `tests/applab/applab.spec.ts`                                      | C+F+W    | design elements maintain correct parent-child DOM hierarchy                                                      |
| `code_tools/pythonlab/pythonlab_run.feature`                   | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | student auth; progress bubble CSS checks                                                                         |
| `code_tools/pythonlab/pythonlab_start_mode.feature`            | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | levelbuilder auth; start mode file types                                                                         |
| `weblab/too_young.feature` (scenario 1)                        | `tests/lab2/weblab/weblab.spec.ts`                                 | C+F+W    | young student redirect; scenario 2 skipped                                                                       |
| `netsim_lobby.feature`                                         | `tests/legacy/netsim/netsim.spec.ts`                               | C+F+W    | 3 scenarios; anonymous; real-time lobby                                                                          |
| `pixelation.feature` (scenarios 5 & 6)                         | `tests/legacy/pixelation/pixelation.spec.ts`                       | C+F+W    | non-auth scenarios; levels 4 & 5; UI state checks                                                                |
| `pixelation.feature` (scenarios 1–4)                           | `tests/legacy/pixelation/pixelation-auth.spec.ts`                  | C+F+W    | @as_student; binary v2/v3 + hex-start; finish+reload persist; slider keyboard; save+reload convert               |
| `public_key_cryptography/continue_button.feature`              | `tests/legacy/pkc/pkc.spec.ts`                                     | C+F+W    | continue button regression; lesson 31                                                                            |
| `studio.feature`                                               | `tests/legacy/studio/studio.spec.ts`                               | C+F+W    | PlayLab sprite height before/after run                                                                           |
| `sharepage.feature` (scenario 1)                               | `tests/legacy/sharepage/sharepage.spec.ts`                         | C+F+W    | Flappy share URL; game states; "View Code" redirect                                                              |
| `sharepage.feature` (scenario 2)                               | `tests/legacy/sharepage/sharepage-project-gallery.spec.ts`         | C+F+W    | @as_student; Artist level 10; save to gallery; check /projects/ row count + name                                 |
| `code_tools/blockly/modal_function_editor.feature`             | `tests/legacy/modal-function-editor/modal-function-editor.spec.ts` | C+F+W    | 3 scenarios; SpriteLab level; flyout/drag/ESC                                                                    |
| `mix_move_ai.feature`                                          | `tests/lab2/mixmoveai/mixmoveai.spec.ts`                           | C+F      | @no_safari; full 3-phase AI generation flow                                                                      |
| `student_learning/hour_of_code/hour_of_code.feature`           | `tests/legacy/hoc/hoc.spec.ts`                                     | C+F      | anonymous; 4 scenarios; progress bubbles + hoc/reset                                                             |
| `student_learning/hour_of_code/hoc_reset.feature`              | `tests/legacy/hoc/hoc.spec.ts`                                     | C+F      | hoc/reset re-triggers video + callout state                                                                      |
| `student_learning/hour_of_code/hour_of_code_signed_in.feature` | `tests/legacy/hoc/hoc-signed-in.spec.ts`                           | C+F+W    | server-side progress; hoc/reset preserves saves                                                                  |
| `acquisition_products/curriculum_catalog.feature`              | `tests/catalog/catalog.spec.ts`                                    | C+F+W    | all 3 scenarios: signed-out redirect, student no-assign, teacher create-section prompt                           |
| `teacher_tools/challenge_level.feature`                        | `tests/legacy/challenge-level/challenge-level.spec.ts`             | C+F+W    | 2 scenarios; JS click bypasses viz overlay                                                                       |
| `dance/age_filter.feature`                                     | `tests/legacy/activities/dance/dance-age-filter.spec.ts`           | C+F+W    | student + anonymous; age dialog + ?songfilter=on                                                                 |
| `dance/age_filter2.feature`                                    | `tests/legacy/activities/dance/dance-age-filter.spec.ts`           | C+F+W    | age-13 dialog; filter persists across levels                                                                     |
| `can_see_finish.feature` (blockly @no_mobile)                  | `tests/legacy/can-see-finish/can-see-finish.spec.ts`               | C+F+W    | 5 labs at 1366×727; Game Lab + Minecraft omitted                                                                 |
| `star_labs/sharepage_logo.feature`                             | `tests/legacy/sharepage-logo/sharepage-logo.spec.ts`               | C+F+W    | 4 scenarios; App Lab / PlayLab / Game Lab / Artist; JS overlay + autoplay bypass                                 |
| `star_labs/legacy_share_remix.feature`                         | `tests/legacy/share-remix/share-remix.spec.ts`                     | C+F+W    | @no_mobile; legacy /c/ share URL remix → /projects/artist/.../edit                                               |
| `star_labs/maker_projects.feature`                             | `tests/legacy/maker/maker.spec.ts`                                 | Chromium | @chrome @no_mobile; makerlab Maker palette present; applab absent                                                |
| `gamelab/level_options.feature`                                | `tests/legacy/activities/gamelab/gamelab.spec.ts`                  | C+F+W    | 4 passing: mode toggle on/off, new project, initial animations                                                   |
| `spritelab/loading_costumes.feature`                           | `tests/legacy/activities/spritelab/spritelab.spec.ts`              | C+F+W    | Piskel editor loads in animation tab; code/anim tab switch                                                       |
| `gamelab/loading_animations.feature`                           | `tests/legacy/activities/gamelab/gamelab.spec.ts`                  | C+F+W    | blank + bear animations load without error after reload; Piskel iframe pen visible                               |
| `aichat/chat.feature`                                          | `tests/lab2/aichat/aichat.spec.ts`                                 | C+F+W    | chat bot reply color; system prompt save+persist; publish model card info                                        |
| `aichat/view_student_chat_history.feature`                     | `tests/lab2/aichat/aichat-teacher-view.spec.ts`                    | C+F+W    | authorized teacher + student; flag/unflag + thumbs-up feedback; test student model                               |
| `ai_tutor/chat.feature`                                        | `tests/lab2/ai-tutor/ai-tutor.spec.ts`                             | @no_ci   | App Lab + Python Lab + Weblab2 AI Tutor chat; bot reply background color                                         |
| `star_labs/manage_assets.feature`                              | `tests/legacy/manage-assets/manage-assets.spec.ts`                 | C+F+W    | 4 scenarios: record-audio (Chrome/skip Firefox), audio upload+preview, image thumbnail new-tab, WebLab no-record |
| `teacher_tools/feedback.feature`                               | `tests/legacy/teacher-tools/recommended-blocks-feedback.spec.ts`   | C+F+W    | @as_student; recommended bee blocks feedback + hint-request cycle                                                |
| `teacher_tools/level_summary.feature` (non-@eyes)              | `tests/legacy/teacher-tools/level-summary.spec.ts`                 | C+F+W    | check for understanding: submit response → teacher show/hide names → hide response                               |
| `teacher_tools/instructions/feedback_tab.feature`              | `tests/legacy/teacher-tools/feedback-tab.spec.ts`                  | C+F+W    | student sees Rubric tab (no submit); teacher submits rubric feedback; student sees result                        |
| `teacher_tools/pairing.feature`                                | `tests/legacy/teacher-tools/pairing.spec.ts`                       | C+F+W    | @no_mobile; 3 scenarios: pair-submit both complete, pair-attempt both attempted, pairing persists on reload      |
| `teacher_tools/version_history.feature`                        | `tests/legacy/teacher-tools/version-history.spec.ts`               | C+F+W    | @no_mobile; 2 scenarios: teacher sees student versions without Restore; teacher sees own versions with Restore   |
| `teacher_tools/assign_modular_course.feature`                  | `tests/legacy/teacher-tools/assign-modular-course.spec.ts`         | C+F+W    | @no_mobile; 2 scenarios: assign from unit page, assign from course page; API-poll post-toast for PATCH gate      |

### teacher_tools/level_types

| Feature file                                           | Playwright spec                                                                | Browsers | Notes                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ | -------- | -------------------------------------------------------- |
| `level_types/bubble_choice.feature`                    | `tests/legacy/bubble-choice/bubble-choice.spec.ts`                             | C+F+W    |                                                          |
| `level_types/curriculum_reference.feature`             | `tests/legacy/curriculum-reference/curriculum-reference.spec.ts`               | —        | 2 test.fixme stubs; all scenarios @eyes only             |
| `level_types/free_response_contained_levels.feature`   | `tests/legacy/free-response-contained/free-response-contained.spec.ts`         | C+F+W    |                                                          |
| `level_types/free_response_submittable.feature`        | `tests/legacy/free-response-submittable/free-response-submittable.spec.ts`     | C+F+W    | 3 scenarios; submit/unsubmit/lock cycle                  |
| `level_types/level_group.feature`                      | `tests/legacy/level-group/level-group.spec.ts`                                 | C+F+W    |                                                          |
| `level_types/level_group_activity_guide.feature`       | `tests/legacy/level-group-activity-guide/level-group-activity-guide.spec.ts`   | C+F+W    | 4 scenarios; submit + teacher summary + numbered bubbles |
| `level_types/level_group_multi_page.feature`           | `tests/legacy/level-group-multi-page/level-group-multi-page.spec.ts`           | C+F+W    |                                                          |
| `level_types/level_group_multi_page_dots.feature`      | `tests/legacy/level-group-multi-page-dots/level-group-multi-page-dots.spec.ts` | C+F+W    | 1 test.fixme (@properties_encryption_key) + 1 real       |
| `level_types/level_swap.feature`                       | `tests/legacy/level-swap/level-swap.spec.ts`                                   | C+F+W    |                                                          |
| `level_types/map_level.feature`                        | `tests/legacy/map-level/map-level.spec.ts`                                     | C+F+W    |                                                          |
| `level_types/match.feature`                            | `tests/legacy/match/match.spec.ts`                                             | C+F+W    |                                                          |
| `level_types/multi.feature` (+ multi2/3/4)             | `tests/legacy/multi/multi.spec.ts`                                             | C+F+W    | multi2/3/4 rolled in                                     |
| `level_types/multiple_choice_contained_levels.feature` | `tests/legacy/multiple-choice-contained/multiple-choice-contained.spec.ts`     | C+F+W    |                                                          |
| `level_types/standalone_video.feature`                 | `tests/legacy/standalone-video/standalone-video.spec.ts`                       | C+F+W    |                                                          |

### teacher_tools (non-level_types)

| Feature file                                                       | Playwright spec                                                                | Browsers | Notes                                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `teacher_tools/authored_hints.feature`                             | `tests/legacy/authored-hints/authored-hints.spec.ts`                           | C+F+W    | 1 scenario; hint cycling + display count                                                                   |
| `teacher_tools/callouts.feature`                                   | `tests/legacy/callouts/callouts.spec.ts`                                       | C+F+W    | 6 scenarios; target-element + x-button dismiss; session persistence                                        |
| `teacher_tools/contextual_hints.feature`                           | `tests/legacy/contextual-hints/contextual-hints.spec.ts`                       | C+F+W    | 2 scenarios; blocks-in-hints + level-without-authored-hints                                                |
| `teacher_tools/course_overview.feature`                            | `tests/legacy/course-overview/course-overview.spec.ts`                         | C+F+W    | 4 scenarios; signed-out/student/teacher views; 1 fixme (section auth)                                      |
| `teacher_tools/teacher_dashboard/demo_section_card.feature`        | `tests/legacy/demo-section-card/demo-section-card.spec.ts`                     | C+F+W    | 1 scenario; teacher with zero sections navigates demo section                                              |
| `teacher_tools/documentation_landing_page.feature`                 | `tests/legacy/documentation-landing-page/documentation-landing-page.spec.ts`   | C+F+W    | 2 scenarios; /docs/ and /docs/ide/applab/ content checks                                                   |
| `teacher_tools/join_section_signup.feature`                        | `tests/legacy/join-section-signup/join-section-signup.spec.ts`                 | C+F+W    | 2 scenarios; signed-out /join link + signed-in redirect chain                                              |
| `teacher_tools/lesson_extras_teacher_panel.feature`                | `tests/legacy/lesson-extras-teacher-panel/lesson-extras-teacher-panel.spec.ts` | C+F+W    | 1 scenario; teacher panel on lesson extras page + sublevel card                                            |
| `teacher_tools/level_navigation.feature`                           | `tests/legacy/level-navigation/level-navigation.spec.ts`                       | C+F+W    | 3 scenarios; continue button on video/markdown/auto-success levels                                         |
| `teacher_tools/multi_submittable.feature`                          | `tests/legacy/multi-submittable/multi-submittable.spec.ts`                     | C+F+W    | 2 scenarios; submit/unsubmit/resubmit cycle                                                                |
| `teacher_tools/projects/public_project_gallery_signed_out.feature` | `tests/legacy/public-project-gallery/public-project-gallery.spec.ts`           | C+F+W    | 2 scenarios; signed-out /projects/public gallery                                                           |
| `teacher_tools/report_abuse.feature`                               | `tests/legacy/report-abuse/report-abuse.spec.ts`                               | C+F+W    | 3 scenarios; anonymous/student/teacher; CAPTCHA bypass via test env                                        |
| `teacher_tools/script_overview.feature`                            | `tests/legacy/script-overview/script-overview.spec.ts`                         | C+F+W    | 5 scenarios; end-of-lesson header, lesson/student tabs, version pick; 2 fixme (@properties_encryption_key) |
| `teacher_tools/send_lesson.feature`                                | `tests/legacy/send-lesson/send-lesson.spec.ts`                                 | C+F+W    | 2 scenarios; modal opens, copy link; 1 fixme (modal renders properly)                                      |
| `teacher_tools/student_lesson_plan.feature`                        | `tests/legacy/student-lesson-plan/student-lesson-plan.spec.ts`                 | C+F+W    | 1 scenario; lesson plan sections, dropdown nav, overview link                                              |
| `teacher_tools/text_to_speech.feature`                             | `tests/legacy/text-to-speech/text-to-speech.spec.ts`                           | C+F+W    | 5 scenarios; inline-audio visibility, TTS button states                                                    |
| `teacher_tools/unnumbered_lessons.feature`                         | `tests/legacy/unnumbered-lessons/unnumbered-lessons.spec.ts`                   | C+F+W    | 1 scenario; lesson names without numbers in progress + header popup                                        |
| `teacher_tools/video/fallback_player_caption_dialog_link.feature`  | `tests/legacy/video-fallback-player/video-fallback-player.spec.ts`             | C+F+W    | 1 scenario; fallback VideoJS player caption link (?force_youtube_fallback)                                 |
| `teacher_tools/course_versions.feature`                            | `tests/legacy/course-versions/course-versions.spec.ts`                         | C+F+W    | 3 scenarios; version warning + dismiss persistence + dropdown selector; dispatchEvent for xmark dismiss    |
| `teacher_tools/fun_o_meter.feature`                                | `tests/legacy/fun-o-meter/fun-o-meter.spec.ts`                                 | C+F+W    | 1 scenario; rating buttons on solve, persist on reload, gone after rating + continue                       |
| `teacher_tools/projects/project_sharing.feature`                   | `tests/legacy/project-sharing/project-sharing.spec.ts`                         | C+F+W    | 4 scenarios; young student (age 10); dance share enabled, spritelab disabled, applab redirect to /home     |
| `teacher_tools/instructions/help_and_tips.feature`                 | `tests/legacy/help-and-tips/help-and-tips.spec.ts`                             | C+F+W    | 1 scenario; help tab + Circuit Playground doc link + frameLocator into instructions iframe                 |
| `teacher_tools/disallowedsharing.feature`                          | `tests/legacy/disallowed-sharing/disallowed-sharing.spec.ts`                   | C+F+W    | 2 scenarios (phone+email); 1 fixme (@webpurify); dismissOverlay before run; .share = #finishButton         |

### foundations / platform

| Feature file                                             | Playwright spec                                                    | Browsers | Notes                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `foundations/create_dropdown.feature`                    | `tests/legacy/create-dropdown/create-dropdown.spec.ts`             | C+F+W    | 5 scenarios; level page exclusion, teacher/student/young-student menus                                                  |
| `foundations/user_menu.feature`                          | `tests/legacy/user-menu/user-menu.spec.ts`                         | C+F+W    | 4 scenarios; signed-out button, teacher/student display name + menu links                                               |
| `platform/header.feature`                                | `tests/legacy/header/header.spec.ts`                               | C+F+W    | 2 scenarios; student + teacher link counts; 2 fixme (Spanish i18n)                                                      |
| `platform/login_redirect.feature`                        | `tests/legacy/login-redirect/login-redirect.spec.ts`               | C+F+W    | 2 scenarios; ?login_required=true cached-level redirect                                                                 |
| `platform/one_trust.feature`                             | `tests/legacy/one-trust/one-trust.spec.ts`                         | C+F+W    | 15 scenarios; popup, self-hosted/prod/test/off, JS categorization, 9 embedded-project suppression checks; @eyes skipped |
| `xteam/cookie_banner.feature`                            | `tests/legacy/cookie-banner/cookie-banner.spec.ts`                 | C+F+W    | 1 scenario; accept/dismiss cycle + persistence across reload; @eyes checkpoints stripped                                |
| `platform/global_edition/region_select.feature`          | `tests/legacy/region-select/region-select.spec.ts`                 | C+F+W    | 2 scenarios; Studio page + lab page locale dropdown switching                                                           |
| `platform/global_edition/region_switch_confirm.feature`  | `tests/legacy/region-switch-confirm/region-switch-confirm.spec.ts` | C+F+W    | 1 scenario; modal shown for Iranian visitors with DCDO flag                                                             |
| `platform/signing_in.feature`                            | `tests/legacy/signing-in/signing-in.spec.ts`                       | C+F+W    | 2 scenarios; student + teacher sign-in via form; 2 fixme (EU/non-picture)                                               |
| `dcdo_mocking.feature`                                   | `tests/legacy/dcdo-mocking/dcdo-mocking.spec.ts`                   | C+F+W    | 1 scenario; DCDO cookie mock/re-mock/delete lifecycle                                                                   |
| `platform/policy_compliance/policy_compliance.feature`   | `tests/legacy/policy-compliance/policy-compliance.spec.ts`         | C+F+W    | 7 scenarios; CAP lockout/home redirect, connect-button lock, sponsored student personal-login                           |
| `platform/policy_compliance/lockout_phase.feature`       | `tests/legacy/policy-compliance/lockout-phase.spec.ts`             | C+F+W    | 10 scenarios; age/state field editability for SSO + timing combinations                                                 |
| `platform/policy_compliance/parental_permission.feature` | `tests/legacy/policy-compliance/parental-permission.spec.ts`       | C+F+W    | 6 scenarios; submit/resend/update/own-email/parent-created flows                                                        |

### javalab

3 of 10 feature files ported. Remaining 7 are all-`@eyes` / all-`@no_ci`
with no portable non-visual or non-WebSocket steps (see "Out of scope" table).
The `@no_ci` finish-button tests require a live Javabuilder WebSocket; they are
excluded from automated CI runs via `grepInvert: /@no_ci/` in playwright.config.ts.

| Feature file                          | Playwright spec                        | Browsers | Notes                                                  |
| ------------------------------------- | -------------------------------------- | -------- | ------------------------------------------------------ |
| `javalab/commit_code.feature`         | `tests/legacy/javalab/javalab.spec.ts` | Chromium | 2 scenarios; commit with/without notes                 |
| `javalab/finish_button.feature`       | `tests/legacy/javalab/javalab.spec.ts` | Chromium | 3 scenarios; all `@no_ci` — manual against test-studio |
| `javalab/javalab_submittable.feature` | `tests/legacy/javalab/javalab.spec.ts` | Chromium | 1 scenario; submit/unsubmit/resubmit cycle             |

C = Chromium, F = Firefox, W = WebKit.

---

## @eyes features — visual checkpoints annotated, snapshot assertions pending

@eyes features are ported up to the visual snapshot call. Each snapshot site is
marked `// visual checkpoint: "<name>"` in the spec. The actual `toHaveScreenshot`
or equivalent assertion is deferred until visual regression infrastructure exists.

### Ported (functional steps + visual checkpoints)

| Feature file                                          | Notes                                       |
| ----------------------------------------------------- | ------------------------------------------- |
| `musiclab/musiclab_switching_levels.feature`          | level nav + run-button ready                |
| `code_tools/pythonlab/pythonlab_run_eyes.feature`     | run → console text assertion                |
| `code_tools/pythonlab/pythonlab_neighborhood.feature` | run → console text assertion                |
| `dance/dance_ai_modal_eyes.feature`                   | AI modal code toggle + emoji picker LTR+RTL |

### Blocked — auth required

| Feature file                                             | Auth blocker      |
| -------------------------------------------------------- | ----------------- |
| `code_tools/pythonlab/pythonlab_start_mode_eyes.feature` | levelbuilder auth |
| `gamelab/eyes.feature`                                   | `@as_student`     |
| `spritelab/eyes.feature`                                 | `@as_student`     |

### Blocked — also @skip or too few non-visual steps to port

| Feature file                                   | Reason                            |
| ---------------------------------------------- | --------------------------------- |
| `angle_helper.feature`                         | @skip wins                        |
| `artist_autorun.feature`                       | legacy lab; all assertions visual |
| `applab/eyes1.feature` through `eyes4.feature` | auth-required (App Lab)           |
| `public_key_cryptography/eyes.feature`         | heavy custom step definitions     |

---

## Skipped — @skip in legacy suite

Already disabled upstream; no porting action needed.

| Feature file                                                  | Reason                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `musiclab/musiclab_drag_block.feature`                        | @skip                                                                   |
| `craft/aquatic.feature`                                       | @skip (CI instability)                                                  |
| `mobile_portait.feature`                                      | @skip + @eyes_mobile                                                    |
| `student_learning/hour_of_code/minecraft_codebuilder.feature` | @skip                                                                   |
| `foundations/markdown_rendering.feature` (scenario 1)         | @properties_encryption_key — level content stays hidden without CDO key |

---

## Skipped — authentication required

Scenarios require `@as_student`, `@as_teacher`, `@as_taught_student`, or explicit
account creation steps. The Playwright teacher-tools auth helper (`createTeacher`) exists
but covers only the teacher-panel flow; porting these would need a full student/teacher
session fixture.

| Feature file                                                      | Auth dependency                                                                                                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `can_see_finish.feature` (mobile @only_mobile variants)           | needs mobile Playwright project                                                                                                                             |
| `custom_blocks.feature`                                           | ~~creates levelbuilder~~ → **ported**                                                                                                                       |
| `droplet.feature`                                                 | ~~@as_student~~ → **ported**                                                                                                                                |
| `applab_submittable.feature`                                      | test.fixme — see fixme stubs table                                                                                                                          |
| `gamelab_submittable.feature`                                     | test.fixme — see fixme stubs table                                                                                                                          |
| `applab/embed.feature`                                            | ~~@as_student~~ → **ported**                                                                                                                                |
| `applab/html_sanitization.feature`                                | ~~@as_student~~ → **ported**                                                                                                                                |
| `applab/scenarios.feature` (scenarios 2+)                         | ~~@as_student~~ → **ported**                                                                                                                                |
| `applab/scenarios2.feature` (scenario 3 — asset upload)           | test.fixme — needs artist_image_1.png test fixture                                                                                                          |
| `applab/scenarios3.feature`                                       | ~~@as_student~~ → **ported**                                                                                                                                |
| `applab/shared_apps.feature`                                      | @single_session                                                                                                                                             |
| `applab/versions.feature`                                         | ~~@no_phone~~ → **ported** (scenarios 1–3; 4–5 fixme multi-tab)                                                                                             |
| `gamelab/export_animations.feature`                               | test.fixme — animation picker library thumbnails fail to load in test-studio; same root cause currently blocks `loading_animations` test (previously green) |
| `gamelab/loading_animations.feature`                              | ~~@as_student~~ → **ported**                                                                                                                                |
| `aichat/chat.feature`                                             | ~~student auth~~ → **ported**                                                                                                                               |
| `aichat/chat_multimodal.feature`                                  | @no_ci; image upload + vision                                                                                                                               |
| `aichat/view_student_chat_history.feature`                        | ~~teacher auth~~ → **ported**                                                                                                                               |
| `ai_tutor/chat.feature`                                           | ~~student auth~~ → **ported** @no_ci                                                                                                                        |
| `manage_assets.feature`                                           | ~~asset upload state~~ → **ported** (no-auth; student project + file upload)                                                                                |
| `acquisition_products/curriculum_catalog_assign_unassign.feature` | test.fixme — see fixme stubs table                                                                                                                          |
| `acquisition_products/curriculum_catalog_filters.feature`         | @eyes                                                                                                                                                       |

---

## Skipped — cookie/session manipulation

Steps use `delete the cookie` and `clear session storage` Selenium primitives. Playwright
has `context.clearCookies()` and `evaluate(localStorage.clear())`, but these scenarios
exist mainly to test UI state reset on re-visit — low value vs. cost.

| Feature file              |
| ------------------------- |
| `signin_callout.feature`  |
| `signin_callout2.feature` |

---

## Skipped — coordinate math / block position assertions

These use pixel-coordinate `near offset` assertions (± tolerance). The Cucumber steps
calculate absolute element positions via JS and compare to stored coordinates. Replicating
this in Playwright is possible but brittle and high-maintenance.

| Feature file          | Blocker                     |
| --------------------- | --------------------------- |
| `blocklayout.feature` | block position pixel checks |

---

## Out of scope — non-CSF coding labs

These are student coding environments with their own editors or execution engines outside
the CSF Blockly runtime targeted by this porting effort. Each needs a fresh POM.

Sprite Lab (p5lab) shares the CSF `#runButton`/`#resetButton`/`.congrats` UI layer
and has been ported. Dance Party has been ported. Remaining labs below are auth-blocked
or have no non-auth scenarios.

| Lab        | Editor / runtime   | Feature files                                                                                                            | Status                                                                                              |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| App Lab    | Droplet / ACE JS   | `applab/tooltips.feature`                                                                                                | All scenarios require auth; data_blocks/data_tab/level_options/libraries/template_backed all ported |
| Game Lab   | p5.js              | `gamelab/libraries.feature`                                                                                              | All scenarios require auth                                                                          |
| Sprite Lab | Blockly + p5.js    | `spritelab/spritelab.feature`                                                                                            | **Ported** — C+F+W                                                                                  |
| Web Lab    | HTML/CSS/JS files  | `weblab/too_young.feature`, `weblab/weblab.feature`, `weblab/weblab_submittable.feature`, `weblab/versions.feature`      | All require auth or @skip                                                                           |
| Minecraft  | Custom interpreter | `craft/dialogs.feature`, `craft/hero_logged_out.feature`, `craft/hero_logged_in.feature`, `craft/can_see_finish.feature` | hero_logged_out + hero_logged_in **Ported** — C+F+W; others @skip or auth                           |

---

## Out of scope — platform and workspace infrastructure

These feature files test shared CSF platform code, not any particular lab.

| Feature file            | What it tests                                                       | Status                                                  |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `studio.feature`        | Sprite image resize after run on a PlayLab level (custom DOM check) | **Ported** — `tests/legacy/studio/studio.spec.ts`       |
| `sharepage.feature`     | Share URL generation, "View Code" redirect, embedded workspace      | **Ported** (both scenarios) — `tests/legacy/sharepage/` |
| `manage_assets.feature` | Asset upload dialog, audio record button visibility                 | ~~skipped~~ → **ported** `tests/legacy/manage-assets/`  |

---

## Out of scope — standalone educational tools

These are interactive CS Principles tools or simulations, not Blockly-based coding
environments.

| Tool / simulator             | Feature files                                      | Status                                                             |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Internet Simulator (NetSim)  | `netsim_lobby.feature`                             | **Ported** — `tests/legacy/netsim/netsim.spec.ts`                  |
| Pixelation widget            | `pixelation.feature`                               | **Fully ported** — `tests/legacy/pixelation/`; all 6 scenarios     |
| Public Key Cryptography tool | `public_key_cryptography/continue_button.feature`  | **Ported** — `tests/legacy/pkc/pkc.spec.ts`                        |
| Modal Function Editor        | `code_tools/blockly/modal_function_editor.feature` | **Ported** — `tests/legacy/modal-function-editor/`                 |
| Mix & Move AI                | `mix_move_ai.feature`                              | **Ported** — `tests/lab2/mixmoveai/mixmoveai.spec.ts` (@no_safari) |

---

## Out of scope — remaining student_learning/hour_of_code files

| Feature file       | Reason                                                                      |
| ------------------ | --------------------------------------------------------------------------- |
| `starwars.feature` | @single_session; Droplet text-mode editor — different lab type from Blockly |
| `ml_hoc.feature`   | @no_ci @no_mobile — excluded from CI; Oceans ML HoC environment             |

---

## Out of scope — lab2 cross-origin, @eyes, and remaining auth

These lab2 feature files remain blocked or out of scope.

| Feature file                                  | Status / Blocker                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `pythonlab/pythonlab_run.feature`             | **Ported** — `tests/lab2/pythonlab/pythonlab.spec.ts`                         |
| `pythonlab/pythonlab_start_mode.feature`      | **Ported** — `tests/lab2/pythonlab/pythonlab.spec.ts`                         |
| `weblab/too_young.feature` (scenario 1)       | **Ported** — `tests/lab2/weblab/weblab.spec.ts`                               |
| `weblab/too_young.feature` (scenario 2)       | Skipped — requires teacher-associated under-13 student (complex auth fixture) |
| `pythonlab/pythonlab_run_eyes.feature`        | @eyes                                                                         |
| `pythonlab/pythonlab_neighborhood.feature`    | @eyes                                                                         |
| `pythonlab/pythonlab_start_mode_eyes.feature` | @eyes                                                                         |
| `weblab/weblab.feature`                       | Cross-origin Bramble iframe — not porteable in Playwright                     |
| `weblab/versions.feature`                     | @skip + @as_student                                                           |
| `weblab/weblab_submittable.feature`           | @skip + @as_taught_student                                                    |

---

## Skipped — teacher_tools auth-blocked / @eyes

These teacher_tools feature files were evaluated and will not be ported.
All require teacher + section setup, multi-session state, @eyes visual
comparison, or @properties_encryption_key; none have anonymous-accessible
scenarios worth porting independently.

| Feature file                                                                         | Blocker                                                               |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `teacher_tools/assign_modular_course.feature`                                        | ~~teacher + section auth~~ → **ported** C+F+W @no_mobile              |
| `teacher_tools/below_visualization.feature`                                          | @eyes only                                                            |
| `teacher_tools/cached_level_page.feature`                                            | teacher + section setup                                               |
| `teacher_tools/certificates/*.feature`                                               | auth + email delivery                                                 |
| `teacher_tools/encrypted_level.feature`                                              | @properties_encryption_key                                            |
| `teacher_tools/feedback.feature`                                                     | ~~auth~~ → **ported** (no auth needed; `@as_student`)                 |
| `teacher_tools/hidden_scripts_eyes.feature`                                          | @eyes                                                                 |
| `teacher_tools/hidden_stages_eyes.feature`                                           | @eyes                                                                 |
| `teacher_tools/hour_of_code/hoc_batch_certificates.feature`                          | teacher + section auth                                                |
| `teacher_tools/instructions/feedback_tab.feature`                                    | ~~@as_taught_student~~ → **ported** C+F+W                             |
| `teacher_tools/instructions/feedback_tab_eyes.feature`                               | @eyes                                                                 |
| `teacher_tools/instructions/csp_top_instructions_eyes.feature`                       | @eyes                                                                 |
| `teacher_tools/instructions/hoc_top_instructions.feature`                            | @as_student                                                           |
| `teacher_tools/instructions/teacher_only_markdown.feature`                           | @as_taught_student                                                    |
| `teacher_tools/instructions/top_instructions.feature`                                | @as_student                                                           |
| `teacher_tools/instructor_in_training/*.feature`                                     | verified/unverified teacher auth states                               |
| `teacher_tools/lesson_lock.feature`                                                  | teacher + section + lock flow                                         |
| `teacher_tools/lesson_lock_retake.feature`                                           | same                                                                  |
| `teacher_tools/lesson_show.feature`                                                  | @as_teacher                                                           |
| `teacher_tools/level_completion.feature`                                             | teacher view of student completion                                    |
| `teacher_tools/level_summary.feature`                                                | ~~@as_taught_student~~ → **ported** (non-@eyes scenario)              |
| `teacher_tools/level_video.feature`                                                  | @as_taught_student                                                    |
| `teacher_tools/modular_courses.feature`                                              | teacher auth + modular course state                                   |
| `teacher_tools/pairing.feature`                                                      | ~~two-session pairing flow~~ → **ported** C+F+W @no_mobile            |
| `teacher_tools/plc_course_unit_navigation.feature`                                   | PLC auth                                                              |
| `teacher_tools/pl_sections.feature`                                                  | PL auth                                                               |
| `teacher_tools/progress.feature`                                                     | teacher view of student progress (auth)                               |
| `teacher_tools/projects/*.feature` (all except gallery_signed_out + project_sharing) | auth or @eyes                                                         |
| `teacher_tools/rubrics/*.feature`                                                    | auth (teacher + student code submission)                              |
| `teacher_tools/student_not_started_level_warning.feature`                            | @as_taught_student                                                    |
| `teacher_tools/submittable_eyes.feature`                                             | @eyes                                                                 |
| `teacher_tools/teacher_dashboard/*.feature` (all except demo_section_card)           | auth, @eyes, section data                                             |
| `teacher_tools/teacher_homepage.feature`                                             | teacher auth                                                          |
| `teacher_tools/teacher_lesson_plan.feature`                                          | teacher auth                                                          |
| `teacher_tools/teacher_student_toggle.feature`                                       | @as_taught_student                                                    |
| `teacher_tools/version_history.feature`                                              | ~~@as_student + project version state~~ → **ported** C+F+W @no_mobile |
| `teacher_tools/ai_diff/*.feature`                                                    | student auth (AI differentiation feature)                             |
| `teacher_tools/levelbuilder/*.feature`                                               | levelbuilder auth; curriculum-authoring tool out of scope             |

---

## Out of scope — additional feature areas

Feature directories outside the original CSF/teacher-tools scope. None have
non-auth, non-@eyes scenarios worth porting on their own.

| Area                              | Feature files                                                                                                                                                                         | Reason                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Java Lab (remaining 7)            | `javalab/code_review_*.feature` (×2), `console_only`, `javalab_demo_mode`, `neighborhood`, `prompter`, `theater`                                                                      | All @no_ci + @eyes; visual or WebSocket-only steps; no portable scenarios |
| WebLab 2 (student_learning)       | `student_learning/weblab2/*.feature`                                                                                                                                                  | cross-origin iframe + auth; matches star_labs/weblab blockers             |
| PD / PL tools                     | `acquisition_products/pd/**`, `acquisition_products/pl_landing_page.feature`, `acquisition_products/regional_workshop_catalog.feature`                                                | professional-development tools, out of scope                              |
| Sign-up / school info             | `acquisition_products/school_info_confirmation_dialog.feature`, `acquisition_products/sign_up.feature`                                                                                | onboarding flows, auth-gated                                              |
| Global Edition (remaining)        | `platform/global_edition/fa/**` (all @eyes or complex auth), `personal_project_gallery.feature`, `pl_landing_page.feature`, `signed_out.feature` (@skip), `teacher_dashboard.feature` | auth-gated or @eyes; not portable                                         |
| Policy compliance                 | ~~`platform/policy_compliance/**`~~ → **ported** `tests/legacy/policy-compliance/` (3 specs, 23 scenarios)                                                                            | CAP/COPPA flows; `cap.ts` helper + `dismissParentalPermissionModal`       |
| Cookie consent                    | `xteam/gdpr_dialog.feature`                                                                                                                                                           | separate scope                                                            |
| Race interstitial                 | `xteam/race_interstitial.feature`                                                                                                                                                     | demographic data dialog; separate scope                                   |
| User settings                     | `platform/user_settings.feature`                                                                                                                                                      | auth + settings state                                                     |
| Teacher dashboard manage-students | `platform/teacher_dashboard/manage_students_tab.feature`                                                                                                                              | auth; mirrors teacher_tools/teacher_dashboard                             |
| Initial page views                | `initial_page_views*.feature` (4 files)                                                                                                                                               | generic signed-out smoke tests; low test value                            |
| DCDO feature flags                | ~~`dcdo_mocking.feature`~~ → **ported** `tests/legacy/dcdo-mocking/dcdo-mocking.spec.ts`                                                                                              | 1 scenario; cookie mock/unmock lifecycle                                  |
| Applitools top-level              | `eyes.feature`                                                                                                                                                                        | @eyes; replaced by toHaveScreenshot                                       |
| Blockly / SpriteLab @eyes         | `code_tools/blockly/modal_function_editor_eyes.feature`, `code_tools/blockly/spritelab_eyes.feature`                                                                                  | @eyes; non-eyes spec already ported                                       |

---

## All CSF legacy feature files — complete

Every porteable scenario from the legacy CSF lab feature files has been ported:

- All Maze levels + step-mode, hints, inline feedback
- All Farmer levels + authored hints
- All Bee levels + conditionals, repeat
- All Artist levels
- All Bounce levels + freeplay finish
- All Flappy levels
- All Jigsaw levels (image render, connect, moveToGhost)
- Step Mode (step-only + step-and-run, 5 scenarios)
- Clear Puzzle (delete + load blocks, 2 scenarios)

The Cucumber legacy CSF suite for these labs is fully superseded by the Playwright suite.
