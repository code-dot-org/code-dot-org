import {Direction, Emotions} from './constants';
import * as constants from './constants';
import Item, {ItemSerialization, Candidate} from './Item';
import type Studio from './Studio';
import StudioAnimation from './StudioAnimation';
import StudioSpriteSheet, {SpriteSheetDefinition} from './StudioSpriteSheet';

/**
 * FrameCounts objects are used in setImage and setLegacyImage.
 */
export interface FrameCounts {
  /** Frames in walk animations (spriteSheet) */
  walkFrames?: number;
  /** Frames in idle animations (spriteSheet) */
  idleFrames?: number;
  /** Default frames in all types of animations (spriteSheet) */
  walk?: number;
  /** Number of idle animations (spriteSheet) */
  idleNormal?: number;
  /** Number of idle animations for each emotion (spriteSheet) */
  idleEmotions?: number;
  /** Number of south walking animations for each emotion (spriteSheet) */
  walkingEmotions?: number;
  /** How many turn animations (applies to spriteSheet && legacySpriteSheet) */
  turns?: number;
  /** Turn animations are in counter clockwise order (spriteSheet) */
  counterClockwise?: boolean;
  /** Count of frames before wrapping for a packed sheet (applies to spriteSheet) */
  packedSheetFrameCount?: number;
  /** Number of frames in idle animation (legacySpriteSheet). */
  normal?: number;
  /** Number of times to repeat frame 0 of idle animation (legacySpriteSheet) */
  holdIdleFrame0Count?: number;
  /** Number of emotions included, 1 frame each (legacySpriteSheet) */
  emotions?: number;
  /** Number of emotions included, all frames cloned (legacySpriteSheet) */
  extraEmotions?: number;
}

export interface SpriteSerialization extends ItemSerialization {
  drawWidth?: number;
  drawHeight?: number;
  emotion?: Emotions;
  lastMove?: number;
}

/**
 * A Sprite is a type of Item.
 * Note: x/y represent x/y of center in gridspace
 */
class Sprite extends Item {
  protected legacyImage?: string;
  protected legacyAnimation?: StudioAnimation;
  protected useLegacyIdleEmotionAnimations: boolean = false;
  lastDrawPosition: {
    x: number;
    y: number;
  } = {x: 0, y: 0};
  drawWidth: number = 0;
  drawHeight: number = 0;
  emotion: Emotions = Emotions.NORMAL;
  lastMove: number = 0;
  animationFrameDuration?: number;
  frameCounts: FrameCounts = {};
  value?: string;
  imageName?: string;
  projectileSpriteHeight?: number;
  projectileSpriteWidth?: number;
  bubbleVisible: boolean = false;

  constructor(studio: Studio, options: SpriteSerialization) {
    // call collidable constructor
    super(studio, options);

    this.renderScale = options.renderScale || 1;
    this.renderOffset = options.renderOffset || {x: 0, y: 0};
    this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED;
    this.setNormalFrameDuration(options.animationFrameDuration || 0);
    this.displayDir = options.displayDir || Direction.NONE;
    this.fadeTime = 0;
    this.drawWidth = options.drawWidth || 0;
    this.drawHeight = options.drawHeight || 0;
    this.emotion = options.emotion || Emotions.NORMAL;
    this.lastMove =
      options.lastMove === undefined ? Infinity : options.lastMove;
  }

