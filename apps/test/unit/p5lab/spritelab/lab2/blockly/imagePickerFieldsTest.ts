// Isolated from the store, the thumbnail cache, and the legacy animation
// module so the test builds only the fields.
jest.mock('@cdo/apps/redux', () => ({getStore: () => mockStore}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/imageTrim', () => ({
  getImageThumbnail: () => undefined,
}));
jest.mock('@cdo/apps/p5lab/redux/animationList', () => ({
  animationSourceUrl: (key: string) => `url:${key}`,
}));

import type {FieldConfig} from 'blockly/core';

import {
  BlockImageField,
  CostumeField,
  FIRST_CHARACTER_OPTION,
  refreshAnimationDropdownThumbnails,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields';

// Newest-first, as Sprite Lab keeps it: 'hero' was made first, 'rival'
// second, 'brick' (a block) last.
const mockStore = {
  getState: () => ({
    animationList: {
      orderedKeys: ['brick', 'rival', 'hero'],
      propsByKey: {
        brick: {name: 'brick', categories: ['blocks']},
        rival: {name: 'rival', categories: []},
        hero: {name: 'hero', categories: []},
      },
    },
  }),
};

describe('image picker fields', () => {
  it('lists costumes newest-first', () => {
    const field = CostumeField.fromJson({});
    expect(field.getOptions(false).map(option => option[1])).toEqual([
      '"rival"',
      '"hero"',
    ]);
  });

  it('defaults a fresh costume field to the newest sprite', () => {
    expect(CostumeField.fromJson({}).getValue()).toBe('"rival"');
  });

  it('starts on the first character when the block asks for it', () => {
    const config = {[FIRST_CHARACTER_OPTION]: true} as FieldConfig;
    const field = CostumeField.fromJson(config);
    expect(field.getValue()).toBe('"hero"');
  });

  it('defaults a fresh block field to the newest block', () => {
    expect(BlockImageField.fromJson({}).getValue()).toBe('"brick"');
  });

  // A flyout-only toolbox builds its blocks at injection, before images
  // load, so the refresh must reach the flyout's workspace as well.
  it('refreshes fields in the main workspace and both flyouts', () => {
    const fields = [
      CostumeField.fromJson({}),
      CostumeField.fromJson({}),
      CostumeField.fromJson({}),
    ];
    const spies = fields.map(field =>
      jest.spyOn(field, 'refreshSelectedOption').mockImplementation(() => {})
    );
    const workspaceOf = (field: unknown) => ({
      getAllBlocks: () => [{inputList: [{fieldRow: [field]}]}],
    });
    const flyoutOf = (field: unknown) => ({
      getWorkspace: () => workspaceOf(field),
    });
    (globalThis as {Blockly?: unknown}).Blockly = {
      getMainWorkspace: () => ({
        ...workspaceOf(fields[0]),
        getFlyout: () => flyoutOf(fields[1]),
        getToolbox: () => ({getFlyout: () => flyoutOf(fields[2])}),
      }),
    };
    refreshAnimationDropdownThumbnails();
    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
  });
});
