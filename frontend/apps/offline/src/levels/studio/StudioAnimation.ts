/**
 * An animated image, which handles frame counts, rates and offsets
 * internally and exposes simple methods for rendering at the desired position.
 */

import {SVG_NS} from './constants';
import type StudioSpriteSheet from './StudioSpriteSheet';
import type {AnimationRect} from './StudioSpriteSheet';

// Unique element ID that increments by 1 each time an element is created
let uniqueId = 0;

export interface AnimationFrameDefinition {
  type: string;
  index: number;
  frame: number;
}

export interface AnimationDefinition {
  /** The source asset for this animation. */
  spriteSheet: StudioSpriteSheet;
  /** The scale to render. Default: 1 */
  renderScale?: number;
  /** Opacity on a 0.0 to 1.0 scale. Default: 1.0 */
  opacity?: number;
  /**
   * How fast the animation should be played, in 30 fps ticks per frame.
   * Default: 1 (30 fps)
   */
  animationFrameDuration?: number;
  /** Whether or not the animation should loop. Default: false */
  loop?: boolean;
  /** Whether each animation should be uniquely skewed. Default: false */
  skewAnimations?: boolean;
}

/**
 * A StudioAnimation represents an animation asset that can be created,
 * positioned and rendered by other code.  It tries to hide away all the
 * details of actually rendering the correct frame at the correct offset
 * and advancing frames at the correct rate.
 */
class StudioAnimation {
  /** The animation id that uniquely identifies this animation. */
  protected animId: number;
  /** The source asset for this animation. */
  protected spriteSheet: StudioSpriteSheet;
  /** The scale to render. Default: 1 */
  protected renderScale: number;
  /** Opacity on a 0.0 to 1.0 scale. Default: 1.0 */
  protected opacity: number;
  /**
   * Which animation type (a group of columns in the sprite sheet) is currently
   * playing.
   */
  protected interfaceMode: string = '';
  /** The list of special animations and their locations in the sprite sheet. */
  protected specialAnimations: {
    [key: string]: AnimationRect[][];
  } = {};
  /**
   * Which animation (which column in the sprite sheet for a given type) is
   * currently playing.
   */
  protected currentAnimationIndex: number = 0;
  /**
   * How fast the animation should be played, in 30 fps ticks per frame.
   * Default: 1 (30 fps)
   */
  protected animationFrameDuration: number;
  /** Whether or not the animation should loop. Default: false */
  protected loop: boolean = false;
  /** Whether each animation should be uniquely skewed. Default: false */
  protected skewAnimations: boolean = false;
  /** The element that is being animated */
  protected element?: SVGImageElement;
  /** The associated clip path that is clipping the frame out of the sprite sheet. */
  protected clipPath?: SVGElement;

  constructor(options: AnimationDefinition) {
    this.spriteSheet = options.spriteSheet;
    this.renderScale =
      options.renderScale === undefined ? 1 : options.renderScale;
    this.opacity = options.opacity === undefined ? 1 : options.opacity;
    this.loop = !!options.loop;
    this.skewAnimations = !!options.skewAnimations;
    this.animationFrameDuration = options.animationFrameDuration || 1;
    this.animId = uniqueId++;
  }

  getElement(): SVGImageElement | undefined {
    return this.element;
  }

  /**
   * Create an image element with a clip path.
   */
  createElement(parentElement: SVGElement) {
    // Create our clipping path/rect
    this.clipPath = document.createElementNS(SVG_NS, 'clipPath');
    const clipId = 'studioanimation_clippath_' + this.animId;
    this.clipPath.setAttribute('id', clipId);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute(
      'width',
      (this.spriteSheet.frameWidth * this.renderScale).toString(),
    );
    rect.setAttribute(
      'height',
      (this.spriteSheet.frameHeight * this.renderScale).toString(),
    );

    this.clipPath.appendChild(rect);
    parentElement.appendChild(this.clipPath);

    const itemId = 'studioanimation_' + this.animId;
    this.element = document.createElementNS(SVG_NS, 'image');
    this.element.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      this.spriteSheet.assetPath,
    );
    this.element.setAttribute('id', itemId);
    this.element.setAttribute(
      'height',
      (this.spriteSheet.assetHeight() * this.renderScale).toString(),
    );
    this.element.setAttribute(
      'width',
      (this.spriteSheet.assetWidth() * this.renderScale).toString(),
    );
    parentElement.appendChild(this.element);

