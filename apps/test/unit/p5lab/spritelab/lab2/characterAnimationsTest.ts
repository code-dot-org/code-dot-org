import {
  AnimationPoses,
  CHARACTER_POSES,
  jumpFrame,
  nextFacing,
  orderedPoseKeys,
  pickPose,
  poseForFrame,
  poseFrame,
  poseFrameDelay,
  poseKey,
  posesByImageName,
  teeterFrame,
  teeterTicks,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

const fullSet: AnimationPoses = {
  'stand-right': {start: 0, count: 2, frameDelay: 15},
  'walk-right': {start: 2, count: 8, frameDelay: 3},
  'jump-right': {start: 10, count: 2, frameDelay: 8},
  'stand-left': {start: 12, count: 2, frameDelay: 15},
  'walk-left': {start: 14, count: 8, frameDelay: 3},
  'jump-left': {start: 22, count: 2, frameDelay: 8},
};

describe('SpriteLab2 characterAnimations', () => {
  it('orders pose keys right-facing first, skipping poses a set lacks', () => {
    expect(orderedPoseKeys(fullSet)).toEqual([
      'stand-right',
      'walk-right',
      'jump-right',
      'stand-left',
      'walk-left',
      'jump-left',
    ]);
    expect(orderedPoseKeys({'walk-left': fullSet['walk-left']})).toEqual([
      'walk-left',
    ]);
    expect(CHARACTER_POSES.map(p => p.pose)).toEqual(['stand', 'walk', 'jump']);
  });

  it('indexes character sets by image name and skips plain images', () => {
    const index = posesByImageName({
      orderedKeys: ['a', 'b'],
      propsByKey: {a: {name: 'hero', poses: fullSet}, b: {name: 'tree'}},
    });
    expect(index.get('hero')).toBe(fullSet);
    expect(index.has('tree')).toBe(false);
  });

  it('picks the pose for the motion, facing the way the sprite faces', () => {
    const pick = (
      moving: boolean,
      airborne: boolean,
      facing: 'right' | 'left'
    ) => pickPose(fullSet, {moving, airborne, facing});
    expect(pick(false, false, 'right')).toMatchObject({key: 'stand-right'});
    expect(pick(true, false, 'left')).toMatchObject({
      key: 'walk-left',
      pose: 'walk',
      facing: 'left',
      range: fullSet['walk-left'],
    });
    // Off the ground beats moving.
    expect(pick(true, true, 'right')).toMatchObject({key: 'jump-right'});
  });

  it('holds back in the jump frames when stopped at an edge, once through', () => {
    const still = {moving: false, airborne: false, facing: 'left' as const};
    expect(pickPose(fullSet, {...still, teetering: true})).toMatchObject({
      key: 'jump-left',
    });
    // Moving again ends it.
    expect(
      pickPose(fullSet, {...still, teetering: true, moving: true})
    ).toMatchObject({
      key: 'walk-left',
    });
    const range = fullSet['jump-right']!;
    expect(teeterTicks(range)).toBe(16);
    expect([0, 7, 8, 15, 40].map(tick => teeterFrame(range, tick))).toEqual([
      10, 10, 11, 11, 11,
    ]);
  });

  it('falls back to standing the same way before anything facing the other way', () => {
    const noLeftWalk = {...fullSet};
    delete noLeftWalk[poseKey('walk', 'left')];
    expect(
      pickPose(noLeftWalk, {moving: true, airborne: false, facing: 'left'})
    ).toMatchObject({key: 'stand-left'});
    expect(
      pickPose(
        {'walk-right': fullSet['walk-right']},
        {moving: true, airborne: false, facing: 'left'}
      )
    ).toMatchObject({key: 'walk-right', facing: 'right'});
    expect(
      pickPose({}, {moving: true, airborne: false, facing: 'left'})
    ).toBeUndefined();
  });

  it('steps through a pose range at its frame delay and wraps', () => {
    const walk = fullSet['walk-right']!;
    expect(poseFrame(walk, 0)).toBe(2);
    expect(poseFrame(walk, 2)).toBe(2);
    expect(poseFrame(walk, 3)).toBe(3);
    expect(poseFrame(walk, 23)).toBe(9);
    expect(poseFrame(walk, 24)).toBe(2);
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

  it('paces a pose so any frame count keeps its cycle time', () => {
    const walk = CHARACTER_POSES.find(p => p.pose === 'walk')!;
    const cycle = walk.frameCount * walk.frameDelay;
    expect(poseFrameDelay('walk', walk.frameCount)).toBe(walk.frameDelay);
    expect(poseFrameDelay('walk', cycle / 3)).toBe(3);
    expect(poseFrameDelay('walk', cycle * 4)).toBe(1);
  });

  it('finds which pose a sheet frame belongs to', () => {
    expect(poseForFrame(fullSet, 0)).toEqual({
      pose: 'stand',
      facing: 'right',
      frame: 0,
    });
    expect(poseForFrame(fullSet, 5)).toEqual({
      pose: 'walk',
      facing: 'right',
      frame: 3,
    });
    expect(poseForFrame(fullSet, 23)).toEqual({
      pose: 'jump',
      facing: 'left',
      frame: 1,
    });
    expect(poseForFrame(fullSet, 24)).toBeUndefined();
  });
});
