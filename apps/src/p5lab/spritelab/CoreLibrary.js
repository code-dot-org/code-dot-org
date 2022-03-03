import {createUuid, stringToChunks, ellipsify} from '@cdo/apps/utils';
import * as drawUtils from '@cdo/apps/p5lab/drawUtils';
import commands from './commands/index';
import {APP_HEIGHT, APP_WIDTH} from '../constants';

export default class CoreLibrary {
  constructor(p5) {
    this.p5 = p5;
    this.spriteId = 0;
    this.nativeSpriteMap = {};
    this.inputEvents = [];
    this.behaviors = [];
    this.userInputEventCallbacks = {};
    this.totalPauseTime = 0;
    this.timerResetTime = {
      seconds: 0,
      frames: 0
    };
    this.numActivePrompts = 0;
    this.screenText = {};
    this.defaultSpriteSize = 100;
    this.printLog = [];
    this.promptVars = {};
    this.eventLog = [];
    this.speechBubbles = [];
    this.soundLog = [];
    this.criteria = [];
    this.previous = {};
    this.validationFrames = {
      delay: 90,
      fail: 150,
      pass: 90,
      successFrame: 0
    };

    this.commands = {
      executeDrawLoopAndCallbacks() {
        this.drawBackground();
        this.runBehaviors();
        this.runEvents();
        this.p5.drawSprites();
        this.drawSpeechBubbles();
        if (this.screenText.title || this.screenText.subtitle) {
          commands.drawTitle.apply(this);
        }
      },
      ...commands
    };
  }

  isPreviewFrame() {
    return this.currentFrame() === 1;
  }

  currentFrame() {
    return this.p5.World.frameCount;
  }

  getBackground() {
    return this.background;
  }

  setBackground(background) {
    this.background = background;
  }

  drawBackground() {
    if (typeof this.background === 'string') {
      this.p5.background(this.background);
    } else {
      this.p5.background('white');
    }
    if (typeof this.background === 'object') {
      this.background.resize(400, 400);
      this.p5.image(this.background);
    }
  }

  drawSpeechBubbles() {
    // Since this runs on every draw, remove any temporary speech
    // bubbles that have expired.
    this.removeExpiredSpeechBubbles();

    if (this.speechBubbles.length === 0 || this.isPreviewFrame()) {
      return;
    }

    this.speechBubbles.forEach(({text, sprite}) => {
      this.drawSpeechBubble(
        text,
        sprite.x,
        sprite.y - Math.round(sprite.getScaledHeight() / 2)
      );
    });
  }

  drawSpeechBubble(text, x, y) {
    const padding = 8;
    if (typeof text === 'number') {
      text = text.toString();
    }
    //protect against crashes in the unlikely event that a non-string or non-number was passed
    if (typeof text !== 'string') {
      text = '';
    }
    text = ellipsify(text, 150 /* maxLength */);
    let textSize;
    let charsPerLine;
    if (text.length < 50) {
      textSize = 20;
      charsPerLine = 16;
    } else if (text.length < 75) {
      textSize = 15;
      charsPerLine = 20;
    } else {
      textSize = 10;
      charsPerLine = 28;
    }

    const lines = stringToChunks(text, charsPerLine);
    // Since it's not a fixed-width font, we can't just use line length to
    // determine the longest line, we have to actually calculate each width.
    const longestLine = [...lines].sort((a, b) =>
      drawUtils.getTextWidth(this.p5, a, textSize) <
      drawUtils.getTextWidth(this.p5, b, textSize)
        ? 1
        : -1
    )[0];
    let width =
      drawUtils.getTextWidth(this.p5, longestLine, textSize) + padding * 2;
    width = Math.max(width, 50);
    const height = lines.length * textSize + padding * 2;

    let triangleSize = 10;
    let triangleTipX = x;
    // The number of pixels used to create the rounded corners of the speech bubble:
    const rectangleCornerRadius = 8;

    // For the calculations below, keep in mind that x and y are located at the horizontal center and the top of the sprite, respectively.
    // In other words, x and y indicate the default position of the bubble's triangular tip.
    y = Math.min(y, APP_HEIGHT);
    const spriteX = x;
    if (y - height - triangleSize < 1) {
      triangleSize = Math.max(1, y - height);
      y = height + triangleSize;
    }
    if (spriteX - width / 2 < 1) {
      triangleTipX = Math.max(spriteX, rectangleCornerRadius + triangleSize);
      x = width / 2;
    }
    if (spriteX + width / 2 > APP_WIDTH) {
      triangleTipX = Math.min(spriteX, APP_WIDTH - rectangleCornerRadius);
      x = APP_WIDTH - width / 2;
    }

    // Draw bubble.
    const {minY} = drawUtils.speechBubble(this.p5, x, y, width, height, {
      triangleSize,
      triangleTipX,
      rectangleCornerRadius
    });

    // Draw text within bubble.
    drawUtils.multilineText(this.p5, lines, x, minY + padding, textSize, {
      horizontalAlign: this.p5.CENTER
    });
  }

