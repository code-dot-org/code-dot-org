---
title: Game Lab
description: Reference for the Game Lab workspace — the canvas, toolbox categories, Animation tab, blocks and text, and the draw loop.
type: reference
---

Game Lab is a programming environment for building games and animations with sprites on a 400-by-400-pixel canvas. The workspace has a code editor on the left, the canvas preview on the right, and an Animation tab for managing sprite images. Code runs in a draw loop that executes about 30 times per second.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/). To share a finished project, see [Sharing and publishing a project](/guide/projects/sharing-and-publishing/).

## Canvas

The canvas is a 400-by-400-pixel area where sprites and shapes are drawn. It updates each frame when `drawSprites()` is called inside the `draw` function. The origin (0, 0) is the top-left corner; x increases to the right, y increases downward. Sprites that move outside the 0-400 range in either axis are still in memory but not visible.

## Toolbox

![The Droplet toolbox showing category tabs and block signatures for the World category](images/game-lab-toolbox.png)

The toolbox groups blocks into categories:

- **World** — `background`, `drawSprites`, `playSound`, `stopSound`, `playSpeech`, camera controls, and frame-rate functions.
- **Sprites** — creating sprites (`createSprite`), setting position, velocity, rotation, scale, lifetime, depth, and collision detection (`isTouching`, `collide`, `displace`, `bounce`, `overlap`).
- **Drawing** — shapes (`rect`, `ellipse`, `line`, `arc`, `point`), colors (`fill`, `stroke`, `noFill`, `noStroke`), text (`text`, `textAlign`, `textSize`), and image rendering.
- **Animations** — loading and setting sprite animations by label.
- **Groups** — creating sprite groups and operating on all members (count, remove, get, highest/lowest depth).
- **Math** — `randomNumber`, `sin`, `cos`, trigonometric helpers.
- **Variables** — `console.log`, `console.clear`, and object utilities.
- **Control** — conditionals, loops, and function definitions.

Which categories appear depends on the level configuration.

## Animation tab

![The Animation tab with the Animation Library open, showing categories such as Animals, Aquatic Objects, Backgrounds, and others](images/game-lab-animation-tab.png)

The Animation tab (film-strip icon in the top-left) manages the images used by sprites. Each animation has a label, one or more frames, and a frame rate. You can draw frames in the built-in pixel editor, upload an image, or choose from the built-in library. The animation's label is the string you pass to `setAnimation` in your code.

Animations have a default size of 100 by 100 pixels. The pixel editor supports resizing, and imported images are scaled to fit.

## Blocks and text

Game Lab defaults to block mode. Select **Show Text** below the workspace to switch to a text editor showing the equivalent JavaScript. Select **Show Blocks** to return.

If your text contains unsupported syntax, the editor stays in text mode and shows a warning. Your mode preference is remembered per level.

## The draw loop

Game Lab code has two implicit functions: `setup` runs once when the program starts; `draw` runs continuously at about 30 frames per second. Sprite movement, input checks, and collision detection belong in `draw`. Initialization (creating sprites, setting the background) belongs in `setup`.

Calling `noLoop()` stops the draw loop. Calling `loop()` restarts it.

## Run and Reset

![The Run button](images/game-lab-run-button.png)

Select **Run** above the canvas to execute the program. The canvas begins updating and responds to keyboard and mouse input.

![The Reset button](images/game-lab-reset-button.png)

Select **Reset** to stop execution and clear the canvas to its initial state.

## Troubleshooting

### Sprites do not appear

`drawSprites()` must be called inside `draw`. Without it, sprites exist in memory but are never rendered. If `background()` is called after `drawSprites()`, it paints over the sprites.

### The canvas is blank after Run

If neither shapes nor sprites appear, confirm that `draw` contains at least `background()` and `drawSprites()`. A program with only `setup` code produces a single frame and stops.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Sharing and publishing a project](/guide/projects/sharing-and-publishing/)
- [Labs overview](/guide/labs/)
