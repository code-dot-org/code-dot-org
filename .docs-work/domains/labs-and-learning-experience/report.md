# labs-and-learning-experience report

## Pages

### students/learning/ (9 pages, all task type)

| Path | Grade | Notes |
|---|---|---|
| run-your-code.md | VERIFIED | Run/Reset buttons observed in Maze level |
| get-a-hint.md | VERIFIED | Instructions panel observed in Artist level |
| reset-or-start-over.md | VERIFIED | Reset and Start Over buttons observed |
| switch-between-blocks-and-text.md | VERIFIED | Show Code toggle observed in App Lab |
| watch-a-video.md | VERIFIED | StandaloneVideo level loaded |
| work-with-a-partner.md | STRONGLY_SUPPORTED | Requires two sessions |
| choose-an-activity.md | STRONGLY_SUPPORTED | BubbleChoice model reviewed |
| answer-a-question.md | STRONGLY_SUPPORTED | LevelGroup, Multi, FreeResponse reviewed |
| change-the-site-language.md | STRONGLY_SUPPORTED | locale controller reviewed |

### students/labs/ (13 pages, all concept type)

| Path | Grade |
|---|---|
| app-lab.md | VERIFIED |
| game-lab.md | VERIFIED |
| sprite-lab.md | VERIFIED |
| web-lab.md | STRONGLY_SUPPORTED |
| python-lab.md | STRONGLY_SUPPORTED |
| java-lab.md | VERIFIED |
| music-lab.md | VERIFIED |
| dance-party.md | VERIFIED |
| artist.md | VERIFIED |
| maze-and-puzzles.md | VERIFIED |
| minecraft.md | STRONGLY_SUPPORTED |
| play-lab.md | STRONGLY_SUPPORTED |
| internet-simulator.md | STRONGLY_SUPPORTED |

### teachers/learning/ (1 page)

| Path | Grade |
|---|---|
| view-the-answer-key.md | INFERRED |

### developers/labs/ (3 pages)

| Path | Grade |
|---|---|
| how-a-level-loads.md | STRONGLY_SUPPORTED |
| blockly-fork.md | STRONGLY_SUPPORTED |
| add-a-lab.md | STRONGLY_SUPPORTED |

## Journeys

Spec: frontend/packages/e2e-tests/docs-journeys/labs-learning.spec.ts
8 tests, all passing.

## Screenshots (10)

run-button crop, maze-workspace full, instructions-panel crop, reset-button crop,
start-over crop, show-code-toggle crop, dance-party workspace, music-lab workspace,
app-lab workspace, java-lab workspace, game-lab workspace.

## UI labels observed

Run, Reset, Start Over, Show Code, Show Blocks, Instructions, OK, Settings,
Less/More, Play (Music Lab), Continue.

## OQ-17 verdict

Lab2 does not replace appOptions. Both use the same LevelsHelper#app_options
entry point and appOptions JSON format. Difference is scope: legacy = one large
sync blob; lab2 = small bootstrap + async level_properties fetch. A DCDO key
typo (proper0ties) pins the flag to default true.

## Assumed cross-domain links

/students/progress/, /students/projects/share-your-project/,
/students/projects/version-history/, /teachers/curriculum/who-can-see-this-course/,
/teachers/classes/view-student-progress/

## Questions for Fable

1. students/learning/ shared with curriculum owner -- correct grouping?
2. Music Lab Play vs Run -- mentioned as variant, acceptable?
3. work-with-a-partner grade STRONGLY_SUPPORTED (needs two sessions) -- accept or BLOCKED?

---

## Rewrite pass (problem-shaped topic pages)

### New tree

Each flat lab page became a directory with a hub index.md and problem-shaped topic pages:

