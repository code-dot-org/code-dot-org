---
title: How a level loads
description: The path from a ScriptLevel URL to a running lab, covering both the legacy and lab2 boot sequences.
type: concept
---

A level URL such as `/s/coursea-2024/lessons/4/levels/2` resolves to a running lab through two stages: the server assembles configuration as JSON, and the client boots the correct lab with that configuration. Two boot paths exist: the legacy path (most labs) and the lab2 path (Music Lab, Python Lab, Web Lab 2).

## Server side: `appOptions`

`ScriptLevelsController#show` renders a level page. The view calls `LevelsHelper#app_options`, a large dispatcher that branches on the level's class hierarchy.

For legacy levels (Blockly subclasses, Applab, Gamelab, Weblab, and others), `app_options` builds a per-level-type hash containing hundreds of fields: TTS configuration, pairing state, backpack, callouts, autoplay video, experiment flags, the theme, and the full level configuration. This hash is serialized into the page as a raw JS global:

```
var appOptions = #{app_options.to_json};
```

For lab2 levels (`@level.uses_lab2?` is true), `app_options` dispatches to `lab2_options`, which returns a much smaller bootstrap payload: `level_id`, `channel` (if project-backed), `edit_blocks`, `is_editing_exemplar`, `share`, and `theme`. This is written into a data attribute:

```
%script{src: webpack_asset_path("js/lab2.js"), data: {appoptions: app_options.to_json}}
```

Both paths share the `app_options` method name and the `appOptions` JSON wire format. They diverge in payload size and in whether a second fetch is needed.

## Client side: legacy boot

Legacy labs read `window.appOptions` directly. `apps/src/appMain.js` dispatches to the lab's entry point (one of the functions in `apps/src/sites/studio/pages/levels/*.js`) based on the level type stored in the options. `StudioApp.js` is the common base that manages the workspace, Run/Reset buttons, instructions, hints, and progress reporting.

The `appOptions` payload is the complete level configuration. No follow-up network request is needed.

## Client side: lab2 boot

Lab2 labs parse the `data-appoptions` attribute, then fetch the full level configuration from the server asynchronously.

`apps/src/lab2/hooks/useLoadLevelProperties.ts` reads the DCDO key `lab2-fetch-level-properties-by-lesson-id` (default `true`). When true, it fetches `/lessons/${currentLessonId}/level_properties`, which returns configuration for every level in the current lesson in one response. When false, or for standalone levels without a lesson, it fetches `/levels/${currentLevelId}/level_properties` for one level at a time.

The async fetch means lab2 levels render a loading state before the full configuration arrives. The `ProgressManager` (see `apps/src/lab2/progress/README.md`) handles validation conditions for lab2 labs using a JSON-based system rather than the legacy JavaScript evaluator.

## Open question 17 verdict

The premise "lab2 replaces `appOptions`" is incorrect. Lab2 uses the same `app_options` Rails helper and the same `appOptions` JSON format as legacy labs. The difference is scope: legacy labs get one large synchronous payload with no follow-up fetch; lab2 labs get a small synchronous bootstrap plus an async fetch of `level_properties`. Both contracts share a single entry point in `LevelsHelper` and a single wire format.

A DCDO key typo (`lab2-fetch-level-proper0ties-by-lesson-id` with a literal `0` in `proper0ties`) pins the server-side exposed value to `true` regardless of any ops-side override attempt via the correctly spelled key.

## Key files

- `dashboard/app/helpers/levels_helper.rb` -- `app_options`, `lab2_options`, `blockly_options`
- `apps/src/StudioApp.js` -- legacy lab base
- `apps/src/appMain.js` -- legacy dispatch
- `apps/src/lab2/hooks/useLoadLevelProperties.ts` -- lab2 level-properties fetch
- `apps/src/lab2/progress/README.md` -- lab2 progress/validation system

## Related

- [Blockly fork](/developers/labs/blockly-fork/)
- [Add a lab](/developers/labs/add-a-lab/)
