// Are you sure?: a Panel, a Label and two Buttons, placed, as a screen.
//
// Here for the reason the pause menu is — a learner reaching for "are you
// sure?" is not reaching for a Panel (specs/UI_ACTORS.md, "The second axis").
// IT SPEAKS THROUGH AN EVENT and knows nothing about the project: it does not
// know what it is confirming. Its buttons raise the game's `yes` and `no`, and
// the game answers, so the same screen serves every use of it
// (specs/MAP_EVENTS_PLAN.md, specs/SCREEN_STACK_PLAN.md).

import {chain, defineMap, emitWorldEvent} from '../../actors/stock/workspace';
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

const screenFile = (spec: {
  /** The screen's own color, behind its placements. */
  backgroundColor?: string;
  actors: object[];
  workspace: object;
}) =>
  JSON.stringify(
    {
      type: 'map',
      size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
      tile: {width: TILE_SIZE, height: TILE_SIZE},
      ...(spec.backgroundColor ? {backgroundColor: spec.backgroundColor} : {}),
      actors: spec.actors,
      blocks: spec.workspace,
    },
    null,
    2,
  );

const goBack = {type: 'world_go_back'};

// ── Are you sure? ───────────────────────────────────────────────────────────

/**
 * A question with two answers, over whatever is behind it.
 *
 * A SCREEN, which is the whole point of a confirm: while it is up, the thing
 * it is asking about cannot be clicked again. Half clear, so what it asks
 * about shows behind it (specs/SCREEN_STACK_PLAN.md, step 5).
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
export const confirmMap = screenFile({
  backgroundColor: '#00000080',
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
      script(emitWorldEvent('yes'), goBack),
    ),
    place(
      'actors/button',
      'No',
      56,
      28,
      {positional: {parent: 'Ask'}, Label: {text: 'NO'}, hasABox: {width: 96}},
      script(emitWorldEvent('no'), goBack),
    ),
  ],
  workspace: defineMap('Are You Sure?'),
});
