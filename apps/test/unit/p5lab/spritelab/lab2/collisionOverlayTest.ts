import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  collisionOverlayBoxes,
  isCollisionBoxesShortcut,
} from '@cdo/apps/p5lab/spritelab/lab2/collisionOverlay';

jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: jest.fn()}));

const box = (x: number, y: number, width: number, height: number) => ({
  position: {x, y},
  width,
  height,
  scale: 1,
});

describe('collisionOverlay', () => {
  it("gives each block's cell and each sprite's body, marking the ones that touch", () => {
    // A 50px block at (75, 325), a 25x50 sprite standing on it, and a
    // second sprite well away from it.
    const walls = [box(75, 325, 50, 50)];
    const sprites = [box(75, 275, 25, 50), box(300, 100, 25, 50)];
    expect(collisionOverlayBoxes(sprites, walls)).toEqual([
      {kind: 'wall', touching: true, x: 75, y: 325, halfW: 25, halfH: 25},
      {kind: 'body', touching: true, x: 75, y: 280, halfW: 10, halfH: 20},
      {kind: 'body', touching: false, x: 300, y: 105, halfW: 10, halfH: 20},
    ]);
  });

  it('marks two sprites whose bodies overlap, and neither when only their pictures overlap', () => {
    // 25x50 sprites have 20x40 bodies. 24px apart, the pictures overlap by
    // 1px and the bodies are 4px apart; 19px apart, the bodies overlap.
    const touching = (dx: number) =>
      collisionOverlayBoxes(
        [box(100, 100, 25, 50), box(100 + dx, 100, 25, 50)],
        []
      ).map(b => b.touching);
    expect(touching(24)).toEqual([false, false]);
    expect(touching(19)).toEqual([true, true]);
  });

  it('leaves an object unmarked for the block it rests on when ignoresFooting is true for it', () => {
    const walls = [box(75, 325, 50, 50)];
    const object = box(75, 275, 25, 50);
    const marks = (sprites: ReturnType<typeof box>[]) =>
      collisionOverlayBoxes(
        sprites,
        walls,
        undefined,
        sprite => sprite === object
      ).map(b => b.touching);
    // The block, then the object.
    expect(marks([object])).toEqual([false, false]);
    // A second sprite standing on the block and overlapping the object marks
    // all three.
    expect(marks([object, box(85, 275, 25, 50)])).toEqual([true, true, true]);
  });

  it('still marks a sprite pressed against the side of a block when ignoresFooting is true for it', () => {
    // The block's right edge is at x 100; the body is 20px wide.
    const boxes = collisionOverlayBoxes(
      [box(110, 325, 25, 50)],
      [box(75, 325, 50, 50)],
      undefined,
      () => true
    );
    expect(boxes.map(b => b.touching)).toEqual([true, true]);
  });

  it('marks nothing when a sprite only brushes a corner', () => {
    const walls = [box(75, 325, 50, 50)];
    // 3px of the body over the block's top-left corner on both axes.
    const boxes = collisionOverlayBoxes([box(43, 278, 25, 50)], walls);
    expect(boxes.map(b => b.touching)).toEqual([false, false]);
  });

  it('measures a sprite under upward gravity by a body anchored at its top', () => {
    // The sprite rests under the block: picture top on the underside (350).
    const walls = [box(75, 325, 50, 50)];
    const sprites = [box(75, 375, 25, 50)];
    expect(collisionOverlayBoxes(sprites, walls, () => -0.75)).toEqual([
      {kind: 'wall', touching: true, x: 75, y: 325, halfW: 25, halfH: 25},
      {kind: 'body', touching: true, x: 75, y: 370, halfW: 10, halfH: 20},
    ]);
    // Measured as if gravity were down, the body is 10px below the block.
    expect(collisionOverlayBoxes(sprites, walls)[1].touching).toBe(false);
  });

  // Whether the overlay is shown is module state, so each case loads the
  // module afresh.
  const freshOverlay = (param: string | undefined) => {
    (queryParams as jest.Mock).mockImplementation((name: string) =>
      name === 'collision-boxes' ? param : undefined
    );
    let overlay!: typeof import('@cdo/apps/p5lab/spritelab/lab2/collisionOverlay');
    jest.isolateModules(() => {
      overlay = require('@cdo/apps/p5lab/spritelab/lab2/collisionOverlay');
    });
    return overlay;
  };

  it('starts shown with ?collision-boxes=true, and hidden without it', () => {
    expect(freshOverlay(undefined).collisionBoxesShown()).toBe(false);
    expect(freshOverlay('true').collisionBoxesShown()).toBe(true);
  });

  it('toggles from either start', () => {
    const hidden = freshOverlay(undefined);
    hidden.toggleCollisionBoxes();
    expect(hidden.collisionBoxesShown()).toBe(true);
    hidden.toggleCollisionBoxes();
    expect(hidden.collisionBoxesShown()).toBe(false);
    const shown = freshOverlay('true');
    shown.toggleCollisionBoxes();
    expect(shown.collisionBoxesShown()).toBe(false);
  });

  it('takes Alt+Shift+T as its shortcut, by the physical key', () => {
    const key = {
      altKey: true,
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      code: 'KeyT',
    };
    expect(isCollisionBoxesShortcut(key)).toBe(true);
    expect(isCollisionBoxesShortcut({...key, shiftKey: false})).toBe(false);
    expect(isCollisionBoxesShortcut({...key, altKey: false})).toBe(false);
    expect(isCollisionBoxesShortcut({...key, ctrlKey: true})).toBe(false);
    expect(isCollisionBoxesShortcut({...key, code: 'KeyB'})).toBe(false);
  });
});
