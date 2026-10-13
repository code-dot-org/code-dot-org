---
name: figma-pixel-parity
description: >-
  Figma-to-code pixel-parity workflow for the component library. Use when
  aligning an existing library component with its Figma component set, or,
  rarely, building a new component from one. Requires a spec pull, a visual
  recipe, and a browser-vs-Figma correction loop before the component can be
  called done. Not for component work that does not start from a Figma node.
---

# Figma pixel parity

Use this skill from the first spec pull through the last recapture. It is not an end-of-task checklist. Human review is for genuine ambiguity or API decisions, not for styling already specified in Figma.

Read `repo.md` beside this skill first. It binds the workflow to this library: Figma file, paths, tokens, capture URL, and verify commands.

Before calling Figma `get_design_context`, load the Figma plugin's `figma-design-to-code` skill. Without the plugin, read the Figma MCP server's `skill://figma/figma-design-to-code/SKILL.md` resource. Design-context output is a reference to adapt to this library. Do not paste it as the component.

Do not write component code until phases 0–2 are done.

## What “matches Figma” means

A case matches only when all of these are true in the current session:

1. Design context was retrieved for the exact component-set node (not a page, frame, or nearby example).
2. The visual recipe has a cell for that variant, state, and mode, with geometry and token bindings taken from that retrieval.
3. A Figma screenshot of that exact variant exists.
4. A browser capture of the library component, from its story, exists for the same case id.
5. You compared them by overlay or by measured box plus computed style. Recording two file paths is not a comparison.
6. Every mismatch is fixed and recaptured, or written up as an accepted difference.

Code inspection, “the token name looks right,” and “side by side looks close” do not pass a case. A screenshot from an earlier session does not prove the current code. If a required capture cannot be made, the component is not done — say which evidence is missing.

## Sources of truth

| Layer | Source |
|---|---|
| Design | Figma file in `repo.md`. Exact public component-set node. |
| Spec | Visual recipe from `visual-recipe-template.json`, checked with `validate-recipe.mjs` |
| Code API | The library’s prop catalog in `repo.md` |
| Visual proof | Figma screenshot vs story capture for each coverage case |
| Build | Verify commands in `repo.md` |

The recipe and the captures are working files for one task. They live in the gitignored work directory named in `repo.md` and are never committed.

Read [references/correction-loop.md](references/correction-loop.md) before the first capture. Read [references/mui-watchouts.md](references/mui-watchouts.md) when styling an MUI-backed component. Apply a watch-out only after confirming this library hits that failure.

## When to escalate

Escalate only when:

1. A Figma property is design-tool-only, or the code API should differ for a real reason (for example a group `value` instead of a per-item `isActive`).
2. Token or interaction recipes conflict across variants, or a required state cannot be inspected.
3. Figma has contradictory component definitions.
4. An accepted-difference note is still unresolved.

Do not ask a human to re-confirm sizes, enums, or states already present on the component set.

Every accepted difference records: case ids, Figma behavior, code behavior, reason, and who decided. “Looks close” is not an accepted difference. The recipe is not committed, so copy accepted differences into the PR description.

## Phase 0 — classify

Pick one path and record it on the recipe:

- **Figma update.** The usual path: an existing component is brought in line with its Figma component set. Pull a fresh recipe. If an earlier recipe for the component is still in the work directory, diff against it; otherwise diff against the current implementation. List changed axes, values, tokens, and geometry, and test the changed cases plus one regression sentinel per affected variant family.
- **Code-only fix.** Still refresh design evidence for the affected cases so the fix does not contradict Figma.
- **New component.** Rare. Write the visual recipe before implementation.

## Phase 1 — pull the spec

1. Resolve the public component-set node. A page or marketing frame is not a substitute.
2. Call `get_design_context` on that node before writing code. Use `get_metadata` only to list every variant symbol. Metadata is not a styling spec.
3. Inspect related components that change rendering (a menu item, an icon slot, a label wrapper).
4. Record:
   - axes, values, defaults, booleans, and invalid combinations
   - width, height, padding, gap, border, radius, overlap
   - type family, size, weight, line-height, and icon size
   - the library token bound to every visible color, not a raw hex
   - default, hover, focus, press, disabled, and selected recipes
   - Light and Dark differences, plus annotations
