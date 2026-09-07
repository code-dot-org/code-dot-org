# Getting around a project

A World project is nine folders, one level deep, and nothing nests. What a file
IS is decided by where it sits: an image in `backgrounds/` is a backdrop and the
same bytes in `sprites/` are a sprite (BACKGROUNDS.md §5), an `.actor` is
expected in `actors/`, and the dropdowns that offer a file read the folder to
know which list it belongs in.

That makes the folders SEMANTIC, and it makes a file tree the wrong shape for
them twice over. A tree's central affordance is moving a file somewhere else,
and here every such move either means nothing or breaks something. And a tree
spends its room on hierarchy this project does not have — nine rows that never
change, each of which must be opened before it says anything.

## The menus

So the tab bar carries one button per folder (`files/folderMenus`,
`files/FileMenus`), and each opens a menu of that folder:

```
New actor          — where making one from nothing is a thing to want
Import…            — where something stocks that kind
───────────────
Ball            ⋮
Coin            ⋮   the row opens it; the ⋮ deletes it
Player          ⋮
```

**The tabs say the same thing.** A file opened from a menu called "Platform
World" used to become a tab reading `main.world`, which is the one place in the
lab that says a file name rather than a thing's name — and it wore a generic
glyph beside a tree row wearing a globe. Codebridge asks the lab now
(`CodebridgeConfig.fileLabel`, and the tab strip finally reads
`config.fileIcons`), and the lab answers with the same `authoredName` the menus
use. The file name stays as the tab's tooltip: it is still the answer to "which
file is this".

**Rows are named by what the file DECLARES**, not by what it is called.
`player.actor` reads as "Player" — the word on its own blocks, in every
dropdown that offers it, in the map editor — because the file name is where
that lives rather than what it is (`authoredName`). A file that declares
nothing is titled from its own stem, the same fallback every dropdown makes:
`level1.map` is "Level1". A `.sheet` is left out entirely, as it is from the
tree: it belongs to the `.png` of the same name and is not a file to open.

**Rename means the THING.** The row says "Player", so that is what changes —
and the file's stem is made from the new name, the way `New` makes one, so the
two cannot drift apart. What that costs is every reference, since nothing in
this lab records where one lives (`files/renameThing`):

- a MODULE PATH — `actors/player`, on the fields that place an actor, filter an
  event, count a kind, load a map, add an effect — and in every `.map`, which is
  a document rather than a workspace and needs its own pass;
- a FILE NAME — an asset is named by its file, and a spritesheet cell carries
  `#3` on the end of it;
- a BLOCK TYPE — an actor's own properties and blocks are minted from its path,
  so `world_get_ActorsPlayer_IdProperty` becomes `…ActorsHero…` and every saved
  block holding the old one would otherwise be a stand-in that generates
  nothing;
- a RULE's NAME, which is a reference in itself — to its traits, its members and
  the worlds that use it — and already had a rename that carries
  (`blockly/renameRule`).

Prose is left alone: the walk reads fields, and a `log` block saying
"actors/player" is a sentence about the project rather than a reference to it.

**One file does not move.** `worlds/main.world` is the entry BY PATH — without
it the runtime says "No entry file" and nothing runs — so renaming that world
renames the thing and leaves the file where the runtime looks.

The tree still renames a FILE, which is a different act: it leaves the thing
inside called what it was.

**The acts are the tree's acts.** Opening, renaming and deleting go through the
same `useFileOperations` and the same prompts the file browser uses, including
the lab's veto on deleting a rule another rule requires (`rules/deleteGuard`).
Nothing is possible from here that was not possible before; this is a second
reading of one project, not a second file system.

**What a row does not offer says something.** A folder with no `New` is one
where making a file from nothing means nothing: a SOUND is bytes, and an empty
one is silence nobody can draw. A folder with no `Import…` is one nobody
stocks — nothing ships a world or a map to copy in.

Sprites and backdrops were in the first list and are not any more. An empty PNG
is not a starting point for a game and is exactly one for a drawing, which is
what the image editor is for: `New sprite` writes a blank tile and opens it.

