import {
  drawStripCell,
  stripCellOrigin,
  AnimationPoses,
  CHARACTER_POSE_ORDER,
  CHARACTER_STRIP_FRAME_COUNT,
  CHARACTER_STRIP_POSES,
  jumpFrame,
  nextFacing,
  orderedPoseKeys,
  pickPose,
  poseFrame,
  poseStartTick,
  poseKey,
  posesByImageName,
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
    expect(CHARACTER_POSE_ORDER).toEqual(['stand', 'walk', 'jump']);
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

  it('holds back in the jump pose when stopped at an edge, for one play of it', () => {
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
    expect(teeterTicks(fullSet['jump-right']!)).toBe(16);
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

  it('a walk starts on the mid-stride frame and alternates from there', () => {
    const poses = CHARACTER_STRIP_POSES;
    const pick = pickPose(poses, {
      moving: true,
      airborne: false,
      facing: 'right',
    })!;
    const tick = poseStartTick(poses, pick);
    // The first shown frame is the stride, not the shared standing frame.
    expect(poseFrame(pick.range, tick)).toBe(pick.range.start + 1);
    expect(poseFrame(pick.range, tick + pick.range.frameDelay)).toBe(
      pick.range.start
    );
    // Every other pose starts at its first frame.
    const stand = pickPose(poses, {
      moving: false,
      airborne: false,
      facing: 'right',
    })!;
    expect(poseStartTick(poses, stand)).toBe(0);
    const jump = pickPose(poses, {
      moving: false,
      airborne: true,
      facing: 'right',
    })!;
    expect(poseStartTick(poses, jump)).toBe(0);
    // A walk drawn with its own first frame (no shared standing frame)
    // starts there, not one frame in.
    const drawnWalk = {'walk-right': {start: 0, count: 4, frameDelay: 6}};
    const drawnPick = pickPose(drawnWalk, {
      moving: true,
      airborne: false,
      facing: 'right',
    })!;
    expect(poseStartTick(drawnWalk, drawnPick)).toBe(0);
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

  it('cuts one cell of a strip into a canvas of its size', () => {
    const drawImage = jest.fn();
    const getContext = (() =>
      ({
        drawImage,
      } as unknown as CanvasRenderingContext2D)) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(getContext);
    const image = {naturalWidth: 96} as HTMLImageElement;
    const cell = drawStripCell(image, {x: 32, y: 48}, 4);
    expect([cell.width, cell.height]).toEqual([32, 48]);
    // Index 4 of a three-column strip: second row, second column.
    expect(drawImage).toHaveBeenCalledWith(image, 32, 48, 32, 48, 0, 0, 32, 48);
    jest.restoreAllMocks();
  });

  it('the strip: ranges fit, and the standing frame is shared', () => {
    Object.values(CHARACTER_STRIP_POSES).forEach(range => {
      expect(range.start + range.count).toBeLessThanOrEqual(
        CHARACTER_STRIP_FRAME_COUNT
      );
    });
    const stand = CHARACTER_STRIP_POSES['stand-right']!;
    const walk = CHARACTER_STRIP_POSES['walk-right']!;
    // The standing frame ends the idle range and starts the walk range.
    expect(walk.start).toBe(stand.start + stand.count - 1);
    expect(poseFrame(walk, 0)).toBe(walk.start);
    expect(poseFrame(walk, walk.frameDelay)).toBe(walk.start + 1);
    expect(poseFrame(walk, walk.frameDelay * 2)).toBe(walk.start);
    // The jump range follows the walk; teeter holds its falling frame.
    expect(CHARACTER_STRIP_POSES['jump-right']!.start).toBe(
      walk.start + walk.count
    );
  });
});

describe('stripCellOrigin', () => {
  const frame = {x: 64, y: 64};
  it('walks one row of cells left to right', () => {
    expect(stripCellOrigin(320, frame, 0)).toEqual({x: 0, y: 0});
    expect(stripCellOrigin(320, frame, 4)).toEqual({x: 256, y: 0});
  });
  it('wraps to the next row at the image width', () => {
    expect(stripCellOrigin(128, frame, 2)).toEqual({x: 0, y: 64});
    expect(stripCellOrigin(128, frame, 3)).toEqual({x: 64, y: 64});
  });
  it('treats an image narrower than a cell as one column', () => {
    expect(stripCellOrigin(32, frame, 1)).toEqual({x: 0, y: 64});
  });
});
