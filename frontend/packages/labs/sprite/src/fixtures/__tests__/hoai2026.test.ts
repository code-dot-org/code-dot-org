import {describe, expect, it} from 'vitest';

import {SPRITELAB2_BLOCKS} from '../../blockly/setup';
import hoai2026 from '../hoai2026';

// The fixture reads the course's .level file; these catch an edit to that
// file the fixture no longer understands.
const level = hoai2026.levelProperties?.['1'] as unknown as {
  sharedBlocks: {name: string; pool: string}[];
  helperLibraries: string[];
  toolboxDefinition: {
    kind: string;
    contents: {name: string; contents: {type: string}[]}[];
  };
};

describe('the hoai2026 free-play fixture', () => {
  it("takes the level's pools and libraries", () => {
    expect(new Set(level.sharedBlocks.map(block => block.pool))).toEqual(
      new Set(['GamelabJr', 'GameDev']),
    );
    expect(level.helperLibraries).toEqual(['NativeSpriteLab', 'zGameDev']);
  });

  it('offers a category for each scene type', () => {
    expect(level.toolboxDefinition.kind).toBe('categoryToolbox');
    expect(level.toolboxDefinition.contents.map(c => c.name)).toEqual([
      'Platform',
      'Story',
      'Link',
    ]);
  });

  // Blocks the course offers that this package has not ported yet. Apps grew
  // them after the port began: setWeather and burst in #75703, whenPlayer in
  // #75816. Blockly drops a toolbox entry whose type is undefined, so the
  // level still loads without them. Delete a name here as its block lands.
  const UNPORTED = [
    'spritelab2_setWeather',
    'spritelab2_burst',
    'spritelab2_whenPlayer',
  ];

  it('defines every block its toolbox names, bar the unported ones', () => {
    const known = new Set([
      ...level.sharedBlocks.map(block => block.name),
      ...SPRITELAB2_BLOCKS.map(block => block.type),
    ]);
    const named = level.toolboxDefinition.contents.flatMap(category =>
      category.contents.map(entry => entry.type),
    );
    const undefinedTypes = [...new Set(named.filter(type => !known.has(type)))];
    expect(undefinedTypes.sort()).toEqual([...UNPORTED].sort());
  });
});
