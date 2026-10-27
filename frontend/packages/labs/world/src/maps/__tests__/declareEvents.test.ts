// The one place an import writes into a file the learner already had.
//
// A map raises the game's events and declares none of its own, so importing
// the Pause Menu into a project that has never heard of `quit` has to declare
// `quit` on the Main Screen — or the menu's Quit button raises a name nothing
// answers (specs/MAP_EVENTS_PLAN.md, "What it costs, said plainly"). What
// declaring is, in the screen's data, is `screenDialogs.test`'s.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {EMPTY_APP_PROJECT} from '../../fixtures/scenarios';
import {importStockMap} from '../importStockMap';
import {stockMapById} from '../stock';

describe('importing a stock map', () => {
  const EMPTY = EMPTY_APP_PROJECT;
  const screenId = Object.keys(EMPTY.files).find(
    id => EMPTY.files[id].name === 'main.screen',
  )!;
  const declared = (source: MultiFileSource) =>
    (
      (
        JSON.parse(source.files[screenId].contents ?? '{}') as {
          events?: Array<{name: string}>;
        }
      ).events ?? []
    ).map(event => event.name);

  it('declares what the map says it raises, on the Main Screen', () => {
    const {source} = importStockMap(EMPTY, stockMapById('confirm')!);
    expect(declared(source)).toEqual(['yes', 'no']);
  });

  it('declares again for a map the project already holds', () => {
    // The reason to run the import a second time is that something is
    // missing: the map is not written over, and the declaration is put back.
    const once = importStockMap(EMPTY, stockMapById('pauseMenu')!).source;
    const emptied: MultiFileSource = {
      ...once,
      files: {...once.files, [screenId]: EMPTY.files[screenId]},
    };
    const again = importStockMap(emptied, stockMapById('pauseMenu')!).source;
    expect(declared(again)).toEqual(['quit']);
  });
});
