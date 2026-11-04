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
  applyLevelDefaults,
  BlockImageField,
  CostumeField,
  refreshAnimationDropdownThumbnails,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields';

// Newest-first, as Sprite Lab keeps it: 'hero' was made first, 'rival'
// second, 'brick' (a block) last.
const fullList = {
  orderedKeys: ['brick', 'rival', 'hero'],
  propsByKey: {
    brick: {name: 'brick', categories: ['blocks']},
    rival: {name: 'rival', categories: []},
    hero: {name: 'hero', categories: []},
  },
};
let animationList: {
  orderedKeys: string[];
  propsByKey: Record<
    string,
    {name: string; categories: string[]; role?: string}
  >;
} = fullList;
let imageRoleDefaults: Record<string, string> | undefined;
const mockStore = {
  getState: () => ({
    animationList,
    lab: {levelProperties: {imageRoleDefaults}},
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

  describe('followList', () => {
    afterEach(() => {
      animationList = fullList;
    });

    it('keeps a value the list still has', () => {
      const field = CostumeField.fromJson({});
      field.setValue('"hero"');
      field.followList();
      expect(field.getValue()).toBe('"hero"');
    });

    it('moves off a value the list lost', () => {
      const field = CostumeField.fromJson({});
      field.setValue('"hero"');
      animationList = {
        orderedKeys: ['rival'],
        propsByKey: {rival: {name: 'rival', categories: []}},
      };
      field.followList();
      expect(field.getValue()).toBe('"rival"');
    });

    it('lands on the placeholder when every image is gone', () => {
      const field = CostumeField.fromJson({});
      field.setValue('"hero"');
      animationList = {orderedKeys: [], propsByKey: {}};
      field.followList();
      expect(field.getValue()).toBe('null');
    });
  });

  describe('level defaults off screen', () => {
    // A costume field on a set-as-player block, never rendered.
    const onBlock = (field: InstanceType<typeof CostumeField>) => {
      (field as unknown as {getSourceBlock: () => unknown}).getSourceBlock =
        () => ({
          type: 'spritelab2_setAsPlatformPlayer',
          outputConnection: null,
          getParent: () => null,
        });
      return field;
    };
    beforeEach(() => {
      animationList = {
        orderedKeys: ['rival', 'hero'],
        propsByKey: {
          rival: {name: 'rival', categories: [], role: 'friend'},
          hero: {name: 'hero', categories: [], role: 'hero'},
        },
      };
      imageRoleDefaults = {sprite: 'hero'};
    });
    afterEach(() => {
      animationList = fullList;
      imageRoleDefaults = undefined;
    });

    it('takes the level default when the source saved no value', () => {
      const field = onBlock(CostumeField.fromJson({}));
      expect(field.getValue()).toBe('"rival"');
      field.applyLevelDefaultUnlessLoaded();
      expect(field.getValue()).toBe('"hero"');
    });

    it('keeps a saved value', () => {
      const field = onBlock(CostumeField.fromJson({}));
      field.loadState('"rival"');
      field.applyLevelDefaultUnlessLoaded();
      expect(field.getValue()).toBe('"rival"');
    });

    it('reaches every dropdown in a workspace', () => {
      const fresh = onBlock(CostumeField.fromJson({}));
      const saved = onBlock(CostumeField.fromJson({}));
      saved.loadState('"rival"');
      applyLevelDefaults({
        getAllBlocks: () => [
          {inputList: [{fieldRow: [fresh]}, {fieldRow: [saved]}]},
        ],
      } as never);
      expect(fresh.getValue()).toBe('"hero"');
      expect(saved.getValue()).toBe('"rival"');
    });
  });
});