  addSpeechBubble(sprite, text, seconds = null) {
    // Sprites can only have one speech bubble at a time so first filter out
    // any existing speech bubbles for this sprite
    this.removeSpeechBubblesForSprite(sprite);

    const id = createUuid();
    const removeAt = seconds ? this.getUnpausedWorldTime() + seconds : null;
    // Note: renderFrame is used by validation code.
    this.speechBubbles.push({
      id,
      sprite,
      text,
      removeAt,
      renderFrame: this.currentFrame()
    });
    return id;
  }

  removeSpeechBubblesForSprite(sprite) {
    this.speechBubbles = this.speechBubbles.filter(
      bubble => bubble.sprite !== sprite
    );
  }

  removeExpiredSpeechBubbles() {
    this.speechBubbles = this.speechBubbles.filter(
      ({removeAt}) => !removeAt || removeAt > this.getUnpausedWorldTime()
    );
  }

  startPause(time) {
    this.currentPauseStartTime = time;
  }

  endPause(time) {
    if (this.currentPauseStartTime) {
      this.totalPauseTime += time - this.currentPauseStartTime;
      this.currentPauseStartTime = 0;
    }
  }

  /**
   * Returns World.seconds adjusted to exclude time during which the app was paused
   */
  getUnpausedWorldTime() {
    const current = new Date().getTime();
    return Math.round(
      (current - this.p5._startTime - this.totalPauseTime) / 1000
    );
  }

  /**
   * Returns time (in seconds) since last resetTimer(), excluding time during which the app was paused
   */
  getSecondsSinceReset() {
    return this.getUnpausedWorldTime(this.p5) - this.timerResetTime.seconds;
  }

  /**
   * Returns time (in frames) since last resetTimer()
   */
  getFramesSinceReset() {
    return this.p5.frameCount - this.timerResetTime.frames;
  }

  /**
   * Returns a list of sprites, specified either by id, name, or animation name.
   * @param {Object} spriteArg - Specifies a sprite or group of sprites by id, name, or animation name.
   * @return {[Sprite]} List of sprites that match the parameter. Either a list containing the one sprite
   * the specified id/name, or a list containing all sprites with the specified animation.
   */
  getSpriteArray(spriteArg) {
    if (!spriteArg) {
      return [];
    }
    if (spriteArg.hasOwnProperty('id')) {
      let sprite = this.nativeSpriteMap[spriteArg.id];
      if (sprite) {
        return [sprite];
      }
    }
    if (spriteArg.name) {
      let sprite = Object.values(this.nativeSpriteMap).find(
        sprite => sprite.name === spriteArg.name
      );
      if (sprite) {
        return [sprite];
      }
    }
    if (spriteArg.costume) {
      if (spriteArg.costume === 'all') {
        return Object.values(this.nativeSpriteMap);
      } else {
        return Object.values(this.nativeSpriteMap).filter(
          sprite => sprite.getAnimationLabel() === spriteArg.costume
        );
      }
    }
    return [];
  }

  getAnimationsInUse() {
    let animations = new Set();
    Object.values(this.nativeSpriteMap).filter(sprite =>
      animations.add(sprite.getAnimationLabel())
    );

    return Array.from(animations);
  }

  /**
   * @param {string} animation
   * @return {number} Number of behaviors associated with the specified animation.
   */
  getNumBehaviorsForAnimation(animation) {
    let numBehaviors = 0;
    this.behaviors.forEach(behavior => {
      if (behavior.sprite.getAnimationLabel() === animation) {
        numBehaviors++;
      }
    });
    return numBehaviors;
  }

  /**
   * @param {number} spriteId
   * @return {number} Number of behaviors associated with the specified sprite
   */
  getNumBehaviorsForSpriteId(spriteId) {
    let numBehaviors = 0;
    this.behaviors.forEach(behavior => {
      if (behavior.sprite.id === spriteId) {
        numBehaviors++;
      }
    });
    return numBehaviors;
  }

  /**
   * @param {number} spriteId
   * @return {[String]} List containing the names of the behaviors associated
   * with the specified sprite
   */
  getBehaviorsForSpriteId(spriteId) {
    let spriteBehaviors = [];
    this.behaviors.forEach(behavior => {
      if (behavior.sprite.id === spriteId) {
        spriteBehaviors.push(behavior.name);
      }
    });
    return spriteBehaviors;
  }

