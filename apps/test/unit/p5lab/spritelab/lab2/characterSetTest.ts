import {
  basePrompt,
  cellSize,
  CHARACTER_SET_FRAME_COUNT,
  frameOffset,
  framePrompt,
  planCharacterFrames,
  POSE_FRAME_DESCRIPTIONS,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {
  CHARACTER_POSES,
  memberKey,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

describe('SpriteLab2 characterSet', () => {
  const plan = planCharacterFrames();

  it('describes exactly the frames the poses table asks for', () => {
    CHARACTER_POSES.forEach(({pose, frameCount}) => {
      expect(POSE_FRAME_DESCRIPTIONS[pose]).toHaveLength(frameCount);
    });
  });

  it('plans every frame of every pose both ways, the base first', () => {
    const perFacing = CHARACTER_POSES.reduce((n, p) => n + p.frameCount, 0);
    expect(plan).toHaveLength(perFacing * 2);
    expect(CHARACTER_SET_FRAME_COUNT).toBe(plan.length);
    expect(plan[0]).toMatchObject({
      pose: 'stand',
      facing: 'right',
      frame: 0,
      references: [],
    });
    const keys = new Set(
      plan.map(p => `${memberKey(p.pose, p.facing)}-${p.frame}`)
    );
    expect(keys.size).toBe(plan.length);
  });

  it('references only the base and, facing left, the mirrored right-facing twin', () => {
    plan.forEach((step, index) => {
      step.references.forEach(ref => expect(ref.index).toBeLessThan(index));
      if (index > 0) {
        expect(step.references[0].index).toBe(0);
      }
      // Never the frame before: it anchors the pose.
      expect(step.references.length).toBeLessThanOrEqual(2);
    });
    const walkLeft2 = plan.findIndex(
      p => p.pose === 'walk' && p.facing === 'left' && p.frame === 2
    );
    const walkRight2 = plan.findIndex(
      p => p.pose === 'walk' && p.facing === 'right' && p.frame === 2
    );
    // Every reference a left-facing frame sees faces left.
    expect(plan[walkLeft2].references).toEqual([
      {index: 0, mirrored: true},
      {index: walkRight2, mirrored: true},
    ]);
    expect(plan[walkRight2].references).toEqual([{index: 0, mirrored: false}]);
    plan
      .filter(step => step.facing === 'right')
      .forEach(step =>
        step.references.forEach(ref => expect(ref.mirrored).toBe(false))
      );
  });

  it('writes prompts that carry the character, the pose, the facing and the key color', () => {
    const base = basePrompt('a robot', 'smooth');
    expect(base).toContain('a robot');
    expect(base).toContain('faces right');
    expect(base).toContain('single flat color');
    const step = plan.find(p => p.pose === 'jump' && p.facing === 'left')!;
    const frame = framePrompt('a robot', step, 'pixel');
    expect(frame).toContain('a robot');
    expect(frame).toContain('faces left');
    expect(frame).toContain('NEW pose');
    expect(frame).toContain(POSE_FRAME_DESCRIPTIONS.jump[0]);
    expect(frame).toContain('pixel art');
    expect(frame).toContain('same plain flat background color');
  });

  it('sizes the cell to the largest frame and stands each frame on the floor', () => {
    const cell = cellSize([
      {left: 10, top: 10, right: 29, bottom: 49}, // 20 x 40
      {left: 0, top: 0, right: 29, bottom: 19}, // 30 x 20
      null,
    ]);
    expect(cell).toEqual({x: 30, y: 40});
    // The narrow tall frame, third in the strip: centered across, feet down.
    expect(
      frameOffset(cell, {left: 10, top: 10, right: 29, bottom: 49}, 2)
    ).toEqual({
      x: 2 * 30 + 5,
      y: 0,
    });
    expect(
      frameOffset(cell, {left: 0, top: 0, right: 29, bottom: 19}, 0)
    ).toEqual({
      x: 0,
      y: 20,
    });
    expect(cellSize([null])).toEqual({x: 1, y: 1});
  });
});
