import {
  basePrompt,
  buildPoses,
  cellSize,
  CHARACTER_SET_FRAME_COUNT,
  framePrompt,
  MAX_SHEET_PIXELS,
  placeFrame,
  planCharacterFrames,
  POSE_FRAME_DESCRIPTIONS,
  sheetLayout,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {
  CHARACTER_POSES,
  poseKey,
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
      plan.map(p => `${poseKey(p.pose, p.facing)}-${p.frame}`)
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
    expect(plan[walkLeft2].references).toEqual([
      {index: 0, mirrored: true},
      {index: walkRight2, mirrored: true},
    ]);
    expect(plan[walkRight2].references).toEqual([{index: 0, mirrored: false}]);
  });

  it('maps each pose to a contiguous range of sheet frames in plan order', () => {
    const poses = buildPoses(plan);
    expect(poses['stand-right']).toEqual({start: 0, count: 2, frameDelay: 15});
    expect(poses['walk-right']).toEqual({start: 2, count: 8, frameDelay: 3});
    const total = Object.values(poses).reduce((n, r) => n + r!.count, 0);
    expect(total).toBe(plan.length);
    Object.entries(poses).forEach(([key, range]) => {
      for (let f = 0; f < range!.count; f++) {
        const step = plan[range!.start + f];
        expect(poseKey(step.pose, step.facing)).toBe(key);
        expect(step.frame).toBe(f);
      }
    });
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

  it('sizes the cell to the largest frame', () => {
    expect(
      cellSize([
        {left: 10, top: 10, right: 29, bottom: 49}, // 20 x 40
        {left: 0, top: 0, right: 29, bottom: 19}, // 30 x 20
        null,
      ])
    ).toEqual({x: 30, y: 40});
    expect(cellSize([null])).toEqual({x: 1, y: 1});
  });

  it('lays a near-square grid and scales it down to the pixel budget', () => {
    const small = sheetLayout(24, {x: 100, y: 100});
    expect(small).toMatchObject({columns: 5, rows: 5, scale: 1});
    expect(small.width).toBe(500);
    expect(small.height).toBe(500);
    // 24 model-sized frames: 5x5 cells of 884x964 is 21M pixels; scaled to fit.
    const big = sheetLayout(24, {x: 884, y: 964});
    expect(big.scale).toBeLessThan(1);
    expect(big.width * big.height).toBeLessThanOrEqual(MAX_SHEET_PIXELS);
    expect(big.cell.x / big.cell.y).toBeCloseTo(884 / 964, 1);
    expect(big.width).toBe(big.columns * big.cell.x);
  });

  it('stands each frame on its cell floor, centered, in row-major cells', () => {
    const layout = sheetLayout(6, {x: 30, y: 40});
    expect(layout).toMatchObject({columns: 3, rows: 2});
    // Fifth frame: second row, second column; content 20 x 30.
    expect(placeFrame(layout, 4, 20, 30)).toEqual({x: 30 + 5, y: 40 + 10});
    expect(placeFrame(layout, 0, 30, 40)).toEqual({x: 0, y: 0});
  });
});