  /**
   * Sets (or modifies) the image for the preferred spritesheet format - we will
   * generate a StudioSpriteSheet and StudioAnimation in response..
   *
   * @param image - URL for spritesheet image
   * @param frameCounts - Metadata describing spritesheet
   */
  setImage(image: string, frameCounts: FrameCounts) {
    if (image === this.image) {
      return;
    }

    this.image = image;

    const spriteSheetOptions: SpriteSheetDefinition = {
      assetPath: this.image,
      animations: [
        {
          type: 'direction',
          count: frameCounts.turns || 0,
          frames: frameCounts.walkFrames || frameCounts.walk,
        },
        {
          type: 'idle',
          count:
            (frameCounts.idleNormal || 0) + (frameCounts.idleEmotions || 0),
          frames: frameCounts.idleFrames || frameCounts.walk,
        },
        {
          type: 'walkingEmotions',
          count: frameCounts.walkingEmotions || 0,
          frames: frameCounts.walkFrames || frameCounts.walk,
        },
      ],
      defaultFramesPerAnimation: frameCounts.walk || 0,
      frameWidth: this.drawWidth,
      frameHeight: this.drawHeight,
      packedSheetFrameCount: frameCounts.packedSheetFrameCount || 0,
    };

    if (this.animation) {
      this.animation?.removeElement();
    }

    if (!this.image) {
      this.animation = undefined;
      return;
    }

    this.animation = new StudioAnimation({
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      skewAnimations: true,
      spriteSheet: new StudioSpriteSheet(spriteSheetOptions),
      animationFrameDuration: this.getAnimationFrameDuration(),
    });
  }

  /**
   * Sets (or modifies) the image for the legacy spritesheet format - we will
   * generate a StudioSpriteSheet and StudioAnimation in response..
   *
   * The "legacy" spritesheet format was used by all of the original playlab
   * skins. Typically a single horizontal strip of images.
   *
   * Originally, it contained a normal frame and an optional blink frame
   * (later extended into an idle animation), a single frame for each direction
   * (called turns), and a single frame for each emotion.
   *
   * In late 2014, walking animations were added in a separate spritesheet. The
   * app switches between showing the walking spritesheet and the original
   * spritesheet when walking starts and stops.
   *
   * In late 2015, the original spritesheet format was extended to replicate all
   * of the non-walking frames in the original format for each emotion, such that
   * it contained multiple rows of images (extraEmotions)
   *
   * @param image - URL for spritesheet image
   * @param frameCounts - Metadata describing spritesheet
   */
  setLegacyImage(image: string, frameCounts: FrameCounts) {
    if (image === this.legacyImage) {
      return;
    }

    this.legacyImage = image;

    const rowCount = 1 + (frameCounts.extraEmotions || 0);
    const frameCount =
      (frameCounts.normal || 0) +
      (frameCounts.turns || 0) +
      (frameCounts.emotions || 0);

    const spriteSheetOptions: SpriteSheetDefinition = {
      assetPath: this.legacyImage,
      animations: [
        {
          type: 'legacyEmotionRow',
          count: rowCount,
          frames: frameCount,
        },
      ],
      defaultFramesPerAnimation: frameCount,
      frameWidth: this.drawWidth,
      frameHeight: this.drawHeight,
      horizontalAnimation: true,
    };

    if (this.legacyAnimation) {
      this.legacyAnimation.removeElement();
    }

    if (!this.legacyImage) {
      this.legacyAnimation = undefined;
      return;
    }

    this.legacyAnimation = new StudioAnimation({
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      skewAnimations: true,
      spriteSheet: new StudioSpriteSheet(spriteSheetOptions),
      animationFrameDuration: this.getAnimationFrameDuration(),
    });

    const turnCount = frameCounts.turns || 0;
    const frame0Count =
      frameCounts.holdIdleFrame0Count === undefined
        ? 1
        : frameCounts.holdIdleFrame0Count;

    for (let row = 0; row < rowCount; row++) {
      // Create a new special animation called "idle":
      const animationList = [];

      for (let i = 0; i < frame0Count; i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: 0,
        });
      }

