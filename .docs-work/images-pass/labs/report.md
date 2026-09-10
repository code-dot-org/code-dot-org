# Labs images pass report

## Per-lab crops

**Game Lab** (5 crops): toolbox (Droplet categories+blocks), canvas (visualization column), run-button, reset-button, animation-tab (full viewport).
Skip: Show Text toggle not visible in project mode.

**Sprite Lab** (3 crops): play-area, toolbox (Sprites flyout with blocks), run-button.
Skip: Costumes dropdown is inside a Blockly field -- no stable crop selector.

**Web Lab** (1 crop): version-history-button.
Skip: File tree, code editor, preview pane all inside cross-origin Bramble iframe.

**Java Lab** (4 crops): editor-tabs, console, backpack, run-button.
Skip: Theater view requires javabuilder server not available locally.

**Music Lab** (3 crops): toolbox (Sounds flyout), timeline, playback-controls.
Skip: Sound library dropdown inside Blockly field; Advanced controls not on freeplay level.

**Dance Party** (4 crops): stage, song-picker, toolbox (Dancers flyout with blocks), run-button.

**Artist** (4 crops): canvas, toolbox (direction blocks flyout), run-button, show-code.

**Maze** (2 crops): grid, run-button.
Skip: Toolbox flyout empty in coursea simple level; feedback dialog animation timing unreliable.

## Text-only labs

Python Lab, Minecraft, Play Lab, Internet Simulator: no stable seeded levels found for orientation images; left text-only.

## Totals

26 region crops across 8 labs. All tests green. Build and evidence:check green.
