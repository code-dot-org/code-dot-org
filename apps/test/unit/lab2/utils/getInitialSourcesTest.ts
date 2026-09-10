import {LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import getInitialSources from '@cdo/apps/lab2/utils/getInitialSources';

// levelProperties comes out of the redux store, which immer deep-freezes.
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// Kept plainly typed so assertions can reach into the block tree; the same
// object is handed to getInitialSources as ProjectSources.
const frozenBlocks = {
  source: {blocks: {blocks: [{type: 'when_run'}]}},
};
const startSources = frozenBlocks as unknown as ProjectSources;

describe('getInitialSources', () => {
  it('hands out a mutable copy of frozen level start sources', () => {
    const levelProperties = deepFreeze({
      startSources,
    } as unknown as LevelProperties);
    const result = getInitialSources(levelProperties, undefined) as {
      source: {blocks: {blocks: [{type: string}]}};
    };
    // This test file is a module, so it runs in strict mode: the assignment
    // below throws if any level of the result is still frozen — the
    // production crash this pins (migrations rename block types in place).
    result.source.blocks.blocks[0].type = 'spritelab2_whenRun';
    expect(result.source.blocks.blocks[0].type).toBe('spritelab2_whenRun');
    // The level's own copy is untouched.
    expect(frozenBlocks.source.blocks.blocks[0].type).toBe('when_run');
  });

  it('passes project sources through as-is', () => {
    const levelProperties = deepFreeze({
      startSources,
    } as unknown as LevelProperties);
    const projectSources = {source: '{}'} as ProjectSources;
    expect(getInitialSources(levelProperties, projectSources)).toBe(
      projectSources
    );
  });
});
