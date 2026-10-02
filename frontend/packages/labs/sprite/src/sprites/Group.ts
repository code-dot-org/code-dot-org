import {type GroupCollisionMethod, installGroupCollision} from './collision';
import {Sprite} from './Sprite';

/** An ordered collection of sprites that is an Array (GRP-1..GRP-9). */
export class Group extends Array<Sprite> {
  // map, filter and slice return plain arrays, not groups.
  static get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  constructor() {
    super();
    installGroupCollision(this);
  }

  get(i: number): Sprite | undefined {
    return this[i];
  }

  size(): number {
    return this.length;
  }

  contains(sprite: Sprite): boolean {
    return this.indexOf(sprite) !== -1;
  }

  toArray(): Sprite[] {
    return Array.prototype.slice.call(this) as Sprite[];
  }

  add(sprite: Sprite): void {
    if (!(sprite instanceof Sprite)) {
      throw new Error('you can only add sprites to a group');
    }
    if (this.indexOf(sprite) === -1) {
      this.push(sprite);
      sprite.groups.push(this);
    }
  }

  remove(sprite: Sprite): boolean {
    if (!(sprite instanceof Sprite)) {
      throw new Error('you can only remove sprites from a group');
    }
    let removed = false;
    for (let i = this.length - 1; i >= 0; i--) {
      if (this[i] === sprite) {
        this.splice(i, 1);
        removed = true;
      }
    }
    if (removed) {
      for (let i = sprite.groups.length - 1; i >= 0; i--) {
        if (sprite.groups[i] === this) {
          sprite.groups.splice(i, 1);
        }
      }
    }
    return removed;
  }

  removeSprites(): void {
    while (this.length > 0) {
      const first = this[0];
      first.remove();
      // A sprite whose groups list no longer names this group would stay put.
      if (this[0] === first) {
        this.splice(0, 1);
      }
    }
  }

  clear(): void {
    this.length = 0;
  }

  maxDepth(): number {
    if (this.length === 0) {
      return 0;
    }
    let max = this[0].depth;
    for (let i = 1; i < this.length; i++) {
      max = Math.max(max, this[i].depth);
    }
    return max;
  }

  minDepth(): number {
    if (this.length === 0) {
      return 99999;
    }
    let min = this[0].depth;
    for (let i = 1; i < this.length; i++) {
      min = Math.min(min, this[i].depth);
    }
    return min;
  }

  /** WLD-11: sort in place by depth, stably, then draw from index 0. */
  draw(): void {
    Array.prototype.sort.call(
      this,
      (a: Sprite, b: Sprite) => a.depth - b.depth,
    );
    for (let i = 0; i < this.length; i++) {
      this[i].display();
    }
  }

  // COL-22: own properties, bound to this group, made by the constructor.
  declare readonly overlap: GroupCollisionMethod;
  declare readonly isTouching: GroupCollisionMethod;
  declare readonly collide: GroupCollisionMethod;
  declare readonly displace: GroupCollisionMethod;
  declare readonly bounce: GroupCollisionMethod;
  declare readonly bounceOff: GroupCollisionMethod;
}
