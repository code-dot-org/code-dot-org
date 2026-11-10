# Keyboard and mouse state

The library turns raw keyboard and mouse events into per-frame _edge
states_: whether a key or button went down this frame, is held, went up
this frame, or is up. Events arrive at any time; the edge states change
only once per frame, at the start of the pre phase (LIF-), and are then
constant for the rest of that frame. A key or button is tracked only
after the program first asks about it.

Sprite Lab asks, once per frame from its event loop, `keyWentDown` and
`keyDown` with the names of its key dropdown, `mouseWentDown` for the
left button, `mouseWentUp` with no argument, and `mouseIsOver` and
`mousePressedOver` for sprites. The hit test itself is in `collision.md`
(COL-); the camera's part in it is in `camera.md` (CAM-15).

## Raw key state

INP-1. The library keeps a _down set_ of numeric key codes. It listens
on `window` for `keydown`, `keyup` and `blur` events for the life of the
p5 instance.

INP-2. On `keydown`, the event's legacy numeric code is added to the
down set. The code is the event's `which` value. If the code is already
in the set, the event is ignored (auto-repeat has no effect).

INP-3. On `keyup`, the event's `which` is removed from the down set,
whether or not it was in it.

INP-4. On `blur` of the window, the down set is emptied.

INP-5. When the p5 instance is created, its down set is empty; Code.org
also empties it explicitly at that point. A key physically held across
the creation is up until its next `keydown`, which for a held key is
typically the next auto-repeat event. Classic Sprite Lab creates a new
instance for every run; Sprite Lab 2 reuses one instance across reruns
and scene jumps (INP-18).

INP-6. Only `which` is read. Events do not need to be trusted: an
event constructed by script and dispatched on `window` has the same
effect as a real one. Sprite Lab 2's on-screen buttons dispatch
`new KeyboardEvent(type, {keyCode, which, key, code, bubbles: true})`
with `keyCode` and `which` both 37, 38, 39 or 40. A host that presses a
key without a DOM event calls the instance's `pressKey(code)` and
`releaseKey(code)`, which change the down set exactly as a `keydown` and
a `keyup` with that `which` would. (The fork's mobile controls called
p5's key handlers directly with an object whose `which` is the code;
those handlers are p5's private methods, and the library does not touch
them. CMP-45.)

INP-7. The library's own down set must be per p5 instance: two
instances on a page each see every window event, and creating one must
not clear the other's set. (The fork keeps one set for all
instances, and creating an instance clears it; Sprite Lab runs one at a
time, so this is not observable there. CMP-42.)

## Key names

INP-8. A key is named by a number, which is taken as the key code, or by
a string, which is looked up in the alias table below after conversion
to upper case (so `'space'`, `'Space'` and `'SPACE'` agree). A string
not in the table names no key; so does a numeric string such as `'37'`.
A single digit string names the digit key: `'8'` is code 56, not 8.

INP-9. Two deprecated strings are accepted: `MINUT` for `MINUS` (109)
and `COMA` for `COMMA` (188). Each use prints the warning
`Key literal "<ALIAS>" is deprecated and may be removed in a future version of p5.play. Please use "<NEW>" instead.`
with the upper-cased alias.

INP-10. The alias table (upper-case keys):

| Alias                      | Code       |
| -------------------------- | ---------- |
| `BACKSPACE`                | 8          |
| `TAB`                      | 9          |
| `ENTER`                    | 13         |
| `SHIFT`                    | 16         |
| `CTRL`                     | 17         |
| `ALT`                      | 18         |
| `PAUSE`                    | 19         |
| `CAPS_LOCK`                | 20         |
| `ESC`                      | 27         |
| `SPACE`, `' '` (one space) | 32         |
| `PAGE_UP`                  | 33         |
| `PAGE_DOWN`                | 34         |
| `END`                      | 35         |
| `HOME`                     | 36         |
| `LEFT_ARROW`, `LEFT`       | 37         |
| `UP_ARROW`, `UP`           | 38         |
| `RIGHT_ARROW`, `RIGHT`     | 39         |
| `DOWN_ARROW`, `DOWN`       | 40         |
| `INSERT`                   | 45         |
| `DELETE`                   | 46         |
| `0` .. `9`                 | 48 .. 57   |
| `A` .. `Z`                 | 65 .. 90   |
| `0NUMPAD` .. `9NUMPAD`     | 96 .. 105  |
| `MULTIPLY`                 | 106        |
| `PLUS`                     | 107        |
| `MINUS`                    | 109        |
| `DOT`                      | 110        |
| `SLASH1`                   | 111        |
| `F1` .. `F12`              | 112 .. 123 |
| `EQUAL`                    | 187        |
| `COMMA`                    | 188        |
| `SLASH`                    | 191        |
| `BACKSLASH`                | 220        |

