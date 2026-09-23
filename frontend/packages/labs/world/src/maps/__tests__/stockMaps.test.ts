// What a stock map says it raises, against what it actually raises and what
// the import declares (specs/MAP_EVENTS_PLAN.md).
//
// THE SHIPPED CASE OF THE SILENT NAME FAILURE. A map raises one of the world's
// events BY NAME, and a name that names nothing raises nothing — quietly. The
// editor's dropdown is the guard for a learner's own map; this is the guard
// for the five that ship, because nobody types those names again after they
// are written and a typo in one would be a button that does nothing in every
// project that imports it.
//
// Three lists have to agree, and each is written somewhere different: the
// `raises` rows in the map's own workspace, the `emit` blocks in its
// placements' scripts, and the `raises` on the `StockMap` entry that the
// import declares from (`maps/stock/index`).

import {describe, expect, it} from 'vitest';

import {parseMapManifest} from '../../blockly/ownProperties';
import {pascal} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import {MAIN_WORLD_PATH} from '../../mainWorld';
import {STOCK_MAPS} from '../stock';

/** Every `world_emit_…` block type anywhere in a map's JSON. */
const emitted = (contents: string): string[] => [
  ...new Set(contents.match(/world_emit_[A-Za-z0-9_]+/g) ?? []),
];

/** The block type a raise of `name` from a map has. */
const emitType = (name: string) =>
  `world_emit_${pathSlug(MAIN_WORLD_PATH)}_${pascal(name)}Event`;

describe.each(STOCK_MAPS)('the stock $name map', map => {
  const manifest = parseMapManifest(map.contents);

  it('has a root, which names it what the shelf calls it', () => {
    expect(manifest).toBeDefined();
    expect(manifest!.name).toBe(map.name);
  });

  it('declares exactly the events the import declares in the world', () => {
    expect([...manifest!.raises].sort()).toEqual(
      (map.raises ?? []).map(event => event.name).sort(),
    );
  });

  it('raises those and nothing else, out of the world’s module', () => {
    expect(emitted(map.contents).sort()).toEqual(
      manifest!.raises.map(emitType).sort(),
    );
  });
});
