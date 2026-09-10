# Lab reference page image audit -- report

43 images across 8 lab pages (5 pages have no images).

## Classification counts

Pre-audit: 29 MATCH, 13 EMPTY STATE, 1 WRONG REGION.
Post-audit: 33 MATCH, 4 EMPTY STATE, 0 WRONG REGION, 3 BLOCKED, 3 remaining EMPTY STATE in evidence.

## Retaken (4 images improved to MATCH)

- dance-party-stage.png: journey now runs program before screenshot; shows dancers.
- artist-workspace.png: blocks added via Blockly API; workspace has N and S blocks.
- music-lab-toolbox.png: Sounds category flyout now opens; shows play/drums/tune/notes/rest blocks.
- music-lab-workspace.png: Sounds category selected; sound blocks visible.
- game-lab-animation-tab.png: shows Animation Library with categories.

## Reclassified as BLOCKED (3 images)

- artist-canvas.png: trail not visible in static #visualization crop after Run.
- sprite-lab-play-area.png: canvas content not captured by Playwright locator screenshot.
- web-lab-workspace.png: Bramble editor is cross-origin iframe.

## Still EMPTY STATE (4 images, need future work)

- app-lab-workspace.png: needs drag-and-drop to place elements.
- game-lab-workspace.png and game-lab-canvas.png: blank project, no code injection path.
- java-lab-console.png: javabuilder unavailable locally.
- music-lab-timeline.png: needs blocks connected to when-run and Run.

## Alt text updated

dance-party.md, artist.md, game-lab.md, music-lab.md (5 alt-text lines updated to match visible content).

## Specs and build

labs-reference.spec.ts and labs-learning.spec.ts: 11 passed, 5 skipped (fixme).
npm run build and npm run evidence:check: green.
