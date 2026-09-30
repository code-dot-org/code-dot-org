import type p5 from 'p5';

import type {Sprite} from '../Sprite';

import {type Box, corners, orientedBox, pointBox, projectedRadius} from './box';

/** What `sprite.collider` holds once created (COL-3). */
export interface Collider {
  box: Box;
  /** COL-16: the broad-phase box covering the path of the latest update. */
  swept: Box;
}

export function colliderOf(sprite: Sprite): Collider | undefined {
  return sprite.collider as Collider | undefined;
}

/** COL-5: the unscaled base width and height. */
export function baseSize(sprite: Sprite): [number, number] {
  const animation = sprite.animation;
  return animation
    ? [animation.getWidth(), animation.getHeight()]
    : [sprite.width, sprite.height];
}

/** COL-5..COL-7. */
function currentBox(sprite: Sprite): Box {
  const [w0, h0] = baseSize(sprite);
  const [hs, vs] = sprite.animation ? sprite.getStretch() : [1, 1];
  return orientedBox(
    sprite.position.x,
    sprite.position.y,
    w0 * sprite.scale * hs,
    h0 * sprite.scale * vs,
    sprite.rotation,
  );
}

/** COL-3, COL-4: the collider, created if missing, whatever the costume. */
export function ensureCollider(sprite: Sprite): Collider {
  const existing = colliderOf(sprite);
  if (existing) {
    return existing;
  }
  const collider: Collider = {box: currentBox(sprite), swept: pointBox(0, 0)};
  sprite.collider = collider;
  return collider;
}

/** COL-8: takes a new snapshot, if the sprite has a collider. */
export function refreshCollider(sprite: Sprite): void {
  const collider = colliderOf(sprite);
  if (collider) {
    collider.box = currentBox(sprite);
  }
}

export function isMoving(sprite: Sprite): boolean {
  return sprite.velocity.x !== 0 || sprite.velocity.y !== 0;
}

/** COL-16: the swept box, recomputed at the start of the update step. */
export function refreshSweptCollider(sprite: Sprite): void {
  const collider = colliderOf(sprite);
  if (!collider || !isMoving(sprite)) {
    return;
  }
  const {x: vx, y: vy} = sprite.velocity;
  const speed = Math.hypot(vx, vy);
  const ux = vx / speed;
  const uy = vy / speed;
  const along = projectedRadius(collider.box, ux, uy);
  const across = projectedRadius(collider.box, -uy, ux);
  const length = speed + 2 * along;
  const width = 2 * across;
  const [nx, ny] = sprite.getAnchor();
  collider.swept = {
    x: nx + vx / 2,
    y: ny + vy / 2,
    wx: ux * length,
    wy: uy * length,
    hx: -uy * width,
    hy: ux * width,
  };
}

/** COL-8 item 2: after the animation advances. */
export function updateCollider(sprite: Sprite): void {
  refreshCollider(sprite);
}

/** SPR-57 item 3: the outline, in the stroke the overlay has set. */
export function drawDebugCollider(p: p5, sprite: Sprite): void {
  const [a, b, c, d] = corners(ensureCollider(sprite).box);
  p.quad(a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]);
}
