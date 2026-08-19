# Sound

## The problem

The lab draws, animates, shades and simulates, and it cannot make a noise. A
coin is collected in silence; a player lands in silence. Of everything missing
from the vocabulary this is the widest gap between what the lab does and what a
learner expects a game to do, and it is the smallest new idea on the list.

It is also the first thing the engine has to say **happened**. Everything that
crosses the engine boundary today is state read once a frame: the driver calls
`tick(delta)` and then `renderSnapshot`, `backdropSnapshot`, `layerSnapshot`,
`cameraSnapshot`. `world_log` is not a counter-example — it emits a bare
`console.log` and rides the ambient console, which the engine (DOM-free by
design) never sees.

## Two things, not one

`play sound ⟨pop⟩` is a MOMENT. Music is STATE — "this world plays this track" —
and the two want opposite mechanisms, in the same way an `add effect` and a
`set background` do.

Sprite Lab's own library agrees before we do: `loops`, `music` and `background`
sit in its category list beside `pop`, `jump` and `collect`. Nobody writes
`play sound ⟨theme⟩` sixty times a second, and nobody wants a coin's `pop` to
survive a hot reload.

So: two blocks, two mechanisms, and only the second one is in the snapshot.

### A moment leaves the engine on a queue

`world.playSound(name)` appends to a per-tick list; the driver drains it after
`tick()` and plays what it finds. Symmetric with `setInput`, which is how the
keyboard gets IN, and it needs no callback — the engine stays a function of its
inputs, and a test can assert on what a tick queued without a stub.

**NOT in `WorldSnapshot`, and the reason is worth stating precisely**, because
this project has just been bitten by something wrongly left out of it. An
actor's traits belonged there: they are state the running actors hold, and a
patch cannot install one, so the reconciler had to see them to know to restart.
A sound is the opposite — it already happened. In the baseline it would be
compared, found different, and replayed.

**Building a world drops its queue.** `reconcile` makes its `incoming` world by
running the module top-level, and the thumbnail manifest builds throwaway worlds
per picker refresh. A `play sound` in a world's setup body — legal, if odd —
would queue in worlds nobody drains. Dropping is right and is stated here rather
than left to be discovered.

One edge, recorded rather than guarded: `WorldBuilder.requireNoActors` discards
a built world when a declaration arrives late and nothing has been placed yet,
so a `play sound` followed in the same setup body by a `use animations` would
queue into a world that is then thrown away. No block can express that — the
generator emits every declaration in the world block's prologue and hoists the
layers — and the fix if it ever can is a pending list on the builder that
`getWorld` flushes. A second queue for an unreachable case is not worth it yet.

### Music is state, and patches like a backdrop

`world.setMusic(name)` sets it; the snapshot carries it; the reconciler patches
it in place beside `setBackground`. Changing the track while the game runs
changes the track, exactly as changing the sky changes the sky. Setting it to
nothing stops it. A restart restarts it.

## A sound is a project file

`sounds/jump.mp3` — a file with a `url`, like every image. That is not a
convenience, it is what makes almost all of this free:

- `projectFiles` and the file tree carry it already;
- `projectAssets` already inlines EVERY file with a `url` as a `data:` URL and
  hands the map to the driver — it never filtered to images, so a sound arrives
  in `projectAssets` with no change at all;
- Phaser's loader takes a `data:` URL for `load.audio` exactly as it does for
  `load.image`;
- the dropdown-plus-`(import…)`-row pattern is what `set sprite` and
  `set background` already are.

**One thing to fix before it can bite.** `SANDBOX.md` specifies
`img-src 'self' blob: data:` for the preview surface and no `media-src`. The CSP
is a design intent today — no surface applies it — so sound is not blocked now,
and the day it is applied without `media-src 'self' blob: data:` every sound in
every project stops. It is one line, and it belongs in the spec that states the
policy rather than in the commit that discovers it.

## The shelf

Sprite Lab's library is 1598 sounds in 37 categories behind a 2.2MB manifest,
served from `/api/v1/sound-library/<category>/<name>.mp3`. The backdrop shelf,
by comparison, is 29 files.

