# Proposal: pointing at things

STATUS: DECIDED IN PART. Options A and B, "Show me" and a simple ring, are
BUILT (specs/SHOW_ME_PLAN.md) and seen working. C to F are NOT
being built, and are to be looked at again only if something later needs one.
The legacy callouts and the Shepherd tours (G and H, and their paragraphs in
the survey) are out of consideration: the first is ancient and the second more
machinery than this wants. What follows is the survey and the options as they
were weighed, with the revisions the weighing made.

A survey of what the repository has for drawing a learner's eye to a piece of
the screen, the options for World Lab, and a recommendation. Written after the
pilot of lessons on the map (specs/PILOT_PLAN.md), whose instructions say
"press **Enhance Hero…**" and have no way to show where that is.

## The question

A lesson unlocks things: a drawer of blocks, a rule on a shelf, a button in
the map editor. A learner has to find each one. There are four moments
when pointing would help, and they want different answers:

1. **The unlock.** A lesson has just been finished. What did it give me?
2. **The start of a lesson.** What is here that was not here before, or is
   lent to me for this lesson?
3. **The middle of a step.** The instructions name a control. Where is it?
4. **Looking round.** This is greyed out. Why, and what brings it?

The fourth is built (`mapEditor/WithheldNote`, and the locked rows of the
import dialogs): a withheld control names the lesson that grants it. The
other three are this document.

## What the repository has

**Legacy callouts** (`apps/src/code-studio/callouts.js`). jQuery qTip2
2.2.0. A level's callouts are rows of a `callouts` table or JSON on the
level, each a jQuery selector (`element_id`), text, an optional window
event that triggers it (`on`), and qTip config. Shown at once or on the
event; dismissed by any click, mousedown or touch; seen-state kept per
learner. The close box has `role="button"`, a label and hand-rolled Enter
and Space. There is no `role="tooltip"`, no `aria-describedby` from the
target, no focus handling and no live region. Lab2 does not support them.

**Product tours** (`apps/src/sharedComponents/productTour/`). Shepherd.js
15, which is what the newer parts of the legacy app use: the Lab2
onboarding and validation tours (`apps/src/lab2/productTours/`), the
teacher homepage, with a levelbuilder setting per level. No modal overlay,
Esc exits, arrow keys step, a tour cancels itself when its anchor leaves
the DOM, seen-state in localStorage, a `?hideProductTours` switch. Its
highlight is a 2px outline with an animated gradient that stops under
`prefers-reduced-motion`. intro.js survives in one place, the rubric
container. None of this is in `frontend/`.

**Music Lab's arrow** (`labs/music/src/components/Callouts`). A fixed
registry of Blockly flyout selectors and an animated arrow image over the
target, raised by a validation's `callout` id. The only callout any Lab2
lab has.

**The design system** (`component-library`). `Tooltip` and `WithTooltip`
(`role="tooltip"`, `aria-describedby`); `Popover` and `WithPopover`, which
have a close button and no role, no focus handling and no return of focus;
`Alert`, `NotificationBanner` and `Toast`, each mapping a role to a live
region, the last two with actions; `Tag`. No badge for "new", no coach
mark, no highlight utility. MUI is a dependency of this package; of its
anchored components (`Popover`, `Popper`, `Tooltip`, `Snackbar`, `Badge`)
only `Tooltip` is used anywhere in `frontend/packages`.

**The instructions renderer** (`@code-dot-org/markdown`). Two extensions
matter. `callout` renders `<callout variant="tip">` as an `<aside
role="note">`. `clickableText` renders `[label](#clickable=some-id)` as a
button in the text, operable by keyboard, that calls
`onInstructionsTextClick(id)`. The base `Instructions` component takes
that handler. Codebridge's `InfoPanel`, which World Lab mounts, does not
pass one, so in this lab a clickable is bold text today.

**World Lab's own.** The progression dialog says what a finished tile
opened, in an off-screen `role="status"` region, and nothing visible. A
tile's detail lists what it unlocks. A block can carry a button back to
the lesson that taught it (`extensions/lessonButton`), and a shelf row a
link (`LessonLink`). Nothing marks a block, a drawer or a control as new.

**The accessibility checklist** (`.agents/skills/accessibility`). "Avoid
if possible: tooltips, overlapping dialogs/modals, actions on hover."
Focus is trapped only where it is meant to be, and returns to the trigger.
Live regions through the design system's components. Visual tooltips are
not labels. It has no rule on motion; the practice in the code is to stop
animation under `prefers-reduced-motion`.

