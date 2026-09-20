// The stock maps: interface arrangements a project imports whole.
//
// A stock actor is one control; a stock map is several of them arranged —
// a pause menu, a title screen, a dialog — which is what a learner reaches
// for (specs/UI_ACTORS.md, "The second axis"). Each is a `.map` file plus the
// actors it places, and importing one walks that list the way importing an
// actor walks its rules (`maps/importStockMap`).

import {confirmMap, messageMap, tabsMap} from './dialogs';
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
  {
    id: 'confirm',
    name: 'Are You Sure?',
    description:
      'A question with two answers, over whatever is behind it. It covers what it is asking about, so nothing under it can be clicked while it is up, and it says “yes” or “no” for the project to act on.',
    actors: ['panel', 'label', 'button'],
    contents: confirmMap,
  },
  {
    id: 'tabs',
    name: 'Tab Bar',
    description:
      'A row of tabs across the foot of the screen. Each says which was chosen, by the word on it, so the project decides what screen each one goes to — and adding a fourth tab is adding a button.',
    actors: ['panel', 'button'],
    contents: tabsMap,
  },
  {
    id: 'message',
    name: 'Message',
    description:
      'A line of words over the app with a way to be rid of it. Load it to say something happened; it goes when it is tapped, or when the project takes it away.',
    actors: ['panel', 'label', 'button'],
    contents: messageMap,
  },
];

export const stockMapById = (id: string): StockMap | undefined =>
  STOCK_MAPS.find(map => map.id === id);