  getSpriteIdsInUse() {
    let spriteIds = [];
    Object.keys(this.nativeSpriteMap).forEach(spriteId =>
      spriteIds.push(parseInt(spriteId))
    );
    return spriteIds;
  }

  getLastSpeechBubbleForSpriteId(spriteId) {
    const speechBubbles = this.speechBubbles.filter(
      ({sprite}) => sprite.id === parseInt(spriteId)
    );
    return speechBubbles[speechBubbles.length - 1];
  }

  /**
   * Adds the specified sprite to the native sprite map
   * @param {Sprite} sprite
   * @returns {Number} A unique id to reference the sprite.
   */
  addSprite(opts) {
    opts = opts || {};
    let name = opts.name;
    let location = opts.location || {x: 200, y: 200};
    if (typeof location === 'function') {
      location = location();
    }
    let animation = opts.animation;

    const sprite = this.p5.createSprite(location.x, location.y);
    this.nativeSpriteMap[this.spriteId] = sprite;
    sprite.id = this.spriteId;
    if (name) {
      this.enforceUniqueSpriteName(name);
      sprite.name = name;
    }

    sprite.direction = opts.direction || 0;
    sprite.rotation = opts.rotation || 0;
    sprite.speed = opts.speed || 5;
    sprite.lifetime = opts.lifetime || -1;
    if (opts.delay) {
      sprite.delay = opts.delay;
    }
    if (opts.initialAngle) {
      sprite.initialAngle = opts.initialAngle;
    }

    sprite.baseScale = 1;
    sprite.setScale = function(scale) {
      sprite.scale = scale * sprite.baseScale;
    };
    sprite.getScale = function() {
      return sprite.scale / sprite.baseScale;
    };
    if (animation) {
      sprite.setAnimation(animation);
      sprite.scale /= sprite.baseScale;
      sprite.baseScale =
        100 /
        Math.max(
          100,
          sprite.animation.getHeight(),
          sprite.animation.getWidth()
        );
      sprite.scale *= sprite.baseScale;
    }
    sprite.setScale((opts.scale || this.defaultSpriteSize) / 100);

    // If there are any whenSpriteCreated events, call the callback immediately
    // so that the event happens during the same draw loop frame.
    this.runSpriteCreatedEvents(sprite);

    this.spriteId++;
    return sprite.id;
  }

  /**
   * Enforces that two sprites cannot have the same name. This is enforced by clearing
   * the name from any existing sprites when a new sprite is created with that name.
   * @param {String} name
   */
  enforceUniqueSpriteName(name) {
    Object.values(this.nativeSpriteMap).forEach(sprite => {
      if (sprite.name === name) {
        sprite.name = undefined;
      }
    });
  }

  /**
   * Removes a sprite from the native sprite map
   * @param {Number} spriteId
   */
  deleteSprite(spriteId) {
    delete this.nativeSpriteMap[spriteId];
  }

  registerPrompt(promptText, variableName, setterCallback) {
    this.numActivePrompts++;
    if (!variableName) {
      return;
    }
    if (this.promptVars[variableName] === undefined) {
      // Set explicitly to null so that we can tell that there *is* a prompt
      // for this variable name, it just hasn't been answered yet.
      this.promptVars[variableName] = null;
    }

    if (!this.userInputEventCallbacks[variableName]) {
      this.userInputEventCallbacks[variableName] = {
        setterCallbacks: [],
        userCallbacks: []
      };
    }
    this.userInputEventCallbacks[variableName].setterCallbacks.push(
      setterCallback
    );
  }

  registerPromptAnswerCallback(variableName, userCallback) {
    if (!variableName) {
      return;
    }
    if (!this.userInputEventCallbacks[variableName]) {
      this.userInputEventCallbacks[variableName] = {
        setterCallbacks: [],
        userCallbacks: []
      };
    }
    this.userInputEventCallbacks[variableName].userCallbacks.push(userCallback);
  }

  onPromptAnswer(variableName, userInput) {
    this.numActivePrompts--;
    this.promptVars[variableName] = userInput;
    const callbacks = this.userInputEventCallbacks[variableName];
    if (callbacks) {
      // Make sure to call the setter callback to set the variable
      // before the user callback, which may rely on the variable's new value
      callbacks.setterCallbacks.forEach(callback => {
        callback(userInput);
      });
      callbacks.userCallbacks.forEach(callback => {
        callback();
      });
    }
  }

  addEvent(type, args, callback) {
    this.inputEvents.push({type, args, callback});
  }

