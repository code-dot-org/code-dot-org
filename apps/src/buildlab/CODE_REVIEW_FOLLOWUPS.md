# Build Lab code review follow-ups

Open items from the review of the `build-lab-prototype` branch (`staging..HEAD`
plus the uncommitted Blockly-hook refactor). Everything listed here still needs
work; the smaller fixes found in the same review have already landed on the
branch.

Complexity is a rough estimate of the change, not of the investigation:

- **Small** — one file, contained change, no interface change.
- **Medium** — a few files, or one file plus a new interface between components.
- **Large** — crosses labs or needs a product decision before coding.

---

# Bugs

## 1. An unparseable project is silently replaced, then overwritten

`parseBuildLabProject` returns `null` for any validation failure, and
`projectFromSources` substitutes a blank `DEFAULT_PROJECT` without reporting the
problem. The student sees an empty project, and the next save writes it over
their stored source. A load failure must be surfaced through
`setPageError` (the `loadError` path already does this) and must block saving
until the user chooses to start over.

- **File:** `apps/src/buildlab/BuildlabContainer.tsx` (with `apps/src/buildlab/project.ts`)
- **Complexity:** Medium
- **Category:** Frontend / data integrity

## 2. The ID fields rename on every keystroke with no validation

The element ID field and the screen ID field each rewrite the id, every
dependent record, and every workspace block reference on each `onChange`.
Clearing either field rewrites all references to the empty string, and nothing
rejects an id another element or screen already uses. Both fields need local
draft state, a commit on blur or Enter, and a uniqueness check.

- **File:** `apps/src/buildlab/BuildlabView.tsx` (element ID ~line 1930, screen ID ~line 1870)
- **Complexity:** Medium
- **Category:** Frontend / data integrity

## 3. `engine.run()` has no error handling and no error surface

`compileBuildLabWorkspace` loads the saved workspace through
`Blockly.serialization.workspaces.load`, which throws on a block type that is
not registered — a project saved before a block was renamed, for instance. The
throw escapes `toggleRun` before `setIsRunning(true)`, so the Run button dies
with only a console error. The view has no general error surface, so this needs
one (dispatch `setPageError`, or a banner) alongside the `try`/`catch`.

- **File:** `apps/src/buildlab/BuildlabView.tsx` (~line 1200)
- **Complexity:** Medium
- **Category:** Frontend / error handling

## 4. The arrow-key loop drops AI and prediction requests

The animation frame calls `engine.moveWithArrowKeys` inside a
`setRuntimeElements` updater and keeps only `.elements`. Touch handlers that
run during movement can set `pendingPrediction` or `pendingGeneration`, and
those are discarded — a "when sprite touches sprite → ask AI" program never
fires from arrow-key movement. Routing the result through `applyRuntimeState`
is not sufficient on its own: pending requests stay set in engine state until
`clearPendingRequests`, so a per-frame `applyRuntimeState` would re-issue the
same request every frame. The engine needs to clear a pending request once it
has been handed out.

- **File:** `apps/src/buildlab/BuildLabEngine.ts` and `apps/src/buildlab/BuildlabView.tsx` (~line 1300)
- **Complexity:** Medium
- **Category:** Frontend / runtime engine

## 5. `loadCode` silently drops a load while a drag is in progress

The shared hook's `loadCode` returns without loading when
`workspace.isDragging()`, tells the caller nothing, and nothing retries. Sprite
Lab's scene-change effect then leaves the previous scene's blocks in the
workspace while believing the new scene is loaded, and the next edit writes
them into the new scene. Either return a status the caller can act on, or queue
the load and replay it when the gesture ends.

- **File:** `apps/src/lab2/views/useBlocklyWorkspace.ts` (with `apps/src/p5lab/spritelab/lab2/views/SpriteLab2View.tsx`)
- **Complexity:** Medium
- **Category:** Frontend / Lab2 shared code

## 6. The Blockly container is located by a global DOM id

