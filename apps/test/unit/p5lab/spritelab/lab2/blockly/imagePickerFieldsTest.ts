// Isolated from the store, the thumbnail cache, and the legacy animation
// module so the test builds only the fields.
jest.mock('@cdo/apps/redux', () => ({getStore: () => mockStore}));
jest.mock('@cdo/apps/p5lab/spritelab/lab2/imageTrim', () => ({
  getImageThumbnail: () => undefined,
}));
jest.mock('@cdo/apps/p5lab/redux/animationList', () => ({
  animationSourceUrl: (key: string) => `url:${key}`,
}));

import {
  BlockImageField,
  CostumeField,
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

  it('defaults a fresh costume field to the first character made', () => {
    expect(CostumeField.fromJson({}).getValue()).toBe('"hero"');
  });

  it('defaults a fresh block field to the newest block', () => {
    expect(BlockImageField.fromJson({}).getValue()).toBe('"brick"');
  });
});
