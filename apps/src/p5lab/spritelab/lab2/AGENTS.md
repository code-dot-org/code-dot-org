# Sprite Lab in Lab2 (`apps/src/p5lab/spritelab/lab2/`)

The Lab2 version of Sprite Lab: a Blockly workspace, a p5.play engine
(`SpriteLab2Engine.js`) built on the classic engine next door, React views,
and AI image generation under `ai/`. `apps/src/AGENTS.md` applies; this file
adds what reviews of this lab keep asking for.

## Names

- In prose the lab is "Sprite Lab in Lab2"; identifiers stay `SpriteLab2`.
  "Standalone" already means a project outside a progression.
- One name per concept, across identifiers, file names and CSS classes. Two
  sibling files about one concept differ in a word that says what each holds,
  never in number or suffix alone.
- A type used only inside this directory carries no `SpriteLab2` prefix. Keep
  the prefix where the name leaves the lab (`src/types/redux.ts`) or would
  collide with the shared type it extends.
- A serialized property with the wrong name is renamed before it merges; after
  that it needs an entry in `migrateSources.ts`.

## Classic Sprite Lab is next door

Everything under `p5lab/` outside `lab2/` runs classic Sprite Lab, in heavy
use. A change to shared code (`CoreLibrary`, `commands/`, `P5Wrapper`) keeps
classic behavior identical: a new knob defaults to the old behavior, or the
override goes through `SpriteLab2Engine`'s `createLibrary`. A change that
alters classic behavior is its own PR with its own safety analysis.

## Two customers

The Hour of AI unit drove most of the lab, but it is not the only user. The
prompt bar (`views/components/PromptBar.tsx`, the prompt-for-a-variable and
prompt-with-choices blocks) and the Ask AI block (`ai/text/askAi.ts`) are
curriculum work, reached from the sandbox level and not from any level of
the unit. A change to shared code (`SpriteLab2Engine.js`, the view, the
toolbox) keeps them working even though the unit never exercises them, and a
unit convention (objectives, `level_mode`, the free-play toolbox) is not
assumed to hold for a level that uses them.

## Level properties and content

- Three places must agree when a level property changes:
  `SpriteLab2LevelProperties` in `types.ts`, `serialized_attrs` in
  `dashboard/app/models/levels/gamelab_jr.rb`, and `RAW_EDITABLE_PROPERTIES`
  in `apps/src/code-studio/spriteLab2ExtraProperties.js`.
- Level files and data manifests are edited by people who do not ship code.
  Code reads them as data and never restates what they hold; the only values
  listed in code are ones the code has a branch per value for.

## Types

Derive from the canonical shape (`Partial`, `Pick`, `Omit` of
`RuntimeAnimationProps` and `SerializedAnimationProps` in `types.ts`) instead
of re-listing fields. A domain's types live beside their producer, such as
`ai/images/types.ts`.

## Views

- Keep `views/SpriteLab2View.tsx` flat. A screenful of related state,
  callbacks and effects becomes a `views/use<Concern>.ts` hook; multi-element
  JSX becomes a component in its own file with its own stylesheet. State moves
  with the logic it drives.
- Components declare a named `Props` interface.
- `Playspace` reports the preview column's width only while a preview shows.
  A tab that hides the playspace sees zero and falls back to its own width.
- A selected state never changes an element's size.
- SCSS: semantic tokens (`--border-neutral-primary`, `--text-neutral-primary`;
  the `--borders-*` family is retired). Nest a child selector under its parent
  instead of repeating the parent. Style `:focus-visible` and keep an outline
  for keyboard focus. Container queries are fine; an `@container` block comes
  after the base rules it overrides, since equal specificity resolves by order.

## Accessibility

Design-system components first. Checkbox groups sit in a `fieldset` with a
`legend`. A dialog traps focus and closes on Escape, or the PR says why not. A
popover moves focus in and returns it on close. State is conveyed by more than
color. A hint that changes is a live region. The `img` role goes on the
picture's own box, never on a container that also holds controls.

## Comments

Beyond `apps/src/AGENTS.md`: write for a colleague outside this lab. No nouns
coined in the branch ("the strip", "repoint") without the plain thing they
name. No history ("used to", "before #N"). No cross-layer names, such as a
Rails property's snake_case in TS. A type property's comment says what it
represents, not what a caller does with it. Add to an existing TSDoc block
rather than beside it. US spelling.

## Tests

- Unit tests mirror this tree under `apps/test/unit/p5lab/spritelab/lab2/`,
  one `<module>Test.ts` per module. Run one with `npx jest --maxWorkers=2
  <path>` from `apps/`.
- `apps/test/setupJest.js` mocks `@cdo/apps/imageUtils` partially, with the
  real module spread in, so a test for a component that draws mocks
  `toImage` itself.
- Mock `tone` wholesale (see `soundEffectsTest.ts`).
- A stylesheet with an `:export` block yields only those constants in tests;
  its class names read as undefined.
- Never make a real model call, in a test or in a browser check. Stub the
  gateway.

## Definition of done

Before calling a change ready: `yarn typecheck` on every PR tip of a stack,
`./tools/hooks/pre-commit` with the files staged, the module's unit tests, and
a browser check at 1024 by 605 and at a large window on a level of each kind
the change can reach (an image level, free play, the draw tools). Read the
diff as a reviewer would, prose included, before asking for review.