  clearCollectDataEvents() {
    this.inputEvents = this.inputEvents.filter(e => e.type !== 'collectData');
  }

  runSpriteCreatedEvents(newSprite) {
    const matchingInputEvents = this.inputEvents.filter(
      inputEvent =>
        inputEvent.type === 'whenSpriteCreated' &&
        (inputEvent.args.name === newSprite.name ||
          inputEvent.args.costume === newSprite.getAnimationLabel() ||
          inputEvent.args.costume === 'all')
    );
    matchingInputEvents.forEach(inputEvent => {
      this.eventLog.push(`spriteCreated: ${newSprite.id}`);
      inputEvent.callback({newSprite: newSprite.id});
    });
  }

  atTimeEvent(inputEvent) {
    if (inputEvent.args.unit === 'seconds') {
      const previousTime = inputEvent.previousTime || 0;
      const worldTime = this.getSecondsSinceReset();
      inputEvent.previousTime = worldTime;
      // There are many ticks per second, but we only want to fire the event once (on the first tick where
      // the time matches the event argument)
      if (
        worldTime === inputEvent.args.n &&
        previousTime !== inputEvent.args.n
      ) {
        // Call callback with no extra args
        this.eventLog.push(`atTime: ${inputEvent.args.n}`);
        return [{}];
      }
    } else if (inputEvent.args.unit === 'frames') {
      const worldFrames = this.getFramesSinceReset();
      if (worldFrames === inputEvent.args.n) {
        // Call callback with no extra args
        this.eventLog.push(`atTime: ${inputEvent.args.n}`);
        return [{}];
      }
    }
    // Don't call callback
    return [];
  }

  collectDataEvent(inputEvent) {
    const previous = inputEvent.previous || 0;
    const worldTime = this.getUnpausedWorldTime(this.p5);
    inputEvent.previous = worldTime;

    // Only log data once per second
    if (worldTime !== previous) {
      // Call callback with no extra args
      return [{}];
    } else {
      // Don't call callback
      return [];
    }
  }

  repeatForeverEvent(inputEvent) {
    // No condition to check, just always call callback with no extra args
    return [{}];
  }

  whenPressEvent(inputEvent) {
    if (this.p5.keyWentDown(inputEvent.args.key)) {
      this.eventLog.push(`whenPress: ${inputEvent.args.key}`);
      // Call callback with no extra args
      return [{}];
    } else {
      // Don't call callback
      return [];
    }
  }

  whilePressEvent(inputEvent) {
    if (this.p5.keyDown(inputEvent.args.key)) {
      // Prevent spamming the event log with repeated events
      if (!this.eventLog[this.eventLog.length - 1]?.includes('whilePress')) {
        this.eventLog.push(`whilePress: ${inputEvent.args.key}`);
      }
      // Call callback with no extra args
      return [{}];
    } else {
      // Don't call callback
      return [];
    }
  }

  whenTouchEvent(inputEvent) {
    const getFired = function(map, spriteId, targetId) {
      if (map && map[spriteId] && map[spriteId][targetId]) {
        return map[spriteId][targetId].firedOnce;
      }
    };
    const setFired = function(map, spriteId, targetId, fired) {
      if (!map) {
        map = {};
      }
      if (!map[spriteId]) {
        map[spriteId] = {};
      }
      if (!map[spriteId][targetId]) {
        map[spriteId][targetId] = {};
      }
      map[spriteId][targetId].firedOnce = fired;
    };
    const sprites = this.getSpriteArray(inputEvent.args.sprite1);
    const targets = this.getSpriteArray(inputEvent.args.sprite2);
    const callbackArgList = [];
    const previousCollisions = inputEvent.previous;

    // We need to clear out previous, so that events get re-triggered when sprite animations change
    inputEvent.previous = {};
    sprites.forEach(sprite => {
      targets.forEach(target => {
        let firedOnce = getFired(previousCollisions, sprite.id, target.id);
        if (sprite.overlap(target)) {
          if (!firedOnce) {
            // Sprites are overlapping, and we haven't fired yet for this collision,
            // so we should fire the callback
            this.eventLog.push(`whenTouch: ${sprite.id} ${target.id}`);
            callbackArgList.push({
              subjectSprite: sprite.id,
              objectSprite: target.id
            });
            firedOnce = true;
          }
        } else {
          // Sprites are not overlapping (anymore), so we should make sure firedOnce is
          // set to false, so that if the sprites overlap again, we will fire the callback.
          // This is required to handle the case where sprites start touching, stop touching, and start
          // touching again- we want the callback to fire two times.
          firedOnce = false;
        }
        setFired(inputEvent.previous, sprite.id, target.id, firedOnce);
      });
    });
    return callbackArgList;
  }

