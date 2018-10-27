import * as constants from './constants';
import Item from './Item';
import StudioAnimation from './StudioAnimation';
import StudioSpriteSheet from './StudioSpriteSheet';
import { valueOr } from '../utils';

const Direction = constants.Direction;
const Emotions = constants.Emotions;

/**
 * A Sprite is a type of Item.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Item}
 */
export default class Sprite extends Item {
  constructor(options) {
    // call collidable constructor
    super(options);

    /**
     * Rendering offset for item animation vs display position - applied as
     * late as possible.
     * @type {{x: number, y: number}}
     */
    this.renderOffset = options.renderOffset || { x: 0, y: 0 };

    this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED;
    this.setNormalFrameDuration(options.animationFrameDuration);
    this.displayDir = options.displayDir || Direction.NONE;
    this.startFadeTime = null;
    this.fadeTime = 0;

    this.image = null;
    this.legacyImage = null;

    this.animation_ = null;
    this.legacyAnimation_ = null;

    this.useLegacyIdleEmotionAnimations = false;

    this.lastDrawPosition = { x: 0, y: 0 };
  }


  /**
   * FrameCounts objects are used in setImage and setLegacyImage:
   * @typedef {Object} FrameCounts
   * @property {number} walkFrames - frames in walk animations (spriteSheet)
   * @property {number} idleFrames - frames in idle animations (spriteSheet)
   * @property {number} walk - default frames in all types of animations (spriteSheet)
   * @property {number} idleNormal - number of idle animations (spriteSheet)
   * @property {number} idleEmotions - number of idle animations for each emotion (spriteSheet)
   * @property {number} walkingEmotions - number of south walking animations for each emotion (spriteSheet)
   * @property {number} turns - how many turn animations (applies to spriteSheet && legacySpriteSheet)
   * @property {boolean} counterClockwise - turn animations are in counter
   *    clockwise order (spriteSheet)
   * @property {number} packedSheetFrameCount - count of frames before wrapping
   *    for a packed sheet (applies to spriteSheet)
   * @property {number} normal - number of frames in idle animation (legacySpriteSheet)
   * @property {number} holdIdleFrame0Count - number of times to repeat frame 0 of idle animation (legacySpriteSheet)
   * @property {number} emotions - number of emotions included, 1 frame each (legacySpriteSheet)
   * @property {number} extraEmotions - number of emotions included, all frames cloned (legacySpriteSheet)
   */

  /**
   * Sets (or modifies) the image for the preferred spritesheet format - we will
   * generate a StudioSpriteSheet and StudioAnimation in response..
   *
   * @param {string} image URL for spritesheet image
   * @param {FrameCounts} frameCounts metadata describing spritesheet
   */
  setImage(image, frameCounts) {
    if (image === this.image) {
      return;
    }

    this.image = image;

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      frameWidth: this.drawWidth,
      frameHeight: this.drawHeight,
      assetPath: this.image,
      animations: [
        {
          type: 'direction',
          count: frameCounts.turns || 0,
          frames: frameCounts.walkFrames || frameCounts.walk
        },
        {
          type: 'idle',
          count: (frameCounts.idleNormal || 0) + (frameCounts.idleEmotions || 0),
          frames: frameCounts.idleFrames || frameCounts.walk
        },
        {
          type: 'walkingEmotions',
          count: frameCounts.walkingEmotions || 0,
          frames: frameCounts.walkFrames || frameCounts.walk
        }
      ],
      packedSheetFrameCount: frameCounts.packedSheetFrameCount,
      defaultFramesPerAnimation: frameCounts.walk,
      skewAnimations: true
    };

    if (this.animation_) {
      this.animation_.removeElement();
    }

    if (!this.image) {
      this.animation_ = null;
      return;
    }