    this.element.setAttribute('clip-path', `url(#${clipId})`);
  }

  /**
   * Remove our element/clipPath/animator
   */
  removeElement() {
    if (this.element) {
      this.element.parentNode?.removeChild(this.element);
      this.element = undefined;
    }

    // remove clip path element
    if (this.clipPath) {
      this.clipPath.parentNode?.removeChild(this.clipPath);
      this.clipPath = undefined;
    }
  }

  /** @returns Whether the type of animation has been created */
  hasType(type: string): boolean {
    return (
      !!this.specialAnimations[type] ||
      !!this.spriteSheet.animationFrameCounts[type]
    );
  }

  /** @returns The count of frames for the current animation */
  getAnimationFrameCount(): number {
    const specialFrames = this.specialAnimations[this.interfaceMode];
    if (specialFrames) {
      return specialFrames[this.currentAnimationIndex].length;
    } else {
      return this.spriteSheet.getAnimationFrameCount(this.interfaceMode);
    }
  }

  /** @returns The frame rectangle from the sprite sheet for a frame */
  getFrame(frameIndex: number): AnimationRect {
    const specialFrames = this.specialAnimations[this.interfaceMode];
    if (specialFrames) {
      return specialFrames[this.currentAnimationIndex][frameIndex];
    } else {
      return this.spriteSheet.getFrame(
        this.interfaceMode,
        this.currentAnimationIndex,
        frameIndex,
      );
    }
  }

  /**
   * Display the current frame at the given location
   */
  redrawCenteredAt(
    center: {
      x: number;
      y: number;
    },
    tickCount: number,
  ) {
    let animTick = tickCount;

    // Each animation will start at a different frame when this is enabled:
    if (this.skewAnimations) {
      // NOTE: not intended to be used with non-looping animations
      animTick = tickCount + this.animId * (this.animationFrameDuration + 1);
    }

    let currentFrame = Math.floor(animTick / this.animationFrameDuration);
    const framesInThisAnimation = this.getAnimationFrameCount();

    if (this.loop) {
      currentFrame = currentFrame % framesInThisAnimation;
    } else {
      currentFrame = Math.min(currentFrame, framesInThisAnimation - 1);
    }

    const frame = this.getFrame(currentFrame);
    const scale = this.renderScale;

    // Preserved behavior: When scaling a sprite up, we actually scale around the
    //       bottom-center of the sprite (so feet stay planted in the same place)
    //       rather than actually around its center.
    //       That's what the (2 * scale - 1) bit is about; just change that to
    //       (scale) if you want to scale about the sprite center again.
    const topLeft = {
      x: center.x - (frame.width / 2) * scale,
      y: center.y - (frame.height / 2) * (2 * scale - 1),
    };

    // Offset the spritesheet DOM element by the inverse of the offset of the
    // frame we want to display.
    this.element?.setAttribute(
      'x',
      (topLeft.x - frame.left * scale).toString(),
    );
    this.element?.setAttribute('y', (topLeft.y - frame.top * scale).toString());
    this.element?.setAttribute('opacity', this.opacity.toString());

    // Then set the clip rect to the position where we want to display it, so
    // only the frame that's now positioned correctly is shown.
    const clipRect = this.clipPath?.childNodes?.[0] as unknown as
      | SVGElement
      | undefined;
    clipRect?.setAttribute('x', topLeft.x.toString());
    clipRect?.setAttribute('y', topLeft.y.toString());
  }

  /**
   * Sets which animation to play out of the sprite sheet.
   * Animations are indexed by their position in the sprite sheet, where each
   * animation is its own column and animation zero is the far-left column.
   */
  setCurrentAnimation(animationType: string, animationIndex: number) {
    this.interfaceMode = animationType;
    this.currentAnimationIndex = animationIndex;
  }

  /**
   * Creates a new special animation types based on specific frames to play from
   * the sprite sheet.
   *
   * A special animation is an animation created in code (or from metadata)
   * without regard to where the frames exist within the spritesheet. Each frame
   * from the new animation is specified according to how it was encoded by the
   * original AnimationDescription object when the StudioSpriteSheet object was
   * created.
   *
   * @param type - The name of the new animation type
   * @param index - The index of the new animation
   * @param animationList - An array with frame information
   */
  createSpecialAnimation(
    type: string,
    index: number,
    animationList: AnimationFrameDefinition[],
  ) {
    if (!this.specialAnimations[type]) {
      this.specialAnimations[type] = [];
    }

    const frames = animationList.map(frame =>
      this.spriteSheet.getFrame(frame.type, frame.index, frame.frame),
    );

    this.specialAnimations[type][index] = frames;
  }

  /**
   * Set the animation speed for this item's sprite.
   */
  setAnimationFrameDuration(ticksPerFrame: number) {
    this.animationFrameDuration = ticksPerFrame;
  }

  /**
   * Change visible opacity of this animation.
   * @param newOpacity - The new opacity (between 0.0 and 1.0)
   */
  setOpacity(newOpacity: number) {
    this.opacity = newOpacity;
  }

  /**
   * Make this animation hidden.
   */
  hide() {
    this.element?.setAttribute('visibility', 'hidden');
  }

  /**
   * Make this animation visible.
   */
  show() {
    this.element?.setAttribute('visibility', 'visible');
  }
}

export default StudioAnimation;
