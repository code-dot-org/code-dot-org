# labs-and-learning-experience plan

## Blocking questions

1. UI says "section" on teacher side but "class" on student side (join page says "Join a class"). Record: use "class" in student pages, "section" in teacher and developer pages.
2. Maker Toolkit availability post-Chrome-Apps deprecation is AMBIGUOUS. Documented from code, marked BLOCKED for verification.
3. Web Lab 2, Sketch Lab, and some other labs are behind DCDO flags (weblab2, sketchlab). Student pages will document only what a student can reach in production today; flag-gated labs that are not default-on are omitted or noted as "available in some courses."
4. Dance Party `ai-dancer-head-crop` default false: does this mean the head-crop feature is off in production? INFERRED off by default.

## Terminology observed

- UI labels (OBSERVED in Cucumber features and Playwright specs): "Run", "Reset", "Show Code" / "Show Blocks", "Instructions", "Hint" (lightbulb icon), "Finish", "Submit", "Continue", "Version History", "Start Over", "Remix"
- "Run" becomes "Play" in Music Lab. "Run" button in Blockly labs.
- "class" in student-facing UI; "section" in teacher dashboard and developer code.

## Pages

### students/learning/ (task group: doing the work)

| Path | Type | Question it answers | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `students/learning/run-your-code.md` | task | How do I run my code and know if I got it right? | student-work-a-level, level-milestone-post | J2 step 5-6 | Run/Reset buttons crop |
| `students/learning/get-a-hint.md` | task | I'm stuck -- how do I get help inside a level? | level-instructions, level-authored-hints, level-callouts | J12 steps 1-3 | Hint lightbulb crop |
| `students/learning/switch-between-blocks-and-text.md` | task | How do I type code instead of dragging blocks? | droplet-text-mode | -- | Show Code toggle crop |
| `students/learning/watch-a-video.md` | task | How do I watch the video and move on? | level-standalone-video, level-video-captions | -- | -- |
| `students/learning/use-text-to-speech.md` | task | How do I have the instructions read aloud? | level-tts, blockly-keyboard-nav | -- | TTS button crop (if visible locally) |
| `students/learning/work-with-a-partner.md` | task | How does pair programming work? | pair-programming | -- | -- |
| `students/learning/reset-or-start-over.md` | task | I messed up -- how do I go back? | level-version-history, level-start-over | J5 step 3 | Version History crop |
| `students/learning/choose-an-activity.md` | task | There are multiple choices -- which one do I pick? | level-bubble-choice | -- | -- |
| `students/learning/answer-a-question.md` | task | How do I answer the quiz or write a reflection? | level-group-assessment, level-contained-level, lesson-reflection | J3 step 2-3 | -- |
| `students/learning/submit-your-work.md` | task | How do I hand in my project? | project-submit-for-assignment | -- | -- |
| `students/learning/change-the-site-language.md` | task | How do I switch the site to my language? | locale-switch | -- | -- |
| `students/learning/rate-a-puzzle.md` | task | What are the thumbs-up/thumbs-down buttons? | level-puzzle-rating | -- | -- |

### students/labs/ (concept group: what is this workspace?)

One short page per major lab a student meets by name. Each answers "what is this workspace and what are its main controls."

| Path | Type | Lab | Inventory ids | Screenshot |
|---|---|---|---|---|
| `students/labs/app-lab.md` | concept | App Lab | lab-applab | Workspace crop |
| `students/labs/game-lab.md` | concept | Game Lab | lab-gamelab | -- |
| `students/labs/sprite-lab.md` | concept | Sprite Lab | lab-spritelab | -- |
| `students/labs/web-lab.md` | concept | Web Lab | lab-weblab | -- |
| `students/labs/python-lab.md` | concept | Python Lab | lab-pythonlab | -- |
| `students/labs/java-lab.md` | concept | Java Lab | lab-javalab | -- |
| `students/labs/music-lab.md` | concept | Music Lab | lab-music | -- |
| `students/labs/dance-party.md` | concept | Dance Party | lab-dance | -- |
| `students/labs/artist.md` | concept | Artist | lab-artist | -- |
| `students/labs/maze-and-puzzles.md` | concept | Maze / Karel / Bee | lab-maze-karel | -- |
| `students/labs/minecraft.md` | concept | Minecraft | lab-craft-minecraft | -- |
| `students/labs/play-lab.md` | concept | Play Lab | lab-studio-playlab | -- |
| `students/labs/internet-simulator.md` | concept | Internet Simulator | lab-netsim | -- |

Labs omitted from student pages: Poetry (shares Sprite Lab engine, no distinct student name), CS Principles widgets (embedded, no named lab identity), Sketch Lab (DCDO-gated, not default-on), Web Lab 2 (DCDO-gated), AI for Oceans (frontend-only lab under frontend/packages/labs/oceans, student reaches it as Hour of Code activity, not a named lab), Maker Toolkit (BLOCKED: requires hardware + Chrome extension).

### teachers/learning/ (teacher-only level actions)

| Path | Type | Question | Inventory ids |
|---|---|---|---|
| `teachers/learning/view-the-answer-key.md` | task | Where is the answer or exemplar for this level? | (cross-ref curriculum owner) |

### developers/labs/ (mental model and extension points)

| Path | Type | Question | Inventory ids |
|---|---|---|---|
| `developers/labs/how-a-level-loads.md` | concept | How does a ScriptLevel become a running lab? | level-app-options-handoff, lab2-framework, legacy-lab-boot |
| `developers/labs/blockly-fork.md` | concept | What is the Blockly fork and how does it differ from upstream? | blockly-fork |
| `developers/labs/add-a-lab.md` | task | How do I add a new lab or level type? | lab2-framework |

## Items left undocumented and why

- `level-callouts`: folded into get-a-hint.md (callouts are automatic, not a student action)
- `level-puzzle-rating`: one-paragraph page; could be folded into run-your-code.md if too thin
- `lab-poetry`, `lab-sketchlab`, `lab-csp-widgets`, `lab-oceans`, `lab-maker-toolkit`: see omissions above
- `lab-weblab2`: DCDO-gated, not production-default

## Cross-domain links (assumed paths)

- `/students/progress/` -- classrooms-and-progress owner
- `/students/projects/share-your-project/` -- projects-and-sharing owner
- `/students/projects/version-history/` -- projects-and-sharing owner
- `/students/account/sign-in/` -- accounts-and-access owner
- `/teachers/curriculum/who-can-see-this-course/` -- curriculum owner
