import placeholder, {
  PLACEHOLDER_MUTATOR,
  PLACEHOLDER_OUTLINE_EXTENSION,
  PlaceholderBlock,
  placeholderMutator,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/placeholder';

const LIKE = {type: 'gamelab_spriteSay', fields: {SPEECH: 'hi'}};

describe('placeholder block', () => {
  it('generates no code: a slot runs nothing', () => {
    expect(
      placeholder.generator(
        {} as Parameters<typeof placeholder.generator>[0],
        {} as Parameters<typeof placeholder.generator>[1]
      )
    ).toBe('');
  });

  it('names its extension and mutator so setup can register them', () => {
    expect(placeholder.definition.extensions).toEqual([
      PLACEHOLDER_OUTLINE_EXTENSION,
    ]);
    expect(placeholder.definition.mutator).toBe(PLACEHOLDER_MUTATOR);
  });

  it('keeps the like block through save and load, and saves nothing without one', () => {
    const block = {} as PlaceholderBlock;
    expect(placeholderMutator.saveExtraState.call(block)).toBeNull();
    placeholderMutator.loadExtraState.call(block, {like: LIKE});
    expect(block.like).toEqual(LIKE);
    expect(placeholderMutator.saveExtraState.call(block)).toEqual({like: LIKE});
  });
});
