// The collision boxes overlay: a way to see what the platform physics and
// the "when touches" block measure. It is off unless the page's URL has
// ?collision-boxes=true or Alt+Shift+T turns it on.

import {queryParams} from '@cdo/apps/code-studio/utils';

import {
  bodyBox,
  boxesOverlap,
  CollisionBox,
  PhysicsBox,
  PLATFORM_GRAVITY,
  TOUCH_SLACK,
  touchesWall,
  wallBox,
} from './platformPhysics';

export interface OverlayBox extends CollisionBox {
  kind: 'wall' | 'body';
  /** Two bodies touch when they overlap. A body and a block touch when
      touchesWall holds, unless the sprite only rests on the block and
      `ignoresFooting` is true for it. */
  touching: boolean;
}

/**
 * Each block's cell and each sprite's body, each marked with whether it
 * touches anything. A sprite for which `ignoresFooting` is true is not
 * marked for the block it rests on, nor that block for it: an object placed
 * on a block would keep both marked the whole game.
 */
export function collisionOverlayBoxes<Sprite extends PhysicsBox>(
  sprites: Sprite[],
  walls: PhysicsBox[],
  gravityOf: (sprite: Sprite) => number = () => PLATFORM_GRAVITY,
  ignoresFooting: (sprite: Sprite) => boolean = () => false
): OverlayBox[] {
  const bodies = sprites.map(sprite => bodyBox(sprite, gravityOf(sprite)));
  const restsOn = (body: CollisionBox, wall: PhysicsBox) => {
    const box = wallBox(wall);
    return Math.abs(body.y + body.halfH - (box.y - box.halfH)) <= TOUCH_SLACK;
  };
  const touchesBlock = (sprite: Sprite, wall: PhysicsBox) =>
    touchesWall(sprite, wall, gravityOf(sprite)) &&
    !(ignoresFooting(sprite) && restsOn(bodies[sprites.indexOf(sprite)], wall));
  return [
    ...walls.map(wall => ({
      ...wallBox(wall),
      kind: 'wall' as const,
      touching: sprites.some(sprite => touchesBlock(sprite, wall)),
    })),
    ...sprites.map((sprite, i) => ({
      ...bodies[i],
      kind: 'body' as const,
      touching:
        walls.some(wall => touchesBlock(sprite, wall)) ||
        bodies.some((other, j) => j !== i && boxesOverlap(bodies[i], other)),
    })),
  ];
}

// Whether the overlay is shown. It is module state so that it outlasts the
// game engine: the page makes a new engine for each level.
let shown: boolean | undefined;

export function collisionBoxesShown(): boolean {
  if (shown === undefined) {
    shown = queryParams('collision-boxes') === 'true';
  }
  return shown;
}

export function toggleCollisionBoxes(): void {
  shown = !collisionBoxesShown();
}

/** Alt+Shift+T. `code` is the physical key: with Alt held, some keyboards
    report another character as the key. */
export function isCollisionBoxesShortcut(event: {
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  code: string;
}): boolean {
  return (
    event.altKey &&
    event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    event.code === 'KeyT'
  );
}
