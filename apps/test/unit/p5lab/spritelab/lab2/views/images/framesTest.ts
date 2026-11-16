import {CHARACTER_STRIP_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  FRAME_LABELS,
  frameCount,
  frameGroups,
} from '@cdo/apps/p5lab/spritelab/lab2/views/images/frames';

describe('frames', () => {
  it('names the five frames of a strip, the standing one being the base', () => {
    expect(FRAME_LABELS).toEqual([
      'Idle',
      'Standing',
      'Walk',
      'Jump up',
      'Jump down',
    ]);
  });

  it('groups a strip by pose, listing the shared standing frame once', () => {
    expect(frameGroups(CHARACTER_STRIP_POSES, 5)).toEqual([
      {key: 'stand-right', title: 'Idle', frames: [0, 1]},
      {key: 'walk-right', title: 'Walk', frames: [2]},
      {key: 'jump-right', title: 'Jump', frames: [3, 4]},
    ]);
  });

  it('leaves out frames a shorter strip does not hold, and a pose left with none', () => {
    expect(frameGroups(CHARACTER_STRIP_POSES, 3)).toEqual([
      {key: 'stand-right', title: 'Idle', frames: [0, 1]},
      {key: 'walk-right', title: 'Walk', frames: [2]},
    ]);
    expect(
      frameGroups({'walk-left': {start: 0, count: 4, frameDelay: 6}}, 4)
    ).toEqual([{key: 'walk-left', title: 'Walk left', frames: [0, 1, 2, 3]}]);
  });

  it('counts a strip by its cells, five at most', () => {
    expect(frameCount(320, {x: 64, y: 64})).toBe(5);
    expect(frameCount(192, {x: 64, y: 64})).toBe(3);
    expect(frameCount(640, {x: 64, y: 64})).toBe(5);
    expect(frameCount(32, {x: 64, y: 64})).toBe(1);
  });
});
