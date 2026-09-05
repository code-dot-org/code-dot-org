# Breaking a rule into surfaces — what it buys

The question `specs/NEXT.md` §8 could not answer from the desk: if a rule
opened as its INTERFACE and built a body only when somebody asked for it, how
much faster would opening one be?

§8 reasoned from an earlier measurement — collapsing 80% of `solid`'s blocks
moved the tab switch from 342ms to 341ms, so the cost is building a block, not
showing it — and inferred a saving of about seventeen times. Reasoning, not a
number. jsdom cannot settle it either: it makes SVG nodes and runs no layout,
which is the cost in question.

So this drives the lab's own dev server with Playwright, injects a real
workspace into a real page, and loads every stock rule twice — whole, then
interface-only — timing `Blockly.serialization.workspaces.load`, which is what
a tab switch pays for.

    yarn dev:isolated              # in another terminal
    node spikes/rule-surfaces/measure.mjs           # every rule
    node spikes/rule-surfaces/measure.mjs solid     # or some of them

## The answer

Six loads per variant, first discarded, median of the rest. Chromium, this
machine, 2026-09-05.

| rule       | blocks | → shape | whole | → shape | saved |
| ---------- | ------ | ------- | ----- | ------- | ----- |
| `solid`    | 473    | 14      | 147.2 | 8.6     | 17.1× |
| `path`     | 394    | 15      | 121.7 | 10.4    | 11.7× |
| `climb`    | 311    | 26      | 109.9 | 15.2    | 7.2×  |
| `turning`  | 247    | 15      | 89.1  | 9.7     | 9.2×  |
| `prowling` | 238    | 17      | 86.5  | 11.1    | 7.8×  |
| `grid`     | 264    | 20      | 82.4  | 11.6    | 7.1×  |
| `gravity`  | 209    | 22      | 71.5  | 12.1    | 5.9×  |
| …          |        |         |       |         |       |
| `camera`   | 10     | 4       | 3.7   | 2.1     | 1.8×  |
| `writing`  | 6      | 6       | 3.7   | 4.2     | 0.9×  |

**All 47 rules: 5,228 blocks in 1,764ms → 587 blocks in 338ms.** The heaviest
rule in the shelf opens seventeen times faster and the interface it opens on is
fourteen blocks.

Three things the table says that the inference did not.

**There is a floor of two to four milliseconds a load.** `writing` and
`progress` have no bodies to hide and come out slightly slower, which is
noise around a fixed cost. Below about twenty blocks the split buys nothing —
though it costs nothing either, and see "always or never" in §8.

**The saving tracks block count, not file size.** `path` is 394 blocks and
gains 11.7×; `climb` is 311 and gains 7.2×, because a third of `climb`'s
blocks are in trait members that stay. What is hidden is what is saved.

**The absolute numbers are a floor.** The design system's `Registry` turns a
definition's extension objects into registered names and is not exported, so
this registers a no-op under each name instead. A real editor also runs the
extensions, rebuilds a toolbox and remounts React — which is the gap between
147ms here and the 340ms tab switch measured earlier on `solid`. Both variants
are treated identically, so the ratio is the trustworthy part.

## What the probe found that the spec had wrong

**A body hangs off two different places, and `next` means two different
things.** A rule-level step and a behavior are HATS: what follows them is what
runs, so their body is the `next` chain. A trait's step and a designed block
keep theirs in the `DO` input. And `next` on `define rule` and `define trait`
holds their MEMBERS, which are interface and must stay.

The first draft of `interfaceOnly` stripped only `DO`, which left every
rule-level step's body in place — `gravity` came out at 75 blocks rather than
22, and `solid` at 48 rather than 14. §8's table was built with the mirror of
the same mistake and overstated `solid`'s interface as 28 blocks.

Anything that implements §8 has to know this: reading `next` as "body"
everywhere empties the rule; reading only `DO` as "body" hides almost nothing
in the rules that need it most.

## What is here

- `interfaceOnly.mjs` — the transform, and the durable part. Strips a hat's
  `next` and a member's `DO`; keeps every signature, property and declaration.
- `harness.ts` — the lab's own modules, re-exported for the page. Vite rewrites
  bare specifiers when it transforms a module, so a dynamic `import('blockly')`
  from `page.evaluate` resolves nothing; a file the server transforms can
  import them normally.
- `measure.mjs` — the driver.
- `check-overlay.mjs` — opens `solid.rule`, counts the interface, clicks a
  pencil, counts the body, comes back.
- `check-roundtrip.mjs` — the same, plus an edit: does it reach the file, and
  do the other bodies survive it.

## Two things that wasted a day

**A Blockly field cannot be clicked at coordinates read earlier.** Going Back
re-renders the interface, and a rectangle captured before that points at empty
canvas. The click lands, nothing happens, and it reads exactly like a dead
button — which sent this work chasing stranded gestures, a module-level opener
owned by the wrong editor, and a remount that was not happening. All three
were ruled out by measurement; none was the cause. Drive the field's own
`onClick()` instead, and the probe stops lying.

**`yarn dev:isolated` does not persist anything across a reload.** Its mock
sources are reseeded on every load, so an edit inside a body reverts — and so
does a plain edit on the interface, which is the control that says the sandbox
rather than the code. Reading `sessionStorage` mid-session is no better: it is
not written per edit, and it sat byte-identical through an edit that the
editor had emitted correctly. Whether a write is right has to be judged from
the document the editor hands to `onChange`, or from the unit tests.

Delete this once §8 is built or abandoned. `interfaceOnly.mjs` has since been
promoted to `src/blockly/bodySurfaces.ts`, which splits and MERGES and knows
about actor files too; the copy here stays only because the measurement runs
it in a browser.
