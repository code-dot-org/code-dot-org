---
title: Blockly fork
description: How the CodeAI Blockly fork differs from upstream Google Blockly.
type: concept
---

CodeAI maintains a vendored fork of Google Blockly. The fork lives in two locations: `apps/src/blockly` (the runtime wrapper and custom renderers) and `frontend/packages/blockly` (the fork of the upstream package).

## Renderers

Blockly ships three renderers. The production default is **Thrasos** (`cdo_renderer_thrasos` in `apps/src/blockly/constants.ts`). Two alternatives are available as per-session experiments:

- `geras` -- the older renderer, available via the `geras` experiment flag.
- `zelos` -- a rounded-block renderer, available via the `zelos` experiment flag.

All three are registered in `apps/src/blockly/blocklyWrapper.ts` with a `cdo_renderer_` prefix.

## Keyboard navigation

Keyboard navigation in Blockly is behind the `blockly-keyboard-navigation` DCDO flag (default `false`) and a matching experiment flag. When enabled, students can navigate the block tree, toolbox, and workspace using keyboard shortcuts instead of drag-and-drop.

## Internationalization

Block text is localized through the standard Blockly i18n system. The `blockly_i18n_in_text` DCDO flag (default `false`) controls whether translations are injected directly into block text labels.

## Custom blocks

Level authors define custom blocks in JSON under `dashboard/config/blocks/`. The `BlocksController` serves these to the client. For a guide on adding a new block, see `apps/docs/creating-new-blocks.md`.

## Key files

- `apps/src/blockly/constants.ts` -- renderer names and defaults
- `apps/src/blockly/blocklyWrapper.ts` -- registration and initialization
- `frontend/packages/blockly/` -- vendored upstream fork
- `dashboard/config/blocks/` -- per-level custom block definitions
- `apps/docs/creating-new-blocks.md` -- block authoring guide

## Related

- [How a level loads](/developers/labs/how-a-level-loads/)
- [Add a lab](/developers/labs/add-a-lab/)
