import * as BlocklyCore from 'blockly/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {RuntimeAnimationList} from '../../types';
import {
  BlockImageField,
  CostumeField,
  refreshAnimationDropdownThumbnails,
} from '../imagePickerFields';
import {setImageSource} from '../imageSource';

// Isolated from the lab store and the thumbnail cache so the test builds
// only the fields.
vi.mock('../../redux/store', () => ({
  default: {getState: () => ({lab: {}}), dispatch: vi.fn()},
}));
vi.mock('../../imageTrim', () => ({
  getImageThumbnail: () => undefined,
}));

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
  propsByKey: Record<string, {name: string; categories: string[]}>;
} = fullList;

beforeEach(() => {
  setImageSource({
    animationList: () => animationList as unknown as RuntimeAnimationList,
    imageUrl: key => `url:${key}`,
  });
});

describe('image picker fields', () => {
  it('lists costumes newest-first', () => {
    const field = CostumeField.fromJson();
    expect(field.getOptions(false).map(option => option[1])).toEqual([
      '"rival"',
      '"hero"',
    ]);
  });

  it('defaults a fresh costume field to the newest sprite', () => {
    expect(CostumeField.fromJson().getValue()).toBe('"rival"');
  });

  it('defaults a fresh block field to the newest block', () => {
    expect(BlockImageField.fromJson().getValue()).toBe('"brick"');
  });

  // A flyout-only toolbox builds its blocks at injection, before images
  // load, so the refresh must reach the flyout's workspace as well.
  it('refreshes fields in the main workspace and both flyouts', () => {
    const fields = [
      CostumeField.fromJson(),
      CostumeField.fromJson(),
      CostumeField.fromJson(),
    ];
    const spies = fields.map(field =>
      vi.spyOn(field, 'refreshSelectedOption').mockImplementation(() => {}),
    );
    const workspaceOf = (field: unknown) => ({
      getAllBlocks: () => [{inputList: [{fieldRow: [field]}]}],
    });
    const flyoutOf = (field: unknown) => ({
      getWorkspace: () => workspaceOf(field),
    });
    BlocklyCore.common.setMainWorkspace({
      ...workspaceOf(fields[0]),
      getFlyout: () => flyoutOf(fields[1]),
      getToolbox: () => ({getFlyout: () => flyoutOf(fields[2])}),
    } as unknown as BlocklyCore.WorkspaceSvg);
    refreshAnimationDropdownThumbnails();
    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
  });

  describe('followList', () => {
    afterEach(() => {
      animationList = fullList;
    });

    it('keeps a value the list still has', () => {
      const field = CostumeField.fromJson();
      field.setValue('"hero"');
      field.followList();
      expect(field.getValue()).toBe('"hero"');
    });

    it('moves off a value the list lost', () => {
      const field = CostumeField.fromJson();
      field.setValue('"hero"');
      animationList = {
        orderedKeys: ['rival'],
        propsByKey: {rival: {name: 'rival', categories: []}},
      };
      field.followList();
      expect(field.getValue()).toBe('"rival"');
    });

    it('lands on the placeholder when every image is gone', () => {
      const field = CostumeField.fromJson();
      field.setValue('"hero"');
      animationList = {orderedKeys: [], propsByKey: {}};
      field.followList();
      expect(field.getValue()).toBe('null');
    });
  });
});