5. Take a Figma screenshot for each case chosen in phase 2.
6. Update the visual recipe. Never fill a gap from memory, from MUI defaults, or from the current implementation.

If design context times out, retry a smaller exact node. Do not implement from screenshots alone.

## Phase 2 — coverage before code

Fill `coverage.cases` before implementation. Use pairwise coverage plus risk cases, not every permutation. Include:

- every size, color, and visual variant at least once
- every interaction state
- Light and Dark
- selected and disabled, where the component has them
- icon-only, leading/trailing icon, long label, and composed layouts, where they exist
- combinations Figma marks as restricted or exceptional
- one default sentinel per major variant family

Each case needs a stable id (`button-medium-contained-primary-hover-light`), a Figma node and variant name, mode, props, state, viewport, expected geometry, and expected tokens. Names like `test1` are invalid.

Run `validate-recipe.mjs` on the recipe before moving on.

## Phase 3 — implement from the recipe

1. Use this library’s components, tokens, and styling system. Do not paste Figma’s generated layout or Tailwind.
2. Implement each recipe cell: variant × color × state × mode.
3. Drive hover, press, and focus from CSS pseudo-classes and real input. Do not add a public `state` prop to match a Figma axis.
4. Keep the library’s existing token roles (brand vs selected vs danger, or whatever `repo.md` documents).
5. Use the geometry in the recipe. MUI’s default height, padding, radius, and type are not a match.
6. Update types, the prop catalog, and the docs or Storybook example in the same change.

## Phase 4 — correction loop

Follow [references/correction-loop.md](references/correction-loop.md). For each coverage case:

1. Capture the case from its story at the recipe viewport and device scale, after tokens and fonts have loaded.
2. Produce hover, keyboard focus-visible, and press with real browser input. Disabled is a real disabled control. Do not fake these with an undocumented public prop.
3. Compare against the matching Figma screenshot. Also measure the rendered box and computed type, spacing, radius, and colors against the recipe.
4. Classify each mismatch: `geometry`, `typography`, `variable-color`, `state`, `icon`, `content`, or `rendering-noise`.
5. Fix every non-noise mismatch and recapture the failed cases.
6. Repeat until every case is `pass` or `accepted-difference`.

One pass that finds a mismatch is not done. A checklist without case ids and results is not evidence.

## Phase 5 — API, behavior, accessibility

- Every Figma axis maps to a code prop, or is listed as design-only. `state` is design-only unless `repo.md` says otherwise.
- Every public prop with no Figma axis has a category and a reason (event, content, accessibility, controlled value, layout).
- Enum values match. Extra or missing values are failures.
- Types, docs or stories, and examples agree.
- Check keyboard operation, visible focus, accessible name, disabled behavior, and controlled or uncontrolled behavior where the component has them.
- Run the API audit command in `repo.md` when one exists. Otherwise record this mapping check in `evidence.apiAudit`.

## Phase 6 — evidence summary

Run the verify commands in `repo.md` and record each in `evidence.verify`. Run `validate-recipe.mjs` on the final recipe. The final message must include:

```text
Task path: figma-update | code-only fix | new
Components:
Figma evidence: public and related node ids, retrieval date
Coverage: passed/total case ids; modes; states actually exercised
Correction loop: mismatches found, fixes, cases recaptured
API check: result
Verification: commands and results
Accepted differences: none | structured list (also in the PR description)
Still missing: none | evidence that could not be captured
```

Do not report the component as done when any required case is `pending` or `fail`.

## Invocation

```text
Load figma-pixel-parity and figma-design-to-code. Read repo.md.
Classify this as a Figma update, code-only fix, or new component.
Pull design context from the exact component-set node, update the visual
recipe, and define coverage cases before writing code. Before done, run the
correction loop, the API check, the repo verify commands, and report the
evidence summary. Escalate only genuine ambiguity.
```
