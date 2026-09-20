# Plan: screens, and a way back (APPS.md, missing thing 5)

STATUS: PROPOSED. What turns the Interface Kit from one screen into an
app. The working record, as the other plans are.

## What a screen already is

- **A screen is a map**, and the lab has had them all along. `load map
⟨…⟩` ADDS one over what is there — the comment on the block says so, and
  the stock pause menu is exactly that: a panel, a title and two buttons,
  coming up over a game that is still underneath.
- **A map loaded twice is two loads.** `MapLoad` closes over the actors
  one loading placed, so a pause menu's Resume closes its own menu and not
  the other one's, and a space keeps its loads oldest first.
- **`unload this map` takes one back**, from inside that map's own script,
  through the binding the script is given.
- **A map can say what happened to it**: `when this map unloads` is a hat
  a map's own script can carry.

So the stack is already there in everything but name: loading pushes, and
each load knows how to take itself back.

## What is missing, and it is one thing

**Nothing can close the screen on top from outside it.** `unload this map`
needs the binding only a map's own script has, so a Back button on the
screen BELOW, or a rule managing screens, has no way to say it. That is
precisely what "back" is.

A second, smaller thing sits behind it: **a load that unloads does not
take itself off its space's list.** Nothing has noticed, because the only
other reader splices the whole list and unloading twice is harmless. It
matters the moment anything asks which load is on top, which is what a
stack does.

## What is being built

- **`unload the newest map`**, a block that closes the topmost load of the
  world's own space. One block, over machinery that exists.
- **A load deregisters itself**, so "the newest" is the newest and not the
  newest thing that has already gone.
- **A `Screens` stock rule**, ability `Shows Screens`:
  - **`screens`**, a world list of the map paths showing, deepest first —
    the stack, made of the list vocabulary that already exists.
  - **`go to screen ⟨map⟩`** — load it, and remember it.
  - **`go back`** — close the newest, and forget it.
  - **`replace the screen with ⟨map⟩`** — go back, then go to.
  - **`the screen showing`** — the last of the list.
  - **`a screen opens ⟨name⟩` and `a screen closes ⟨name⟩`**, world
    events carrying which.
- **A second screen in the Interface Kit**, and a way to and from it, so
  the template is an app rather than a screen. This is the apps spec's
  "one cheap thing worth doing first", finished rather than begun.

## Decisions taken before building

- **The stack is a list of PATHS, not of loads.** A load is a runtime
  object with no name, and a project wants to ask "which screen is
  showing" and get something it can compare and print. The load is the
  engine's business and the path is the project's.
- **Back closes the NEWEST, not a named one.** A stack has one end that
  moves. Closing a named screen from the middle is a different idea, and a
  list of paths cannot even say which of two loads of one map it meant.
- **Go to does not unload what is under it.** That is what makes it a
  stack rather than a channel, and it is already what `load map` does — a
  menu over a game leaves the game there.
- **No transitions.** A screen appears and is there. Sliding one in is a
  tween over a whole map's actors, which is its own piece of work and
  wants the anchoring question answered first.

## Order of work

1. This plan.
2. The engine: a load deregisters, and the world closes its newest. Tests.
3. The block. Tests.
4. The `Screens` rule. Tests.
5. The Interface Kit's second screen.
6. The shelf: library entry, demo, tile.
7. Specs: APPS.md's fifth thing, and this record.

## Commits

## Learned while building

## Not built, and known

## What to look at in the browser
