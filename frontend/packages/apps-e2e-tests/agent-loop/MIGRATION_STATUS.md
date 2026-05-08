# Cucumber → Playwright Migration Status

Source: `dashboard/test/ui/features/star_labs/`, `features/code_tools/`, `features/student_learning/`, and `features/teacher_tools/level_types/`  
Target: `frontend/packages/apps-e2e-tests/tests/`  
As of: 2026-05-08 (updated 2026-05-08 — all teacher_tools/level_types ported)

---

## Summary

| Status                                 | Count                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Ported                                 | 55 feature files (C+F for pythonlab + mixmoveai; C+F+W for rest)                  |
| Covered by ported                      | 5 (maze2, jigsaw2, multi2/3/4 rolled into existing specs)                         |
| Partial — @eyes (visual checkpoints)   | 5 ported up to snapshot; @eyes auth blocked 3                                     |
| Fixme stubs — @eyes only               | 3 (curriculum_reference ×2, level_group_multi_page_dots ×1)                       |
| Skipped — auth required                | 30+                                                                               |
| Skipped — @skip / @eyes_mobile         | 3                                                                                 |
| Skipped — cookie/session manipulation  | 2                                                                                 |
| Out of scope — non-CSF labs            | 5 labs, ~15 feature files (spritelab + craft hero_logged_out now ported)          |
| Out of scope — lab2 cross-origin       | WebLab full tests (Bramble cross-origin iframe); weblab/too_young ported          |
| Out of scope — platform/infrastructure | 3                                                                                 |
| Out of scope — standalone tools        | 0 (netsim/pixelation/pkc/studio/sharepage/modal-fn-editor/mix-move-ai all ported) |
| Porteable, not yet done                | 0                                                                                 |

---

## Ported