- app-lab/ (hub + 4 topics: make-a-button-do-something, screens, blocks-and-text, nothing-happens)
- game-lab/ (hub + 3: make-a-sprite-move, input, sprite-problems)
- web-lab/ (hub + 3: build-a-page, style-with-css, page-problems)
- python-lab/ (hub + 2: running-and-output, error-messages)
- java-lab/ (hub + 2: running-and-output, compile-errors)
- music-lab/ (hub + 1: composing)
- dance-party/ (hub + 1: choreography)
- artist/ (hub + 1: drawing)
- maze-and-puzzles/ (hub + 1: solving)
- sprite-lab/ (hub + 1: animating)
- minecraft/ (hub + 1: playing)
- play-lab/ (hub + 1: storytelling)
- internet-simulator/ (hub + 1: sending-messages)

Total: 13 hubs + 22 topic pages = 35 evidence files.

### Grades

All hub index pages carry the grade of the old flat page (VERIFIED for labs walked in journeys; STRONGLY_SUPPORTED for those grounded in code/tests only). Topic pages are STRONGLY_SUPPORTED (grounded in source code, Cucumber features, and level model review).

### Journeys

Existing labs-learning.spec.ts unchanged (8 tests, all passing). It already reaches real levels of each major lab type via course enrollment, which grounds the hub-level VERIFIED grades.

### Images

All full-page/viewport screenshots removed per the new "crops only" rule. No new images added -- the topic pages describe controls by name and the text does not leave visual ambiguity requiring a crop. Existing learning-page crops (Run button, Reset button, Show Code toggle, instructions panel, Start Over) remain under students/learning/images/ and are referenced by working-on-a-level.md (the IA-merged page).

### Renames

.docs-work/domains/labs-and-learning-experience/renames.md records all 13 flat->directory hub moves and 22 new topic page paths.

### Could not ground

- App Lab data storage blocks (app tables, key-value store): code exists but local seed levels may not exercise it. Omitted.
- Web Lab file upload and preview refresh timing: described from code, not browser-verified.
- Internet Simulator multi-user behavior: requires simultaneous sessions. Described from Cucumber features, not walked.
- Java Lab theater view: requires specific level configuration. Mentioned but not verified.

---

## Reference rewrite pass (tool manual shape)

All 12 non-App-Lab lab pages rewritten to match the approved App Lab exemplar: type: reference, organized by workspace regions and features, orientation paragraph + viewport image, no curriculum recipes.

### Per-lab summary

| Lab | Words | Images | Sources added | BLOCKED |
|---|---|---|---|---|
| Game Lab | ~430 | 1 viewport | dropletConfig.js categories | -- |
| Sprite Lab | ~320 | 1 viewport | spritelab/ blocks, gamelab_jr.rb | -- |
| Web Lab | ~380 | 1 viewport | weblab/, preview domain docs | -- |
| Python Lab | ~310 | 0 (text only) | pythonlab/, README.md | No stable enrolled course locally |
| Java Lab | ~350 | 1 viewport | javalab/, constants.js | Run requires javabuilder server |
| Music Lab | ~300 | 1 viewport | music/ views, Controls.tsx, AdvancedControls.tsx | -- |
| Dance Party | ~320 | 1 viewport | dance/, constants.js | -- |
| Artist | ~370 | 1 viewport | turtle/, dropletConfig.js, blocks.js | -- |
| Maze | ~400 | 1 viewport | maze/, beeBlocks.js, harvesterBlocks.js, collectorBlocks.js | -- |
| Minecraft | ~280 | 0 (text only) | craft/, craft.rb | No journey test for Minecraft |
| Play Lab | ~300 | 0 (text only) | studio/, studio.rb | No journey test for Play Lab |
| Internet Simulator | ~310 | 0 (text only) | netsim/ | Requires classmates online |

### Images

8 viewport workspace screenshots added via labs-reference.spec.ts (all 8 tests passing).
4 labs text-only: Python Lab (no stable course for enrollment), Minecraft/Play Lab (no journey test), Internet Simulator (requires multi-user).

### Journey spec

New file: frontend/packages/e2e-tests/docs-journeys/labs-reference.spec.ts (8 tests, all passing). Does not edit labs-learning.spec.ts per coordinator instruction.

### Could not ground

- Region-level crops (one per section) not yet added; viewport images only. Region crops require locator selectors per lab and more journey work.
- Python Lab, Minecraft, Play Lab, Internet Simulator: no viewport image.

### Build and evidence:check

Both pass.
