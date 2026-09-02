// The warning `define block ⟨reports a …⟩` wears in an `.actor` file.

import {describe, expect, it} from 'vitest';

import {reportsWhereItCannot} from '../actorBlockReports';

/** A block with a parent chain and a workspace, as the check reads one. */
const blockIn = (
  returns: string,
  rootType: string,
  tops: string[] = [rootType],
) => {
  const root = {type: rootType, getParent: () => null} as never;
  return {
    type: 'world_rule_block',
    getFieldValue: (name: string) => (name === 'RETURNS' ? returns : ''),
    getParent: () => root,
    workspace: {getTopBlocks: () => tops.map(type => ({type}))},
  } as never;
};

describe('an actor’s own block that says it reports a value', () => {
  it('is warned about', () => {
    expect(reportsWhereItCannot(blockIn('number', 'world_actor'))).toBe(true);
  });

  it('is not, when it merely does something', () => {
    // The form that IS built. Nothing about it is unusual, so nothing is said.
    expect(reportsWhereItCannot(blockIn('none', 'world_actor'))).toBe(false);
  });

  it('is not, in a rule, which is where that form belongs', () => {
    expect(reportsWhereItCannot(blockIn('number', 'world_rule'))).toBe(false);
  });

  it('is not, in a world, which is not offered the block at all', () => {
    // A world's own `define actor` is a `world_actor` root too, so the root's
    // type alone would answer yes here. What settles it is the file.
    expect(
      reportsWhereItCannot(
        blockIn('number', 'world_actor', ['world_world', 'world_actor']),
      ),
    ).toBe(false);
  });
});
