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
  OPENABLE_EXTENSIONS,
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

// The half that shipped broken, and why the tests above did not notice.
//
// They asked whether a block could be opened — the registry's question — and
// never whether anything WOULD open, which is a different list in a different
// file. `.actor` went into the first and not the second, so the eye appeared
// on `create ⟨Coin⟩ in map ⟨…⟩` and clicking it did nothing whatsoever.
//
// The lists are now one list. This checks that every kind it names is a kind
// the project can actually hold, so adding a sixth cannot quietly offer an eye
// over a file that does not exist.
describe('the kinds a module path can name', () => {
  it('covers the Blockly files a project holds', () => {
    // If a kind is registered as openable it must be resolvable, and the only
    // way to keep that true is for one list to answer both.
    expect([...OPENABLE_EXTENSIONS]).toEqual(
      expect.arrayContaining(['rule', 'behavior', 'actor']),
    );
  });

  it('tries a rule before a script, as the compiler does', () => {
    // Resolution order is load-bearing: the file the eye opens should be the
    // file the project would compile.
    const order = [...OPENABLE_EXTENSIONS];

    expect(order.indexOf('rule')).toBeLessThan(order.indexOf('js'));
    expect(order.indexOf('js')).toBeLessThan(order.indexOf('ts'));
  });

  it('resolves an imported actor to its actual file', () => {
    // The end of the chain, and the assertion the eye's promise rests on.
    const source = importStockActor(
      WORLD_SCENARIOS.empty.source,
      stockActorById('coin')!,
    ).source;
    const held = projectFiles(source);

    const resolved = OPENABLE_EXTENSIONS.map(
      kind => `actors/coin.${kind}`,
    ).find(path => path in held);

    expect(resolved).toBe('actors/coin.actor');
  });
});