Ranges are consecutive: `B` is 66, `5NUMPAD` is 101, `F10` is 121.

INP-11. Sprite Lab's key dropdown offers `up`, `down`, `left`, `right`,
`space` and `a` through `z`; Sprite Lab 2's generated code also uses
`up` and `space`. These must resolve as the table says.

INP-12. All names of one code share one tracked state: `'left'`,
`'LEFT_ARROW'` and 37 are the same key.

## Key edge states

INP-13. Each tracked key is in one of four states: UP, WENT_DOWN, DOWN,
WENT_UP.

INP-14. `keyWentDown(k)`, `keyDown(k)` and `keyWentUp(k)` resolve _k_ to
a code (INP-8) and return true exactly when its state is WENT_DOWN, DOWN
and WENT_UP respectively. If the code is not yet tracked, it becomes
tracked first, in state DOWN if the code is in the down set at that
moment and UP otherwise. A name that resolves to no code is tracked as a
single "no key" entry that is always UP.

INP-15. At the start of every pre phase, before sprites update (LIF-),
each tracked key's state is recomputed from the down set:

| Previous state           | Code in down set | New state |
| ------------------------ | ---------------- | --------- |
| UP                       | yes              | WENT_DOWN |
| WENT_DOWN, DOWN, WENT_UP | yes              | DOWN      |
| DOWN                     | no               | WENT_UP   |
| UP, WENT_DOWN, WENT_UP   | no               | UP        |

INP-16. Nothing else changes a tracked state. Queries within a frame
therefore agree with each other however many times they are made, and
events arriving during a frame take effect only at the next pre phase.

INP-17. Consequences, all observable in Sprite Lab:

- a press is reported by `keyWentDown` in exactly one frame, the first
  frame whose pre phase sees the key down;
- `keyDown` is false in that frame and true from the next frame for as
  long as the key stays down; a "while key pressed" event therefore
  starts one frame after the matching "when key pressed" event;
- a key held for exactly one pre phase goes WENT_DOWN then UP: it is
  never DOWN and never WENT_UP;
- a press and release both between two pre phases are not seen at all;
- a release and re-press both between two pre phases are not seen: the
  key stays DOWN;
- a key already down when first queried is DOWN, so that press never
  produces `keyWentDown`.

Example: `'left'` is first queried in frame 1 with no key down. The
keydown for 37 arrives during frame 1. Frame 2: `keyWentDown('left')`
true, `keyDown('left')` false. Frame 3: `keyWentDown` false, `keyDown`
true. The keyup arrives during frame 3. Frame 4: `keyWentUp('left')`
true. Frame 5: all three false.

INP-18. Tracked states belong to the p5 instance and persist until it is
destroyed. Sprite Lab 2 reuses one instance across reruns and scene
jumps, so both the tracked states and the down set carry over from one
run to the next.

## Raw mouse state

INP-29. The library keeps its own _pointer state_ for each instance: a
position in canvas pixels, a pressed flag, the name of the pressed
button, and a touch flag. In these specifications `mouseX`, `mouseY`,
`mouseIsPressed`, `mouseButton` and `touchIsDown` name that state, not
the p5 instance's fields of the same names. The library neither reads
nor writes p5's fields, which hold whatever p5 puts in them. The fork
kept this state in p5's own fields. Upstream p5 2.x cannot: its handlers
listen on the whole window, counting presses and moves outside the
canvas, and it converts positions without regard to CSS transforms, so
its fields cannot hold the values INP-19..INP-21 require. The pointer
state starts at position (0, 0), not pressed, button `'left'`, not
touched. (CMP-46.)

INP-19. The mouse position `mouseX`, `mouseY` is in canvas pixels. For a
mouse event with client coordinates (_cx_, _cy_), let _r_ be the
canvas's bounding client rectangle and _ow_, _oh_ its layout width and
height (`offsetWidth`, `offsetHeight`). The event is _inside_ when
0 <= _cx_ - _r_.left < _r_.width and 0 <= _cy_ - _r_.top < _r_.height.
An inside event sets `mouseX` = (_cx_ - _r_.left) _ow_ / _r_.width and
`mouseY` likewise, not rounded. An outside event leaves them unchanged.
This corrects for CSS scaling of the canvas, CSS transforms included. The
canvas is the one the instance's `createCanvas` last made. (The fork
rounds both to whole pixels. CMP-43.)

