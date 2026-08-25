import {
  CHARACTER_BASE_NAME_MAX_LENGTH,
  CHARACTER_POSES,
  characterAnimationName,
  CharacterFacing,
  CharacterPose,
  indexCharacterSets,
  isBaseRole,
  jumpFrame,
  memberKey,
  nextFacing,
  pickCharacterAnimation,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {IMAGE_NAME_MAX_LENGTH} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';

const fullSet = {
  'stand-right': 'hero',
  'stand-left': 'hero standing left',
  'walk-right': 'hero walking right',
  'walk-left': 'hero walking left',
  'jump-right': 'hero jumping right',
  'jump-left': 'hero jumping left',
};

describe('SpriteLab2 characterAnimations', () => {
  it('names the base after the character and the rest after their role', () => {
    expect(
      characterAnimationName('hero', {pose: 'stand', facing: 'right'})
    ).toBe('hero');
    expect(characterAnimationName('hero', {pose: 'walk', facing: 'left'})).toBe(
      'hero walking left'
    );
    expect(isBaseRole({pose: 'stand', facing: 'right'})).toBe(true);
    expect(isBaseRole({pose: 'stand', facing: 'left'})).toBe(false);
  });

  it('leaves every member name within the image name limit', () => {
    const base = 'x'.repeat(CHARACTER_BASE_NAME_MAX_LENGTH);
    CHARACTER_POSES.forEach(({pose}) => {
      (['right', 'left'] as const).forEach(facing => {
        expect(
          characterAnimationName(base, {pose, facing}).length
        ).toBeLessThanOrEqual(IMAGE_NAME_MAX_LENGTH);
      });
    });
  });

  it('indexes every member name to its whole set', () => {
    const role = (id: string, pose: CharacterPose, facing: CharacterFacing) =>
      ({id, pose, facing} as const);
    const list = {
      orderedKeys: ['a', 'b', 'c', 'd'],
      propsByKey: {
        a: {name: 'hero', character: role('h', 'stand', 'right')},
        b: {name: 'hero walking right', character: role('h', 'walk', 'right')},
        c: {name: 'tree'},
        d: {name: 'cat', character: role('c', 'stand', 'right')},
      },
    };
    const index = indexCharacterSets(list);
    expect(index.get('hero')).toEqual({
      'stand-right': 'hero',
      'walk-right': 'hero walking right',
    });
    expect(index.get('hero walking right')).toBe(index.get('hero'));
    expect(index.get('cat')).toEqual({'stand-right': 'cat'});
    expect(index.has('tree')).toBe(false);
  });

  it('picks the pose for the motion, facing the way the sprite faces', () => {
    const pick = (
      moving: boolean,
      airborne: boolean,
      facing: 'right' | 'left'
    ) => pickCharacterAnimation(fullSet, {moving, airborne, facing});
    expect(pick(false, false, 'right')).toEqual({name: 'hero', pose: 'stand'});
    expect(pick(true, false, 'left')).toEqual({
      name: 'hero walking left',
      pose: 'walk',
    });
    // Off the ground beats moving.
    expect(pick(true, true, 'right')).toEqual({
      name: 'hero jumping right',
      pose: 'jump',
    });
  });

  it('falls back to standing the same way before anything facing the other way', () => {
    const noLeftWalk = {...fullSet};
    delete (noLeftWalk as Partial<typeof fullSet>)[memberKey('walk', 'left')];
    expect(
      pickCharacterAnimation(noLeftWalk, {
        moving: true,
        airborne: false,
        facing: 'left',
      })
    ).toEqual({name: 'hero standing left', pose: 'stand'});
    expect(
      pickCharacterAnimation(
        {'walk-right': 'only walk'},
        {moving: true, airborne: false, facing: 'left'}
      )
    ).toEqual({name: 'only walk', pose: 'walk'});
    expect(
      pickCharacterAnimation(
        {},
        {moving: true, airborne: false, facing: 'left'}
      )
    ).toBeUndefined();
  });

  it('turns with movement and keeps facing through float noise', () => {
    expect(nextFacing('right', -2)).toBe('left');
    expect(nextFacing('left', 2)).toBe('right');
    expect(nextFacing('left', 0.001)).toBe('left');
    expect(nextFacing('right', 0)).toBe('right');
  });

  it('shows the rising jump frame against gravity and the falling one with it', () => {
    expect(jumpFrame(-5, 0.75)).toBe(0);
    expect(jumpFrame(3, 0.75)).toBe(1);
    // Gravity pointing up: rising is moving down.
    expect(jumpFrame(5, -0.75)).toBe(0);
    expect(jumpFrame(-3, -0.75)).toBe(1);
  });
});
