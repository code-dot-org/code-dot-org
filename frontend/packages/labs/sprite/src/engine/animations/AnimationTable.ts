// The predefined animation table (ANI-27), built from a project's loaded
// images as ANI-35, ANI-36 and ANI-38 describe.
import type p5 from 'p5';

import type {PredefinedAnimation, SpriteP5} from '../../sprites';
import type {RuntimeAnimationList, RuntimeAnimationProps} from '../../types';

export interface AnimationTableOptions {
  /**
   * True for Sprite Lab 2: an image whose metadata records several frames
   * becomes an animation (ANI-36). False for classic, where every image is
   * a still (ANI-35).
   */
  multiFrame: boolean;
  /** Decodes an image; p5's `loadImage` by default. */
  loadImage?: (url: string) => Promise<p5.Image>;
}

interface Entry {
  /** The image data the entry was built from (ANI-38). */
  data: string;
  animation: PredefinedAnimation;
}

export class AnimationTable {
  readonly #p: SpriteP5;
  readonly #multiFrame: boolean;
  readonly #loadImage: (url: string) => Promise<p5.Image>;
  readonly #entries = new Map<string, Entry>();
  /** The data each name was last asked to load, so a stale load is dropped. */
  readonly #requested = new Map<string, string>();

  constructor(p: SpriteP5, {multiFrame, loadImage}: AnimationTableOptions) {
    this.#p = p;
    this.#multiFrame = multiFrame;
    this.#loadImage = loadImage ?? (url => (p as unknown as p5).loadImage(url));
    p.predefinedAnimations ??= {};
  }

  /**
   * Loads every image in `list` that has data, by name. A name already in
   * the table with the same data keeps its object (ANI-38). Resolves once
   * all are in the table; an image that fails to decode is left out and
   * reported on the console.
   */
  async load(list: RuntimeAnimationList): Promise<void> {
    await Promise.all(
      list.orderedKeys.map(key => this.#loadEntry(list.propsByKey[key])),
    );
  }

  /** Removes every entry whose name is not in `keep`. */
  prune(keep: ReadonlySet<string>): void {
    const table = this.#table();
    for (const name of [...this.#entries.keys()]) {
      if (!keep.has(name)) {
        this.#entries.delete(name);
        this.#requested.delete(name);
        delete table[name];
      }
    }
  }

  has(name: string): boolean {
    return this.#entries.has(name);
  }

  async #loadEntry(props: RuntimeAnimationProps | undefined): Promise<void> {
    const data = props?.dataURI;
    if (!props || !data) {
      return;
    }
    const {name} = props;
    if (this.#entries.get(name)?.data === data) {
      return;
    }
    this.#requested.set(name, data);
    let image: p5.Image;
    try {
      image = await this.#loadImage(data);
    } catch (error) {
      console.error(`Unable to load image "${name}":`, error);
      return;
    }
    if (this.#requested.get(name) !== data) {
      return;
    }
    const animation = this.#build(image, props);
    this.#entries.set(name, {data, animation});
    this.#table()[name] = animation;
  }

  #build(image: p5.Image, props: RuntimeAnimationProps): PredefinedAnimation {
    const {frameCount, frameSize} = props;
    if (!this.#multiFrame || !(frameCount > 1) || !frameSize) {
      return image;
    }
    const sheet = this.#p.loadSpriteSheet(
      image,
      frameSize.x,
      frameSize.y,
      frameCount,
    );
    const animation = this.#p.loadAnimation(sheet);
    animation.looping = props.looping;
    animation.frameDelay = props.frameDelay;
    return animation;
  }

  #table(): Record<string, PredefinedAnimation> {
    return (this.#p.predefinedAnimations ??= {});
  }
}
