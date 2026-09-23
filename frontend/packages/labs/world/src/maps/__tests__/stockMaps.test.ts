// What a stock map says it raises, against what it actually raises
// (specs/MAP_EVENTS_PLAN.md).
//
// THE SHIPPED CASE OF THE SILENT NAME FAILURE. A map raises one of the world's
// events BY NAME, and a name that names nothing raises nothing — quietly. For
// a learner's own map the answer is that there is nothing to get wrong: an
// `emit` block comes from the world's drawer and carries the name it was
// declared with. A SHIPPED map is different, because the import has to declare
// those events in a world it has never seen, and the list it declares from is
// written by hand.
//
// So two things have to agree and they are written in different places: the
// `emit` blocks inside the map's JSON, and the `raises` on the `StockMap`
// entry beside it (`maps/stock/index`). The entry cannot be derived from the
// blocks — a declaration needs the event's SIGNATURE, and `a tab is chosen`
// carries a value that no emit block states — so this holds the two in step
// instead.

import {describe, expect, it} from 'vitest';

import {authoredName} from '../../blockly/projectModules';
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
  it('has a root, which names it what the shelf calls it', () => {
    // Through `authoredName`, which is what the file menus read — a map
    // declares its name the way every other Blockly file does.
    expect(authoredName(map.contents)).toBe(map.name);
  });

  it('raises exactly what the import declares, out of the world’s module', () => {
    expect(emitted(map.contents).sort()).toEqual(
      (map.raises ?? []).map(event => emitType(event.name)).sort(),
    );
  });
});
