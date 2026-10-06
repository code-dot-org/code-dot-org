# The world's blocks, by topic

Status: BUILT (Oct 2026).

## What was there

One built-in drawer, **World**, held sixty-three blocks: the world's own
definition and properties, loading maps and Viewports, layers, cameras,
tweens, the map and view sizes, the clock, pausing, saving, typing without a
keyboard, world effects, and the background and foreground slots with their
effects. Beside it, **Map** held the five blocks a map is written with.

A learner looking for `set background` read past cameras, layers, tweens and
saving to find it, and a level that wanted to leave cameras out of the
toolbox had to name each block, because the only unit a toolbox can drop by
name is a drawer (`levelData.hiddenToolboxCategories`).

## What is built

The two drawers are six, each named for its topic:

| Drawer          | Holds                                                                 |
| --------------- | --------------------------------------------------------------------- |
| **World**       | `define world`, its properties and events, theme, map and view size, adding and removing actors, pausing, tweens, typing, world effects, `any ⟨kind⟩` |
| **Map**         | loading and unloading maps, into a Viewport too; and in a map's own workspaces, the blocks a map is written with |
| **Cameras**     | defining, using, moving and naming cameras; camera traits; `this camera` |
| **Backgrounds** | each layer's background, the colour behind everything, their effects; layers, parallax and layer effects |
| **Memory**      | saving, recalling and forgetting what the world remembers, and records |
| **Clock**       | how long the game has run, and what time it is out there              |

Every block is in exactly one of them, the same sixty-eight as before.

## Decisions

- **Names a rule's drawer cannot also have.** A drawer is found by its name
  (a level's hidden categories, the open file's drawer being lifted to the
  top), and the stock library has rules called **Time** and **Camera**. So
  the clock is **Clock** and the cameras are **Cameras**.
- **Loading a map is the Map drawer's**, not the World's. In a world file
  Map shows only the loading blocks, since `ROOT_HOMES` keeps a map's own
  blocks to a map's workspaces; in a map file it shows both halves.
- **`add actor` stays in World**, beside `remove actor`: it places one
  actor, where loading a map places many.
- **Layers live with Backgrounds.** A layer is what a background belongs
  to; somebody looking for one finds the layer blocks beside it.
- **Foregrounds are gone** since this split (specs/LAYERS_PLAN.md,
  "Foregrounds retired"), which took six blocks out of Backgrounds: what
  was in front of the actors is a layer above them.
- **Gating is unchanged.** The lesson shelf narrows a drawer that holds any
  block a lesson grants, and every new drawer holds such a block, so each
  hides exactly the blocks the one World drawer hid. The shelf's ledger
  (`progression/__tests__/shelfCoverage`) lists them under their new
  drawers.

## What it is for next

A profile that offers less than everything (the survey's *Starter*, and
App Builder) can now leave out a topic by naming its drawer, rather than
block by block. App Builder still filters by block type
(`appBuilder.APP_HIDDEN_BLOCKS`), which now empties the Cameras drawer and
takes the layer blocks out of Backgrounds.
