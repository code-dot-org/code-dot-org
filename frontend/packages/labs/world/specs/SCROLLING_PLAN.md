# Showing more than fits

A Label wraps and a List scrolls rows of WORDS. Neither answers the ordinary
case an app is made of: a settings page longer than the window, a form that
runs off the bottom, a feed, a list whose rows are real actors with a picture
and a button in them (specs/APPS.md).

## The clip decides the design

A mask does nothing in this Phaser — `setMask` is a no-op in WebGL. A clip
comes from a CAMERA, or from an actor's own canvas, which is exactly the
actor's size and clips only what that actor draws, not other actors standing
in it.

So anything that clips OTHER ACTORS is a camera, and the thing in this lab
with a camera of its own is the Viewport. That is not a compromise: a Viewport
is already a window onto a space, the engine already grows that space to the
size of the map loaded into it (`growSpaceToFit`), and `settleSpace` already
clamps its camera into those bounds every tick, for a level's camera. A
scrolling container is those three facts plus a way to say where it is
scrolled to.

## `scroll` is not the camera

The camera holds a MIDDLE, which is right for a level a player walks around
and wrong for a list: "scrolled to 0" has to mean the top, not the middle of
the first screenful. So the Viewport trait grew two properties:

- **`scroll`** — from the top left of the content to the top left of the
  window, in pixels. What a scroll offset means everywhere else.
- **`content`** — how big the thing being scrolled is, read-only, written by
  the engine from the space's bounds. A project needs it for the only two
  questions a scroll view asks: how far is left, and how long is the thumb.

`settleSpace` converts one to the other, clamps, and **writes the clamped
answer back**. That is the part worth keeping: a project that scrolls past the
end reads back where it actually stopped, so a scrollbar drawn from `scroll`
cannot run off its track and "am I at the bottom" is answerable. Nothing has
to remember to clamp, because the thing that already clamped the camera now
owns the number.

A Viewport that FOLLOWS an actor ignores `scroll` — following is what a level
does, scrolling is what a page does, and an actor cannot be doing both.

## The actor

`actors/scrollView` — a Viewport that a finger moves:

- **Dragging subtracts.** A drag carries the content with the finger, so
  pulling up moves the window down the page.
- **The arrows and the page keys move it**, but only while it has the focus.
  A Scroll View nobody has clicked must not eat the arrows from whatever else
  is on the screen.
- **A bar down the right edge** drawn from `scroll` and `content` — the
  engine-settled numbers, so it cannot disagree with where the window is.

IT IS NOT A LIST. It knows nothing about rows, choosing, or what is in it. A
list whose rows are actors is this with a map of rows loaded into it, and the
choosing is that map's business — which is what makes it worth building once
rather than per kind of list.

## What building it cost, and it was all the same mistake

Three separate silent failures, each the same shape: a name that resolves to
nothing, and nothing anywhere says so.

- **A hat naming a rule the project lacks is a stand-in**, which generates
  nothing for itself and leaves what was chained under it at the TOP of the
  module — where it ran `actor.act(…)` with no actor to run it on. The Scroll
  View's `requires` had Gestures, Tab Navigation and Input, and not Mouse.
- **A property block named for the wrong export is a stand-in too**, and that
  one is quieter still: `world_set_Viewport_ScrollProperty` for an export
  called `ViewportScrollProperty` simply did nothing, so dragging and the
  arrows both moved a view that never moved.
- **Electing a trait is not one election.** The Scroll View elected Takes
  Gestures and not Can Be Clicked, so it could be dragged and could not be
  clicked; the click that was supposed to bring it the keyboard never
  happened, and the arrows went on moving whatever had the focus before.

`stockActors.test` did not catch the first or the third, which is worth
knowing: it checks the rules an actor READS through property blocks, and a
`use trait` that elects nothing and a hat naming an absent rule are not that.

## What it does not do

- **No momentum, no rubber band.** A drag stops where it is let go. Both are
  arithmetic over a velocity nobody keeps yet.
- ~~**No wheel.**~~ BUILT. It was true that the lab had never had one; it was
  not true that nothing missed it — the first person to put a Scroll View and
  a List on a screen reached for it immediately. The wheel is its own trait
  (`Can Be Scrolled`) and arrives in pixels, so the handler is one addition to
  the offset the view already keeps (specs/LIST_PLAN.md, "Found in the
  browser").
- **The bar is not draggable.** It says where you are; it is not a Slider. A
  project that wants one can place a Slider and write `scroll` from it, which
  is two blocks and reads better than a second dragging mechanism inside this.
- **No horizontal scrollbar.** `scroll` is a vector and both axes work; only
  the vertical bar is drawn, because a sideways page is rare and a second bar
  is a second thumb to keep honest.
- **Nothing keeps the focus ring inside it.** Tabbing into a Scroll View's
  content will one day want the view to scroll to whatever got the focus, and
  it does not.
- **No easing and no overscroll.** A wheel moves it instantly, and a view
  already at the end gives no sign that the wheel was turned.

## Obligations

- `actors/scrollView` on the shelf and granted by a tile.
- `engine/scrolling.test` for the arithmetic, `scrollViewPlays` for the
  finger and the keys.
- **A FIXTURE THAT PLACES ONE**, which this did not have for months: it was
  on the shelf with five passing tests and had never once been seen running.
  The Interface Kit places one now, showing a settings map taller than its
  window, and `interfaceKitPlays` scrolls it. A headless test says the
  arithmetic is right; it cannot say anybody can see the thing.
