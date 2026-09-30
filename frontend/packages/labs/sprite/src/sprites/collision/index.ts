import type p5 from 'p5';

import {getContext} from '../context';
import type {Group} from '../Group';
import type {Sprite} from '../Sprite';

import {pointBox, separation} from './box';
import {ensureCollider} from './collider';
import {
  type CollisionCallback,
  type CollisionTarget,
  type CollisionType,
  runCollision,
} from './pair';

export {
  drawDebugCollider,
  refreshSweptCollider,
  updateCollider,
} from './collider';
export type {CollisionCallback, CollisionTarget} from './pair';

/** The instance members collision.md specifies. */
export interface CollisionMembers {
  mouseIsOver(sprite: Sprite | undefined | null): boolean;
  mousePressedOver(sprite: Sprite | undefined | null): boolean;
}

export type SpriteCollisionMethod = (
  self: Sprite,
  target: CollisionTarget,
  callback?: CollisionCallback,
) => boolean;

export type GroupCollisionMethod = (
  target: CollisionTarget,
  callback?: CollisionCallback,
) => boolean;

function method(type: CollisionType): SpriteCollisionMethod {
  return (self, target, callback) => runCollision(type, self, target, callback);
}

export const overlap = method('overlap');
export const collide = method('collide');
export const displace = method('displace');
export const bounce = method('bounce');
export const bounceOff = method('bounceOff');

const GROUP_METHODS = [
  'overlap',
  'collide',
  'displace',
  'bounce',
  'bounceOff',
] as const;

/** COL-22: gives `group` its collision methods, bound to it for good. */
export function installGroupCollision(group: Group): void {
  for (const name of GROUP_METHODS) {
    const run: GroupCollisionMethod = (target, callback) => {
      let any = false;
      for (let i = 0; i < group.length; i++) {
        if (group[i][name](target, callback)) {
          any = true;
        }
      }
      return any;
    };
    const names = name === 'overlap' ? ['overlap', 'isTouching'] : [name];
    for (const key of names) {
      Object.defineProperty(group, key, {
        value: run,
        writable: true,
        configurable: true,
      });
    }
  }
}

/** Called once at attachment, before setup. */
export function installCollision(p: p5): CollisionMembers {
  const mouseIsOver = (sprite: Sprite | undefined | null): boolean => {
    if (!sprite) {
      return false;
    }
    const collider = ensureCollider(sprite);
    const camera = getContext(p).camera;
    const point = camera.active
      ? pointBox(camera.mouseX, camera.mouseY)
      : pointBox(p.mouseX, p.mouseY);
    return separation(point, collider.box).overlaps;
  };
  const mousePressedOver = (sprite: Sprite | undefined | null): boolean => {
    // INP-27: the raw pressed state, not the tracked edge state.
    const raw = p as unknown as {mouseIsPressed: boolean; touchIsDown: boolean};
    const down = !!raw.mouseIsPressed || !!raw.touchIsDown;
    return down && mouseIsOver(sprite);
  };
  return {mouseIsOver, mousePressedOver};
}
