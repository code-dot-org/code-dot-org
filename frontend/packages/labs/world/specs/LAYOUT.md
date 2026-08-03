# Plan: the editor column at narrow widths

**Status: deferred.** Written from a measurement, not a report — nobody has
complained yet, and on a wide screen nothing is wrong. It is here so the next
person to meet it does not have to re-derive it.

The workspace is three columns of which one is elastic, and that one is the
editor. Every pixel the window lacks comes out of it, until it is not an editor
any more.

## 1. What happens, measured

Default project, split view, file browser open, at a 900px-tall window:

| viewport | instructions | preview | editor pane | file browser | **editor content** |
| -------- | ------------ | ------- | ----------- | ------------ | ------------------ |
| 1900     | 320          | 460     | 1118        | 220          | ~898               |
| 1600     | 320          | 460     | 818         | 220          | ~598               |
| 1400     | 320          | 460     | 618         | 220          | ~398               |
| 1280     | 320          | 460     | 498         | 220          | ~278               |
| 1100     | 320          | 460     | 318         | 220          | **~98**            |
| 1000     | 320          | 460     | 218         | 220          | **~0**             |

At 1100 a Blockly workspace still reports 400px of its own inside a 97px column
— it simply overflows and is clipped. The image editor fits itself to what it is
given (`imageEditor/PixelEditor` `fit()`), so below its 64px floor it scrolls
rather than clipping; that is the only pane that currently degrades honestly,
and it was fixed for a different reason.

## 2. Why

Three consumers of width, and only one of them can lose:

- `.instructions` — `width: var(--instructions-width, 320px); flex-shrink: 0`
  (`layout/worldLayout.module.css`), resizable 200–640 by its seam.
- `.previewPane` — `flex: 0 0 auto` with an inline `width` from
  `WorldLayout`'s `previewWidth` state (initial 460, resizable 240–900). It does
  not flex deliberately: `flex: 1` implies `flex-basis: 0%`, which makes the
  inline width inert and leaves the divider dragging nothing.
- `.editorPane` — `flex: 1; min-width: 0`, and inside it Codebridge's sidebar
  (`SIDEBAR.initial = 220`, `flex-shrink: 0`).

So the editor is the only elastic thing in the row, and `min-width: 0` says out
loud that it may vanish. Nothing is wrong with any single rule; what is missing
is an answer to **what yields first**.

## 3. The policy

In order. Each stage only comes into play when the one before it has run out.

1. **The editor keeps a floor; the preview yields.** The editor pane may not go
   below `EDITOR_MIN` of content. The preview renders at
   `clamp(preference, PREVIEW.min, available − editorMin − handle)`.
2. **The file browser collapses.** 220px that belongs to the editor pane, with a
   re-open button already in the tab strip. At 1100 this alone nearly settles it:
   780 available − 320 editor − 8 handle leaves ~452 for the preview, near its
   natural 460.
3. **One pane.** Below about 900 the minimums do not both fit; show the pane the
   view-mode control already names (default: the editor). The segmented
   Code | Preview | Split buttons stay, and switching still works — this only
   decides what to show when both cannot be.

Two rules that matter more than the thresholds:

- **Clamp what is rendered, never the stored preference.** `previewWidth` is
  what the learner dragged the divider to. Writing a clamped value back would
  quietly destroy it, and widening the window would not bring it back.
- **The drag handle obeys the same budget.** Its `max` must come from the same
  arithmetic, or the pointer can put the editor below the floor by hand — a
  floor honoured by one path and not the other is not a floor.

## 4. Method

A pure function, and one observer.

```ts
// layout/paneLayout.ts
export interface PaneRequest {
  /** Width of `.editorAndPreview` — instructions already taken out. */
  available: number;
  /** What the learner dragged the divider to (never modified here). */
  previewPreference: number;
  /** Whether the learner (or the level) wants the file browser. */
  fileBrowserPreferred: boolean;
  /** Which pane the view-mode control names. */
  viewMode: ViewMode;
}

export interface PaneLayout {
  previewWidth: number;
  showEditor: boolean;
  showPreview: boolean;
  /** False when the browser was wanted but there is no room for it. */
  showFileBrowser: boolean;
}

export function paneLayout(request: PaneRequest): PaneLayout;
```

`WorldLayout` measures `.editorAndPreview` with a `ResizeObserver`, calls this,
and renders what it is told; `Workspace` already takes `hideFileBrowser`. No CSS
rule changes — the policy is one function whose cases can be read, argued with,
and tested at a table, which is not true of a media query.

Constants, with their reasons:

| name          | value | why                                                                                                                       |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `EDITOR_MIN`  | 320   | A Blockly workspace with a toolbox and one block visible; the image editor's toolbar (72) plus a canvas worth drawing on. |
| `BROWSER_MIN` | 540   | Editor pane width below which the file browser (220 + `EDITOR_MIN`) stops earning its place.                              |
| `SINGLE_PANE` | 568   | `EDITOR_MIN + PREVIEW.min + handle` — below this the split is arithmetic, not a layout.                                   |

## 5. Deliberately not in scope

- **The instructions panel does not auto-collapse.** It is 320px and collapses to
  an icon strip on its own control. Instructions are the pedagogy; taking them
  away to make room is the learner's call, not the layout's.
- **Blockly's own overflow is not addressed.** A clipped workspace is what a
  too-narrow column looks like today; with a floor in place it stops arising.
  `BlocklyWorkspace` already calls `Blockly.svgResize` from a `ResizeObserver`,
  so a pane that changes width re-lays-out — worth confirming when this lands,
  because a workspace that keeps a stale size would undo the whole point.
- **The preview's aspect.** The world viewport is square (320×320,
  `runtime/viewport`); a preview pane at its 240 minimum draws it smaller, which
  is correct and not a layout bug.

## 6. Testing

`paneLayout` is a table, and the table is the test:

| available | preference | browser wanted | expect                                     |
| --------- | ---------- | -------------- | ------------------------------------------ |
| 1579      | 460        | yes            | preview 460, browser shown                 |
| 779       | 460        | yes            | preview ≥ 240, browser hidden              |
| 679       | 460        | yes            | preview clamped, browser hidden            |
| 560       | 460        | yes            | one pane (the view mode's), browser hidden |
| 1579      | 900        | yes            | preview 900 (preference honoured)          |
| 779       | 900        | no             | preference untouched by the clamp          |

Then in the browser: that the editor never goes under its floor from 900 to 1900
wide; that the preview returns to the dragged width when the window widens
again; that dragging the divider cannot push the editor below the floor; and
that a Blockly workspace re-lays-out when its pane changes width rather than
keeping the size it was injected with.

## 7. Open questions

- **A level that turns the browser off** (`levelData.showFileBrowser: false`)
  and stage 2 must not fight: the level's answer is final, stage 2 only ever
  removes a browser the learner would otherwise have.
- **Whether the browser should come back on its own** when the window widens.
  Coming back is consistent (nothing was chosen, only accommodated), but a
  panel that reappears while you type is its own annoyance. Suggest: it returns,
  since it left without being asked.
- **Where the thresholds are checked.** `available` is measured from
  `.editorAndPreview`, which already has the instructions width taken out — so
  dragging the instructions panel wider walks the same stages, which is the
  intent.
