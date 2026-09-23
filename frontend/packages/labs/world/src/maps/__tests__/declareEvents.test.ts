// The one place an import writes into a file the learner already had.
//
// A map raises the world's events and declares none of its own, so importing
// the Pause Menu into a project that has never heard of `quit` has to put
// `define event ⟨quit⟩` in the world — or the menu's Quit button raises a name
// nothing answers (specs/MAP_EVENTS_PLAN.md, "What it costs, said plainly").

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {parseWorldOwnMeta} from '../../blockly/ownProperties';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {MAIN_WORLD_PATH} from '../../mainWorld';
import {declareEvents} from '../declareEvents';
import {importStockMap} from '../importStockMap';
import {stockMapById} from '../stock';

const world = (...rows: object[]) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Main'},
          ...(rows.length
            ? {
                next: {
                  block: rows.reduceRight<object | undefined>(
                    (next, row) => ({
                      ...row,
                      ...(next ? {next: {block: next}} : {}),
                    }),
                    undefined,
                  ),
                },
              }
            : {}),
        },
      ],
    },
  });

const declared = (contents: string) =>
  parseWorldOwnMeta(MAIN_WORLD_PATH, contents)?.events ?? [];

const WHICH = {
  id: 'tabsWhich',
  name: 'which',
  type: 'string',
  binds: 'String',
} as const;

describe('declareEvents', () => {
  it('appends a declaration per event the world lacks', () => {
    const next = declareEvents(world(), [{name: 'quit'}, {name: 'save'}]);
    expect(declared(next).map(event => event.name)).toEqual(['quit', 'save']);
  });

  it('leaves what the world already declares exactly as it is', () => {
    const once = declareEvents(world(), [{name: 'quit'}]);
    expect(declareEvents(once, [{name: 'quit'}])).toBe(once);
  });

  it('keeps the rows above it, and adds below them', () => {
    const before = world({
      type: 'world_rule_property',
      fields: {TYPE: 'number', ACCESS: 'writable', NAME: 'score'},
    });
    const next = declareEvents(before, [{name: 'quit'}]);
    const meta = parseWorldOwnMeta(MAIN_WORLD_PATH, next)!;
    expect(meta.properties.map(property => property.name)).toEqual(['score']);
    expect(meta.events.map(event => event.name)).toEqual(['quit']);
  });

  it('carries a parameter, as the variable the declaration names by id', () => {
    const next = declareEvents(world(), [
      {name: 'a tab is chosen', carries: WHICH},
    ]);
    // Without the variable the parameter comes back called `value`
    // (`designedEvent`), which is the whole reason it is written.
    expect(declared(next)[0].parts).toEqual([
      {kind: 'label', text: 'a tab is chosen'},
      {kind: 'param', name: 'which', type: 'string'},
    ]);
  });

  it('leaves a file it cannot find a `define world` in alone', () => {
    expect(declareEvents('not json', [{name: 'quit'}])).toBe('not json');
    expect(declareEvents('{"blocks":{"blocks":[]}}', [{name: 'quit'}])).toBe(
      '{"blocks":{"blocks":[]}}',
    );
  });
});

describe('importing a stock map', () => {
  const EMPTY = WORLD_SCENARIOS.empty.source;
  const worldId = Object.keys(EMPTY.files).find(
    id => EMPTY.files[id].name === 'main.world',
  )!;
  const worldOf = (source: MultiFileSource) =>
    source.files[worldId].contents ?? '';

  it('declares what the map says it raises, in the project’s world', () => {
    const {source} = importStockMap(EMPTY, stockMapById('confirm')!);
    expect(declared(worldOf(source)).map(event => event.name)).toEqual([
      'yes',
      'no',
    ]);
  });

  it('declares again for a map the project already holds', () => {
    // The reason to run the import a second time is that something is
    // missing: the map is not written over, and the declaration is put back.
    const once = importStockMap(EMPTY, stockMapById('pauseMenu')!).source;
    const emptied: MultiFileSource = {
      ...once,
      files: {
        ...once.files,
        [worldId]: {...once.files[worldId], contents: world()},
      },
    };
    const again = importStockMap(emptied, stockMapById('pauseMenu')!).source;
    expect(declared(worldOf(again)).map(event => event.name)).toEqual(['quit']);
  });
});
