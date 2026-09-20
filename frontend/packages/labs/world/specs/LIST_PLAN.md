# Plan: the List, and what a gesture lets a control be

STATUS: BUILT, not yet seen in the browser. The first interface actor the finger makes possible
(specs/GESTURES_PLAN.md), and the one specs/APPS.md calls "the single
biggest gap in what an app can SHOW". The working record, as the other
plans are.

## What scrolling costs in this engine, and the answer it forces

This is the finding that decided what to build, and it was nearly the
opposite decision.

**A mask does nothing.** The driver says so where it stands up a Viewport:
"in this Phaser a mask is a filter and `setMask` does nothing in WebGL".
So a clip has to come from somewhere else, and there are exactly two
somewheres.

1. **A camera.** That is what a Viewport is — a space of its own, drawn
   into the Viewport's rectangle through a camera of the space's own. It
   clips because a camera's viewport clips.
2. **An actor's own canvas.** A drawing is exactly the actor's size, "so
   anything beyond it is clipped away" (specs/UI_ACTORS.md, on why a
   Button's focus ring is drawn inside its face).

**So a control that scrolls its OWN drawing works, and a container that
scrolls its CHILDREN does not.** Children are separate actors with their
own canvases, and nothing clips one to its parent. A Scroll Panel — a
Panel whose children slide under a window — is not buildable this way, and
would want the Viewport's camera instead, which is a bigger piece of work
about reaching a space's camera from outside it.

That rules out the container and rules in the control. A List draws its
own rows.

## What is being built

**`List` — a box of words you scroll, and choose one of.** The Dropdown
with the three things that make it a list rather than a menu: it is always
open, it is as tall as it says rather than as tall as its contents, and it
SCROLLS.

- **Its own `items`**, a list of words, as the Dropdown's `choices` are.
- **A scroll offset in pixels**, clamped so the first row cannot fall
  below the top or the last rise above the bottom.
- **A drag scrolls it.** `is dragged by ⟨movement⟩` carries how far the
  pointer went since the last frame, which is exactly what a scroll offset
  adds up (specs/GESTURES_PLAN.md).
- **`is chosen ⟨word⟩ at ⟨place⟩`**, carrying both. The first event in
  anything shipped to carry two named values, which is what
  specs/EVENT_VALUES_PLAN.md was for and what nothing had yet used.
- **A highlight**, which the keyboard moves and a click sets.

## Reachable without a mouse, which is the other half

Everything the kit already does, because an interface actor that only
answers a pointer is an interface half the people cannot use:

- **Tab reaches it** (`Can Be Focused`), and the ring is drawn INSIDE the
  face, as the Button's and the Slider's are, because outside is clipped
  away.
- **Up and down move the highlight**, and scroll to keep it in view — the
  part a list has that a dropdown does not, since the highlight can leave
  the window.
- **Enter chooses the highlighted row**, raising the same event a click
  does.
- **Page up and page down** move by a windowful, which is the only thing
  that makes a long list usable from the keyboard at all.

**What this does NOT get, and should not be claimed:** the running world
is a canvas and has no screen-reader story at all — no roles, no names, no
announcements, nothing. Keyboard-operable and visibly focused is what the
kit means by accessible today, and a list is where that starts to hurt,
because "item four of nine" is a thing a sighted user reads from the
scrollbar and nobody else is told.

## Decisions taken before building

- **A control scrolls its own drawing.** Forced, per the finding above,
  and worth stating as the rule for everything that comes after: a control
  that shows more than it fits draws it.
- **Scroll in PIXELS, not in rows.** A drag is a distance, and rounding it
  to whole rows makes a slow drag do nothing and a fast one jump. The row
  under a point is then arithmetic, as the Dropdown's already is.
- **`defineEvent` gains parameters.** An actor's own event could only
  carry labels, because until specs/EVENT_VALUES_PLAN.md an event could
  only carry one unnamed thing. The List is the first actor with something
  worth saying, so the helper grows the ability the language already has.
- **It acts like a LABEL**, not a Panel, which is what the plan first said.
  A Label is where the size, the anchor and the text colours live, and the
  Dropdown already takes them that way; a Panel is a Label with no words,
  so acting like one would be a step further for nothing.

## Order of work

1. This plan.
2. `defineEvent` with parameters, and a test.
3. The List: properties, drawing, drag, click, keyboard, events. Tests.
4. The shelf: the library entry, the demo the shelf asks for, and the tile
   that grants it.
5. Specs: UI_ACTORS.md's table, APPS.md's third missing thing, this
   record.

## Commits

- `62c566834b5` — this plan, and what scrolling costs here.
- `ea41360e130` — `defineEvent` with parameters.
- `6a742776a92` — the List, and the seven cases that play it.
- the tile that grants it.

## Learned while building

- **A part's type and a variable's type are different spellings.** A
  signature part is typed in the language's words (`vector`); a workspace
  variable is typed with Blockly's own flavour tag (`Vector`). Declared
  with the wrong one, the getter finds nothing of its flavour and INVENTS
  a variable — so the handler read a name nothing had ever written and
  scrolled by `undefined`, silently. The helper that converts one to the
  other is three lines and exists so nobody meets this twice.
- **An event is named by its labels JOINED.** `define event ⟨is chosen⟩
⟨word⟩ ⟨at⟩ ⟨place⟩` is the event "is chosen at", because a carried value
  is not part of the name. The hat and the `emit` are `…IsChosenAtEvent`,
  and naming them by the first label alone produced a hat that generated
  nothing and a handler body that leaked out above the world it belonged
  to.
- **Two blocks I reached for do not exist.** There is no two-argument
  `min`, and `text_join` was retired for a `text` block that chains. Both
  were caught at workspace load rather than at authoring time, which is
  the cost of writing a `.actor` as JSON.
- **A clamp whose bottom is above its top answers with the bottom.** A
  list shorter than its box overflows by a negative amount, so the clamp
  would have parked the window below the only rows there are. The `if` in
  `scrollTo` is not decoration.

## Not built, and known

- **No demo.** A stock rule must have one and a stock actor need not; the
  List would be a good one, and a drag is a thing a still picture cannot
  say.
- **No scrollbar.** Nothing says how far down the list you are, which is
  exactly the thing a sighted user reads and a keyboard user is told
  nowhere. That is the same gap as the missing screen-reader story and it
  wants answering together.
- **No momentum.** Letting go stops it dead. A flick is already a swipe,
  so the event to carry it exists.
- **Rows are words, not actors.** A row with a picture and a button in it
  is the other kind of list, and it needs the clipping a Viewport has.
- **One column, no wrap.** A word wider than the box is drawn past its
  edge and clipped.

## What to look at in the browser

Put a List on a map and give it eight or ten words. Drag it with the
pointer: the words should follow the finger and stop dead at either end
rather than rubber-banding. Click a row and it should highlight.

Then leave the pointer alone. Tab to it, and the ring should appear inside
the box. The arrows should move the highlight, and when the highlight
reaches the bottom row the window should start moving with it. Page Down
should jump a boxful. Enter should choose.

A list SHORTER than its box should not move at all, however hard it is
dragged.
