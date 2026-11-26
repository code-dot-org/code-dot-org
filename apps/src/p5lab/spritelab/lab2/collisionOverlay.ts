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
  /** A body and a block touch by touchesWall. For a sprite that is not a
      player, "when touches" can also fire while this is false. */
  touching: boolean;
}

/** Each block's cell and each sprite's body, each marked with whether
    touchesWall holds for it. */
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
