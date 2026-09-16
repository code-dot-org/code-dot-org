// The pause menu, as a map: a Pause Menu panel carrying a Resume and a Quit.
//
// The first stock interface map (specs/UI_ACTORS.md, "The second axis"). A
// menu is three actors arranged, and arranging is what a map is; the two
// buttons are the panel's CHILDREN, stored in its frame (specs/PARENTING.md),
// so loading the map puts the menu on screen as one thing and removing the
// panel takes it away as one thing.
//
// THE BUTTONS ARE PLAIN BUTTONS, told apart by the NAMES this map gives
// them: the Pause Menu's file says `when ⟨the actor named Resume⟩ is
// clicked`, and Resume is whatever this map places under that name
// (specs/MAPS.md, "A block naming a placement"). Rename one in the editor
// and the menu stops hearing it, which is the one thing to know.
//
// AT THE MIDDLE OF THE STANDARD WINDOW, which is where a project with a
// square view wants it and which a project with another view moves in the
// map editor — a map is a starting point to arrange, not a layout that
// adapts (the anchoring UI_ACTORS.md defers is exactly this).

import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';

const MIDDLE = (VIEWPORT_TILES * TILE_SIZE) / 2;

export const pauseMenuMap = JSON.stringify(
  {
    type: 'map',
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      {
        type: 'actors/pauseMenu',
        id: 'Pause',
        properties: {positional: {position: {x: MIDDLE, y: MIDDLE}}},
      },
      // In the panel's frame: a little below its middle, and lower again.
      {
        type: 'actors/button',
        id: 'Resume',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: 4}},
          Label: {text: 'RESUME'},
        },
      },
      {
        type: 'actors/button',
        id: 'Quit',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: 40}},
          Label: {text: 'QUIT'},
        },
      },
    ],
  },
  null,
  2,
);
