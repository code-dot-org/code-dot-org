// A project, invented, so that a theme can be seen before it is used.
//
// THE PREVIEW DRAWS THE REAL CONTROLS. Not a mock-up of a button: the stock
// Button's own `.actor` file, read by the same reader that makes the map
// editor's stills, painted by the same painter that makes the game's
// textures. A theme that looks right here looks right in the game, because
// the only thing that differs is which canvas it lands on.
//
// What has to be invented is the PROJECT around it, because `readDrawing`
// reads a theme the way the game does — the first `use theme` row under a
// `define world` (`preview/drawingReader`). The file being edited has no path
// yet and may not be in the project at all, so this makes a world whose only
// row names it.

import type {Files} from '../../actors/preview/drawingReader';
import {STOCK_ACTORS} from '../../actors/stock';
import {STOCK_RULES} from '../../rules/stock';

/** Where the theme under edit is mounted in the invented project. */
const THEME_PATH = 'styles/__preview';

/**
 * The controls the preview shows, in the order they are shown.
 *
 * CHOSEN TO COVER THE ROLES rather than to be a catalogue. Between them these
 * seven name every style a theme defines except the two a still cannot reach
 * — a Scroll View's and a List's pictures depend on where they are scrolled,
 * which only a running world knows (`drawingReader`, "the four that cannot
 * be").
 */
export const PREVIEW_KINDS = [
  'button',
  'panel',
  'textInput',
  'toggle',
  'dropdown',
  'slider',
  'progressBar',
] as const;

/** The stock shelf, plus a world that names the theme being edited. */
export function previewFiles(theme: string): Files {
  return {
    ...Object.fromEntries(
      STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
    ),
    ...Object.fromEntries(
      STOCK_RULES.map(rule => [`rules/${rule.id}.rule`, rule.contents]),
    ),
    [`${THEME_PATH}.style`]: theme,
    'worlds/__preview.world': JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'Preview'},
            next: {
              block: {
                type: 'world_use_theme',
                fields: {THEME: THEME_PATH},
              },
            },
          },
        ],
      },
    }),
  };
}
