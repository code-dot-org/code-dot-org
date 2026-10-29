// The stock maps: interface arrangements a project imports whole.
//
// A stock actor is one control; a stock map is several of them arranged —
// a pause menu, a title screen, a dialog — which is what a learner reaches
// for (specs/UI_ACTORS.md, "The second axis"). Each is a `.map` file plus the
// actors it places, and importing one walks that list the way importing an
// actor walks its rules (`maps/importStockMap`).
//
// …and the world EVENTS it raises, which the import declares in the project's
// world, because a map names the world's events and declares none of its own
// (specs/MAP_EVENTS_PLAN.md).

import type {RaisedEvent} from '../declareEvents';

import {confirmMap} from './confirm';
import {pauseMenuMap} from './pauseMenu';

export interface StockMap {
  /** File stem this is imported as — `pauseMenu` becomes `maps/pauseMenu.map`. */
  id: string;
  name: string;
  /** One line on what it is, for the import dialog. */
  description: string;
  /** The stock actors the map places, brought with it. */
  actors: readonly string[];
  /**
   * The world events it raises, which the import declares in the world.
   *
   * Said here as well as by the `emit` blocks inside the map, because a
   * declaration needs the event's SIGNATURE — `a tab is chosen` carries a
   * value — and an `emit` block does not carry one. Two genuinely different
   * artifacts, so a test holds them in step (`stockMaps.test`), the way one
   * holds `actors` against what the map places.
   */
  raises?: readonly RaisedEvent[];
  /** The `.map` JSON, copied verbatim on import. */
  contents: string;
  /**
   * A SCREEN the game shows over what is there, rather than a map: imported
   * into `screens/` as a `.screen` (specs/SCREEN_STACK_PLAN.md, step 5).
   */
  screen?: boolean;
}

export const STOCK_MAPS: readonly StockMap[] = [
  {
    id: 'pauseMenu',
    name: 'Pause Menu',
    description:
      'A screen that says PAUSED with a Resume and a Quit button. Show it when a key is pressed and “pause the game”; Resume goes back, and Quit says “quit” for the game to decide what that means.',
    actors: ['panel', 'label', 'button'],
    raises: [{name: 'quit'}],
    contents: pauseMenuMap,
    screen: true,
  },
  {
    id: 'confirm',
    name: 'Are You Sure?',
    description:
      'A question with two answers, over whatever is behind it. It covers what it is asking about, so nothing under it can be clicked while it is up, and it says “yes” or “no” for the project to act on.',
    actors: ['panel', 'label', 'button'],
    raises: [{name: 'yes'}, {name: 'no'}],
    contents: confirmMap,
    screen: true,
  },
];

export const stockMapById = (id: string): StockMap | undefined =>
  STOCK_MAPS.find(map => map.id === id);