**A curated subset, vendored, exactly as the backdrops are.** `sounds.txt`
carries the URLs, `scripts/write-stock-sounds.mjs` turns it into a generated id
list in the bundle, `yarn setup:world` fetches the bytes into `public/sounds/`,
and a base URL (`setSoundBaseUrl`, beside `setBackgroundBaseUrl`) says where
they are served from. Nothing here is a new idea; it is `BACKGROUNDS.md` §7 with
a different extension.

Vendoring all 1598 is not on the table, and pointing the demo at the studio API
is not either: the standalone demo works with no code.org origin, which is the
whole reason `yarn setup:world` exists.

**Flat, not categorised.** The category tree exists in Sprite Lab because 1598
sounds cannot be a list; forty can. `BackgroundLibraryDialog` is a flat grid for
the same reason, and two library dialogs that browse differently would be two
things to learn. The categories are in the upstream manifest and are not being
thrown away — if the full library is ever wired to the studio API, the tree
comes with it.

**With a play button, which the backdrops did not need.** A backdrop tile IS its
own preview; a sound tile cannot be. One player, one sound at a time, stopped
when the dialog closes and when a choice is made — which is what Sprite Lab's
`stopAllAudio` does at the same two moments.

Select-then-confirm, like the backdrop shelf, and for a sharper version of that
dialog's reason: "a click that imported would make browsing the shelf expensive"
is true of pictures and truer of sounds, where browsing means listening.

## Uploading one, and a cap

A learner's own sound is an upload like any other (`UPLOADS.md`), and it is
capped at **2MB**.

There is no size cap anywhere in this lab today — not for images, not for
anything — so this is new policy rather than a number copied from somewhere. It
is written as one shared constant at the point bytes enter, so that capping the
other upload paths later is a change of caller and not a second policy. 2MB is
roughly two minutes of ordinary mp3: generous for anything one-shot, enough for
a loop, and short of the point where a project stops loading.

## What is deliberately not taken from Sprite Lab

`SoundPicker.jsx` is a studio component and most of what it carries is studio's:

- the `files`/`sounds` MODE TOGGLE and `AssetManager` — this lab's project files
  are the file tree, and a modal file manager beside it would be a second answer
  to a question already answered;
- the RECORDING flow (`RecordingFileType`, `recorders`) — a real feature and a
  separate one;
- `showUnderageWarning`, `useFilesApi`, `libraryOnly` — flags about a session
  and a backend that this lab does not have;
- the `Sounds` SINGLETON, a global audio manager — the dialog owns one player
  and stops it, the way the dialogs here already own and stop what they start.

What is taken is the shape a learner recognises: browse, search, select,
preview, choose.

## The blocks

```
play sound ⟨pop ▾⟩            a moment
set music to ⟨theme ▾⟩        state; `(none)` stops it
```

Both dropdowns list the project's own sounds and carry the `(import…)` row, the
same as `set sprite`. Volume, pitch and per-actor panning are NOT in the first
pass: none of them is expressible as an obvious sentence yet, and a knob nobody
asked for is a knob to keep working.

`play sound` takes no subject. A sound has no position in this lab — there is no
listener, so there is nothing for a position to mean — and a block that took an
actor would be promising panning it does not do.

## Plan

1. ✅ **The engine's half.** `World.playSound` and its per-tick queue with a
   drain the driver calls; `World.setMusic` and its snapshot entry.
   `WorldBuilder.playSound` is the one method here that is NOT deferred, which
   is what "building a world drops its sounds" comes to; `setMusic` is deferred
   and collapsed, like `set`.
2. ✅ **The reconciler.** Music joins the patched values beside the backdrop —
   its own `musicChanged` flag rather than folded into `backdropChanged`, which
   is about what is DRAWN — and `setMusic` is written unconditionally with the
   rest, since setting the track it already has is what "nothing changed"
   sounds like.
