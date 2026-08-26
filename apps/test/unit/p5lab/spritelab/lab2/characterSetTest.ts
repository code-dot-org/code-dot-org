import {
  basePrompt,
  buildPoses,
  sheetFrames,
  cellSize,
  CHARACTER_SET_FRAME_COUNT,
  framePrompt,
  MAX_SHEET_PIXELS,
  placeFrame,
  planCharacterFrames,
  sheetLayout,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {KEY_COLORS} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';
import {
  CHARACTER_POSES,
  GENERATED_FACINGS,
  poseKey,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

describe('SpriteLab2 characterSet', () => {
  const walkFrames = CHARACTER_POSES.find(p => p.pose === 'walk')!.frameCount;
  const plan = planCharacterFrames();

  it('plans the design plate, then every frame of every pose for each generated facing', () => {
    const perFacing = CHARACTER_POSES.reduce((n, p) => n + p.frameCount, 0);
    expect(plan).toHaveLength(1 + perFacing * GENERATED_FACINGS.length);
    expect(CHARACTER_SET_FRAME_COUNT).toBe(plan.length);
    expect(plan[0]).toMatchObject({
      isBase: true,
      references: [],
      poseFigure: false,
    });
    plan.slice(1).forEach(step => {
      expect(step.isBase).toBe(false);
      expect(step.poseFigure).toBe(true);
    });
    expect(sheetFrames(plan)).toHaveLength(
      perFacing * GENERATED_FACINGS.length
    );
    const keys = new Set(
      sheetFrames(plan).map(p => `${poseKey(p.pose, p.facing)}-${p.frame}`)
    );
    expect(keys.size).toBe(sheetFrames(plan).length);
  });

  it('references only the base, and a mirrored twin when a left frame is generated', () => {
    plan.forEach((step, index) => {
      step.references.forEach(ref => expect(ref.index).toBeLessThan(index));
      if (index > 0) {
        expect(step.references[0].index).toBe(0);
      }
      // Never the frame before: it anchors the pose.
      expect(step.references.length).toBeLessThanOrEqual(2);
      if (step.facing === 'right') {
        expect(step.references.map(r => r.mirrored)).toEqual(
          index > 0 ? [false] : []
        );
      } else {
        expect(step.references.every(r => r.mirrored)).toBe(true);
      }
    });
  });

  it('maps each pose to a contiguous range of sheet frames in plan order', () => {
    const poses = buildPoses(plan);
    const [stand, walk] = CHARACTER_POSES;
    expect(poses['stand-right']).toEqual({
      start: 0,
      count: stand.frameCount,
      frameDelay: stand.frameDelay,
    });
    expect(poses['walk-right']).toEqual({
      start: stand.frameCount,
      count: walk.frameCount,
      frameDelay: walk.frameDelay,
    });
    const frames = sheetFrames(plan);
    const total = Object.values(poses).reduce((n, r) => n + r!.count, 0);
    expect(total).toBe(frames.length);
    Object.entries(poses).forEach(([key, range]) => {
      for (let f = 0; f < range!.count; f++) {
        const step = frames[range!.start + f];
        expect(poseKey(step.pose, step.facing)).toBe(key);
        expect(step.frame).toBe(f);
      }
    });
  });

  it('writes prompts that carry the character, the facing and the key color, and leave the pose to the figure', () => {
    const key = KEY_COLORS.magenta;
    const base = basePrompt('a robot', 'smooth', key);
    expect(base).toContain('a robot');
    expect(base).toContain('right side of the image');
    expect(base).toContain('#FF00FF');
    expect(base).toContain('no shadow');
    expect(base).toContain('no other creatures');
    expect(base).toContain('must contain no pure magenta');
    const step = plan.find(p => p.pose === 'walk' && p.frame === 3)!;
    const frame = framePrompt('a robot', step, 'pixel', KEY_COLORS.green);
    expect(frame).toContain('a robot');
    expect(frame).toContain('faces right');
    expect(frame).toContain('silhouette figure');
    expect(frame).toContain('Take nothing else from the figure');
    expect(frame).toContain('pixel art');
    expect(frame).toContain('#00FF00');
    expect(frame).toContain('no other creatures');
    // No limb-by-limb description: the figure is the pose.
    expect(frame).not.toMatch(/stride|heel|knee|swing/);
    expect(frame).not.toMatch(/[A-Z]{4,}/);
    // The text names the frame in animation's own words.
    expect(frame).toContain(
      `frame 4 of ${walkFrames} of a side-view walk cycle sprite sheet, the up pose`
    );
    // The last walk frame, whatever the cycle length; key names repeat
    // every four frames.
    const last = framePrompt(
      'a robot',
      plan.find(p => p.pose === 'walk' && p.frame === walkFrames - 1)!,
      'smooth',
      key
    );
    expect(last).toContain(`frame ${walkFrames} of ${walkFrames}`);
    expect(last).toContain(
      `the ${['contact', 'down', 'passing', 'up'][(walkFrames - 1) % 4]} pose`
    );
    expect(
      framePrompt(
        'a robot',
        plan.find(p => p.pose === 'jump' && p.frame === 1)!,
        'smooth',
        key
      )
    ).toContain('the falling frame of a jump');
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
