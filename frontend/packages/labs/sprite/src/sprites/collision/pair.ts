import type {Sprite} from '../Sprite';

import {type Separation, separation} from './box';
import {
  baseSize,
  type Collider,
  ensureCollider,
  isMoving,
  refreshCollider,
} from './collider';

export type CollisionType =
  | 'overlap'
  | 'collide'
  | 'displace'
  | 'bounce'
  | 'bounceOff';

export type CollisionTarget = Sprite | readonly Sprite[];
export type CollisionCallback = (
  this: Sprite,
  self: Sprite,
  other: Sprite,
) => void;

const BAD_TARGET = 'overlap can only be checked between sprites or groups';
const MIN_SAMPLE_STEP = 0.015;

function broadShape(sprite: Sprite, collider: Collider) {
  return isMoving(sprite) ? collider.swept : collider.box;
}

function place(sprite: Sprite, x: number, y: number): void {
  sprite.position.x = x;
  sprite.position.y = y;
}

/** COL-16: sub-frame sampling; the overlapping sample's D, if any. */
function sample(
  a: Sprite,
  b: Sprite,
  ca: Collider,
  cb: Collider,
): Separation | undefined {
  const [wa, ha] = baseSize(a);
  const [wb, hb] = baseSize(b);
  const reach = Math.max(Math.min(wa, ha), Math.min(wb, hb));
  const speed = Math.hypot(
    a.velocity.x - b.velocity.x,
    a.velocity.y - b.velocity.y,
  );
  const t = Math.max(MIN_SAMPLE_STEP, reach / speed);
  if (!(t < 1)) {
    return undefined;
  }
  const qa = [a.position.x, a.position.y];
  const qb = [b.position.x, b.position.y];
  const pa = [a.previousPosition.x, a.previousPosition.y];
  const pb = [b.previousPosition.x, b.previousPosition.y];
  place(a, pa[0], pa[1]);
  place(b, pb[0], pb[1]);
  const eax = t * (qa[0] - pa[0]);
  const eay = t * (qa[1] - pa[1]);
  const ebx = t * (qb[0] - pb[0]);
  const eby = t * (qb[1] - pb[1]);
  for (let f = t; f < 1; f += t) {
    a.position.x += eax;
    a.position.y += eay;
    b.position.x += ebx;
    b.position.y += eby;
    refreshCollider(a);
    refreshCollider(b);
    const d = separation(ca.box, cb.box);
    if (d.overlaps) {
      if (a.immovable) {
        place(a, qa[0], qa[1]);
      }
      if (b.immovable) {
        place(b, qb[0], qb[1]);
      }
      return d;
    }
  }
  place(a, qa[0], qa[1]);
  place(b, qb[0], qb[1]);
  return undefined;
}

/** COL-15. */
function pairwise(
  a: Sprite,
  b: Sprite,
  ca: Collider,
  cb: Collider,
): Separation {
  if (separation(broadShape(a, ca), broadShape(b, cb)).overlaps) {
    const sampled = sample(a, b, ca, cb);
    if (sampled) {
      return sampled;
    }
  }
  refreshCollider(a);
  refreshCollider(b);
  return separation(ca.box, cb.box);
}

/** COL-20. */
function respondVelocity(
  a: Sprite,
  b: Sprite,
  type: CollisionType,
  dx: number,
  dy: number,
): void {
  const length = Math.hypot(dx, dy);
  const nx = dx / length;
  const ny = dy / length;
  const bImmovable = type === 'bounce' ? b.immovable : true;
  const bRestitution = type === 'collide' ? 0 : b.restitution;
  let ma: number;
  let mb: number;
  if (a.immovable) {
    ma = 1;
    mb = 0;
  } else if (bImmovable) {
    ma = 0;
    mb = 1;
  } else {
    ma = a.mass;
    mb = b.mass;
  }
  const e = a.restitution * bRestitution;
  const m = ma + mb;
  const ua = a.velocity.x * nx + a.velocity.y * ny;
  const ub = b.velocity.x * nx + b.velocity.y * ny;
  const ua2 = (ma * ua + mb * ub + mb * e * (ub - ua)) / m;
  const ub2 = (ma * ua + mb * ub + ma * e * (ua - ub)) / m;
  a.velocity.x += (ua2 - ua) * nx;
  a.velocity.y += (ua2 - ua) * ny;
  b.velocity.x += (ub2 - ub) * nx;
  b.velocity.y += (ub2 - ub) * ny;
}

/** COL-19. */
function pair(
  a: Sprite,
  b: Sprite,
  type: CollisionType,
  callback: CollisionCallback | undefined,
): boolean {
  if (b === a || b.removed) {
    return false;
  }
  const ca = ensureCollider(a);
  const cb = ensureCollider(b);
  const {overlaps, dx, dy} = pairwise(a, b, ca, cb);
  if (!overlaps) {
    return false;
  }
  const touching = a.touching;
  if (dx > 0) {
    touching.left = true;
  }
  if (dx < 0) {
    touching.right = true;
  }
  if (dy < 0) {
    touching.bottom = true;
  }
  if (dy > 0) {
    touching.top = true;
  }
  if (type === 'displace') {
    if (!b.immovable) {
      b.position.x -= dx;
      b.position.y -= dy;
    }
  } else if (type !== 'overlap') {
    if (!a.immovable) {
      a.position.x += dx;
      a.position.y += dy;
      a.resetAnchor();
      refreshCollider(a);
    }
    respondVelocity(a, b, type, dx, dy);
  }
  if (typeof callback === 'function') {
    callback.call(a, a, b);
  }
  return true;
}

/** COL-17, COL-18, COL-23. */
export function runCollision(
  type: CollisionType,
  a: Sprite,
  target: CollisionTarget,
  callback: CollisionCallback | undefined,
): boolean {
  const touching = a.touching;
  touching.left = touching.right = touching.top = touching.bottom = false;
  if (a.removed) {
    return false;
  }
  let others: readonly Sprite[];
  // Sprite's own constructor: importing the class would close a cycle.
  if (target instanceof (a.constructor as abstract new () => Sprite)) {
    others = [target];
  } else if (Array.isArray(target)) {
    others = target;
  } else {
    throw new Error(BAD_TARGET);
  }
  let any = false;
  // COL-17: the length is read afresh on every pass.
  for (let i = 0; i < others.length; i++) {
    if (pair(a, others[i], type, callback)) {
      any = true;
    }
  }
  return any;
}