INP-20. A `mousedown` on `window` that is inside sets the pressed flag
`mouseIsPressed` and the button `mouseButton`: `'center'` if the event's
`button` is 1, `'right'` if 2, `'left'` otherwise. An outside `mousedown`
is ignored entirely. A `mouseup` anywhere on `window` clears
`mouseIsPressed`; it does not change `mouseButton`. A `blur` of the
window also clears `mouseIsPressed`, as upstream p5 does. A `mousemove`
updates the position only. (The fork keeps the pressed flag across a
blur. CMP-44.)

INP-21. A `touchstart` with at least one touch inside the canvas sets the
touch flag `touchIsDown` and moves `mouseX`, `mouseY` to the first
inside touch. `touchend` clears `touchIsDown` when no inside touches
remain.

INP-22. The _button-pressed_ predicate for button _b_ is true when
`mouseIsPressed` and `mouseButton` equals _b_, or when `touchIsDown` and
_b_ is `'left'`.

## Mouse edge states

INP-23. Buttons are named `'left'`, `'right'`, `'center'` (the values of
p5's `LEFT`, `RIGHT`, `CENTER`), or by the strings `'leftButton'`,
`'rightButton'`, `'centerButton'`, which map to them. An omitted argument
means `'left'`. Any other value is used as given and, matching no
`mouseButton`, is only ever pressed by nothing.

INP-24. `mouseWentDown(b)`, `mouseDown(b)`, `mouseWentUp(b)` and
`mouseUp(b)` are true when button _b_'s state is WENT_DOWN, DOWN,
WENT_UP and UP respectively. Tracking starts on first query exactly as
INP-14, using the button-pressed predicate for the initial state, and
each pre phase recomputes every tracked button by the table of INP-15,
using the predicate in place of the down set. INP-16 and INP-17 apply
to buttons as written.

INP-25. `mouseWentDown()`, `mouseWentDown('left')` and
`mouseWentDown('leftButton')` are the same tracked button.

## Pointer over a sprite

INP-26. `mouseIsOver(sprite)` returns false for a missing sprite, and
otherwise whether the point chosen by CAM-15 lies in the sprite's
collider (COL-). It does not consult any button.

INP-27. `mousePressedOver(sprite)` is true when `mouseIsPressed` or
`touchIsDown` is true at the time of the call and `mouseIsOver(sprite)`
is true. It uses the raw flags, not edge states, so it is true in the
same frame as `mouseWentDown`, reacts to any button, and would see a
press that arrived after the pre phase if one could.

INP-28. Sprite Lab's "when clicked" event is `mouseWentDown('leftButton')`
and then `mouseIsOver` for each candidate sprite; "while clicked" is
`mousePressedOver`; the draggable behavior starts a drag on
`mousePressedOver(sprite)` together with `mouseWentDown()`, and ends it
on `mouseWentUp()`.

## Test vectors

Marked _fork_ (run on the fork under apps' harness) or _hand_. Each
triple is (`keyDown`, `keyWentDown`, `keyWentUp`); "frame" means one pre
phase followed by the frame's draw.

| Sequence                                                                                        | Result                                                | Src  |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| query `'left'` (frame 1); keydown 37; query same frame                                          | (f, f, f)                                             | fork |
| next frame                                                                                      | (f, t, f)                                             | fork |
| next frame                                                                                      | (t, f, f)                                             | fork |
| keyup 37; next frame                                                                            | (f, f, t)                                             | fork |
| next frame                                                                                      | (f, f, f)                                             | fork |
| tracked, keydown; frame; keyup; frame; frame                                                    | (f, t, f), (f, f, f), (f, f, f)                       | fork |
| tracked, keydown and keyup between frames; frame                                                | (f, f, f)                                             | fork |
| `'right'` held and DOWN; keyup then keydown between frames; frame                               | (t, f, f)                                             | fork |
| keydown 65; two frames; first query `'a'`; again next frame                                     | (t, f, f), (t, f, f)                                  | fork |
| 32 down: `keyDown` of `'space'`, `'SPACE'`, `'Space'`, `' '`, `'spacebar'` (tracked while down) | t, t, t, t, f                                         | fork |
| 109 down: `keyDown('minut')`                                                                    | true, and the INP-9 warning with `MINUT`, `MINUS`     | fork |
| `'left'` tracked, keydown 37, frame: 37, `'37'`, `'LEFT_ARROW'`, `'LEFT'`, `'left'`             | (f,t,f) (f,f,f) (f,t,f) (f,t,f) (f,t,f)               | fork |
| `keyDown('bogus')`                                                                              | false                                                 | fork |
| keydown 38 twice, keyup 38                                                                      | 38 not in down set                                    | fork |
| 40 tracked and DOWN; window blur; frame                                                         | (f, f, t)                                             | fork |
| `'b'` tracked; keydown 66; frame; `keyWentDown` of `'b'`, `'B'`, 66, then `keyDown('b')`        | t, t, t, f                                            | fork |
| `new KeyboardEvent('keydown', {keyCode: 37, which: 37, ...})` on window                         | `which` 37; 37 in down set; matching keyup removes it | fork |
| mobile-control path with code 90                                                                | 90 in down set                                        | fork |
| pre-phase order                                                                                 | input states, then sprite update, then camera         | fork |

Mouse (canvas 400x400 at the page origin, unscaled; quadruple is
(`mouseDown`, `mouseWentDown`, `mouseWentUp`, `mouseUp`) for `'left'`):

| Sequence                                                                               | Result                                                                                                | Src  |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| query (frame 1), no press                                                              | (f, f, f, t)                                                                                          | fork |
| mousedown at client (100, 50), button 0                                                | `mouseX` 100, `mouseY` 50, `mouseButton` `'left'`, pressed; same frame still (f, f, f, t)             | fork |
| next frame: no argument, `'leftButton'`, `'left'`, `LEFT`                              | (f, t, f, f) for each                                                                                 | fork |
| next frame                                                                             | (t, f, f, f)                                                                                          | fork |
| mouseup; next frame                                                                    | (f, f, t, f)                                                                                          | fork |
| next frame                                                                             | (f, f, f, t)                                                                                          | fork |
| mousedown at client (500, 50)                                                          | not pressed, `mouseX` stays 100                                                                       | fork |
| `'rightButton'` tracked; mousedown button 2; frame                                     | right (f, t, f, f); left (f, f, f, t)                                                                 | fork |
| mousedown and mouseup between frames; frame                                            | (f, f, f, t)                                                                                          | fork |
| `touchIsDown` set; frame                                                               | left (f, t, f, f); right (f, f, f, t)                                                                 | fork |
| canvas CSS-scaled to 800x800 client pixels, layout 400; mousedown at client (401, 799) | `mouseX` 200.5, `mouseY` 399.5 (the fork: 201, 400; CMP-43)                                           | hand |
| mousedown inside; window blur                                                          | not pressed (the fork: still pressed; CMP-44)                                                         | hand |
| `pressKey(37)`; two frames; `releaseKey(37)`; frame                                    | `keyWentDown('left')` in the first frame, `keyDown` in the second, `keyWentUp` after release (CMP-45) | hand |

## Not specified

- `keyIsPressed`, `key`, `keyCode`, `keyTyped`, and the user callbacks
  `keyPressed`, `keyReleased`, `mousePressed` and the like; Sprite Lab
  defines none.
- `pmouseX`, `pmouseY`, `mouseDidMove`, `winMouseX`, `winMouseY`,
  `touches`, `touchX`, `touchY`: their update timing belongs to LIF- if
  anything reaches them.
- Sprite mouse callbacks (`onMousePressed` and so on) and `mouseActive`.
- Mouse wheel.

## Open questions

1. INP-17's one-frame press never yields `keyWentUp` (WENT_DOWN goes
   straight to UP). Sprite Lab never asks `keyWentUp`, but the draggable
   behavior asks `mouseWentUp()`: a click held for exactly one pre phase
   starts a drag that never sees its release, so the sprite stays
   attached to the pointer until the next press and release. Students
   may rely on this; preserve.
2. INP-17's release-and-re-press within one frame is lost. At 30 frames
   a second a fast double tap on the on-screen buttons can merge.
   Sprite Lab 2's buttons hold an accessibility "click" for 100 ms and
   two animation frames to avoid the press-and-release case. Preserve.
3. INP-2 reads only `which`. In Chrome a script-made `KeyboardEvent`
   carries the `which` it was given, and Sprite Lab 2 passes it. A
   browser that ignores `which` in the event initialiser would report 0.
   The implementation may fall back to `keyCode` when `which` is 0; no
   alias names code 0, so this changes nothing a program can see.
4. In Sprite Lab 2 a key held through a rerun or scene jump stays DOWN
   into the next run (INP-18), so the new run's "when pressed" events do
   not fire for it; in classic Sprite Lab the new instance starts with
   the key up. Preserve each.
5. Classic Sprite Lab's mouse edge states are sampled with the same
   delay: a click's `mouseWentDown` is true in the frame after the
   `mousedown` event, while `mousePressedOver` is true from the event
   itself if something asks mid-frame. Nothing does today.
