# Paste, across tabs

What it takes for a block copied in one file's tab to be pasted into
another's — which does nothing today — and what has to be true of the block
once it lands.

## Why it does nothing today

Two facts, one on each side of the seam.

**The lab shows one workspace at a time.** Codebridge mounts the custom editor
for the active file, keyed by that file's id (`codebridge/editor/CodeEditor`).
Switching tabs unmounts the Blockly editor and mounts a new one, and the
unmounted editor's workspace is disposed with it. There is no workspace for
the other tab while this one is open.

**Blockly pastes into the workspace a block was copied from.** Copy records
three things at module level — the copied data, the workspace it came from,
and where on that workspace it was (`clipboard.setLastCopiedData`, `…Workspace`,
`…Location`). The paste shortcut reads the copied-from workspace back, and its
precondition refuses unless that workspace is still `rendered`; on refusal it
plays the error beep. After a tab switch that workspace is disposed, so
Cmd+V beeps and pastes nothing, in the tab it was copied from as well as the
new one.

The data itself survives the switch. It is module state, not workspace state,
so the block is still on the clipboard; it is only the destination that Blockly
gets wrong for us. `clipboard.paste(data, workspace, coordinate)` takes an
explicit workspace and pastes there. The shortcut simply never passes one.

## What is on the clipboard

A `BlockCopyData`: the block's serialized state, with coordinates, WITHOUT the
blocks chained after it (a copy is the block and what is plugged into it, not
the rest of its stack), plus a count of block types for the capacity check.

Three things about that state matter for a paste that lands in another file:

