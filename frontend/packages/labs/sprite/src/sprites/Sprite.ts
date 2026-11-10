import type p5 from 'p5';

import {Animation, drawAnimationFrame, type RGBA} from './animation';
import {
  bounce,
  bounceOff,
  type CollisionCallback,
  type CollisionTarget,
  collide,
  displace,
  drawDebugCollider,
  overlap,
  refreshSweptCollider,
  updateCollider,
} from './collision';
import type {SpriteContext} from './context';
import type {Group} from './Group';
import {makeVector} from './vector';

const PLACEHOLDER_GREY = 127;

export interface Touching {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

/**
 * A sprite (sprite.md, SPR-). The names in SPR-6 are the runtime's and are
 * deliberately absent here.
 */
export class Sprite {
  position: p5.Vector;
  previousPosition: p5.Vector;
  velocity: p5.Vector;
  deltaX = 0;
  deltaY = 0;
  rotation = 0;
  scale = 1;
  depth: number;
  visible = true;
  lifetime = -1;
  removed = false;
  debug = false;
  tint: unknown = undefined;
  animation: Animation | undefined = undefined;
  groups: Group[] = [];

  // COL- owns these; SPR-5 fixes their initial values.
  collider: unknown = undefined;
  touching: Touching = {left: false, right: false, top: false, bottom: false};
  mass = 1;
  restitution = 1;
  immovable = false;

  // Inert in Sprite Lab (SPR-42).
  friction = 0;
  maxSpeed = -1;
  rotationSpeed = 0;
  rotateToDirection = false;

  readonly #context: SpriteContext;
  #naturalWidth: number;
  #naturalHeight: number;
  #stretchX = 1;
  #stretchY = 1;
  #mirrorX = 1;
  #mirrorY = 1;
  #lastX: number;
  #lastY: number;
  #animations = new Map<string, Animation>();
  #label = '';

  constructor(
    context: SpriteContext,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
  ) {
    this.#context = context;
    const p = context.p as unknown as p5;
    this.position = makeVector(p, x ?? 0, y ?? 0);
    this.previousPosition = makeVector(p, this.position.x, this.position.y);
    this.velocity = makeVector(p, 0, 0);
    this.#lastX = this.position.x;
    this.#lastY = this.position.y;
    this.#naturalWidth = width === undefined ? 100 : width;
    this.#naturalHeight = height === undefined ? 100 : height;
    const allSprites = context.allSprites;
    this.depth = allSprites.length === 0 ? 1 : allSprites.maxDepth() + 1;
  }

  get x(): number {
    return this.position.x;
  }

  set x(value: number) {
    this.position.x = value;
  }

  get y(): number {
    return this.position.y;
  }

  set y(value: number) {
    this.position.y = value;
  }

  get velocityX(): number {
    return this.velocity.x;
  }

  set velocityX(value: number) {
    this.velocity.x = value;
  }

  get velocityY(): number {
    return this.velocity.y;
  }

  set velocityY(value: number) {
    this.velocity.y = value;
  }

  get life(): number {
    return this.lifetime;
  }

  set life(value: number) {
    this.lifetime = value;
  }

  get bounciness(): number {
    return this.restitution;
  }

  set bounciness(value: number) {
    this.restitution = value;
  }

  get width(): number {
    return this.animation
      ? this.#naturalWidth * this.#stretchX
      : this.#naturalWidth;
  }

  set width(value: number) {
    if (this.animation) {
      this.#stretchX = value / this.#naturalWidth;
    } else {
      this.#naturalWidth = value;
    }
  }

  get height(): number {
    return this.animation
      ? this.#naturalHeight * this.#stretchY
      : this.#naturalHeight;
  }

  set height(value: number) {
    if (this.animation) {
      this.#stretchY = value / this.#naturalHeight;
    } else {
      this.#naturalHeight = value;
    }
  }

