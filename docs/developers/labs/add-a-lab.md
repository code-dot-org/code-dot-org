---
title: Add a lab
description: How to add a new lab or level type to the CodeAI platform.
type: task
---

A lab is a frontend runtime (Maze, App Lab, Music Lab, and so on) that renders inside a level page. Adding a new lab requires changes in both Rails and the frontend.

## Prerequisites

- Familiarity with [how a level loads](/developers/labs/how-a-level-loads/).
- A local development environment with both Rails and the apps dev server running.

## Choose a framework

New labs should use **lab2** (`apps/src/lab2`). Lab2 provides a standard boot sequence, an async level-properties fetch, a JSON-based progress/validation system, and React integration. Music Lab, Python Lab, and Web Lab 2 all use lab2.

Legacy labs (Maze, App Lab, Game Lab, and others) use `StudioApp.js` and a synchronous `appOptions` payload. Do not build new labs on the legacy framework.

## Steps

1. **Define a level model.** Create a new ActiveRecord model under `dashboard/app/models/levels/` that inherits from `Level` (or a subclass such as `Blockly`). Set `uses_lab2?` to return `true`. Register the game type in `dashboard/app/models/game.rb`.

2. **Add a webpack entry point.** In `apps/webpackEntryPoints.js`, add an entry for your lab. For a lab2 lab, the entry typically boots the lab2 shell with your lab component.

3. **Implement the frontend.** Create your lab's source under `apps/src/<labname>/`. For lab2 labs, implement the `Lab` interface and register your lab in the lab2 router.

4. **Wire up level properties.** If your lab needs per-level configuration beyond what `lab2_options` provides, extend the `level_properties` endpoint in `LessonsController` or `LevelsController` to include your fields.

5. **Add validation.** Use the lab2 `ProgressManager` and `Validator` pattern (see `apps/src/lab2/progress/README.md`). Define validation conditions in JSON on the level, not in JavaScript.

6. **Write tests.** Add unit tests under `apps/test/unit/<labname>/` and, if the lab has verifiable behavior in the browser, a Playwright spec under `frontend/packages/e2e-tests/tests/labs/`.

7. **Seed a test level.** Add a level definition under `dashboard/config/levels/custom/<labname>/` so the local seed includes at least one navigable level.

## Key files

- `apps/src/lab2/` -- lab2 framework
- `apps/src/lab2/progress/README.md` -- validation system
- `dashboard/app/models/levels/` -- level model definitions
- `dashboard/app/models/game.rb` -- game type registry
- `apps/webpackEntryPoints.js` -- frontend entry points

## Related

- [How a level loads](/developers/labs/how-a-level-loads/)
- [Blockly fork](/developers/labs/blockly-fork/)