| Feature file                                                   | Playwright spec                                                    | Browsers | Notes                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------- |
| `maze.feature`                                                 | `tests/legacy/maze/maze.spec.ts`                                   | C+F+W    |                                                      |
| `maze2.feature`                                                | `tests/legacy/maze/maze.spec.ts`                                   | C+F+W    | Rolled into Maze — level 4 describe                  |
| `farmer.feature`                                               | `tests/legacy/farmer/farmer.spec.ts`                               | C+F+W    |                                                      |
| `bee.feature`                                                  | `tests/legacy/bee/bee.spec.ts`                                     | C+F+W    |                                                      |
| `artist.feature`                                               | `tests/legacy/artist/artist.spec.ts`                               | C+F+W    |                                                      |
| `bounce.feature`                                               | `tests/legacy/bounce/bounce.spec.ts`                               | C+F+W    |                                                      |
| `flappy.feature`                                               | `tests/legacy/flappy/flappy.spec.ts`                               | C+F+W    |                                                      |
| `jigsaw.feature`                                               | `tests/legacy/jigsaw/jigsaw.spec.ts`                               | C+F+W    |                                                      |
| `jigsaw2.feature`                                              | `tests/legacy/jigsaw/jigsaw.spec.ts`                               | C+F+W    | Rolled into level 2/3 describes                      |
| `step_mode.feature`                                            | `tests/legacy/step/step-mode.spec.ts`                              | C+F+W    | All 5 scenarios ported                               |
| `clearpuzzle.feature`                                          | `tests/legacy/clearpuzzle/clearpuzzle.spec.ts`                     | C+F+W    | All 2 scenarios ported                               |
| `musiclab/musiclab_timeline_nav.feature`                       | `tests/lab2/music/music.spec.ts`                                   | C+F+W    | @no_safari; webkit skipped                           |
| `code_tools/pythonlab/pythonlab_files.feature`                 | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | @no_safari; webkit skipped                           |
| `musiclab/musiclab_switching_levels.feature` (@eyes)           | `tests/lab2/music/music.spec.ts`                                   | C+F+W    | visual checkpoints annotated                         |
| `code_tools/pythonlab/pythonlab_run_eyes.feature`              | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | visual checkpoints annotated                         |
| `code_tools/pythonlab/pythonlab_neighborhood.feature`          | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | visual checkpoints annotated                         |
| `dance/dance_party.feature`                                    | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | 4 scenarios; age dialog bypassed                     |
| `dance/dance_ai_modal.feature`                                 | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | AI modal full flow                                   |
| `dance/dance_ai_modal_eyes.feature` (@eyes)                    | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | @visual; visual checkpoints LTR+RTL                  |
| `dance/save_for_share.feature`                                 | `tests/legacy/activities/dance/dance.spec.ts`                      | C+F+W    | non-@as_student scenarios only                       |
| `spritelab/spritelab.feature`                                  | `tests/legacy/activities/spritelab/spritelab.spec.ts`              | C+F+W    | 3 scenarios; p5 barrier; grid dropdown               |
| `craft/hero_logged_out.feature`                                | `tests/legacy/activities/craft/craft.spec.ts`                      | C+F+W    | Phaser ready signal; signed-out UI check             |
| `code_tools/pythonlab/pythonlab_run.feature`                   | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | student auth; progress bubble CSS checks             |
| `code_tools/pythonlab/pythonlab_start_mode.feature`            | `tests/lab2/pythonlab/pythonlab.spec.ts`                           | C+F      | levelbuilder auth; start mode file types             |
| `weblab/too_young.feature` (scenario 1)                        | `tests/lab2/weblab/weblab.spec.ts`                                 | C+F+W    | young student redirect; scenario 2 skipped           |
| `netsim_lobby.feature`                                         | `tests/legacy/netsim/netsim.spec.ts`                               | C+F+W    | 3 scenarios; anonymous; real-time lobby              |
| `pixelation.feature` (scenarios 5 & 6)                         | `tests/legacy/pixelation/pixelation.spec.ts`                       | C+F+W    | non-auth scenarios; levels 4 & 5; UI state checks    |
| `public_key_cryptography/continue_button.feature`              | `tests/legacy/pkc/pkc.spec.ts`                                     | C+F+W    | continue button regression; lesson 31                |
| `studio.feature`                                               | `tests/legacy/studio/studio.spec.ts`                               | C+F+W    | PlayLab sprite height before/after run               |
| `sharepage.feature` (scenario 1)                               | `tests/legacy/sharepage/sharepage.spec.ts`                         | C+F+W    | Flappy share URL; game states; "View Code" redirect  |
| `code_tools/blockly/modal_function_editor.feature`             | `tests/legacy/modal-function-editor/modal-function-editor.spec.ts` | C+F+W    | 3 scenarios; SpriteLab level; flyout/drag/ESC        |
| `mix_move_ai.feature`                                          | `tests/lab2/mixmoveai/mixmoveai.spec.ts`                           | C+F      | @no_safari; full 3-phase AI generation flow          |
| `student_learning/hour_of_code/hour_of_code.feature`           | `tests/legacy/hoc/hoc.spec.ts`                                     | C+F      | anonymous; 4 scenarios; progress bubbles + hoc/reset |
| `student_learning/hour_of_code/hoc_reset.feature`              | `tests/legacy/hoc/hoc.spec.ts`                                     | C+F      | hoc/reset re-triggers video + callout state          |
| `acquisition_products/curriculum_catalog.feature` (scenario 1) | `tests/catalog/catalog.spec.ts`                                    | C+F+W    | signed-out redirect; other scenarios auth-blocked    |
| `teacher_tools/challenge_level.feature`                        | `tests/legacy/challenge-level/challenge-level.spec.ts`             | C+F+W    | 2 scenarios; JS click bypasses viz overlay           |
| `dance/age_filter.feature`                                     | `tests/legacy/activities/dance/dance-age-filter.spec.ts`           | C+F+W    | student + anonymous; age dialog + ?songfilter=on     |
| `dance/age_filter2.feature`                                    | `tests/legacy/activities/dance/dance-age-filter.spec.ts`           | C+F+W    | age-13 dialog; filter persists across levels         |
| `can_see_finish.feature` (blockly @no_mobile)                  | `tests/legacy/can-see-finish/can-see-finish.spec.ts`               | C+F+W    | 5 labs at 1366×727; Game Lab + Minecraft omitted     |

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