  /** SPR-26, ANI-41: sets the natural size, keeping the stretch. */
  setNaturalSize(width: number, height: number): void {
    this.#naturalWidth = width;
    this.#naturalHeight = height;
  }

  /** COL-6: the stretch factors of SPR-20. */
  getStretch(): [number, number] {
    return [this.#stretchX, this.#stretchY];
  }

  /** COL-16: the anchor, the position at the end of the latest update. */
  getAnchor(): [number, number] {
    return [this.#lastX, this.#lastY];
  }

  /** COL-19 step 6: makes the position both anchor and previous position. */
  resetAnchor(): void {
    this.#lastX = this.previousPosition.x = this.position.x;
    this.#lastY = this.previousPosition.y = this.position.y;
  }

  getScaledWidth(): number {
    return this.width * this.scale;
  }

  getScaledHeight(): number {
    return this.height * this.scale;
  }

  getSpeed(): number {
    return Math.hypot(this.velocity.x, this.velocity.y);
  }

  getDirection(): number {
    const {x, y} = this.velocity;
    if (x === 0 && y === 0) {
      return 0;
    }
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  mirrorX(direction?: number): number | undefined {
    if (direction === 1 || direction === -1) {
      this.#mirrorX = direction;
      return undefined;
    }
    return this.#mirrorX;
  }

  mirrorY(direction?: number): number | undefined {
    if (direction === 1 || direction === -1) {
      this.#mirrorY = direction;
      return undefined;
    }
    return this.#mirrorY;
  }

  getAnimationLabel(): string {
    return this.#label;
  }

  get frameDelay(): number | undefined {
    return this.animation?.frameDelay;
  }

  set frameDelay(value: number) {
    if (this.animation) {
      this.animation.frameDelay = value;
    }
  }

  /** ANI-19. */
  addAnimation(label: string, ...sources: unknown[]): Animation | -1 {
    if (typeof label !== 'string') {
      console.log('addAnimation error: the label must be a string');
      return -1;
    }
    const source = sources[0];
    const animation =
      source instanceof Animation
        ? source.clone()
        : new Animation(...(sources as p5.Image[]));
    this.#animations.set(label, animation);
    if (!this.animation) {
      this.animation = animation;
      this.#label = label;
    }
    // SPR-24: sized by the effective scale at the time of the call.
    this.#naturalWidth =
      animation.getWidth() * Math.abs(this.scale * this.#stretchX);
    this.#naturalHeight =
      animation.getHeight() * Math.abs(this.scale * this.#stretchY);
    return animation;
  }

  /** ANI-20. */
  changeAnimation(label: string): void {
    const animation = this.#animations.get(label);
    if (!animation) {
      console.log('changeAnimation error: no animation labeled ' + label);
      return;
    }
    this.animation = animation;
    this.#label = label;
  }

  /** SPR-30, ANI-21. */
  setAnimation(name: string): void {
    if (name === this.#label) {
      return;
    }
    const table = this.#context.p.predefinedAnimations;
    const entry =
      table && Object.prototype.hasOwnProperty.call(table, name)
        ? table[name]
        : undefined;
    if (!entry) {
      throw new Error(
        `Unable to find an animation named "${name}".  Please make sure the animation exists.`,
      );
    }
    this.addAnimation(name, entry);
    this.changeAnimation(name);
    if (this.#context.p.pauseAnimationsByDefault) {
      this.animation!.stop();
    }
  }

  /** ANI-25. */
  pause(): void {
    this.animation?.stop();
  }

  /** ANI-25. */
  play(): void {
    const animation = this.animation;
    if (!animation) {
      return;
    }
    if (
      !animation.looping &&
      !animation.playing &&
      animation.getFrame() === animation.getLastFrame()
    ) {
      animation.rewind();
    }
    animation.play();
  }

  /** SPR-36. */
  remove(): void {
    if (this.removed) {
      return;
    }
    this.removed = true;
    for (const group of this.groups.slice()) {
      group.remove(this);
    }
  }

  declare destroy: () => void;

  /** The update step, SPR-40..SPR-46. */
  update(): void {
    if (this.removed) {
      return;
    }
    refreshSweptCollider(this);
    this.previousPosition.x = this.#lastX;
    this.previousPosition.y = this.#lastY;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.deltaX = this.position.x - this.previousPosition.x;
    this.deltaY = this.position.y - this.previousPosition.y;
    this.#lastX = this.position.x;
    this.#lastY = this.position.y;
    this.animation?.update();
    updateCollider(this);
    if (this.lifetime > 0) {
      this.lifetime--;
    }
    if (this.lifetime === 0) {
      this.remove();
    }
  }

  /** Draws the sprite in the current transform, SPR-50..SPR-58. */
  display(): void {
    if (!this.visible || this.removed) {
      return;
    }
    const p = this.#context.p as unknown as p5;
    p.push();
    p.colorMode(p.RGB, 255);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
    p.imageMode(p.CENTER);
    p.translate(this.position.x, this.position.y);
    p.rotate(this.rotation);
    p.scale(
      this.scale * this.#stretchX * this.#mirrorX,
      this.scale * this.#stretchY * this.#mirrorY,
    );
    if (this.animation) {
      if (this.tint) {
        const tint = rgba(p, p.color(this.tint as string));
        p.push();
        drawAnimationFrame(p, this.animation, tint);
        p.pop();
      } else {
        drawAnimationFrame(p, this.animation, undefined);
      }
    } else {
      const grey = p.color(
        PLACEHOLDER_GREY,
        PLACEHOLDER_GREY,
        PLACEHOLDER_GREY,
      );
      if (this.tint) {
        const [r, g, b, a] = rgba(
          p,
          p.lerpColor(grey, p.color(this.tint as string), 0.5),
        );
        p.fill(r, g, b, a);
      } else {
        p.fill(grey);
      }
      p.rect(0, 0, this.#naturalWidth, this.#naturalHeight);
    }
    p.pop();

    if (this.debug) {
      this.#drawDebug(p);
    }
  }

  #drawDebug(p: p5): void {
    const {x, y} = this.position;
    p.push();
    p.stroke(0, 255, 0);
    p.strokeWeight(1);
    p.line(x - 10, y, x + 10, y);
    p.line(x, y - 10, x, y + 10);
    p.noStroke();
    p.fill(0, 255, 0);
    p.textSize(16);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(String(this.depth), x + 4, y - 2);
    p.stroke(0, 255, 0);
    p.noFill();
    drawDebugCollider(p, this);
    p.pop();
  }

  overlap(target: CollisionTarget, callback?: CollisionCallback): boolean {
    return overlap(this, target, callback);
  }

  declare isTouching: (
    target: CollisionTarget,
    callback?: CollisionCallback,
  ) => boolean;

  collide(target: CollisionTarget, callback?: CollisionCallback): boolean {
    return collide(this, target, callback);
  }

  displace(target: CollisionTarget, callback?: CollisionCallback): boolean {
    return displace(this, target, callback);
  }

  bounce(target: CollisionTarget, callback?: CollisionCallback): boolean {
    return bounce(this, target, callback);
  }

  bounceOff(target: CollisionTarget, callback?: CollisionCallback): boolean {
    return bounceOff(this, target, callback);
  }
}

Sprite.prototype.destroy = Sprite.prototype.remove;
// COL-17: the very same function.
Sprite.prototype.isTouching = Sprite.prototype.overlap;

/** 8-bit RGBA, rounded, as the fork's colors hold them (SPR-56). */
function rgba(p: p5, color: p5.Color): RGBA {
  return [
    Math.round(p.red(color)),
    Math.round(p.green(color)),
    Math.round(p.blue(color)),
    Math.round(p.alpha(color)),
  ];
}