## Principles

Taken from the checklist and from what the legacy callouts got wrong.

- **Pull before push.** A learner who asks "where is it?" wants the answer
  and will attend to it. A bubble that arrives unasked is dismissed by the
  same click that was aimed at something else, which is how qTip callouts
  are closed in practice: unread.
- **Never the only way.** The sentence in the instructions has to be enough
  by itself. Pointing is a second channel for the same fact.
- **Not modal, not on hover, not timed.** Nothing here blocks the lab, needs
  a mouse to reveal, or disappears on a clock (WCAG 2.2.1).
- **Focus moves only when asked.** "Show me" may move focus to the thing,
  since the learner asked. An unlock never does.
- **Said as well as shown.** Whatever is drawn is also announced, through a
  `status` region, in words that stand without the picture: "Script is in
  the Hero's properties, beside Delete."
- **Not by color or motion alone.** A ring has a shape and a label; any
  pulse stops under `prefers-reduced-motion`.
- **Derived, not authored, where it can be.** What a lesson unlocks is in
  the catalogue. Pointing at it should need no second list.

## The options

### A. "Show me" in the instructions (moment 3)

`press [Enhance Hero…](#clickable=map.enhance)`. Activating it REVEALS the
target and points at it: switches to the Map view if the World view is up,
selects a placement if the target is in a placement's properties, opens
the toolbox drawer if it is a block, scrolls it into view, draws the ring
of option B, announces where it is, and moves focus there.

The mechanism exists: the markdown extension, the keyboard handling, the
handler prop on `Instructions`. Missing are the handler's arrival in World
Lab (a prop through codebridge's `InfoPanel`, or World Lab rendering its
own instructions) and the target registry below.

Fits the checklist best of anything here: it is a button in the reading
order, it does what the learner asked, and nothing overlaps anything.

### B. The ring

One highlight at a time, drawn round whatever A, D or E points at: an
outline offset from the target, 3:1 against what is behind it, with the
target's name beside it where there is room. It goes when the target is
used, when something else is pointed at, or on Esc. A slow pulse, off
under `prefers-reduced-motion`. For a DOM target it is a positioned
element, not a style on the target, so that it cannot be clipped by the
target's container and does not fight the target's own focus ring. For a
target on the map's canvas, a placement, the stage draws it, as it draws
the selection.

This is Shepherd's `.tour-step-highlight` without Shepherd.

### C. "New" until used (moments 1 and 2)

A thing unlocked and not yet used carries a mark: a dot and the word "new"
on a toolbox drawer, on a block in the flyout, on a shelf row, on a map
editor control. It goes the first time the thing is used. It needs one
more set in the progress store, beside `completed`: unlocks seen. The word
is part of the accessible name ("Script, new"), so it is not visual only.

Quiet, persistent, asks nothing, and survives a learner who closed the
unlock summary without reading it. The cost is the Blockly half: a drawer
label and a flyout block are not DOM the lab owns, so the mark there is a
toolbox category style and a flyout label, each its own small piece of
work (`blockly/toolboxStyle`).

### D. What a lesson gave you (moment 1)

On finishing a lesson, a visible summary: "You unlocked Scripts on a map
and two blocks", each with Show me (A). Today that moment is an off-screen
status line about which TILES opened. The summary is the same list the
tile's detail already renders under "Unlocks", moved to where the learner
is looking: the design system's `NotificationBanner` with actions, or a
panel in the progression dialog when the lesson was finished from there.
Announced by the banner's own `status` role.

### E. What is new in this lesson (moment 2)

A line at the head of a lesson's instructions, derived from the tile's
`unlocks` and `offers`: "New here: Enhance. Lent for this lesson:
numbers", each a Show me. Content, not chrome: it scrolls with the text,
reads in order, and costs a header component and the registry.

### F. A coach mark

One non-modal popover anchored to a target, with a sentence and "Got it".
The modern form of the legacy callout. The design system's `Popover` has no
role and no focus handling, so this means building one: `role="dialog"`,
`aria-labelledby`, not modal, focus NOT moved into it on arrival, reachable
next in the tab order after its anchor, Esc closes and returns focus to the
anchor, repositioned on scroll and resize.

The checklist says to avoid exactly this where possible, and A to E cover
the four moments without it. One place it may earn its cost: the first
time the lab is ever opened, to say that Map and World are two views of
one world. That is one coach mark, not a system of them.