    this.animation_ = new StudioAnimation(Object.assign({}, options, {
      spriteSheet: new StudioSpriteSheet(options),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));
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
   * @param {string} image URL for spritesheet image
   * @param {FrameCounts} frameCounts metadata describing spritesheet
   */
  setLegacyImage(image, frameCounts) {
    if (image === this.legacyImage) {
      return;
    }

    this.legacyImage = image;

    var rowCount = 1 + valueOr(frameCounts.extraEmotions, 0);
    var frameCount = frameCounts.normal + frameCounts.turns + frameCounts.emotions;

    var options = {
      renderScale: this.renderScale,
      opacity: this.opacity,
      loop: this.loop,
      animationFrameDuration: this.animationFrameDuration,
      frameWidth: this.drawWidth,
      frameHeight: this.drawHeight,
      assetPath: this.legacyImage,
      animations: [
        {
          type: 'legacyEmotionRow',
          count: rowCount,
          frames: frameCount
        }
      ],
      defaultFramesPerAnimation: frameCount,
      horizontalAnimation: true,
      skewAnimations: true
    };

    if (this.legacyAnimation_) {
      this.legacyAnimation_.removeElement();
    }

    if (!this.legacyImage) {
      this.legacyAnimation_ = null;
      return;
    }

    this.legacyAnimation_ = new StudioAnimation(Object.assign({}, options, {
      spriteSheet: new StudioSpriteSheet(options),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));

    var turnCount = valueOr(frameCounts.turns, 0);
    var frame0Count = valueOr(frameCounts.holdIdleFrame0Count, 1);
    var i, animationList;

    for (var row = 0; row < rowCount; row++) {
      // Create a new special animation called "idle":
      animationList = [];

      for (i = 0; i < frame0Count; i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: 0
        });
      }
      for (i = 1; i < frameCounts.normal; i++) {
        animationList.push({
          type: 'legacyEmotionRow',
          index: row,
          frame: i
        });
      }
      this.legacyAnimation_.createSpecialAnimation('idle', row, animationList);

      // Create single-frame 'direction' animations from each 'turn' frame:
      if (turnCount >= 7) {
        var turnIndex = 0;
        var frameIndex = 0;
        if (turnCount === 7) {
          // If turnCount is only 7, create the first animation from 'normal'
          // frame 0.
          this.legacyAnimation_.createSpecialAnimation('direction',
              turnIndex,
              [{ type: 'legacyEmotionRow', index: row, frame: 0 }]);
          turnIndex++;
        }
        for (;turnIndex < 8; turnIndex++, frameIndex++) {
          this.legacyAnimation_.createSpecialAnimation('direction',
              turnIndex,
              [{ type: 'legacyEmotionRow',
                  index: row,
                  frame: this.frameCounts.normal + frameIndex
              }]);
        }
      }
    }

    if (rowCount === 1) {
      // If no extra emotions were supplied as complete rows, we can create
      // special idle animations for each emotion from single emotion frames:

      for (i = 0; i < frameCounts.emotions; i++) {
      // Create a new special animation called "idle" with emotion as index:
        animationList = [];
        for (var j = 0; j < frame0Count; j++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: frameCounts.normal + frameCounts.turns + i
          });
        }
        for (var k = 1; k < frameCounts.normal; k++) {
          animationList.push({
            type: 'legacyEmotionRow',
            index: 0,
            frame: k
          });
        }
        this.legacyAnimation_.createSpecialAnimation('idle', i + 1, animationList);
        this.useLegacyIdleEmotionAnimations = true;
      }
    }
  }

  /**
   * @returns {SVGImageElement}
   * @override
   */
  getElement() {
    return this.animation_ ? this.animation_.getElement() : null;
  }

  /**
   * @returns {SVGImageElement}
   */
  getLegacyElement() {
    return this.legacyAnimation_ ? this.legacyAnimation_.getElement() : null;
  }

  /**
   * Returns the frame of the spritesheet for the current walking direction.
   * @override
   */
  getDirectionFrame() {
    var frameDirTable = this.frameCounts.counterClockwise ?
      constants.frameDirTableWalkingWithIdleCounterclockwise :
      constants.frameDirTableWalkingWithIdleClockwise;

    return frameDirTable[this.displayDir];
  }

  /**
   * Create an image element with a clip path
   * @override
   */
  createElement(parentElement) {
    if (this.animation_) {
      if (!this.animation_.getElement()) {
        this.animation_.createElement(parentElement);
      }
      if (!this.visible) {
        this.animation_.hide();
      }
    }
    if (this.legacyAnimation_) {
      if (!this.legacyAnimation_.getElement()) {
        this.legacyAnimation_.createElement(parentElement);
      }
      if (!this.visible) {
        this.legacyAnimation_.hide();
      }
    }
  }

  /**
   * This function should be called every frame, and moves the sprite around.
   */
  update() {
    super.update();

    // Draw the sprite's current location.
    Studio.drawDebugRect("spriteCenter", this.x, this.y, 3, 3);
  }

  /**
   * Begin a fade out.
   * @param {!number} fadeTime - the duration of the fade (in milliseconds)
   */
  startFade(fadeTime) {
    this.startFadeTime = new Date().getTime();
    this.fadeTime = valueOr(fadeTime, constants.DEFAULT_ACTOR_FADE_TIME);
  }

  /**
   * Remove our element/clipPath/animator
   * @override
   */
  removeElement() {
    if (this.animation_) {
      this.animation_.removeElement();
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.removeElement();
    }
  }

  /**
   * Retrieve animation frame duration (frames per tick)
   * @override
   */
  getAnimationFrameDuration() {
    if (this.dir === Direction.NONE) {
      return this.normalFrameDuration;
    } else {
      return this.normalFrameDuration * constants.DEFAULT_SPRITE_SPEED / this.speed;
    }
  }

  /**
   * Display our item at its current location
   * @override
   */
  display() {
    var currentTime = new Date().getTime();
    var opacity = 1;
    if (this.startFadeTime) {
      opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
      opacity = Math.max(opacity, 0);
      this.setOpacity(opacity);
      if (this.hasCompletedFade()) {
        // NOTE: we don't automatically change the state to hidden or set visible
        // to false here.
        this.startFadeTime = null;
      }
    }

    var useLegacyAnimation = false;
    var animationType;
    var animationIndex;
    var standingStill = this.displayDir === Direction.NONE;
    var facingSouthWithEmotion =
        this.displayDir === Direction.SOUTH && this.emotion !== Emotions.NORMAL;

    if (standingStill || (!this.animation_ && facingSouthWithEmotion)) {
      // Show idle animation while standing still
      // if we only have a legacy animation, also show while moving south
      animationIndex = this.emotion;
      animationType = 'idle';

      if (standingStill && this.frameCounts.normal) {
        // If we see legacy normal frames (which are "idle" animations), use them:
        useLegacyAnimation = true;
      } else if (this.animation_ && !this.frameCounts.idleNormal) {
        // If we are playing an "idle" animation from the primary spritesheet and
        // there were no "normal" idle animations in the sheet, index based on
        // (emotion - 1) instead of (emotion)
        animationIndex -= 1;
      }
    } else if (facingSouthWithEmotion &&
        this.animation_ && this.animation_.hasType('walkingEmotions')) {
      animationIndex = this.emotion - 1;
      animationType = 'walkingEmotions';
    } else {
      animationIndex = this.getDirectionFrame();
      animationType = 'direction';
    }
    if (!this.animation_) {
      useLegacyAnimation = true;
    }

    var drawPosition = this.getCurrentDrawPosition();

    if (useLegacyAnimation) {
      // Legacy render path:
      if (this.animation_) {
        this.animation_.hide();
      }
      if (this.legacyAnimation_) {
        this.legacyAnimation_.setCurrentAnimation(animationType, animationIndex);
        this.legacyAnimation_.redrawCenteredAt(drawPosition, Studio.tickCount);
        if (this.visible) {
          this.legacyAnimation_.show();
        } else {
          this.legacyAnimation_.hide();
        }
      }
    } else {
      this.animation_.setCurrentAnimation(animationType, animationIndex);
      this.animation_.redrawCenteredAt(drawPosition, Studio.tickCount);
      if (this.visible) {
        this.animation_.show();
      } else {
        this.animation_.hide();
      }
      if (this.legacyAnimation_) {
        this.legacyAnimation_.hide();
      }
    }

    this.lastDrawPosition = drawPosition;
  }

  /**
   * x and y props are not consistent with Item. In sprites they represent the
   * top left corner, in items they're the center.
   * @override
   */
  getCenterPos() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  /** @returns {object} the center x, y coordinates for the next draw */
  getCurrentDrawPosition() {
    return {
      x: this.displayX + (this.drawWidth / 2) + this.renderOffset.x,
      y: this.displayY + (this.drawHeight / 2) + this.renderOffset.y
    };
  }

  /**
   * @override
   */
  updateAnimationFrameDuration_() {
    if (this.animation_) {
      this.animation_.setAnimationFrameDuration(this.getAnimationFrameDuration());
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.setAnimationFrameDuration(
          this.getAnimationFrameDuration());
    }
  }

  /**
   * Sets the normal animation frame duration and changes the current animation
   * frame duration to match.
   * @param {number} duration Number of ticks per frame
   */
  setNormalFrameDuration(duration) {
    this.normalFrameDuration = duration ||
        constants.DEFAULT_SPRITE_ANIMATION_FRAME_DURATION;
    this.updateAnimationFrameDuration_();
  }

  /**
   * Change visible opacity of this collidable sprite.
   * @param {number} newOpacity (between 0 and 1)
   * @override
   */
  setOpacity(newOpacity) {
    if (this.animation_) {
      this.animation_.setOpacity(newOpacity);
    }
    if (this.legacyAnimation_) {
      this.legacyAnimation_.setOpacity(newOpacity);
    }
  }

  /**
   * @override
   */
  atEdge(candidate) {
    return candidate.gridX < 0 ||
        (candidate.gridX * Studio.SQUARE_SIZE + this.width) > Studio.MAZE_WIDTH ||
        candidate.gridY < 0 ||
        (candidate.gridY * Studio.SQUARE_SIZE + this.height) > Studio.MAZE_HEIGHT;
  }

  /**
   * @override
   */
  hasWall(candidate) {
    return Studio.willSpriteTouchWall(
        this,
        candidate.gridX * Studio.SQUARE_SIZE,
        candidate.gridY * Studio.SQUARE_SIZE);
  }
}
