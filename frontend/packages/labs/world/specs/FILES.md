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

**Rows are named by what the file DECLARES**, not by what it is called.
`player.actor` reads as "Player" — the word on its own blocks, in every
dropdown that offers it, in the map editor — because the file name is where
that lives rather than what it is (`authoredName`). A file that declares
nothing is titled from its own stem, the same fallback every dropdown makes:
`level1.map` is "Level1". A `.sheet` is left out entirely, as it is from the
tree: it belongs to the `.png` of the same name and is not a file to open.

**Renaming the file is not offered.** It changes nothing these rows show and
leaves the name the learner meant untouched. Renaming the THING — and moving
its file to match — is the version worth having, and until it exists the tree
still renames a file for anyone who wants the file renamed.

**The acts are the tree's acts.** Opening, renaming and deleting go through the
same `useFileOperations` and the same prompts the file browser uses, including
the lab's veto on deleting a rule another rule requires (`rules/deleteGuard`).
Nothing is possible from here that was not possible before; this is a second
reading of one project, not a second file system.

**What a row does not offer says something.** A folder with no `New` is one
where making a file from nothing means nothing: a sprite is bytes and so is a
sound, and an empty one of either is not a starting point. A folder with no
`Import…` is one nobody stocks — nothing ships a world or a map to copy in.

**The extension is the menu's business.** `New actor` asks for a name and adds
`.actor`, because the folder has already answered the question the tree has to
ask ("name.actor"), and the answer cannot differ.

**A folder the project has not got** still gets a button. `Import…` works
anyway, because a shelf makes the folder it writes into
(`projectWrite.folderIn`); `New` appears once the folder exists, since a file is
created IN one and the id of a folder made in the same breath is not known until
the next render.

## Two house details, learned the hard way

The buttons are `IconButtonWithTooltip` (`@code-dot-org/lab/components`) and not
a bare MUI `IconButton` with a `Tooltip`: the bubble portals to `<body>`, which
is OUTSIDE the `[data-theme]` element the lab renders inside, so a tooltip that
does not carry the theme itself resolves its colour variables against nothing
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

## The tree is still there

Collapsed to begin with, and one toggle away — the button at the left of the
same bar. It is the answer to "show me everything at once", to uploading a file
of your own, and to anything the menus deliberately leave out.

## Where the shelves live

The five stock shelves — effects, rules, actors, appearances, sounds — are
mounted by the layout (`library/LibraryImports`), not by the Blockly editor that
used to own them. Both callers ask the same seam
(`blockly/libraryImport`): a dropdown's `(import…)` row, and these menus. An
editor can only open a dialog while it is mounted, and a menu that offered
`Import…` while a PNG was open would otherwise have found nobody listening.
