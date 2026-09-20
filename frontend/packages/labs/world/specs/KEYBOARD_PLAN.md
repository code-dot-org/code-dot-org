# The on-screen keyboard

A phone has no keyboard until something draws one. The Text Input is a field
now (specs/FIELDS_PLAN.md) and it fills the way a field fills — from what was
typed — so an app on a touch screen needs something that types. That is this
plan, and it is the last item on the apps list (specs/APPS.md).

## What it is

A MAP OF BUTTONS. Every piece is already on the shelf: the Button knows it was
clicked, the Panel holds the rows together and is the thing that gets loaded
and unloaded, and a map is how several actors are arranged. Nothing here wants
a new kind of actor, and a `Keyboard` actor would be the wrong shape anyway —
a keyboard is a layout, and a layout is a map.

What the buttons DO is the whole question.

## The false start: reaching into the field

The obvious script for the `a` key is "put an `a` in the field". It is wrong
for one reason: it names the field. A keyboard written that way works for the
Text Input and for nothing else — not the Text Area, not a project's own
handler for `types ⟨character⟩`, not a form with three fields where the
keyboard has to find whichever one has the focus.

Everything that fills with text already listens to the same event. So the
keyboard should not talk to a field at all. It should TYPE, and let what is
listening hear it, exactly as it hears the player's real keyboard.

## Why that did not already work

`World.addTyped` exists — the driver calls it per keystroke — so `type ⟨"a"⟩`
looks like a one-line block over a method that is already there. It is not,
because of when a frame does things. From `World.tick`:

    scheduler.run(...)   // steps, and the Input rule's step is in `sense`
    events.flush(...)    // handlers, and a click handler is one of these
    this.typed = []      // what was typed is drained

A click handler runs AFTER the step that reads what was typed and BEFORE the
drain. A character added there is cleared at the end of the same tick without
ever having been read. The naive block would do nothing at all, silently,
which is the worst kind of nothing.

The same is true of the keys. `press the ⟨backspace⟩ key` from a handler would
have to change the pressed set, and the pressed set is replaced by the driver
before each tick.

## The answer: next frame

What the world types takes effect on the NEXT tick.

    private pendingTyped: string[] = [];   // filled by `type`
    private pendingKeys = new Set<string>(); // filled by `pressKey`

At the top of `tick`, before the steps, whatever is pending is folded into the
frame's input and cleared. The driver's path does not change: it still calls
`addTyped` and `setInput` between frames, and a frame with nothing pending
reads exactly what it read before.

Pending characters go in FRONT of the frame's own. An on-screen key was
pressed a frame ago and a real keystroke arrived since, so that is the order
they happened in.

A pressed key is down for exactly one tick, which is what makes it a
keystroke: the frame it is folded in is a rising edge against the previous
frame's set, and the frame after — with nothing pending — is a falling edge.
The Input rule turns both into events without knowing either came from a
button.

ONE FRAME OF LAG IS THE HONEST ANSWER, not a compromise. A click IS a frame
late; the player pressed the button during the frame the handler runs in, and
the earliest moment anything could read the character is the next one. The
alternative — draining before the steps instead of after — would throw away
the characters the driver added between frames, which is everything the real
keyboard types.

## The second thing that did not work: the key took the focus

A Button takes the focus when it is clicked (`actors/button`, and it is right
to: a button somebody tabbed to and pressed should be the thing the ring is
around). Every key on this keyboard is a Button, so the first tap took the
keyboard away from the field it was meant to fill, and the field stopped
listening before the second letter.

The fix is not in the map, because a map that places a stock actor cannot edit
it. It is a switch on the trait: `takes the keyboard`, true for everybody,
turned off on each key placement. `take the focus` refuses an actor that has
it off, and the Tab route skips one — the same fact read twice. A control the
keyboard cannot come to is not somewhere Tab should stop, and a Tab that
stopped there would call `take the focus`, have it do nothing, and leave the
focus where it was: a hole in the route that swallows it.

Skipping the keys in the tab route is also the right answer on its own terms.
An on-screen keyboard is for a finger. Somebody with a keyboard has a keyboard,
and tabbing through forty keys to reach the next field is not an interface.

## What gets built

Engine:

- `World.type(characters)` — type as if the player had, read next frame.
- `World.pressKey(key)` — press and release, one frame, same terms.

Rule:

- `Tab Navigation`'s `takes the keyboard`, above.

Blocks, both in the World category, because the world is what carries the
keyboard and a project is what calls them:

- `type ⟨"a"⟩`
- `press the ⟨backspace⟩ key`

They are NOT in the Engine drawer. The Engine drawer is for a rule reaching
into the frame boundary (`for each key`, `is key down`); these are for a
project, and a button on a map is the whole audience.

A stock map, `maps/keyboard.map`: a Panel holding four rows of Buttons —
letters, digits, space, backspace and enter — each with a one-block script.
The letter keys `type`; backspace and enter `press the key`, because neither
makes a character and the field handles both as `presses ⟨key⟩`
(`actors/textInput`).

## What it does not do

NO SHIFT, no layout switching, no accents. A shift key is a mode, and a mode
is state the keyboard would have to carry and draw — every letter's caption
changes with it. It is a map a project can edit, so a project that wants
uppercase can add a row; the stock one stays one screen of one alphabet.

NO AUTOMATIC PLACEMENT. It comes up at the bottom of the standard window and
holds on to the bottom edge (specs/ANCHORS_PLAN.md), so a taller window puts
it where a keyboard goes. Whether it is on screen at all is the project's:
`load map ⟨maps/keyboard⟩` when a field is focused, `unload` when it is not.
The field does not summon it, because a field that summoned a keyboard would
summon one on a desktop too.

## What it found, in the end

Both of the engine changes came from a frame's ordering rather than from
anything about keyboards, and neither would have been guessed from the
outside. FIELDS_PLAN priced this as "a stock map and an action, not an engine
change"; the map was right and the price was not. That is the usual shape:
what a feature costs is decided by the seams it crosses, and the two it
crossed were the tick's order and the focus model.

## Obligations

- `STOCK_MAPS` entry, bringing `panel` and `button`.
- `takes the keyboard` on the Tab Navigation shelf row, with the rest of it.
- The two blocks registered, generated, and tested.
- `specs/UI_ACTORS.md` and `specs/APPS.md` record the keyboard as built.
