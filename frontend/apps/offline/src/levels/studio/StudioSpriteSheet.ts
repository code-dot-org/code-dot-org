/**
 * A utility that can help find particular frames within a spritesheet,
 * given certain metadata about that spritesheet
 */

/** Describes an animation */
export interface AnimationDescription {
  /** Descriptive unique name for this animation type. */
  type: string;
  /** Number of animations of this type. */
  count: number;
  /** Number of frames in each animation of this type. */
  frames?: number;
}

export interface AnimationRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface SpriteSheetDefinition {
  /** URL of the sprite sheet asset. */
  assetPath: string;
  /** Descriptions of animations */
  animations: AnimationDescription[];
  /** How many animations (how many columns) */
  totalAnimations?: number;
  /** How many frames there are per animation. Default: 1 */
  defaultFramesPerAnimation: number;
  /**
   * How many frames before wrapping, if animation frames are packed.
   * Defaults to non-packed.
   */
  packedSheetFrameCount?: number;
  /** If animation frames run in rows instead of columns. */
  horizontalAnimation?: boolean;
  /** Width of a frame of animation. */
  frameWidth: number;
  /** Height of a frame of animation. */
  frameHeight: number;
}

/**
 * Provider of metadata about a particular sprite sheet, to help find frames
 * within it.
 *
 * Assumptions:
 * All frames are the same size, and are arranged in a grid.
 * All animations are the same number of frames.
 * Each animation is a single column or a single row
 */
class StudioSpriteSheet {
  animations: AnimationDescription[];
  frameWidth: number;
  frameHeight: number;
  assetPath: string;
  defaultFramesPerAnimation: number;
  packedSheetFrameCount: number;
  animationOffsets: {
    [key: string]: number;
  };
  animationFrameCounts: {
    [key: string]: number;
  };
  horizontalAnimation: boolean = false;
  totalFrames: number = 0;
  totalAnimations: number = 0;
  /** Number of columns in the sheet */
  columnCount: number;
  /** Number of rows in the sheet */
  rowCount: number;

  constructor(options: SpriteSheetDefinition) {
    this.animations = options.animations || [];
    this.frameWidth = options.frameWidth;
    this.frameHeight = options.frameHeight;
    this.assetPath = options.assetPath;
    this.defaultFramesPerAnimation = options.defaultFramesPerAnimation || 1;

    /** If non-zero, the animations are packed in one long strip
     * that wraps around to the next row/column every n frames. The row/column
     * no longer implies the beginning or end of an animation.
     * (which means this mode requires that options.animations be supplied)
     * animationOffsets are stored as an 0-based frame index in this mode.
     */
    this.packedSheetFrameCount = options.packedSheetFrameCount || 0;

    this.animationOffsets = {};
    this.animationFrameCounts = {};

    let totalFrames = 0;
    let totalAnimations = 0;
    for (const animation of this.animations) {
      this.animationOffsets[animation.type] = this.packedSheetFrameCount
        ? totalFrames
        : totalAnimations;
      totalAnimations += animation.count || 0;
      const framesPerThisAnimationType =
        animation.frames || this.defaultFramesPerAnimation;
      this.animationFrameCounts[animation.type] = framesPerThisAnimationType;
      totalFrames += framesPerThisAnimationType * animation.count;
    }

    this.totalAnimations = options.totalAnimations || totalAnimations;
    this.totalFrames =
      totalFrames || this.totalAnimations * this.defaultFramesPerAnimation;

    this.horizontalAnimation = !!options.horizontalAnimation;

    if (this.packedSheetFrameCount) {
      const framesOneSide = Math.ceil(
        this.totalFrames / this.packedSheetFrameCount,
      );
      const framesOtherSide = Math.ceil(this.totalFrames / framesOneSide);
      this.columnCount = this.horizontalAnimation
        ? framesOtherSide
        : framesOneSide;
      this.rowCount = this.horizontalAnimation
        ? framesOneSide
        : framesOtherSide;
    } else {
      this.rowCount = this.horizontalAnimation
        ? this.totalAnimations
        : this.defaultFramesPerAnimation;
      this.columnCount = this.horizontalAnimation
        ? this.defaultFramesPerAnimation
        : this.totalAnimations;
    }
  }

  /** @returns original height of the whole sprite sheet. */
  assetWidth(): number {
    return this.frameWidth * this.columnCount;
  }

  /** @returns original width of the whole sprite sheet. */
  assetHeight(): number {
    return this.frameHeight * this.rowCount;
  }

  /** @returns number of animation frames for a given type. */
  getAnimationFrameCount(animationType: string): number {
    return (
      this.animationFrameCounts[animationType] || this.defaultFramesPerAnimation
    );
  }

  /**
   * Get the framing rect for a particular animation and frame within the
   * sprite sheet.
   * @param animationType - Which type of animation to look up (optional).
   * @param animationIndex - Which animation to look up.
   * @param frameIndex - Which frame in the animation to look up.
   * @returns A frame rect at spritesheet scale relative to the sheet's
   *          top-left corner.
   */
  getFrame(
    animationType: string,
    animationIndex: number,
    frameIndex: number,
  ): AnimationRect {
    let x: number = 0;
    let y: number = 0;
    if (this.packedSheetFrameCount) {
      let absoluteFrameIndex =
        this.animationOffsets[animationType] +
        this.animationFrameCounts[animationType] * animationIndex;
      absoluteFrameIndex += frameIndex;

      if (this.horizontalAnimation) {
        x = this.frameWidth * (absoluteFrameIndex % this.columnCount);
        y =
          this.frameHeight * Math.floor(absoluteFrameIndex / this.columnCount);
      } else {
        x = this.frameWidth * Math.floor(absoluteFrameIndex / this.rowCount);
        y = this.frameHeight * (absoluteFrameIndex % this.rowCount);
      }
    } else {
      if (animationType) {
        animationIndex += this.animationOffsets[animationType];
      }
      x =
        this.frameWidth *
        (this.horizontalAnimation ? frameIndex : animationIndex);
      y =
        this.frameHeight *
        (this.horizontalAnimation ? animationIndex : frameIndex);
    }

    return {
      x: x,
      y: y,
      width: this.frameWidth,
      height: this.frameHeight,
      top: y,
      left: x,
      right: x + this.frameWidth,
      bottom: y + this.frameHeight,
    };
  }
}

export default StudioSpriteSheet;
