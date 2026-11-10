import type p5 from 'p5';

import {type FrameRect, SpriteSheet} from './SpriteSheet';

/** A frame is a sheet rectangle or a whole image. */
export type Frame = FrameRect | p5.Image;

/** An ordered list of frames with playback state (ANI-5..ANI-17). */
export class Animation {
  images: Frame[];
  spriteSheet: SpriteSheet | undefined;
  frameDelay = 4;
  playing = true;
  looping = true;
  visible = true;
  frameChanged = false;
  offX = 0;
  offY = 0;

  #frame = 0;
  #updateCount = 0;
  #targetFrame: number | undefined = undefined;

  constructor(sheet: SpriteSheet);
  constructor(...images: p5.Image[]);
  constructor(...args: (SpriteSheet | p5.Image)[]) {
    if (args.length === 1 && args[0] instanceof SpriteSheet) {
      this.spriteSheet = args[0];
      this.images = args[0].frames.map(record => record.frame);
    } else {
      this.spriteSheet = undefined;
      this.images = args as p5.Image[];
    }
  }

  getFrame(): number {
    return this.#frame;
  }

  getLastFrame(): number {
    return this.images.length - 1;
  }

  getFrameImage(): Frame | undefined {
    return this.images[this.#frame];
  }

  getWidth(): number {
    const frame = this.getFrameImage();
    return frame ? frame.width : 1;
  }

  getHeight(): number {
    const frame = this.getFrameImage();
    return frame ? frame.height : 1;
  }

  clone(): Animation {
    const copy = new Animation();
    copy.images = this.images.slice();
    copy.spriteSheet = this.spriteSheet?.clone();
    copy.offX = this.offX;
    copy.offY = this.offY;
    copy.frameDelay = this.frameDelay;
    copy.playing = this.playing;
    copy.looping = this.looping;
    return copy;
  }

  update(): void {
    this.#updateCount++;
    const previous = this.#frame;
    this.frameChanged = false;

    if (this.images.length === 1) {
      this.playing = false;
      this.#frame = 0;
    }

    // ANI-13: `%` as is, so 0 never advances and fractions advance on exact multiples.
    if (this.playing && this.#updateCount % this.frameDelay === 0) {
      const last = this.images.length - 1;
      if (this.#targetFrame !== undefined) {
        if (this.#frame === this.#targetFrame) {
          this.playing = false;
        } else if (this.#frame < this.#targetFrame) {
          this.#frame++;
        } else {
          this.#frame--;
        }
      } else if (this.looping) {
        this.#frame = this.#frame >= last ? 0 : this.#frame + 1;
      } else if (this.#frame >= last) {
        this.playing = false;
      } else {
        this.#frame++;
      }
    }

    this.frameChanged = this.#frame !== previous;
  }

  changeFrame(frame: number): void {
    this.#frame = frame < this.images.length ? frame : this.images.length - 1;
    this.#targetFrame = undefined;
  }

  nextFrame(): void {
    if (this.#frame < this.images.length - 1) {
      this.#frame++;
    } else if (this.looping) {
      this.#frame = 0;
    }
    this.#targetFrame = undefined;
    this.playing = false;
  }

  previousFrame(): void {
    if (this.#frame > 0) {
      this.#frame--;
    } else if (this.looping) {
      this.#frame = this.images.length - 1;
    }
    this.#targetFrame = undefined;
    this.playing = false;
  }

  play(): void {
    this.playing = true;
    this.#targetFrame = undefined;
  }

  stop(): void {
    this.playing = false;
  }

  rewind(): void {
    this.#frame = 0;
  }

  goToFrame(target: number): void {
    if (target < 0 || target > this.images.length - 1) {
      return;
    }
    this.#targetFrame = target;
    if (target !== this.#frame) {
      this.playing = true;
    }
  }
}
