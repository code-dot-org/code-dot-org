# Cucumber → Playwright Migration Status

Source: `dashboard/test/ui/features/star_labs/` and `features/code_tools/`  
Target: `frontend/packages/apps-e2e-tests/tests/`  
As of: 2026-05-03

---

## Summary

| Status                                 | Count                                         |
| -------------------------------------- | --------------------------------------------- |
| Ported                                 | 13 feature files (all 3 browsers)             |
| Covered by ported                      | 2 (maze2, jigsaw2 rolled into existing specs) |
| Skipped — @eyes                        | 10                                            |
| Skipped — auth required                | 30+                                           |
| Skipped — @skip / @eyes_mobile         | 3                                             |
| Skipped — cookie/session manipulation  | 2                                             |
| Out of scope — non-CSF labs            | 6 labs, ~20 feature files (star_labs)         |
| Out of scope — lab2 auth/eyes          | 7 (pythonlab ×5, weblab ×2 porteable blocked) |
| Out of scope — platform/infrastructure | 3                                             |
| Out of scope — standalone tools        | 4                                             |
| Porteable, not yet done                | 0                                             |

---

## Ported

| Feature file                                   | Playwright spec                                | Browsers | Notes                               |
| ---------------------------------------------- | ---------------------------------------------- | -------- | ----------------------------------- |
| `maze.feature`                                 | `tests/legacy/maze/maze.spec.ts`               | C+F+W    |                                     |
| `maze2.feature`                                | `tests/legacy/maze/maze.spec.ts`               | C+F+W    | Rolled into Maze — level 4 describe |
| `farmer.feature`                               | `tests/legacy/farmer/farmer.spec.ts`           | C+F+W    |                                     |
| `bee.feature`                                  | `tests/legacy/bee/bee.spec.ts`                 | C+F+W    |                                     |
| `artist.feature`                               | `tests/legacy/artist/artist.spec.ts`           | C+F+W    |                                     |
| `bounce.feature`                               | `tests/legacy/bounce/bounce.spec.ts`           | C+F+W    |                                     |
| `flappy.feature`                               | `tests/legacy/flappy/flappy.spec.ts`           | C+F+W    |                                     |
| `jigsaw.feature`                               | `tests/legacy/jigsaw/jigsaw.spec.ts`           | C+F+W    |                                     |
| `jigsaw2.feature`                              | `tests/legacy/jigsaw/jigsaw.spec.ts`           | C+F+W    | Rolled into level 2/3 describes     |
| `step_mode.feature`                            | `tests/legacy/step/step-mode.spec.ts`          | C+F+W    | All 5 scenarios ported              |
| `clearpuzzle.feature`                          | `tests/legacy/clearpuzzle/clearpuzzle.spec.ts` | C+F+W    | All 2 scenarios ported              |
| `musiclab/musiclab_timeline_nav.feature`       | `tests/lab2/music/music.spec.ts`               | C+F+W    | @no_safari; webkit skipped          |
| `code_tools/pythonlab/pythonlab_files.feature` | `tests/lab2/pythonlab/pythonlab.spec.ts`       | C+F      | @no_safari; webkit skipped          |

C = Chromium, F = Firefox, W = WebKit.

---

## Skipped — @eyes (visual regression)

These tests use Applitools screenshot comparison. No equivalent in Playwright without a
visual regression service; skip unless that infrastructure is added.

| Feature file                                   |
| ---------------------------------------------- |
| `angle_helper.feature` (also @skip)            |
| `artist_autorun.feature`                       |
| `applab/eyes1.feature` through `eyes4.feature` |
| `dance/dance_ai_modal_eyes.feature`            |
| `gamelab/eyes.feature`                         |
| `musiclab/musiclab_switching_levels.feature`   |
| `public_key_cryptography/eyes.feature`         |
| `spritelab/eyes.feature`                       |

---

## Skipped — @skip in legacy suite

Already disabled upstream; no porting action needed.

| Feature file                           | Reason                 |
| -------------------------------------- | ---------------------- |
| `musiclab/musiclab_drag_block.feature` | @skip                  |
| `craft/aquatic.feature`                | @skip (CI instability) |
| `mobile_portait.feature`               | @skip + @eyes_mobile   |

---

## Skipped — authentication required

Scenarios require `@as_student`, `@as_teacher`, `@as_taught_student`, or explicit
account creation steps. The Playwright teacher-tools auth helper (`createTeacher`) exists
but covers only the teacher-panel flow; porting these would need a full student/teacher
session fixture.

