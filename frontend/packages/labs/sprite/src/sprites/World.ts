import type p5 from 'p5';

import {getContext} from './context';
import type {Group} from './Group';

/** A view of one instance's clock, canvas, mouse and sprites (WLD-1..WLD-8). */
export class World {
  readonly #p: p5;
  readonly #allSprites: Group;
  readonly #startTime: number;

  constructor(p: p5, allSprites: Group, startTime: number) {
    this.#p = p;
    this.#allSprites = allSprites;
    this.#startTime = startTime;
  }

  get width(): number {
    return this.#p.width;
  }

  get height(): number {
    return this.#p.height;
  }

  /** WLD-3: the pointer state (INP-29), not p5's field. */
  get mouseX(): number {
    return getContext(this.#p).input.mouseX;
  }

  get mouseY(): number {
    return getContext(this.#p).input.mouseY;
  }

  get frameCount(): number {
    return this.#p.frameCount;
  }

  get allSprites(): Group {
    return this.#allSprites;
  }

  get seconds(): number {
    return Math.round((Date.now() - this.#startTime) / 1000);
  }

  get frameRate(): number {
    return this.#p.frameRate();
  }

  // p5 2.x accepts 0, which the fork's p5 ignored (WLD-6).
  set frameRate(rate: number) {
    if (typeof rate === 'number' && rate > 0) {
      this.#p.frameRate(rate);
    }
  }
}
