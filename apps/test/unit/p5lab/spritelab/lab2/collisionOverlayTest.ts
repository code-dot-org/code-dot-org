import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  collisionBoxesRequested,
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

  it('marks nothing when a sprite only brushes a corner', () => {
    const walls = [box(75, 325, 50, 50)];
    // 3px of the body over the block's top-left corner on both axes.
    const boxes = collisionOverlayBoxes([box(43, 278, 25, 50)], walls);
    expect(boxes.map(b => b.touching)).toEqual([false, false]);
  });

  it('is requested by ?collision-boxes=true', () => {
    (queryParams as jest.Mock).mockReturnValue(undefined);
    expect(collisionBoxesRequested()).toBe(false);
    (queryParams as jest.Mock).mockImplementation((name: string) =>
      name === 'collision-boxes' ? 'true' : undefined
    );
    expect(collisionBoxesRequested()).toBe(true);
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
