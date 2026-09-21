# A box

Nine of the stock interface actors are a width and a height with something
drawn in them: a Button, a Panel, a List, a Text Input, a Text Area, a
Dropdown, a Speech Box, a Scroll View, a Viewport. They had those two numbers
by ACTING LIKE a Label.

That works and says the wrong thing. A Button is not a kind of Label; it
inherits one because a Label is where `width` happened to live. And the two
kinds that could not act like a Label each grew a `width` of their own — the
Slider, which acts like a Progress Bar, and the Image, which cannot act like
anything that brings a drawing (specs/UI_ACTORS.md). Three different `width`
properties for one idea, and a map editor resize handle would have had to ask
each kind which one it meant.

## A thing many kinds share is a trait

This lab keeps arriving at that rule from both directions. `text` is the
Label's because a Label and a Button and a Score all mean the same by it;
`fraction` is the Progress Bar's because nobody else means anything by it; a
`Progress` rule with three properties and no behaviour was deleted for being
neither. A box is squarely the first kind: nine kinds mean exactly the same
thing, and the editor wants to ask "does this have a box" without knowing any
of their names.

So `Has a Box` — a trait with `width` and `height`, on a rule called `Boxed`.

**A FOUNDATION RULE**, in play in every world, like Space, Appearance and
Viewport. A resize handle cannot ask whether a project happened to import the
rule that gives things a size; having a size is not a mechanic somebody opts
into.

**NOT `intrinsic size`**, which is the engine's read-only answer to "how big
is the picture this actor draws". This is what the project ASKED for. A
Label's drawing reads it and lays its words into it; an Image reads it and
scales its picture to fit. Where the two disagree, this is the intention and
that is the result.

## Electing it once covers nine

`ActorBuilder.actsLike` copies TRAITS as well as properties, so the Label
elects `Has a Box` and the eight kinds that act like a Label get it without
each saying so. Only the Slider and the Image had to elect it themselves,
which is the honest reading of what they are.

The box is no longer in anybody's own-property ledger: `stockActors.test`'s
list of what each kind KEEPS lost `width` and `height` from the Label, the
Slider and the Image, and gained nothing.

## What it cost, which was mostly bookkeeping

A property moving from one owner to another is not an engine change, it is a
rename with a long tail, and the tail is where the silences are.

- **Map placements name the owner.** A `.map` overrides by owner id and
  property id — `Label.text`, and until now `Label.width`. Twenty-six
  placements across the stock maps, the fixtures and the tests had to say
  `hasABox` instead. An override naming an owner that no longer has the
  property is ignored in silence, so every one of them would have drawn at the
  default size and said nothing.
- **A built-in rule is in no `.rule` file.** The map editor's preview reader
  walks the project's `.actor` and `.rule` files to learn what a property
  means, so a Label's box became invisible to it and every interface actor
  previewed at whatever literal its drawing fell back to. It reads
  `BUILTIN_RULE_META` as well now, which it should always have done — the
  Space and Appearance properties were equally unreachable and nothing had
  happened to need them.
- **Blocks are minted from a list.** A new built-in rule has to join
  `BUILTIN_RULES` in `blockly/builtinMeta` or its blocks simply do not exist,
  and a block type that does not exist is a stand-in that generates nothing.
  Every box read zero for one round of tests because of it.

## What this is for

The map editor. A resize handle wants one question — does this placement have
a box — and one pair of properties to write. Rotation is already there and
needs no trait: `Space`'s `rotation`, which the placement model already
stores. So the handles are UI work over an engine that now has one answer for
"how big is this".

Consistency with Sketch Lab is worth having where it is cheap
(`apps/src/sketchlab/reactFlow/utils/rotatedResize.ts`): the eight handle
positions, the rule that the point opposite the dragged handle stays fixed,
rotation normalised 0–359, and minimum sizes. That module is pure and
framework-free; the React Flow components around it are not portable and
should not be copied.

## Not done

- **The handles themselves.** This is the seam they need, not the UI.
- **A minimum size.** Nothing stops a box being set to zero or negative.
- **Rotation is untouched.** It already exists and already works; it has never
  had a handle.
- **The Progress Bar still has no box**, and draws at constants. It is the one
  interface actor whose size is not the project's to set, which is a gap this
  did not close.
