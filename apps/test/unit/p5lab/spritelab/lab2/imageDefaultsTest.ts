import {
  defaultImageName,
  defaultRole,
} from '@cdo/apps/p5lab/spritelab/lab2/imageDefaults';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';

// Newest-first, as Sprite Lab keeps it.
const list = {
  orderedKeys: ['jewel', 'friend', 'hero', 'bg'],
  propsByKey: {
    jewel: {name: 'Jewel', categories: [], role: 'treasure'},
    friend: {name: 'Friend', categories: [], role: 'friend'},
    hero: {name: 'Hero', categories: [], role: 'hero'},
    bg: {name: 'Forest', categories: ['backgrounds'], role: 'story-background'},
  },
} as unknown as RuntimeAnimationList;

describe('defaultRole', () => {
  const defaults = {
    sprite: 'friend',
    gamelab_checkTouching: ['hero', 'friend'],
  };

  it('names the kind-wide role', () => {
    expect(defaultRole(defaults, 'sprite')).toBe('friend');
    expect(defaultRole(defaults, 'background')).toBeUndefined();
  });

  it('lets a block name its slots, falling back to the kind-wide role', () => {
    const on = (index: number) => ({blockType: 'gamelab_checkTouching', index});
    expect(defaultRole(defaults, 'sprite', on(0))).toBe('hero');
    expect(defaultRole(defaults, 'sprite', on(1))).toBe('friend');
    expect(defaultRole(defaults, 'sprite', on(2))).toBe('friend');
    expect(
      defaultRole(defaults, 'sprite', {
        blockType: 'gamelab_spriteSay',
        index: 0,
      })
    ).toBe('friend');
  });

  it('is undefined for a level naming nothing', () => {
    expect(defaultRole(undefined, 'sprite')).toBeUndefined();
  });
});

describe('defaultImageName', () => {
  it('finds the image carrying the role, of the right kind', () => {
    expect(defaultImageName(list, {sprite: 'hero'}, 'sprite')).toBe('Hero');
    expect(
      defaultImageName(list, {background: 'story-background'}, 'background')
    ).toBe('Forest');
  });

  it('is undefined when no image has the role yet', () => {
    expect(
      defaultImageName(list, {sprite: 'villain'}, 'sprite')
    ).toBeUndefined();
    // A role of the wrong kind does not cross over.
    expect(
      defaultImageName(list, {sprite: 'story-background'}, 'sprite')
    ).toBeUndefined();
  });
});
