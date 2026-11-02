import {
  PlaceholderBlock,
  placeholderMutator,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/placeholder';

describe('placeholderMutator', () => {
  const like = {type: 'spritelab2_setAsPlatformPlayer'};

  it('keeps the like block and the blank flag, and saves nothing for a bare one', () => {
    const block = {} as PlaceholderBlock;
    placeholderMutator.loadExtraState.call(block, {like, blank: true});
    expect(placeholderMutator.saveExtraState.call(block)).toEqual({
      like,
      blank: true,
    });
    placeholderMutator.loadExtraState.call(block, {like});
    expect(placeholderMutator.saveExtraState.call(block)).toEqual({like});
    placeholderMutator.loadExtraState.call(block, {});
    expect(placeholderMutator.saveExtraState.call(block)).toBeNull();
  });
});
