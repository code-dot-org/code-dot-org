// The stock maps: interface arrangements a project imports whole.
//
// A stock actor is one control; a stock map is several of them arranged —
// a pause menu, a title screen, a dialog — which is what a learner reaches
// for (specs/UI_ACTORS.md, "The second axis"). Each is a `.map` file plus the
// actors it places, and importing one walks that list the way importing an
// actor walks its rules (`maps/importStockMap`).

import {keyboardMap} from './keyboard';
import {pauseMenuMap} from './pauseMenu';

export interface StockMap {
  /** File stem this is imported as — `pauseMenu` becomes `maps/pauseMenu.map`. */
  id: string;
  name: string;
  /** One line on what it is, for the import dialog. */
  description: string;
  /** The stock actors the map places, brought with it. */
  actors: readonly string[];
  /** The `.map` JSON, copied verbatim on import. */
  contents: string;
}

export const STOCK_MAPS: readonly StockMap[] = [
  {
    id: 'pauseMenu',
    name: 'Pause Menu',
    description:
      'A panel that says PAUSED with a Resume and a Quit button. Load it when a key is pressed and “pause the game”; Resume takes it away, and Quit says “quit” for the world to decide what that means.',
    actors: ['panel', 'label', 'button'],
    contents: pauseMenuMap,
  },
  {
    id: 'keyboard',
    name: 'On-Screen Keyboard',
    description:
      'Five rows of keys that type. Load it when a text field takes the focus and unload it when nothing has the focus — every key types as if the real keyboard had, so whichever field is focused fills.',
    actors: ['panel', 'button'],
    contents: keyboardMap,
  },
];

export const stockMapById = (id: string): StockMap | undefined =>
  STOCK_MAPS.find(map => map.id === id);