| Feature file                                                      | Auth dependency                    |
| ----------------------------------------------------------------- | ---------------------------------- |
| `can_see_finish.feature` (mobile @only_mobile variants)           | needs mobile Playwright project    |
| `custom_blocks.feature`                                           | creates levelbuilder               |
| `droplet.feature`                                                 | @as_student                        |
| `applab_submittable.feature`                                      | creates teacher-associated student |
| `gamelab_submittable.feature`                                     | @as_taught_student                 |
| `legacy_share_remix.feature`                                      | @as_student                        |
| `maker_projects.feature`                                          | @as_student                        |
| `share_buttons.feature`                                           | @as_student                        |
| `sharepage_logo.feature`                                          | @as_student                        |
| `applab/clipping.feature`                                         | @as_student                        |
| `applab/embed.feature`                                            | @as_student                        |
| `applab/html_sanitization.feature`                                | @as_student                        |
| `applab/scenarios.feature`                                        | @as_student                        |
| `applab/scenarios2.feature`                                       | @as_student                        |
| `applab/scenarios3.feature`                                       | @as_student                        |
| `applab/shared_apps.feature`                                      | @single_session                    |
| `applab/sharing_from_script_level.feature`                        | @as_student                        |
| `applab/versions.feature`                                         | @no_phone (session state)          |
| `craft/hero_logged_in.feature`                                    | logged-in user                     |
| `gamelab/export_animations.feature`                               | @as_student                        |
| `gamelab/level_options.feature`                                   | @as_student                        |
| `gamelab/loading_animations.feature`                              | @as_student                        |
| `spritelab/loading_costumes.feature`                              | @as_student                        |
| `aichat/chat.feature`                                             | student auth (AI chat feature)     |
| `aichat/chat_multimodal.feature`                                  | student auth (AI chat feature)     |
| `aichat/view_student_chat_history.feature`                        | teacher auth (AI chat feature)     |
| `ai_tutor/chat.feature`                                           | student auth (AI tutor feature)    |
| `manage_assets.feature`                                           | asset upload state                 |
| `student_learning/hour_of_code/hour_of_code_signed_in.feature`    | @as_student                        |
| `acquisition_products/curriculum_catalog.feature` (scenarios 2–3) | student/teacher auth               |
| `acquisition_products/curriculum_catalog_assign_unassign.feature` | teacher-with-sections auth         |
| `acquisition_products/curriculum_catalog_filters.feature`         | @eyes                              |

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

| Lab        | Editor / runtime   | Feature files                                                                                                                                 | Status                                                   |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| App Lab    | Droplet / ACE JS   | `applab/data_blocks.feature`, `data_tab.feature`, `level_options.feature`, `libraries.feature`, `template_backed.feature`, `tooltips.feature` | All scenarios require auth                               |
| Game Lab   | p5.js              | `gamelab/libraries.feature`                                                                                                                   | All scenarios require auth                               |
| Sprite Lab | Blockly + p5.js    | `spritelab/spritelab.feature`                                                                                                                 | **Ported** — C+F+W                                       |
| Web Lab    | HTML/CSS/JS files  | `weblab/too_young.feature`, `weblab/weblab.feature`, `weblab/weblab_submittable.feature`, `weblab/versions.feature`                           | All require auth or @skip                                |
| Minecraft  | Custom interpreter | `craft/dialogs.feature`, `craft/hero_logged_out.feature`, `craft/can_see_finish.feature`                                                      | hero_logged_out **Ported** — C+F+W; others @skip or auth |

---

## Out of scope — platform and workspace infrastructure

These feature files test shared CSF platform code, not any particular lab.

| Feature file            | What it tests                                                       | Status                                                                      |
| ----------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `studio.feature`        | Sprite image resize after run on a PlayLab level (custom DOM check) | **Ported** — `tests/legacy/studio/studio.spec.ts`                           |
| `sharepage.feature`     | Share URL generation, "View Code" redirect, embedded workspace      | **Ported** (scenario 1) — `tests/legacy/sharepage/`; scenario 2 @as_student |
| `manage_assets.feature` | Asset upload dialog, audio record button visibility                 | Auth (asset upload state) — skipped                                         |

---

## Out of scope — standalone educational tools

These are interactive CS Principles tools or simulations, not Blockly-based coding
environments.

| Tool / simulator             | Feature files                                      | Status                                                                               |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Internet Simulator (NetSim)  | `netsim_lobby.feature`                             | **Ported** — `tests/legacy/netsim/netsim.spec.ts`                                    |
| Pixelation widget            | `pixelation.feature`                               | **Ported** (scenarios 5 & 6) — `tests/legacy/pixelation/`; scenarios 1–4 @as_student |
| Public Key Cryptography tool | `public_key_cryptography/continue_button.feature`  | **Ported** — `tests/legacy/pkc/pkc.spec.ts`                                          |
| Modal Function Editor        | `code_tools/blockly/modal_function_editor.feature` | **Ported** — `tests/legacy/modal-function-editor/`                                   |
| Mix & Move AI                | `mix_move_ai.feature`                              | **Ported** — `tests/lab2/mixmoveai/mixmoveai.spec.ts` (@no_safari)                   |

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
