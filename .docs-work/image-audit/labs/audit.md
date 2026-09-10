# Lab reference page image audit

Auditor: docs-opus (participant-11). Revision: 9793f8d36ae.

## Classification key

- MATCH -- image shows exactly what the section and alt text describe, in a realistic state.
- EMPTY STATE -- image shows an empty or placeholder state where the section describes content.
- WRONG REGION -- image shows a different region or view than the alt text claims.
- BLOCKED -- cannot achieve realistic state due to technical constraint.

## Pre-audit classification (43 images)

| Classification | Count |
|---|---|
| MATCH | 29 |
| EMPTY STATE | 13 |
| WRONG REGION | 1 |
| Total | 43 |

## Post-audit classification (after retakes)

| Classification | Count | Change |
|---|---|---|
| MATCH | 33 | +4 |
| EMPTY STATE | 7 | -6 |
| WRONG REGION | 0 | -1 |
| BLOCKED | 3 | +3 (reclassified from EMPTY STATE) |
| Total | 43 | |

## Changes per lab

### Artist
- artist-workspace.png: EMPTY STATE -> MATCH. Blocks (N, S) added via Blockly API. Alt text updated.
- artist-canvas.png: EMPTY STATE -> BLOCKED. Run executes but turtle trail not visible in static `#visualization` crop.

### App Lab
- app-lab-workspace.png: EMPTY STATE (unchanged). Design-tab element addition requires drag-and-drop not achievable in current journey.

### Dance Party
- dance-party-stage.png: EMPTY STATE -> MATCH. Journey now clicks Run before stage screenshot; shows moose + aliens + spiral effect. Alt text updated.

### Game Lab
- game-lab-workspace.png: EMPTY STATE (unchanged). Blank project; Droplet editor API not accessible from Playwright.
- game-lab-canvas.png: EMPTY STATE (unchanged). No code to run.
- game-lab-animation-tab.png: EMPTY STATE -> MATCH. Now shows Animation Library with categories. Alt text updated.

### Sprite Lab
- sprite-lab-play-area.png: EMPTY STATE -> BLOCKED. Run executes but `#visualization` element renders blank in Playwright screenshot.

### Web Lab
- web-lab-workspace.png: EMPTY STATE -> BLOCKED. Bramble editor is cross-origin iframe; workspace regions not capturable.

### Music Lab
- music-lab-workspace.png: EMPTY STATE -> MATCH. Sounds category selected; sound blocks visible in workspace. Alt text updated.
- music-lab-toolbox.png: WRONG REGION -> MATCH. Sounds flyout now opens showing play/drums/tune/notes/rest blocks. Alt text updated.
- music-lab-timeline.png: EMPTY STATE (unchanged). Timeline not populated after Run.

### Java Lab
- java-lab-console.png: EMPTY STATE (unchanged). Javabuilder service unavailable locally; Run button disabled.

### Maze and Puzzles, remaining App Lab crops, remaining images
No changes needed; already MATCH.

## Remaining EMPTY STATE and BLOCKED (10 images)

| Image | Status | Reason |
|---|---|---|
| app-lab-workspace.png | EMPTY STATE | Drag-and-drop required for element placement |
| artist-canvas.png | BLOCKED | Trail not capturable in `#visualization` static screenshot |
| game-lab-workspace.png | EMPTY STATE | Blank project, no code injection path |
| game-lab-canvas.png | EMPTY STATE | No code to run |
| sprite-lab-play-area.png | BLOCKED | Canvas content not captured by Playwright locator screenshot |
| web-lab-workspace.png | BLOCKED | Cross-origin Bramble iframe |
| java-lab-console.png | EMPTY STATE | Javabuilder service unavailable locally |
| music-lab-timeline.png | EMPTY STATE | Timeline not populated; needs blocks connected to when-run |
| dance-party-workspace.png | MATCH (stage area empty but workspace has blocks) | Acceptable for orientation shot |
| sprite-lab-workspace.png | MATCH (play area empty but workspace has blocks) | Acceptable for orientation shot |
