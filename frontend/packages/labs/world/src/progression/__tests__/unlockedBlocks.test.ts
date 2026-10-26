// Every block a tile promises, against the palette that would define it.
//
// Forty-odd block types are written out by hand in the catalogue, and a wrong
// one fails quietly: the tile still renders, the unlock still lands on the
// shelf, and the block it names is simply never offered. The generated ones are
// the easy ones to get wrong — `world_do_Physics_ApplyForceAction` is derived
// from a rule's export name by rules nobody remembers (AGENTS.md), and a hand
// guess is right about half the time.
//
// So: build the palette a project holding every stock rule AND every stock
// actor would have, and require each promised type to be in it. The actors
// matter now that a kind may declare properties and blocks of its own — the
// Progress Bar's `fraction` was a rule's and is the bar's, and a tile granting
// it names `world_set_ActorsProgressBar_…`. Separate from the layout test
// because this parses thirty rule workspaces, one of which is 390KB, and the
// layout test should stay instant.

import {describe, expect, it} from 'vitest';

import {STOCK_ACTORS} from '../../actors/stock';
import {buildDomainPalette} from '../../blockly/domainBlocks';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {STOCK_RULES} from '../../rules/stock';
import {TILES} from '../catalogue';

const files = {
  ...Object.fromEntries(
    STOCK_RULES.map(rule => [`rules/${rule.id}.rule`, rule.contents]),
  ),
  ...Object.fromEntries(
    STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
  ),
};
const palette = buildDomainPalette(projectRuleMetas(files), {
  allRuleModules: true,
  ownProperties: projectOwnMetas(files),
});

// Two sources, because there are two kinds of block here. The ones this lab
// DEFINES are in `blocks`; the ones it merely offers — Blockly's own `if`,
// `compare`, `join` — are registered by Blockly and appear only as entries in
// the toolbox. A tile may unlock either.
const defined = new Set<string>(
  [
    ...palette.blocks.map(block => block.type),
    ...(palette.toolbox as {blocks?: readonly unknown[]}[]).flatMap(category =>
      (category.blocks ?? []).map(item =>
        typeof item === 'string' ? item : (item as {type?: string}).type,
      ),
    ),
  ].filter((type): type is string => typeof type === 'string'),
);

describe('every block a tile unlocks', () => {
  it('is one the palette defines, unless the tile says it does not exist', () => {
    for (const tile of TILES) {
      for (const unlock of tile.unlocks) {
        if (unlock.kind !== 'block') {
          continue;
        }
        // Both directions, as with the rules: a type nothing defines has to
        // carry the `proposed` flag, and a flagged type that has since been
        // built has to lose it.
        expect(
          defined.has(unlock.type),
          `${tile.id} unlocks block ${unlock.type}`,
        ).toBe(!unlock.proposed);
      }
    }
  });
});
