// Three arrangements every app has, and none of which is a new kind of actor.
//
// A confirm dialog, a tab bar and a message: a Panel, some Labels and some
// Buttons, placed. They are here for the reason the pause menu is — a learner
// reaching for "are you sure?" is not reaching for a Panel (specs/UI_ACTORS.md,
// "The second axis") — and they are possible now for one reason: a map can say
// it covers what is under it, so a dialog is a dialog rather than a picture of
// one (specs/MODALITY_PLAN.md).
//
// EACH ONE SPEAKS THROUGH AN EVENT and knows nothing about the project. A
// confirm does not know what it is confirming; a tab bar does not know what
// screens the project has. The map declares which of the WORLD's events it
// raises, a placement script raises one, and the world answers — so moving a
// button on the map rewires nothing and the same map serves every use of it
// (specs/MAP_EVENTS_PLAN.md).

import {
  chain,
  defineMap,
  emitWorldEvent,
  me,
} from '../../actors/stock/workspace';
import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';

const VIEW = VIEWPORT_TILES * TILE_SIZE;
const MIDDLE = VIEW / 2;

/** A placement's workspace: one hat about this actor, and what follows. */
const script = (...then: object[]) => ({
  blocks: {
    blocks: {
      blocks: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {ACTOR: me()},
          x: 20,
          y: 20,
          next: {block: chain(then)},
        },
      ],
    },
  },
});

const place = (
  type: string,
  id: string,
  x: number,
  y: number,
  own: Record<string, Record<string, unknown>> = {},
  extras: object = {},
) => ({
  type,
  id,
  properties: {...own, positional: {position: {x, y}, ...own.positional}},
  ...extras,
});

const mapFile = (spec: {
  modal?: boolean;
  anchorless?: boolean;
  actors: object[];
  workspace: object;
}) =>
  JSON.stringify(
    {
      type: 'map',
      size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
      tile: {width: TILE_SIZE, height: TILE_SIZE},
      ...(spec.modal ? {modal: true} : {}),
      actors: spec.actors,
      blocks: spec.workspace,
    },
    null,
    2,
  );

const unloadThis = {type: 'world_unload_this_map'};

// ── Are you sure? ───────────────────────────────────────────────────────────

/**
 * A question with two answers, over whatever is behind it.
 *
 * MODAL, which is the whole point of a confirm: while it is up, the thing it
 * is asking about cannot be clicked again. Before a map could say that, this
 * would have been a panel you could click straight past.
 *
 * IT TAKES ITSELF AWAY either way, as the pause menu does. What the answer
 * MEANS is the project's — `yes` on a delete screen deletes, `yes` on a quit
 * screen quits — so the map says only which button was pressed.
 *
 * The question is a placement's text, so a project changes it in the map
 * editor. Changing it per ASKING wants a way to pass a map a value when it is
 * loaded, which does not exist; a project with two questions has two maps, or
 * writes the words into the Label before it loads this.
 */
export const confirmMap = mapFile({
  modal: true,
  actors: [
    place('actors/panel', 'Ask', MIDDLE, MIDDLE, {
      Label: {text: ''},
      hasABox: {width: 240, height: 140},
    }),
    place('actors/label', 'Question', 0, -36, {
      positional: {parent: 'Ask'},
      Label: {text: 'ARE YOU SURE?'},
    }),
    place(
      'actors/button',
      'Yes',
      -56,
      28,
      {positional: {parent: 'Ask'}, Label: {text: 'YES'}, hasABox: {width: 96}},
      script(emitWorldEvent('yes'), unloadThis),
    ),
    place(
      'actors/button',
      'No',
      56,
      28,
      {positional: {parent: 'Ask'}, Label: {text: 'NO'}, hasABox: {width: 96}},
      script(emitWorldEvent('no'), unloadThis),
    ),
  ],
  workspace: defineMap('Are You Sure?'),
});

// ── Where you are in the app ────────────────────────────────────────────────

/**
 * `emit a tab is chosen ⟨"HOME"⟩` — the tab that was pressed, by the word on
 * it.
 *
 * A VALUE RATHER THAN AN EVENT EACH, so adding a fourth tab is adding a
 * Button with a different caption and nothing else. Three events named for
 * three tabs would have put the project's own screen names inside a stock map,
 * which is exactly what this is trying not to know — and it is now the world
 * that would hold those three names, which makes it worse rather than better
 * (specs/MAP_EVENTS_PLAN.md).
 */
const chose = (caption: string) =>
  emitWorldEvent('a tab is chosen', {
    block: {type: 'text', fields: {TEXT: caption}},
  });

const TABS = ['HOME', 'SEARCH', 'YOU'];

/**
 * A bar of tabs across the foot of the screen.
 *
 * NOT MODAL, and that is the difference from the confirm above: a tab bar
 * sits over the app and the app goes on working under it. It also does not
 * unload itself — a tab bar is the one thing on screen that stays.
 *
 * WHAT A TAB DOES is the project's: `replace the screen with ⟨…⟩` rather than
 * `go to screen`, so three tabs pressed in turn are three replacements and one
 * Back, instead of a stack that grows forever (`rules/screens`).
 */
export const tabsMap = mapFile({
  actors: [
    place('actors/panel', 'Bar', MIDDLE, VIEW - 24, {
      Label: {text: ''},
      hasABox: {width: VIEW, height: 48},
    }),
    ...TABS.map((caption, at) =>
      place(
        'actors/button',
        `Tab ${caption}`,
        (VIEW / TABS.length) * (at + 0.5) - MIDDLE,
        0,
        {
          positional: {parent: 'Bar'},
          Label: {text: caption},
          hasABox: {width: 92},
        },
        script(chose(caption)),
      ),
    ),
  ],
  workspace: defineMap('Tab Bar'),
});

// ── Something to say, briefly ───────────────────────────────────────────────

/**
 * A line of words over the app, with a way to be rid of it.
 *
 * DISMISSED BY HAND, NOT BY A CLOCK, and that is a limitation worth stating
 * rather than hiding. A toast that goes away by itself needs something running
 * every frame, and `each frame` lives in a trait, a world's own `define actor`
 * or an `.actor` file — not in a map's script. So this is the honest half: the
 * project loads it, and it goes when it is tapped or when the project unloads
 * it.
 *
 * NOT MODAL. A message that stopped the app being used would be a dialog, and
 * the one above already is.
 */
export const messageMap = mapFile({
  actors: [
    place('actors/panel', 'Note', MIDDLE, VIEW - 96, {
      Label: {text: ''},
      hasABox: {width: VIEW - 32, height: 56},
    }),
    place('actors/label', 'Words', -40, 0, {
      positional: {parent: 'Note'},
      Label: {text: 'SAVED'},
      hasABox: {width: 180},
    }),
    place(
      'actors/button',
      'Dismiss',
      92,
      0,
      {positional: {parent: 'Note'}, Label: {text: 'OK'}, hasABox: {width: 64}},
      script(emitWorldEvent('dismissed'), unloadThis),
    ),
  ],
  workspace: defineMap('Message'),
});
