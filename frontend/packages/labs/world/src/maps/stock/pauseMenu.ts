// The pause menu, as a screen: a Panel, its title, and a Resume and a Quit
// that know what they are for (specs/SCREEN_STACK_PLAN.md, step 5).
//
// The first stock interface map (specs/UI_ACTORS.md, "The second axis"), and
// the first scripted one (specs/MAP_FIRST.md, "What a map script looks
// like"). A menu is four actors arranged, and arranging is what a map is; the
// title and the two buttons are the panel's CHILDREN, stored in its frame
// (specs/PARENTING.md), so showing the screen puts the menu up as one thing
// and going back takes it away as one thing.
//
// THE BUTTONS ARE PLAIN BUTTONS WITH SCRIPTS. Resume's workspace says `when
// this actor is clicked: resume the game; go back`, because resuming means
// one thing. Quit's says `emit quit; go back`: `quit` is one of the game's
// events, which the Main Screen declares and hears (specs/MAP_EVENTS_PLAN.md).
// What quitting means is the project's — breakout starts the level over. The
// menu takes ITSELF away either way. No kind of actor knows any of this; the
// screen does.
//
// AT THE MIDDLE OF THE STANDARD WINDOW, which is where a project with a
// square view wants it and which a project with another view moves in the
// map editor — a map is a starting point to arrange, not a layout that
// adapts (the anchoring UI_ACTORS.md defers is exactly this).

import {chain, defineMap, emitWorldEvent} from '../../actors/stock/workspace';
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
});

export const pauseMenuMap = JSON.stringify(
  {
    type: 'map',
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    // A SCREEN, so while it is up nothing under it can be clicked, tabbed to
    // or typed at. `pause the game` stops the level MOVING, and the two are
    // not the same thing — a paused game still turns clicks into events.
    // Half clear, so the game shows dimmed behind it.
    backgroundColor: '#00000080',
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
          {type: 'world_go_back'},
        ),
      },
      {
        type: 'actors/button',
        id: 'Quit',
        properties: {
          positional: {parent: 'Pause', position: {x: 0, y: 40}},
          Label: {text: 'QUIT'},
        },
        ...script(whenClicked(), emitWorldEvent('quit'), {
          type: 'world_go_back',
        }),
      },
    ],
    // The map's own workspace: what it is called. What it RAISES is what the
    // Quit button's `emit` says, and nothing here restates it.
    blocks: defineMap('Pause Menu'),
  },
  null,
  2,
);