### G. A tour

Shepherd, as the legacy app uses it, stepping through several targets. It
is the best-behaved option the repository has for a SEQUENCE. World Lab
does not need a sequence: a lesson is already one, written in the
instructions, and A turns each step into a pointer. A tour also fixes its
targets when it is written, and this lab's targets move with the shelf.
Not proposed. If the lab is hosted by Lab2 in `apps/`, its onboarding tour
comes with the host and is a separate question.

### H. Legacy callouts

Not available to a Lab2 lab, not accessible, and dismissed by accident.
Not proposed.

## The registry

A to E all need one thing: a name for a place. `map.enhance`,
`map.script`, `map.layers`, `map.palette`, `map.newActor`, `view.world`,
`toolbox.drawer:Gravity`, `toolbox.block:world_print`, `shelf.rule:gravity`,
`run`. Each name resolves to:

- how to REVEAL it (which view, what has to be selected, which drawer);
- where it IS (a DOM element marked `data-callout`, or for Blockly and the
  canvas, a function that answers a rectangle);
- what it is CALLED and where, in words, for the announcement.

Every `UnlockTarget` maps to a name by rule (`affordance: map-scripts` is
`map.script`; `block: x` is `toolbox.block:x`), which is what lets C, D and
E be derived from the catalogue with no per-lesson authoring.

It also answers a gap the pilot recorded: nothing ties a lesson's words to
the editor's labels. With the registry, a test can assert that every
`#clickable=` id in every lesson resolves, and a lesson can take a
control's label FROM the registry, so a renamed button renames its
mentions.

## After weighing them

Revisions made when the options were looked at a second time, before any
was built:

- **The handler's way in is one prop in one file.** The base
  `ResourcePanel` already takes `onInstructionsTextClick` and hands it to
  `Instructions`; only codebridge's `InfoPanel` does not pass it on.
- **B is simpler than written above.** A positioned overlay has to follow
  scrolling, the panel resizers and every layout change. An outline set by
  an attribute on the target costs nothing and nothing here clips its
  targets. The overlay waits until clipping is seen.
- **A's cost is the revealing**, not the link: getting the target on
  screen can change state (a view, a selection). A reveal never leaves a
  script a learner has open; when the target cannot be shown, the words
  are said and nothing else happens.
- **E ranked too high.** It repeats D and the lesson's own text, and a
  tile's `offers` are often a list of small blocks.
- **C is the most work for the least certain gain.** "Used" is unclear for
  a drawer or a shelf row.
- **F is not needed.** Its one use was the Map and World tabs, which the
  first lesson says in a sentence that A can make a pointer.

## Recommendation (as first written)

1. The registry, the ring, and Show me in instructions (A, B). This is the
   pilot's missing half, and everything else stands on the registry.
2. What a lesson gave you, and what is new here (D, E), derived from the
   catalogue.
3. "New" until used (C), DOM controls first and the toolbox after.
4. One coach mark for Map and World on first run (F), if watching learners
   says the two tabs are missed.

No tour and no legacy callouts.

## Open

- **Where the handler enters.** `InfoPanel` is codebridge's and shared.
  Passing `onInstructionsTextClick` through it is a small change to a
  package other labs use; rendering World Lab's own instructions panel
  avoids that and duplicates a layout.
- **Blockly.** The toolbox and flyout are Blockly's, not the lab's own
  markup, so a ring or a "new" mark there goes through Blockly: a toolbox
  category's style, a label in the flyout. The workspace itself IS
  reachable: this lab is on Blockly 13, whose keyboard navigation is built
  in and whose workspace exposes an accessibility tree, blocks as named
  nodes (`accessibility/blockly.md`). So pointing at a block should be
  more than visual. "Show me" can open the drawer and put Blockly's own
  cursor on the block, which is focus a screen reader follows, and the
  announcement names the drawer. What has to be found out is whether a
  FLYOUT block can be given that cursor from outside, and what Blockly
  reads for it. An earlier draft of this said Blockly has no screen reader
  support. That was wrong, and was a summary repeated without reading the
  file it cited.
- **How long a ring stays** when the learner does nothing. Until used, or
  until the next one, is the proposal. A ring left up for an hour is
  noise; a ring that leaves on a timer is a WCAG question.
- **Whether "new" counts a thing lent** by a lesson's `offers`, which goes
  away again when the lesson is left unfinished.