The shared hook takes a `blocklyDivId` and calls `document.getElementById`,
which returns the first match. Two instances, or a transition where the
outgoing div is still mounted, resolve to the same element and both workspaces
break; a missing div makes the hook return with no cleanup and no error. Build
Lab used a React ref before the refactor. Let the hook accept a ref or element
in addition to an id.

- **File:** `apps/src/lab2/views/useBlocklyWorkspace.ts` (with both callers)
- **Complexity:** Medium
- **Category:** Frontend / Lab2 shared code

## 7. The save-status indicator always reports success

`setSaveStatus('saving')` and `setSaveStatus('saved')` run in the same tick
around a fire-and-forget `onProjectChange`, so React only ever renders
"saved" — including when the save failed. The `loading`, `unsaved`, and `error`
branches are unreachable. Drive the status from the project manager's save
events, or remove the indicator until it can report truthfully; as written the
`aria-live` region asserts a false success to screen readers.

- **File:** `apps/src/buildlab/BuildlabView.tsx` (~line 500)
- **Complexity:** Medium
- **Category:** Frontend / accessibility

## 8. Blockly `findHighlightSvg` is monkey-patched for every lab

A Build Lab drag crash is worked around by wrapping
`RenderedConnection.findHighlightSvg` in the shared Blockly wrapper, with the
recovery path chosen by matching the text of the thrown `TypeError`. Every
Blockly lab now runs the wrapper. A Blockly upgrade that rewords the message
re-exposes the crash silently, and an unrelated `getElementById` `TypeError`
would be swallowed. Gate on the actual condition (a root node without
`getElementById`) and reference the upstream Blockly issue.

- **File:** `apps/src/blockly/blocklyWrapper.ts` (~line 300)
- **Complexity:** Medium
- **Category:** Frontend / Blockly integration

## 9. `scrub_` is patched on the shared JavaScript generator

`setupBuildLabBlocklyEnvironment` permanently replaces `scrub_` on the
process-wide CDO JavaScript generator so Build Lab hat blocks skip the default
scrub. Only one lab loads per page today, so nothing else observes it, but two
labs on one page would get whichever patch ran last.

This was first filed as a small fix; it is not. The hat blocks take their
handler body from `nextStatement`, not a statement input, so `nextCode` embeds
the following chain inside the generated function and the default `scrub_`
would then append that same chain again after the closing brace — hence the
override. Removing it means one of: giving the hat blocks a real statement
input (a block-shape change, so a migration for saved projects), or registering
the Build Lab generators on a generator instance of their own rather than the
`Blockly.JavaScript` singleton. Pick the approach before estimating.

- **File:** `apps/src/buildlab/buildlabBlockly.ts` (~line 460)
- **Complexity:** Medium
- **Category:** Frontend / Blockly integration


## Minor, optional

- The animation frame strip keys on array index, so a `duplicateFrame` splice
  briefly shows the wrong thumbnails. Fixing it properly means giving frames
  ids; they are bare data-URL strings today.
  `apps/src/buildlab/BuildlabView.tsx`.

---

# Features

Wanted work, not defects. Same format as above.

## F1. Drag an element to a trash target to delete it

Dropping a stage element outside the stage used to delete it, which also fired
for drags cancelled with Escape; that implicit behavior has been removed, so
deletion currently happens only through the inspector's "Delete element"
button. Restore the gesture as an explicit drop target rendered below the stage
in `.previewPanel`, gated on the design tab with `!isRunning && !readOnly`.

Three things to build in from the start:

- Accept the drag by testing
  `event.dataTransfer.types.includes('application/buildlab-element-id')` in
  `onDragOver`. Under the HTML5 drag protected mode `getData` returns `''`
  until `drop`, so a `getData`-based check also accepts palette drags and then
  deletes nothing.
- Keep the drop zone childless, or count `dragenter`/`dragleave` depth. Those
  events fire per descendant and the hover state will otherwise flicker.
- Match `.stage`'s `max-width: 400px` so the target lines up under the canvas,
  and use the existing design tokens (`var(--borders-neutral-primary)` and
  friends) so dark theme needs no extra rules.

