// The pause menu, as a map with a script: a Panel, its title, and a Resume and
// a Quit that know what they are for.
//
// The first stock interface map (specs/UI_ACTORS.md, "The second axis"), and
// the first scripted one (specs/MAP_FIRST.md, "What a map script looks
// like"). A menu is four actors arranged, and arranging is what a map is; the
// title and the two buttons are the panel's CHILDREN, stored in its frame
// (specs/PARENTING.md), so loading the map puts the menu on screen as one
// thing and unloading it takes it away as one thing.
//
// THE BUTTONS ARE PLAIN BUTTONS WITH SCRIPTS. Resume's workspace says `when
// this actor is clicked: resume the game; unload this map`, because resuming
// means one thing. Quit's says `emit quit; unload this map`: `quit` is one of
// the WORLD's events, which this map declares it RAISES and the world declares
// and hears (specs/MAP_EVENTS_PLAN.md). What quitting means is the project's —
// breakout starts the level over. The menu takes ITSELF away either way.
// It used not to on Quit, while breakout answered with `clear world`, which
// took the menu with everything else; a level restarted inside a Viewport
// leaves the main map alone, so a menu that has been answered has to go by
// its own hand. No kind of actor knows any of this; the map does.
//
// AT THE MIDDLE OF THE STANDARD WINDOW, which is where a project with a
// square view wants it and which a project with another view moves in the
// map editor — a map is a starting point to arrange, not a layout that
// adapts (the anchoring UI_ACTORS.md defers is exactly this).

import {
  chain,
  defineMap,
  emitWorldEvent,
  me,
} from '../../actors/stock/workspace';
import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';

const MIDDLE = (VIEWPORT_TILES * TILE_SIZE) / 2;

/**
 * A placement's workspace: one hat about this actor, and what follows. The
 * value is a whole workspace serialization, as an actor file holds one.
 */
const script = (hat: object, ...then: object[]) => ({
  blocks: {
    blocks: {blocks: [{...hat, x: 20, y: 20, next: {block: chain(then)}}]},
  },
});

/** `when this actor is clicked with ⟨any⟩` — the Mouse rule's own hat. */
const whenClicked = () => ({
  type: 'world_on_Mouse_IsClickedWithEvent',
  fields: {FILTER0: ''},
  inputs: {ACTOR: me()},
});

export const pauseMenuMap = JSON.stringify(
  {
    type: 'map',
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    // A SCREEN: while it is up, nothing behind it can be clicked, tabbed to
    // or typed at (specs/MODALITY_PLAN.md). `pause the game` already stops
    // the level MOVING, and the two are not the same thing — a paused game
    // still turns clicks into events, so without this the level's buttons
    // were live under the menu asking whether to quit.
    modal: true,
    actors: [
      {
        type: 'actors/panel',
        id: 'Pause',
        // THE MIDDLE OF WHATEVER WINDOW IT COMES UP IN. This map is loaded
        // over any world that asks for it, and the worlds are not one shape:
        // a menu centred on a square level is off to one side of a
        // phone-shaped one. Its three buttons are its children and ride along
        // (specs/ANCHORS_PLAN.md).
        anchor: 'center',
        properties: {
          positional: {position: {x: MIDDLE, y: MIDDLE}},
          // Wide enough for two buttons and a title; no words of its own,
          // since the title below has them.
          Label: {text: ''},
          hasABox: {width: 200, height: 120},
        },
      },
      // In the panel's frame: the title near the top, and the two buttons
      // a little below its middle, and lower again.
      {
        type: 'actors/label',
        id: 'Title',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: -40}},
          Label: {text: 'PAUSED'},
        },
      },
      {
        type: 'actors/button',
        id: 'Resume',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: 4}},
          Label: {text: 'RESUME'},
        },
        ...script(
          whenClicked(),
          {type: 'world_resume_game'},
          {type: 'world_unload_this_map'},
        ),
      },
      {
        type: 'actors/button',
        id: 'Quit',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: 40}},
          Label: {text: 'QUIT'},
        },
        ...script(
          whenClicked(),
          emitWorldEvent('quit'),
          {type: 'world_unload_this_map'},
        ),
      },
    ],
    // The map's own workspace: what it is called, and the one world event it
    // raises.
    blocks: defineMap('Pause Menu', 'quit'),
  },
  null,
  2,
);