  whileTouchEvent(inputEvent) {
    const callbackArgList = [];
    const sprites = this.getSpriteArray(inputEvent.args.sprite1);
    const targets = this.getSpriteArray(inputEvent.args.sprite2);
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.overlap(target)) {
          // Prevent spamming the event log with repeated events
          if (
            !this.eventLog[this.eventLog.length - 1]?.includes('whileTouch')
          ) {
            this.eventLog.push(`whileTouch: ${sprite.id} ${target.id}`);
          }
          callbackArgList.push({
            subjectSprite: sprite.id,
            objectSprite: target.id
          });
        }
      });
    });
    return callbackArgList;
  }

  whenClickEvent(inputEvent) {
    const callbackArgList = [];
    if (this.p5.mouseWentDown('leftButton')) {
      const sprites = this.getSpriteArray(inputEvent.args.sprite);
      sprites.forEach(sprite => {
        if (this.p5.mouseIsOver(sprite)) {
          this.eventLog.push(`whenClick: ${sprite.id}`);
          callbackArgList.push({clickedSprite: sprite.id});
        }
      });
    }
    return callbackArgList;
  }

  whileClickEvent(inputEvent) {
    const callbackArgList = [];
    const sprites = this.getSpriteArray(inputEvent.args.sprite);
    sprites.forEach(sprite => {
      if (this.p5.mousePressedOver(sprite)) {
        // Prevent spamming the event log with repeated events
        if (!this.eventLog[this.eventLog.length - 1]?.includes('whileClick')) {
          this.eventLog.push(`whileClick: ${sprite.id}`);
        }
        callbackArgList.push({clickedSprite: sprite.id});
      }
    });
    return callbackArgList;
  }

  whenAllPromptsAnswered(inputEvent) {
    const previous = inputEvent.previous;
    inputEvent.previous = this.numActivePrompts;
    if (previous !== this.numActivePrompts && this.numActivePrompts === 0) {
      // Call callback with no extra args
      return [{}];
    }
    // Don't call callback.
    return [];
  }

  /**
   * @param {Object} inputEvent
   * Checks whether the condition of the event is met, and if so, returns the arguments to pass to the user's
   * callback function. An event can trigger multiple invocations of the callback in a single tick of the
   * draw loop, so this will return an array of callback arguments.
   * @return {Array.<Object>} Each element of this array gives the arguments that will be passed
   * to the event callback.
   */
  getCallbackArgListForEvent(inputEvent) {
    switch (inputEvent.type) {
      case 'atTime':
        return this.atTimeEvent(inputEvent);
      case 'collectData':
        return this.collectDataEvent(inputEvent);
      case 'repeatForever':
        return this.repeatForeverEvent(inputEvent);
      case 'whenpress':
        return this.whenPressEvent(inputEvent);
      case 'whilepress':
        return this.whilePressEvent(inputEvent);
      case 'whentouch':
        return this.whenTouchEvent(inputEvent);
      case 'whiletouch':
        return this.whileTouchEvent(inputEvent);
      case 'whenclick':
        return this.whenClickEvent(inputEvent);
      case 'whileclick':
        return this.whileClickEvent(inputEvent);
      case 'whenSpriteCreated':
        // This event is handled immediately when the sprite is created. See addSprite()
        return [];
      case 'whenAllPromptsAnswered':
        return this.whenAllPromptsAnswered(inputEvent);
    }
  }

  runEvents() {
    this.inputEvents.forEach(inputEvent => {
      const callbackArgList = this.getCallbackArgListForEvent(inputEvent);
      callbackArgList.forEach(args => {
        inputEvent.callback(args);
      });
    });
  }

  addBehavior(sprite, behavior) {
    if (sprite && behavior) {
      const existing = this.behaviors.find(
        b => b.sprite === sprite && b.name === behavior.name
      );
      if (!existing) {
        this.behaviors.push({
          func: behavior.func,
          name: behavior.name,
          sprite: sprite
        });
      }
    }
  }

  removeAllBehaviors(sprite) {
    this.behaviors = this.behaviors.filter(
      behavior => behavior.sprite !== sprite
    );
  }

  removeBehavior(sprite, behavior) {
    if (sprite && behavior) {
      let index = this.behaviors.findIndex(
        b => b.sprite === sprite && b.name === behavior.name
      );
      if (index !== -1) {
        this.behaviors.splice(index, 1);
      }
    }
  }

  runBehaviors() {
    this.behaviors.forEach(behavior => behavior.func({id: behavior.sprite.id}));
  }
}