| Feature file                               | Auth dependency                    |
| ------------------------------------------ | ---------------------------------- |
| `can_see_finish.feature`                   | creates student                    |
| `custom_blocks.feature`                    | creates levelbuilder               |
| `droplet.feature`                          | @as_student                        |
| `applab_submittable.feature`               | creates teacher-associated student |
| `gamelab_submittable.feature`              | @as_taught_student                 |
| `legacy_share_remix.feature`               | @as_student                        |
| `maker_projects.feature`                   | @as_student                        |
| `share_buttons.feature`                    | @as_student                        |
| `sharepage_logo.feature`                   | @as_student                        |
| `applab/clipping.feature`                  | @as_student                        |
| `applab/embed.feature`                     | @as_student                        |
| `applab/html_sanitization.feature`         | @as_student                        |
| `applab/scenarios.feature`                 | @as_student                        |
| `applab/scenarios2.feature`                | @as_student                        |
| `applab/scenarios3.feature`                | @as_student                        |
| `applab/shared_apps.feature`               | @single_session                    |
| `applab/sharing_from_script_level.feature` | @as_student                        |
| `applab/versions.feature`                  | @no_phone (session state)          |
| `craft/hero_logged_in.feature`             | logged-in user                     |
| `gamelab/export_animations.feature`        | @as_student                        |
| `gamelab/level_options.feature`            | @as_student                        |
| `gamelab/loading_animations.feature`       | @as_student                        |
| `spritelab/loading_costumes.feature`       | @as_student                        |
| `dance/age_filter.feature`                 | age-gate cookie/session            |
| `dance/age_filter2.feature`                | age-gate cookie/session            |
| `aichat/chat.feature`                      | student auth (AI chat feature)     |
| `aichat/chat_multimodal.feature`           | student auth (AI chat feature)     |
| `aichat/view_student_chat_history.feature` | teacher auth (AI chat feature)     |
| `ai_tutor/chat.feature`                    | student auth (AI tutor feature)    |
| `manage_assets.feature`                    | asset upload state                 |

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

Sprite Lab (p5lab) and Dance Party share the CSF `#runButton`/`#resetButton`/`.congrats`
UI layer but add a p5 preload barrier (`#p5_loading`) and, for Dance Party, an age dialog.

| Lab         | Editor / runtime   | Feature files                                                                                                                                 |
| ----------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| App Lab     | Droplet / ACE JS   | `applab/data_blocks.feature`, `data_tab.feature`, `level_options.feature`, `libraries.feature`, `template_backed.feature`, `tooltips.feature` |
| Game Lab    | p5.js              | `gamelab/libraries.feature`                                                                                                                   |
| Sprite Lab  | Blockly + p5.js    | `spritelab/spritelab.feature`                                                                                                                 |
| Dance Party | Blockly + p5.js    | `dance/dance_party.feature`, `dance/dance_ai_modal.feature`, `dance/save_for_share.feature`                                                   |
| Web Lab     | HTML/CSS/JS files  | `weblab/too_young.feature`, `weblab/weblab.feature`, `weblab/weblab_submittable.feature`, `weblab/versions.feature`                           |
| Minecraft   | Custom interpreter | `craft/dialogs.feature`, `craft/hero_logged_out.feature`, `craft/can_see_finish.feature`                                                      |

---

## Out of scope — platform and workspace infrastructure

These feature files test shared CSF platform code, not any particular lab.

| Feature file            | What it tests                                                       | Blocker                      |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------- |
| `studio.feature`        | Sprite image resize after run on a PlayLab level (custom DOM check) | No standard selector pattern |
| `sharepage.feature`     | Share URL generation, "View Code" redirect, embedded workspace      | No auth, but share URL state |
| `manage_assets.feature` | Asset upload dialog, audio record button visibility                 | Auth (asset upload state)    |

---

## Out of scope — standalone educational tools

These are interactive CS Principles tools or simulations, not Blockly-based coding
environments. No run/reset/workspace interface.

| Tool / simulator             | Feature files                                     | Notes                              |
| ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| Internet Simulator (NetSim)  | `netsim_lobby.feature`                            | Multiplayer; needs paired sessions |
| Pixelation widget            | `pixelation.feature`                              | Binary/hex input widget            |
| Public Key Cryptography tool | `public_key_cryptography/continue_button.feature` | Custom navigation widget           |
| Mix & Move AI                | `mix_move_ai.feature`                             | Separate course app                |

---

## Out of scope — lab2 auth-required and @eyes

These lab2 feature files (from `features/code_tools/` and `features/star_labs/`) are blocked
by authentication requirements or Applitools visual regression infrastructure.

| Feature file                                  | Blocker                        |
| --------------------------------------------- | ------------------------------ |
| `pythonlab/pythonlab_run.feature`             | `I create a student` auth      |
| `pythonlab/pythonlab_start_mode.feature`      | `I create a levelbuilder` auth |
| `pythonlab/pythonlab_run_eyes.feature`        | @eyes                          |
| `pythonlab/pythonlab_neighborhood.feature`    | @eyes                          |
| `pythonlab/pythonlab_start_mode_eyes.feature` | @eyes                          |
| `weblab/weblab.feature`                       | `I am a student` auth          |
| `weblab/too_young.feature`                    | `I am a young student` auth    |
| `weblab/versions.feature`                     | @skip + @as_student            |
| `weblab/weblab_submittable.feature`           | @skip + @as_taught_student     |

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