3. ✅ **The driver.** The DECISION is `runtime/driver/sound.ts` — one-shots
   always, a track only when it changes — behind a port, so it tests without an
   AudioContext, as `reconcile` and `backdropPlacement` do without a renderer.
   `PhaserBinding` implements the port, preloads sounds through `load.audio`
   (told from sprites by `sound/soundFiles`, since both are bytes on a `url`),
   drains after `tick`, and stops the track before the game goes.

   `audio: {noAudio: true}` is gone — it was right while nothing made a noise.

   BROWSER-VERIFIED for `play sound`: it plays. The worry was Phaser's WebAudio
   manager, which starts locked until its own document sees a gesture — and the
   preview is an iframe, so sticky activation does not reach it from the editor.
   Phaser's own unlock listeners appear to be enough in practice. `set music to`
   has not been reported on yet.

4. ✅ **The shelf.** 39 sounds — the vocabulary a first game reaches for, plus
   four loops for `set music to` — in `sounds.txt`, which carries `name<TAB>url`
   rather than the bare URLs `backgrounds.txt` has: upstream names like
   `retro_game_coin_pickup_1` camel-case into a dropdown nobody can read, so the
   shelf names them. `write-stock-sounds.mjs` lists them into the bundle,
   `yarn setup:world` fetches 3.0MB into `public/sounds/`, and
   `setSoundBaseUrl` says where they are served from.

   The import helpers moved out of `appearance/importStock` into
   `projectWrite` on the way. They were private to the appearance library while
   sprites and backdrops were the only shelf; a sound is a third caller, and
   three copies of "find the folder, never overwrite" is three places for the
   rule to drift. `language` became a caller's argument rather than a nested
   ternary that knew about `.sheet` and `.anim` — facts about one library, in a
   helper three of them share.

5. ✅ **The dialog.** `SoundLibraryDialog` in the shape of
   `BackgroundLibraryDialog` — same `Dialog`, same select-then-confirm, same
   `busy`/`error` — differing only where a sound has no picture: a LIST rather
   than a grid of thumbnails, and a play button per row.

   The player is `SoundPreview`, a seam over `Audio` rather than a hook, for the
   reason the driver's `SoundChannel` is a class behind a port: the rule worth
   testing is "playing this stops that", and a shelf where clicking three rows
   plays three overlapping sounds is what happens to anyone browsing quickly.
   It stops at the two moments Sprite Lab's `stopAllAudio` does — when the
   dialog closes, and when a choice is made — but owns one element instead of a
   singleton, because a singleton is a thing to remember to clear.

6. ✅ **The blocks.** `play sound` and `set music to`, a `Sound` category of
   their own in the toolbox, and a SOUND dropdown offering what the project
   holds plus `(import…)`. The two differ in exactly one place — what an empty
   dropdown generates. `play sound` writes nothing (playing silence once is not
   a thing anyone means); `set music to` writes `setMusic(undefined)`, because
   silence is a value a learner does mean, and that is why there is no
   `stop music` block.

   Two things fell out on the way. `projectImagePaths` returned every file with
   a `url` — which was every image until a sound was one too, so a sound turned
   up in the `set sprite` dropdown; it filters by extension now, and
   `projectSoundPaths` is its sibling. And `BlocklyFileEditor` had six copies of
   the same `refreshProjectDropdowns(files, images, sizes)` call, one per
   importer; a fourth argument would have made that a list to keep in step, so
   it is one `refreshFor(source)`.

7. ✅ **The cap.** `CodebridgeConfig.maxUploadBytes`, beside `validMimeTypes`
   and for the reason that one is config: what a project can hold is a fact
   about the project, and a World Lab sound has nothing to say to a Python Lab
   data file about how big is too big. World Lab sets 2MB and adds the audio
   MIME types the file picker filters on.

   Checked BEFORE the upload starts, so an oversized file costs a message and
   not a round trip that fails with a status code — and the message names the
   file, its size and the limit, in one unit, because "too big" with no number
   leaves a learner unable to tell whether to find a shorter sound or a
   different one. The decision is `codebridge/uploadLimit`, pulled out of the
   handler so the wording is testable without a redux shell.

8. ✅ **`SANDBOX.md`.** `media-src 'self' blob: data:` on the preview surface.
   No surface applies the policy yet, so its absence broke nothing — but one
   that started enforcing the list without it would play no sound in any
   project, and the reason would be nowhere near the symptom.