- **Ids are kept, unless taken.** A block is created with the id it was saved
  with if the destination has no block by that id, and a fresh one otherwise
  (`Block`'s constructor). So a `define tween` pasted along with the `play
tween` that names it by id keeps the pair intact, and a paste into the same
  file gets fresh ids as it always did.
- **Variables come with the block.** Blockly's serializer does full
  serialization by default, so a variable field carries `{id, name, type}` and
  not the id alone, and loading one calls `getOrCreateVariablePackage` on the
  destination workspace: a variable it has not got is created. `add actor …
as ⟨shot⟩` pasted into a file that never declared `shot` therefore declares
  it — which is the case `patch.withVariable` exists to handle for the
  enhancement rows, and which the paste path handles by itself. Pinned by a
  test rather than trusted, since a typed variable field of the lab's own
  (`variables_get_Actor`, `fields/scopedVariableField`) may serialize its own
  way.
- **References are by name, not by file.** A block type minted for an own
  member carries the declaring file — `world_get_ActorsHero_IdProperty` — and
  pasted into `player.actor` it still reads the Hero's property, imported from
  the Hero's module and asked of `this actor`, which has not got it. It
  compiles, it runs, and it reads nothing. That is the same thing that happens
  when a rule is deleted from under a `use trait`, and the same answer applies:
  the block is what the learner pasted, and a warning is better than a rewrite.

## The design

Three pieces, in the order they are worth doing.

### 1. A paste shortcut of the lab's own

Replace Blockly's `paste` shortcut with one that pastes into the workspace on
screen. Blockly keeps a main workspace — set when one is injected and when one
takes focus (`common.setMainWorkspace`, read by `Blockly.getMainWorkspace()`)
— and with one editor mounted at a time that is exactly the destination we
mean.

    precondition:  there is copied data; the main workspace exists, is
                   rendered, is not read-only and is not mid-drag; no
                   ephemeral focus (a field editor, a dropdown) has the keys
    callback:      clipboard.paste(data, mainWorkspace, where)

`where` is the pointer, for a paste from a context menu; else the copied
location if it lies within the destination's view, which it will for a paste
back into the same file; else the middle of the view. That is Blockly's own
rule with the workspace swapped, and it is worth keeping because the same
shortcut serves the same-file paste too.

Registered once, at module load, beside the other things the editor
registers on Blockly's global registries (`ShortcutRegistry.registry`,
unregister `paste` then register ours). The copy and cut shortcuts are
untouched: they record the right data, and a cut is a copy followed by a
delete, so cut-then-paste across tabs works the moment paste does.

**What this does not do:** keep the other tab's workspace alive. Codebridge
could mount every open file's editor and hide all but one, which would also
make tab switches instant, but it multiplies Blockly's memory by the tab
count and it is a Codebridge change for a problem that a shortcut fixes.
Nor does it replace Blockly's block paster: the paster is right, it is the
choice of workspace that was not ours.

### 2. A misplaced block is an orphan

A paste that lands in the wrong kind of file has to say so, on the block,
rather than compile to nothing or to a module that throws. The lab already
does this for one shape of mistake: `DisableOrphansPlugin` disables any
top-level block that has a previous connection, with a reason, and a disabled
block generates nothing. This is the same plugin for a second shape — a block
that is a root in the right sense but cannot mean anything here — and the
reading is the same: it is an orphan, even though it is a top block, because
nothing in this file can hold it.

On block creation (which a paste raises, and so does a load), ask:

- **Is it a definition with a home elsewhere?** `ROOT_HOMES` says which kinds
  of file may hold `define actor`, `define world`, `define rule` and the rest.
  A `define actor` in a world is disabled with "This belongs in an actor
  file", and copying it into the actor's tab is what the words invite.
- **Is it offered to this kind of file at all?** The palette is built per file
  kind (`buildDomainPalette(…, {fileKind})`) and its toolbox is the set of
  what may be placed. A row that is in no drawer here — a trait step in a
  world, `use rule` in a world — is disabled with "Not something a world
  does". The generator already writes nothing for these; the difference is
  that the learner is told.
- **Is it a hat about `this actor` in a world?** An actor file's hat is about
  the actor whose file it is, and its subject socket says `this actor`. Pasted
  into a world that reads as a hat about nobody: the subject compiles to
  `actor`, which a world module never binds, and the module throws as it
  loads. Disabled with "Say which kind this is about" — and the fix is the
  socket, not the tab, since a world hat about `any ⟨Hero⟩` is a fine thing to
  paste.

The defining roots are the one case where being disabled is not yet enough.
The generator refuses a `define actor` in a world by reading the workspace's
top block types (`fileKind.moduleShape`), and a disabled one is still a top
block. So the generator's scan skips disabled blocks — which is what the
orphan plugin already implies for the orphans it disables, and is one filter
in `BlocklyGenerator`. A disabled definition then costs nothing but a grey
block with a reason on it, and the project runs.

### 3. What the pasted block means, where the file decides

Some blocks are legal in both files and mean different things in each, and a
paste carries the block, not the meaning.

- A hat's subject. In an actor file the socket defaults to `this actor`; in a
  world, to `any ⟨kind⟩` (`actorInput`). A pasted hat keeps whichever it had.
  Actor-to-world is the orphan case above. World-to-actor — `when any ⟨Coin⟩
is collected` pasted into `player.actor` — is legal and means what it says,
  a hat in the Player's file about Coins, and it is left alone.
- A row under `define actor`. Pasted as a root it is an orphan already (it has
  a previous connection). Pasted onto the chain it is that actor's row, which
  is the intended case.
- An own-member block keyed to the file it came from, as above: left alone,
  with `standInBlocks`' warning if the file it names is not in the project.

None of these need code beyond piece 2. They are listed because each is a
question a test should answer once, so the answers do not drift.

## Tests

- **The shortcut**, with two workspaces: copy in the first, dispose it, paste
  in the second, and the block is in the second. Then the same without
  disposing, to show the same-file paste still lands where it was copied from.
  Blockly's shortcut registry can be driven without a browser; the wrapper's
  keyboard-navigation browser test is the model if a real keypress is wanted.
- **Variables travel.** `add actor … as ⟨shot⟩` copied from a file that
  declares `shot` and pasted into one that does not: the destination declares
  it, with the name and type, and the block's field resolves. Once with
  Blockly's own variable field and once with the lab's typed one.
- **Ids.** A `define tween` and its `play tween` pasted together keep the
  reference; pasted into a file that already holds that id, the tween gets a
  fresh one and the reference follows it or is reported.
- **The orphan reasons.** For each of the three questions in piece 2, a
  workspace of the wrong kind, a created block, and the reason on it; and for
  the defining root, a project that still compiles with the block disabled.
- **The palette guard already covers piece 3's block types**, since every
  block a paste can carry is one the palette minted.

## Order of work

1. The shortcut (piece 1). Small, and it is the feature.
2. The generator skipping disabled top blocks. One filter, needed before 3.
3. The orphan plugin's second shape (piece 2), with its three reasons.
4. The tests above, the variable one first because it is the one that could
   say no to the whole design.

A context-menu "Paste" on the workspace is not in the list. Blockly's
workspace menu has none, the keyboard is how every other editor pastes, and a
learner on a touch screen is a question for the whole lab rather than this
one.