Roughly 35 lines of JSX and one hover state in the view, plus about 20 lines of
SCSS. Deletion still strips the element's blocks via
`removeDesignEventsForElement`, so this pairs naturally with F2.

- **File:** `apps/src/buildlab/BuildlabView.tsx` (with `apps/src/buildlab/buildlab-view.module.scss`)
- **Complexity:** Medium
- **Category:** Frontend

## F2. Undo and redo for editor changes

Build Lab has no undo anywhere, and several actions are destructive beyond the
thing being acted on: deleting an element or a screen also strips the blocks
that referenced it. `BuildlabView` currently holds project state across roughly
thirty `useState` slices, so a history stack realistically means consolidating
that state into a reducer first, then either snapshotting the project on each
committed change or recording inverse operations. Blockly keeps its own undo
stack for the workspace, so the two need coordinating — otherwise Ctrl+Z means
different things depending on which pane has focus.

- **File:** `apps/src/buildlab/BuildlabView.tsx` (with `apps/src/buildlab/project.ts`)
- **Complexity:** Large
- **Category:** Frontend / architecture

## F3. Class-based events in the Design tab's Events section

Design events target exactly one element: `BuildlabDesignEvent.elementId` is a
single id, and the Events tab offers only per-element handlers. The touch path
already supports classes — `blocklyTouchTargetOptions` offers `class:<name>`
entries and the engine's `checkTouchEvents` resolves the `class:` prefix — but
clicks do not: `BuildLabEngine.clickHandlers` is a `Map` keyed by exact element
id and `triggerClick` looks up only that key.

The work is to make clicks match what touches already do: offer class options
in the `buildlab_on_click` ELEMENT dropdown, resolve `class:` targets in
`onClick`/`triggerClick`, extend the Events tab UI to pick a class, and teach
`renameElementReferencesInWorkspace` to leave class targets alone when an
element id changes.

- **File:** `apps/src/buildlab/BuildLabEngine.ts` (with `BuildlabView.tsx`, `BlocklyWorkspace.tsx`)
- **Complexity:** Medium
- **Category:** Frontend

## F4. More blocks

The toolbox has sixteen block types, all straight-line statements: events,
element and sprite mutation, two variable blocks, predict, and generate text.
There are no conditionals, comparisons, arithmetic, loops, timers, or sound,
and — notably — the project model already stores `dataTables` and
`keyValuePairs` that no block can read or write.

Anything with a nested body is more than a block definition. Two prerequisites:
the generators currently chain through `nextCode` plus the shared `scrub_`
patch (see bug 11) and would need real statement-input handling; and
`normalizeBuildlabWorkspaceState` and `restoreDropdownValues` only walk `next`
chains, so fields inside statement or value inputs would be silently skipped on
load. Fix those two before the first C-shaped block, not after.

- **File:** `apps/src/buildlab/buildlabBlockly.ts` (with `BuildLabEngine.ts`, `blocklyTypes.ts`)
- **Complexity:** Large, and open-ended — scope per batch of blocks
- **Category:** Frontend / curriculum

## F5. More design elements

Six element kinds exist: button, dropdown, label, sprite, textArea, textInput.
Obvious additions are image, checkbox, radio group, slider, and a table or
chart for the data tab. Each new kind touches a fixed list of places, which
makes the per-element cost predictable: `ElementKind` in `project.ts`,
`DEFAULT_ELEMENT_PROPERTIES`, `NEW_ELEMENT_DROP_OFFSETS`, a `<PaletteElement>`
entry, a render branch in `StageElementView`, the inspector's property fields,
and the SCSS. Interactive kinds also need a runtime story in the engine (what
does `setText` mean for a slider?) and an `inputValue` contract for
`predictMlModel`'s feature lookup.

- **File:** `apps/src/buildlab/project.ts` (with `BuildlabView.tsx`, `buildlab-view.module.scss`)
- **Complexity:** Medium per element
- **Category:** Frontend