**One name, said once.** `New actor` asks for a name — "Health Bar" — and that
name becomes both the file's stem (`healthBar.actor`, the shape every shipped
file has) and the name inside the file: a new Blockly file opens onto its root
already named, a new `.anim` or `.effect` carries the name in its document.
Before, `New` wrote an empty file, the learner typed the name a second time into
a block they had to find first, and until they did the project had an actor
whose only name was a path.

**Clone** is `New` with a head start: it asks what the new thing is called and
copies the old one under that name — REPLACING the name inside rather than
keeping it, since two things called "Player" are two rows nobody can tell apart
and a word every dropdown offers twice. A picture is copied by its URL, which is
where its bytes live.

**A folder the project has not got** still gets a button, and both ways in
work: a shelf makes the folder it writes into, and `New` makes it in the same
write as the file. That took writing the file here rather than through
Codebridge's `newFile`, which takes a folder ID and so can only put a file
somewhere already there — until then a project with no `effects/` could take an
effect from the shelf and could not make one, for a reason nobody could see.

**The name is checked as a NAME.** Codebridge's file-name rule refuses any
extension the lab does not let a learner author, and `.png` is one of those —
you upload or import a picture. But `New sprite` makes one, and the extension
is the menu's rather than the learner's, so the prompt was refusing every name
with a message about endings nobody had typed. What is left of the rule is what
a name has to be: something, and not something already there.

## Two house details, learned the hard way

The buttons are `IconButtonWithTooltip` (`@code-dot-org/lab/components`) and not
a bare MUI `IconButton` with a `Tooltip`: the bubble portals to `<body>`, which
is OUTSIDE the `[data-theme]` element the lab renders inside, so a tooltip that
does not carry the theme itself resolves its color variables against nothing
and draws black text on its own dark bubble. That component stamps the theme it
is handed.

…and the bubble sits at `z-index: 10`, under the Blockly workspace beside these
buttons, so a folder's name appeared behind the blocks. That is not a fact about
these buttons — Blockly's own layers are at 20 to 80 (its toolbox at 70,
measured in this lab), so it is every tooltip in the lab that is at risk, and
the file menus were simply the second place to hit it. So the lift is ONE RULE
(`app.module.css`), matching the portaled bubble by its module's name prefix,
at 1200: above all of Blockly's layers and below `blocklyWidgetDiv` (99999),
which is the field editor a learner is typing into and which a tooltip must
never cover.

Menu rows are `Typography variant="body4"` on a dense list — the size the file
browser's rows and `PopUpButtonOption` use. MUI's default is 16px, which beside
a 13px file tree reads as a different application.

## The tree is gone

It was collapsed and one toggle away, and it is now not there at all. One thing
it could do that the menus deliberately will not: rename a FILE. For an actor
that leaves the thing inside called what it was and every reference to it
pointing at a path that is not there — the exact failure `renameThing` exists to
avoid, reachable from a menu two clicks away from the one that avoids it.

Everything else it offered has a place here. Making, renaming, cloning and
deleting are the menus'; seeing the whole project at once is nine buttons that
each say what they hold; and UPLOADING — the one thing that lived only in the
tree's header — is a third item on the folders that take one:

```
New sprite
Import…            from the shelf that ships with the lab
Upload…            a file of your own
```

An upload lands in the folder whose menu asked for it, where the tree's put
every one at the root — which for a picture is the whole question, since a PNG
in `backgrounds/` is a backdrop and the same bytes in `sprites/` are a sprite.
The act itself is Codebridge's (`useFileUpload`), shared with the tree that
still has one in every other lab.

## Where the shelves live

The five stock shelves — effects, rules, actors, appearances, sounds — are
mounted by the layout (`library/LibraryImports`), not by the Blockly editor that
used to own them. Both callers ask the same seam
(`blockly/libraryImport`): a dropdown's `(import…)` row, and these menus. An
editor can only open a dialog while it is mounted, and a menu that offered
`Import…` while a PNG was open would otherwise have found nobody listening.
