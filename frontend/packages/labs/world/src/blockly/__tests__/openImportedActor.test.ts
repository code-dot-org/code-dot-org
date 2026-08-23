// Importing an actor, and then being able to read it.
//
// The gap this closes, end to end: in a level with the file browser hidden,
// importing a Coin wrote `actors/coin.actor` and left no way to open it. There
// was no list to find it in, and the blocks that named it — `add actor
// ⟨Coin⟩`, `is a ⟨Coin⟩` — carried no eye, because `.actor` was not a kind of
// file the openable registry knew about.
//
// Two halves, and each was silent on its own: the registry not holding the
// path, and the block not asking about the field.

import {beforeEach, describe, expect, it} from 'vitest';

import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {moduleNamedBy} from '../extensions/openSourceButton';
import {
  canOpenModule,
  setModuleOpener,
  setModuleOpeningOffered,
} from '../openModule';
import {refreshProjectDropdowns} from '../projectDropdowns';

const block = (fields: Record<string, string>) =>
  ({getFieldValue: (name: string) => fields[name] ?? null}) as never;

beforeEach(() => {
  setModuleOpener(() => {});
  setModuleOpeningOffered(true);
});

describe('a Coin just imported', () => {
  const withACoin = () =>
    importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('coin')!)
      .source;

  it('can be opened from a block that names it', () => {
    refreshProjectDropdowns(projectFiles(withACoin()), [], {}, []);

    expect(canOpenModule(moduleNamedBy(block({ACTOR: 'actors/coin'})))).toBe(
      true,
    );
  });

  it('brings its rules along, which were already openable', () => {
    // Not a regression test so much as the shape of the thing: the import
    // writes several files, and every one of them is now reachable from the
    // block that mentions it.
    refreshProjectDropdowns(projectFiles(withACoin()), [], {}, []);

    expect(canOpenModule('rules/collect')).toBe(true);
  });

  it('offers nothing for an actor the project has not got', () => {
    refreshProjectDropdowns(
      projectFiles(WORLD_SCENARIOS.empty.source),
      [],
      {},
      [],
    );

    expect(canOpenModule(moduleNamedBy(block({ACTOR: 'actors/coin'})))).toBe(
      false,
    );
  });
});

describe('a behavior', () => {
  it('is openable too, which it was not either', () => {
    // `.behavior` was missing from the same regex, and a `use trait` naming
    // one had no eye for the same reason.
    const tapper = WORLD_SCENARIOS.tapper.source;
    refreshProjectDropdowns(projectFiles(tapper), [], {}, []);

    const behaviors = Object.keys(projectFiles(tapper)).filter(path =>
      path.endsWith('.behavior'),
    );

    expect(behaviors.length).toBeGreaterThan(0);
    for (const path of behaviors) {
      expect(canOpenModule(path.replace(/\.behavior$/, ''))).toBe(true);
    }
  });
});