      for (let i = 1; i < (frameCounts.normal || 0); i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: i,
        });
      }

      this.legacyAnimation.createSpecialAnimation('idle', row, animationList);

      // Create single-frame 'direction' animations from each 'turn' frame:
      if (turnCount >= 7) {
        let turnIndex = 0;
        let frameIndex = 0;
        if (turnCount === 7) {
          // If turnCount is only 7, create the first animation from 'normal'
          // frame 0.
          this.legacyAnimation.createSpecialAnimation('direction', turnIndex, [
            {type: 'legacyEmotionRow', index: row, frame: 0},
          ]);
          turnIndex++;
        }

        for (; turnIndex < 8; turnIndex++, frameIndex++) {
          this.legacyAnimation.createSpecialAnimation('direction', turnIndex, [
            {
              type: 'legacyEmotionRow',
              index: row,
              frame: (this.frameCounts.normal || 0) + frameIndex,
            },
          ]);
        }
      }
    }

    if (rowCount === 1) {
      // If no extra emotions were supplied as complete rows, we can create
      // special idle animations for each emotion from single emotion frames:

      for (let i = 0; i < (frameCounts.emotions || 0); i++) {
        // Create a new special animation called "idle" with emotion as index:
        const animationList = [];
        for (let j = 0; j < frame0Count; j++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: (frameCounts.normal || 0) + (frameCounts.turns || 0) + i,
          });
        }

        for (let k = 1; k < (frameCounts.normal || 0); k++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: k,
          });
        }
        this.legacyAnimation.createSpecialAnimation(
          'idle',
          i + 1,
          animationList,
        );
        this.useLegacyIdleEmotionAnimations = true;
      }
    }
  }

  getElement(): SVGImageElement | undefined {
    return this.animation?.getElement();
  }

  getLegacyElement(): SVGImageElement | undefined {
    return this.legacyAnimation?.getElement();
  }

  /**
   * Returns the frame of the spritesheet for the current walking direction.
   */
  getDirectionFrame(): number {
    const frameDirTable = this.frameCounts.counterClockwise
      ? constants.FrameDirTableWalkingWithIdleCounterClockwise
      : constants.FrameDirTableWalkingWithIdleClockwise;

    return frameDirTable[this.displayDir || Direction.NONE];
  }

  /**
   * Create an image element with a clip path
   */
  createElement(parentElement: SVGElement) {
    if (this.animation) {
      if (!this.animation.getElement()) {
        this.animation.createElement(parentElement);
      }

      if (!this.visible) {
        this.animation?.hide();
      }
    }

    if (this.legacyAnimation) {
      if (!this.legacyAnimation.getElement()) {
        this.legacyAnimation.createElement(parentElement);
      }

      if (!this.visible) {
        this.legacyAnimation.hide();
      }
    }
  }

  /**
   * This function should be called every frame, and moves the sprite around.
   */
  update() {
    super.update();

    // Draw the sprite's current location.
    this.studio.drawDebugRect('spriteCenter', this.x, this.y, 3, 3);
  }

  /**
   * Begin a fade out.
   * @param fadeTime - the duration of the fade (in milliseconds)
   */
  startFade(fadeTime: number) {
    this.startFadeTime = new Date().getTime();
    this.fadeTime =
      fadeTime === undefined ? constants.DEFAULT_ACTOR_FADE_TIME : fadeTime;
  }

  /**
   * Remove our element/clipPath/animator
   */
  removeElement() {
    this.animation?.removeElement();
    this.legacyAnimation?.removeElement();
  }

  /**
   * Retrieve animation frame duration (frames per tick)
   */
  getAnimationFrameDuration(): number {
    if (this.dir === Direction.NONE) {
      return this.normalFrameDuration;
    }

    return (
      (this.normalFrameDuration * constants.DEFAULT_SPRITE_SPEED) / this.speed
    );
  }

  /**
   * Display our item at its current location
   */
  display() {
    const currentTime = new Date().getTime();
    let opacity = 1;
    if (this.startFadeTime) {
      opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
      opacity = Math.max(opacity, 0);
      this.setOpacity(opacity);
      if (this.hasCompletedFade()) {
        // NOTE: we don't automatically change the state to hidden or set visible
        // to false here.
        this.startFadeTime = undefined;
      }
    }

    let useLegacyAnimation = false;
    let animationType;
    let animationIndex;
    const standingStill = this.displayDir === Direction.NONE;
    const facingSouthWithEmotion =
      this.displayDir === Direction.SOUTH && this.emotion !== Emotions.NORMAL;

    if (standingStill || (!this.animation && facingSouthWithEmotion)) {
      // Show idle animation while standing still
      // if we only have a legacy animation, also show while moving south
      animationIndex = this.emotion;
      animationType = 'idle';

      if (standingStill && this.frameCounts.normal) {
        // If we see legacy normal frames (which are "idle" animations), use them:
        useLegacyAnimation = true;
      } else if (this.animation && !this.frameCounts.idleNormal) {
        // If we are playing an "idle" animation from the primary spritesheet and
        // there were no "normal" idle animations in the sheet, index based on
        // (emotion - 1) instead of (emotion)
        animationIndex -= 1;
      }
    } else if (
      facingSouthWithEmotion &&
      this.animation?.hasType('walkingEmotions')
    ) {
      animationIndex = this.emotion - 1;
      animationType = 'walkingEmotions';
    } else {
      animationIndex = this.getDirectionFrame();
      animationType = 'direction';
    }

    if (!this.animation) {
      useLegacyAnimation = true;
    }

    const drawPosition = this.getCurrentDrawPosition();

    if (useLegacyAnimation) {
      // Legacy render path:
      this.animation?.hide();
      this.legacyAnimation?.setCurrentAnimation(animationType, animationIndex);
      this.legacyAnimation?.redrawCenteredAt(
        drawPosition,
        this.studio.tickCount,
      );
      if (this.visible) {
        this.legacyAnimation?.show();
      } else {
        this.legacyAnimation?.hide();
      }
    } else {
      this.animation?.setCurrentAnimation(animationType, animationIndex);
      this.animation?.redrawCenteredAt(drawPosition, this.studio.tickCount);
      if (this.visible) {
        this.animation?.show();
      } else {
        this.animation?.hide();
      }
      this.legacyAnimation?.hide();
    }

    this.lastDrawPosition = drawPosition;
  }

  /**
   * x and y props are not consistent with Item. In sprites they represent the
   * top left corner, in items they're the center.
   */
  getCenterPos(): {
    x: number;
    y: number;
  } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  /** @returns The center x, y coordinates for the next draw */
  getCurrentDrawPosition(): {
    x: number;
    y: number;
  } {
    return {
      x: this.displayX + this.drawWidth / 2 + this.renderOffset.x,
      y: this.displayY + this.drawHeight / 2 + this.renderOffset.y,
    };
  }

  updateAnimationFrameDuration() {
    this.animation?.setAnimationFrameDuration(this.getAnimationFrameDuration());
    this.legacyAnimation?.setAnimationFrameDuration(
      this.getAnimationFrameDuration(),
    );
  }

  /**
   * Sets the normal animation frame duration and changes the current animation
   * frame duration to match.
   * @param duration - Number of ticks per frame
   */
  setNormalFrameDuration(duration: number) {
    this.normalFrameDuration =
      duration || constants.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION;
    this.updateAnimationFrameDuration();
  }

  /**
   * Change visible opacity of this collidable sprite.
   * @param newOpacity - New opacity (between 0.0 and 1.0)
   */
  setOpacity(newOpacity: number) {
    this.animation?.setOpacity(newOpacity);
    this.legacyAnimation?.setOpacity(newOpacity);
  }

  atEdge(candidate: Candidate): boolean {
    return (
      candidate.gridX < 0 ||
      candidate.gridX * this.studio.SQUARE_SIZE + this.width >
        this.studio.MAZE_WIDTH ||
      candidate.gridY < 0 ||
      candidate.gridY * this.studio.SQUARE_SIZE + this.height >
        this.studio.MAZE_HEIGHT
    );
  }

  hasWall(candidate: Candidate): boolean {
    return this.studio.willSpriteTouchWall(
      this,
      candidate.gridX * this.studio.SQUARE_SIZE,
      candidate.gridY * this.studio.SQUARE_SIZE,
    );
  }
}

export default Sprite;
