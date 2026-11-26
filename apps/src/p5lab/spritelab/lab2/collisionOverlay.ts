// The collision boxes overlay: a way to see what the platform physics and
// the "when touches" block measure. It is off unless the page's URL has
// ?collision-boxes=true or Alt+Shift+T turns it on.

import {queryParams} from '@cdo/apps/code-studio/utils';

import {
  bodyBox,
  CollisionBox,
  PhysicsBox,
  touchesWall,
  wallBox,
} from './platformPhysics';

export interface OverlayBox extends CollisionBox {
  kind: 'wall' | 'body';
  /** In a touch that "when touches" reports between a sprite and a block. */
  touching: boolean;
}

/** Each block's cell and each other sprite's body, as the physics and
    touches with blocks measure them. */
export function collisionOverlayBoxes(
  sprites: PhysicsBox[],
  walls: PhysicsBox[]
): OverlayBox[] {
  return [
    ...walls.map(wall => ({
      ...wallBox(wall),
      kind: 'wall' as const,
      touching: sprites.some(sprite => touchesWall(sprite, wall)),
    })),
    ...sprites.map(sprite => ({
      ...bodyBox(sprite),
      kind: 'body' as const,
      touching: walls.some(wall => touchesWall(sprite, wall)),
    })),
  ];
}

export function collisionBoxesRequested(): boolean {
  return queryParams('collision-boxes') === 'true';
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
