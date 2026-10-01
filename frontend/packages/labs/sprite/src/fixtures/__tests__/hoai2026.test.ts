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

  it('defines every block its toolbox names', () => {
    const known = new Set([
      ...level.sharedBlocks.map(block => block.name),
      ...SPRITELAB2_BLOCKS.map(block => block.type),
    ]);
    const named = level.toolboxDefinition.contents.flatMap(category =>
      category.contents.map(entry => entry.type),
    );
    expect(named.filter(type => !known.has(type))).toEqual([]);
  });
});
