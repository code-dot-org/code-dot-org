import {describe, expect, it} from 'vitest';

import placeholder, {
  PLACEHOLDER_MUTATOR,
  PLACEHOLDER_OUTLINE_EXTENSION,
  type PlaceholderBlock,
  placeholderMutator,
} from '../placeholder';

const LIKE = {type: 'gamelab_spriteSay', fields: {SPEECH: 'hi'}};

describe('placeholder block', () => {
  it('generates no code: a slot runs nothing', () => {
    expect(
      placeholder.generator(
        {} as Parameters<typeof placeholder.generator>[0],
        {} as Parameters<typeof placeholder.generator>[1],
        {} as Parameters<typeof placeholder.generator>[2],
      ),
    ).toBe('');
  });

  it('carries its extension and mutator, which the workspace registers', () => {
    expect(
      placeholder.definition.extensions?.map(extension =>
        typeof extension === 'string' ? extension : extension.name,
      ),
    ).toEqual([PLACEHOLDER_OUTLINE_EXTENSION]);
    expect(placeholder.definition.mutator?.name).toBe(PLACEHOLDER_MUTATOR);
  });

  it('keeps the like block through save and load, and saves nothing without one', () => {
    const block = {} as PlaceholderBlock;
    expect(placeholderMutator.saveExtraState.call(block)).toBeNull();
    placeholderMutator.loadExtraState.call(block, {like: LIKE});
    expect(block.like).toEqual(LIKE);
    expect(placeholderMutator.saveExtraState.call(block)).toEqual({like: LIKE});
  });
});
