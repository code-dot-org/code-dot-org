import type {KeyName, SpriteP5} from '../../sprites';

import {commands} from './commands/index';
import {MAX_NUM_SPRITES, SPRITE_WARNING_BUFFER} from './constants';
import {APP_HEIGHT, APP_WIDTH} from './p5lab/constants';
import * as drawUtils from './p5lab/drawUtils';
import * as locationUtils from './p5lab/locationUtils';
import type {StoryLabText} from './p5lab/storyLabUtils';
import {formatForPlayspace} from './p5lab/utils';
import {NO_OP_HOST, type RuntimeHost} from './RuntimeHost';
import type {
  Background,
  BackgroundImage,
  Behavior,
  BubbleType,
  Criterion,
  EventArgs,
  EventCallback,
  ForegroundEffect,
  InputEvent,
  InputEventArgs,
  LocationInput,
  PreviousFrame,
  PromptCallbacks,
  RuntimeSprite,
  ScreenText,
  SpeechBubble,
  SpriteArg,
  SpriteBehavior,
  SpriteOptions,
  TouchMemory,
  ValidationFrames,
  VariableBubble,
  WatchInterpreter,
} from './types';
import {createUuid, ellipsify, stringToChunks} from './util/utils';

function drawLoop(library: CoreLibrary): void {
  library.drawBackground();
  library.runBehaviors();
  library.runEvents();
  library.p5.drawSprites();
  library.drawVariableBubbles();
  library.drawSpeechBubbles();
  // Don't show foreground effect in preview
  if (!library.isPreviewFrame()) {
    library.foregroundEffects.forEach(effect => effect.func());
  }
  if (library.screenText.title || library.screenText.subtitle) {
    commands.drawTitle.apply(library);
  }
  commands.drawStoryLabText.apply(library);
}

export type Commands = typeof commands & {
  executeDrawLoopAndCallbacks(this: CoreLibrary): void;
};

export default class CoreLibrary {
  readonly p5: SpriteP5;
  readonly host: RuntimeHost;
  jsInterpreter: WatchInterpreter | undefined;
  /** Classic Sprite Lab's background images by name, which its host fills. */
  preloadedBackgrounds: Record<string, BackgroundImage> = {};
  spriteId = 0;
  nativeSpriteMap: Record<number, RuntimeSprite> = {};
  inputEvents: InputEvent[] = [];
  behaviors: SpriteBehavior[] = [];
  userInputEventCallbacks: Record<string, PromptCallbacks> = {};
  totalPauseTime = 0;
  currentPauseStartTime = 0;
  timerResetTime = {seconds: 0, frames: 0};
  numActivePrompts = 0;
  screenText: ScreenText = {};
  defaultSpriteSize = 100;
  /** Tolerance (px) for resting-contact comparisons in isDirectlyAbove. */
  contactEpsilon = 0;
  printLog: unknown[] = [];
  promptVars: Record<string, unknown> = {};
  eventLog: string[] = [];
  speechBubbles: SpeechBubble[] = [];
  storyLabText: StoryLabText = {};
  soundLog: string[] = [];
  criteria: Criterion[] = [];
  bonusCriteria: Criterion[] = [];
  previous: PreviousFrame = {};
  successMessage: string | undefined = 'genericSuccess';
  bonusSuccessMessage: string | undefined = 'genericBonusSuccess';
  validationFrames: ValidationFrames = {
    delay: 90,
    fail: 150,
    pass: 90,
    successFrame: 0,
  };
  foregroundEffects: ForegroundEffect[] = [];
  variableBubbles: VariableBubble[] = [];
  background: Background;
  readonly commands: Commands;

  constructor(
    p5: SpriteP5,
    jsInterpreter?: WatchInterpreter,
    host: RuntimeHost = NO_OP_HOST,
  ) {
    this.p5 = p5;
    this.host = host;
    this.jsInterpreter = jsInterpreter;
    this.commands = {
      executeDrawLoopAndCallbacks(this: CoreLibrary) {
        drawLoop(this);
      },
      ...commands,
    };
  }

  isPreviewFrame(): boolean {
    return this.currentFrame() === 1;
  }

  currentFrame(): number {
    return this.p5.World.frameCount;
  }

  getBackground(): Background {
    return this.background;
  }

  setBackground(background: Background): void {
    this.background = background;
  }

  drawBackground(): void {
    if (typeof this.background === 'string') {
      this.p5.background(this.background);
    } else {
      this.p5.background('white');
    }
    if (typeof this.background === 'object') {
      this.background.resize(400, 400);
      this.p5.image(this.background, 0, 0);
    }
  }

  drawSpeechBubbles(): void {
    // Since this runs on every draw, remove any temporary speech
    // bubbles that have expired.
    this.removeExpiredSpeechBubbles();

    if (this.speechBubbles.length === 0 || this.isPreviewFrame()) {
      return;
    }

    this.speechBubbles.forEach(({text, sprite, bubbleType}) => {
      this.drawSpeechBubble(
        text,
        sprite.x,
        sprite.y - Math.round(sprite.getScaledHeight() / 2),
        bubbleType,
      );
    });
  }

  /**
   * Draws bubbles for each variable in the `variableBubbles` array. Labels are truncated with an ellipsis
   * if they exceed the maximum character limit. Values are truncated as needed to fit the remaining space.
   *
   * @param {Object[]} this.variableBubbles - An array of objects, each representing a variable to be displayed. Each object should include:
   *  - `name`: A string identifier for the variable used to get the value from the JSInterpreter.
   *  - `label`: A label for the variable to be displayed in the bubble.
   *  - `location`: An object specifying the `x` and `y` coordinates where the bubble should be drawn.
   */
  drawVariableBubbles(): void {
    const config = {
      textSize: 20,
      padding: 10,
      strokeWeight: 3,
      strokeRadius: 24,
      maxLabelLength: 20, // Maximum number of characters to display in the label
    };

    // Calculate the width for the label and value separator (colon and space)
    const separatorWidth = drawUtils.getTextWidth(
      this.p5,
      ': ',
      config.textSize,
    );
    const totalReservedSpace = config.padding * 2 + separatorWidth;

    this.variableBubbles.forEach(variable => {
      const {name, label, location} = variable;
      if (!name.length || !label.length || !location) {
        return;
      }

      // Use variable value or empty string (if undefined).
      const value = this.getVariableValue(name, '');

      // Determine if the label needs truncation and append an ellipsis if so
      const displayLabel =
        label.length > config.maxLabelLength
          ? label.slice(0, config.maxLabelLength) + '…'
          : label;
      const labelWidth = drawUtils.getTextWidth(
        this.p5,
        displayLabel,
        config.textSize,
      );

      // Truncate the value if necessary to fit within the available space
      const availableSpaceForValue =
        APP_WIDTH - totalReservedSpace - labelWidth;
      const displayValue = drawUtils.truncateText(
        this.p5,
        formatForPlayspace(value),
        availableSpaceForValue,
        config.textSize,
      );

      const displayText = `${displayLabel}: ${displayValue}`;
      drawUtils.variableBubble(
        this.p5,
        location.x,
        location.y,
        displayText,
        config,
      );
    });
  }

  getVariableValue(variableName: string, defaultValue?: unknown): unknown {
    if (!this.jsInterpreter) {
      console.error('JS Interpreter not set in CoreLibrary');
      return;
    }

    try {
      // Blockly does not execute code or track the runtime values of variables, so we need to
      // evaluate the variable's value using the JSInterpreter.
      const result = this.jsInterpreter.evaluateWatchExpression(variableName);
      return typeof result === 'undefined' ? defaultValue : result;
    } catch (e) {
      console.error(`Error evaluating variable '${variableName}': ${e}`);
      return '';
    }
  }

  /**
   * Draws a speech bubble with multi-lane text.
   * @param {String} text
   * @param {Number} spriteX - corner of sprite
   * @param {Number} spriteY - top of sprite
   * @param {String} bubbleType - 'say' or 'think'
   */
  drawSpeechBubble(
    text: unknown,
    spriteX: number,
    spriteY: number,
    bubbleType: BubbleType,
  ): void {
    const padding = 8;
    let str: string;
    if (typeof text === 'number') {
      str = text.toString();
    } else if (typeof text === 'string') {
      str = text;
    } else {
      // Protect against crashes in the unlikely event that a
      // non-string or non-number was passed.
      str = '';
    }
    str = ellipsify(str, 150 /* maxLength */);
    let textSize;
    let charsPerLine;
    if (str.length < 50) {
      textSize = 20;
      charsPerLine = 16;
    } else if (str.length < 75) {
      textSize = 15;
      charsPerLine = 20;
    } else {
      textSize = 10;
      charsPerLine = 28;
    }

    const lines = stringToChunks(str, charsPerLine);
    // Since it's not a fixed-width font, we can't just use line length to
    // determine the longest line, we have to actually calculate each width.
    const longestLine = [...lines].sort((a, b) =>
      drawUtils.getTextWidth(this.p5, a, textSize) <
      drawUtils.getTextWidth(this.p5, b, textSize)
        ? 1
        : -1,
    )[0];
    const bubbleWidth = Math.max(
      50,
      drawUtils.getTextWidth(this.p5, longestLine, textSize) + padding * 2,
    );
    const bubbleHeight = lines.length * textSize + padding * 2;

    const tailHeight = 10;
    const bubbleY = Math.max(
      0,
      Math.min(APP_HEIGHT, spriteY) - bubbleHeight - tailHeight,
    );
    const bubbleX = Math.max(
      0,
      Math.min(APP_WIDTH - bubbleWidth, spriteX - bubbleWidth / 2),
    );
    const radius = padding;
    // Draw bubble.
    drawUtils.speechBubble(
      this.p5,
      bubbleX,
      bubbleY,
      bubbleWidth,
      bubbleHeight,
      spriteX,
      spriteY,
      {
        tailHeight,
        radius,
      },
      bubbleType,
    );

    // Draw text within bubble.
    drawUtils.multilineText(
      this.p5,
      lines,
      bubbleX + bubbleWidth / 2,
      bubbleY + padding,
      textSize,
      {
        horizontalAlign: this.p5.CENTER,
      },
    );
  }

  addVariableBubble(
    label: string,
    name: string,
    locationInput: LocationInput,
  ): void {
    const existingBubble = this.variableBubbles.find(
      bubble => bubble.label === label,
    );

    // We only want the new bubble to overwrite the location of the existing
    // bubble if the new location is defined
    const location = locationUtils.resolveLocation(
      locationInput,
      existingBubble ? existingBubble.location : undefined,
    );

    // If the variable bubble already exists, update its location
    // Otherwise, add a new bubble to the array
    if (existingBubble) {
      existingBubble.location = location;
    } else {
      this.variableBubbles.push({label, name, location});
    }
  }

  removeVariableBubble(label: string): void {
    this.variableBubbles = this.variableBubbles.filter(
      variable => variable.label !== label,
    );
  }

  getVariableBubbles(): VariableBubble[] {
    return this.variableBubbles;
  }

  getForegroundEffects(): ForegroundEffect[] {
    return this.foregroundEffects;
  }

  addSpeechBubble(
    sprite: RuntimeSprite,
    text: unknown,
    seconds: number | null = null,
    bubbleType: BubbleType = 'say',
  ): string {
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
      renderFrame: this.currentFrame(),
      bubbleType,
    });
    return id;
  }

  removeSpeechBubblesForSprite(sprite: RuntimeSprite): void {
    this.speechBubbles = this.speechBubbles.filter(
      bubble => bubble.sprite !== sprite,
    );
  }

  removeExpiredSpeechBubbles(): void {
    this.speechBubbles = this.speechBubbles.filter(
      ({removeAt}) => !removeAt || removeAt > this.getUnpausedWorldTime(),
    );
  }

  startPause(time: number): void {
    this.currentPauseStartTime = time;
  }

  endPause(time: number): void {
    if (this.currentPauseStartTime) {
      this.totalPauseTime += time - this.currentPauseStartTime;
      this.currentPauseStartTime = 0;
    }
  }

  /**
   * Returns World.seconds adjusted to exclude time during which the app was paused
   */
  getUnpausedWorldTime(): number {
    const current = new Date().getTime();
    return Math.round(
      (current - this.p5.worldStartTime - this.totalPauseTime) / 1000,
    );
  }

  /**
   * Returns time (in seconds) since last resetTimer(), excluding time during which the app was paused
   */
  getSecondsSinceReset(): number {
    return this.getUnpausedWorldTime() - this.timerResetTime.seconds;
  }

  /**
   * Returns time (in frames) since last resetTimer()
   */
  getFramesSinceReset(): number {
    return this.p5.frameCount - this.timerResetTime.frames;
  }

  /**
   * Returns a list of sprites, specified either by id, name, or animation name.
   * @param {Object} spriteArg - Specifies a sprite or group of sprites by id, name, or animation name.
   * @return {[Sprite]} List of sprites that match the parameter. Either a list containing the one sprite
   * the specified id/name, or a list containing all sprites with the specified animation.
   */
  getSpriteArray(spriteArg: SpriteArg | null | undefined): RuntimeSprite[] {
    if (!spriteArg) {
      return [];
    }
    if (Object.prototype.hasOwnProperty.call(spriteArg, 'id')) {
      const sprite = this.nativeSpriteMap[spriteArg.id as number];
      if (sprite) {
        return [sprite];
      }
    }
    if (spriteArg.name) {
      const sprite = Object.values(this.nativeSpriteMap).find(
        sprite => sprite.name === spriteArg.name,
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
          sprite => sprite.getAnimationLabel() === spriteArg.costume,
        );
      }
    }
    if (typeof spriteArg.group === 'string') {
      // The group property is undefined for sprites unless explicitly set.
      // We're using '' as a way to signal that we want to return the ones without a group.
      if (spriteArg.group === '') {
        return Object.values(this.nativeSpriteMap).filter(
          sprite => !sprite.group,
        );
      }
      return Object.values(this.nativeSpriteMap).filter(
        sprite => sprite.group === spriteArg.group,
      );
    }
    return [];
  }

  getAnimationsInUse(): string[] {
    const animations = new Set<string>();
    Object.values(this.nativeSpriteMap).filter(sprite =>
      animations.add(sprite.getAnimationLabel()),
    );

    return Array.from(animations);
  }

  /**
   * @param {string} animation
   * @return {number} Number of behaviors associated with the specified animation.
   */
  getNumBehaviorsForAnimation(animation: string): number {
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
  getNumBehaviorsForSpriteId(spriteId: number): number {
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
  getBehaviorsForSpriteId(spriteId: number): string[] {
    const spriteBehaviors: string[] = [];
    this.behaviors.forEach(behavior => {
      if (behavior.sprite.id === spriteId) {
        spriteBehaviors.push(behavior.name);
      }
    });
    return spriteBehaviors;
  }

  getSpriteIdsInUse(): number[] {
    const spriteIds: number[] = [];
    Object.keys(this.nativeSpriteMap).forEach(spriteId =>
      spriteIds.push(parseInt(spriteId)),
    );
    return spriteIds;
  }

  getNumberOfSprites(): number {
    return Object.keys(this.nativeSpriteMap).length;
  }

  getMaxAllowedNewSprites(numRequested: number): number {
    const numSpritesSoFar = this.getNumberOfSprites();
    const numNewSpritesPossible = MAX_NUM_SPRITES - numSpritesSoFar;
    return Math.min(numRequested, numNewSpritesPossible);
  }

  getLastSpeechBubbleForSpriteId(
    spriteId: number | string,
  ): SpeechBubble | undefined {
    const speechBubbles = this.speechBubbles.filter(
      ({sprite}) => sprite.id === parseInt(String(spriteId)),
    );
    return speechBubbles[speechBubbles.length - 1];
  }

  reachedSpriteMax(): boolean {
    return this.getNumberOfSprites() >= MAX_NUM_SPRITES;
  }

  reachedSpriteWarningThreshold(): boolean {
    return (
      this.getNumberOfSprites() === MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER
    );
  }

  // This function is called within the addSprite function BEFORE a new sprite is created
  // If the total number of sprites is equal to (MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER),
  // a workspace alert warning is displayed to let user know they have reached the sprite limit
  dispatchSpriteLimitWarning(): void {
    this.host.displayWorkspaceAlert(
      'warning',
      `The maximum possible number of sprites in Sprite Lab is ${MAX_NUM_SPRITES}. No additional sprites can be created.`,
      /* bottom */ true,
    );
  }

  /**
   * Adds the specified sprite to the native sprite map
   * @param {Sprite} sprite
   * @returns {Number} A unique id to reference the sprite.
   */
  addSprite(opts?: SpriteOptions | null): number | undefined {
    if (this.reachedSpriteMax()) {
      return;
    } else if (this.reachedSpriteWarningThreshold()) {
      this.dispatchSpriteLimitWarning();
    }
    opts = opts || {};
    if (this.getNumberOfSprites() >= MAX_NUM_SPRITES) {
      return;
    }
    const name = opts.name;
    const location = locationUtils.resolveLocation(opts.location);
    const animation = opts.animation;

    const sprite = this.p5.createSprite(
      location.x,
      location.y,
    ) as RuntimeSprite;
    if (opts.group) {
      sprite.group = opts.group;
    }
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

    const minimumScale = opts.minimumScale || 100;
    sprite.baseScale = 1;
    sprite.setScale = function (scale) {
      sprite.scale = scale * sprite.baseScale;
    };
    sprite.getScale = function () {
      return sprite.scale / sprite.baseScale;
    };
    if (animation) {
      sprite.setAnimation(animation);
      sprite.scale /= sprite.baseScale;
      sprite.baseScale =
        100 /
        Math.max(
          minimumScale,
          sprite.animation?.getHeight() ?? NaN,
          sprite.animation?.getWidth() ?? NaN,
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
  enforceUniqueSpriteName(name: string): void {
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
  deleteSprite(spriteId: number): void {
    delete this.nativeSpriteMap[spriteId];
  }

  registerPrompt(
    _promptText: string,
    variableName: string,
    setterCallback: (value: unknown) => void,
  ): void {
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
        userCallbacks: [],
      };
    }
    this.userInputEventCallbacks[variableName].setterCallbacks.push(
      setterCallback,
    );
  }

  registerPromptAnswerCallback(
    variableName: string,
    userCallback: () => void,
  ): void {
    if (!variableName) {
      return;
    }
    if (!this.userInputEventCallbacks[variableName]) {
      this.userInputEventCallbacks[variableName] = {
        setterCallbacks: [],
        userCallbacks: [],
      };
    }
    this.userInputEventCallbacks[variableName].userCallbacks.push(userCallback);
  }

  onPromptAnswer(variableName: string, userInput: string): void {
    this.numActivePrompts--;
    // Check to see if the user entered a number.
    const typedInput = isNaN(parseFloat(userInput))
      ? userInput
      : parseFloat(userInput);
    this.promptVars[variableName] = typedInput;
    const callbacks = this.userInputEventCallbacks[variableName];
    if (callbacks) {
      // Make sure to call the setter callback to set the variable
      // before the user callback, which may rely on the variable's new value
      callbacks.setterCallbacks.forEach(callback => {
        callback(typedInput);
      });
      callbacks.userCallbacks.forEach(callback => {
        callback();
      });
    }
  }

  addEvent(type: string, args: InputEventArgs, callback: EventCallback): void {
    this.inputEvents.push({type, args, callback});
  }

  clearCollectDataEvents(): void {
    this.inputEvents = this.inputEvents.filter(e => e.type !== 'collectData');
  }

  runSpriteCreatedEvents(newSprite: RuntimeSprite): void {
    const matchingInputEvents = this.inputEvents.filter(
      inputEvent =>
        inputEvent.type === 'whenSpriteCreated' &&
        ((inputEvent.args.name !== undefined &&
          inputEvent.args.name === newSprite.name) ||
          inputEvent.args.costume === newSprite.getAnimationLabel() ||
          inputEvent.args.costume === 'all'),
    );
    matchingInputEvents.forEach(inputEvent => {
      this.eventLog.push(`spriteCreated: ${newSprite.id}`);
      inputEvent.callback({newSprite: newSprite.id});
    });
  }

  atTimeEvent(inputEvent: InputEvent): EventArgs[] {
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

  collectDataEvent(inputEvent: InputEvent): EventArgs[] {
    const previous = (inputEvent.previous as number | undefined) || 0;
    const worldTime = this.getUnpausedWorldTime();
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

  everyIntervalEvent(inputEvent: InputEvent): EventArgs[] {
    if (inputEvent.args.unit === 'seconds') {
      const previousTime = inputEvent.previousTime || 0;
      const previousModdedTime = inputEvent.previousModdedTime || 0;
      const worldTime = this.getSecondsSinceReset();
      // Repeat every n seconds
      const moddedWorldTime = worldTime % (inputEvent.args.n as number);
      inputEvent.previousTime = worldTime;
      inputEvent.previousModdedTime = moddedWorldTime;

      // Case where n is 1, so we want to repeat every second, but only the first tick in each second.
      const singleSecondInterval =
        inputEvent.args.n === 1 && previousTime !== worldTime;

      // There are many ticks per second, but we only want to fire the event once (on the first tick where
      // the time matches the event argument)
      // Determine if the current time is on the interval
      if (
        (moddedWorldTime === 0 && previousModdedTime !== 0) ||
        singleSecondInterval
      ) {
        // Call callback with no extra args
        this.eventLog.push(`everyInterval: ${inputEvent.args.n}`);
        return [{}];
      }
    } else if (inputEvent.args.unit === 'frames') {
      const worldFrames = this.getFramesSinceReset();
      // Repeat every n frames
      const moddedWorldFrames = worldFrames % (inputEvent.args.n as number);
      if (moddedWorldFrames === 0) {
        // Call callback with no extra args
        this.eventLog.push(`everyInterval: ${inputEvent.args.n}`);
        return [{}];
      }
    }
    // Don't call callback
    return [];
  }

  repeatForeverEvent(): EventArgs[] {
    // No condition to check, just always call callback with no extra args
    return [{}];
  }

  whenPressEvent(inputEvent: InputEvent): EventArgs[] {
    if (this.p5.keyWentDown(inputEvent.args.key as KeyName)) {
      this.eventLog.push(`whenPress: ${inputEvent.args.key}`);
      // Call callback with no extra args
      return [{}];
    } else {
      // Don't call callback
      return [];
    }
  }

  whilePressEvent(inputEvent: InputEvent): EventArgs[] {
    if (this.p5.keyDown(inputEvent.args.key as KeyName)) {
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

  whenTouchEvent(inputEvent: InputEvent): EventArgs[] {
    const getFired = function (
      map: TouchMemory | undefined,
      spriteId: number,
      targetId: number,
    ) {
      if (map && map[spriteId] && map[spriteId][targetId]) {
        return map[spriteId][targetId].firedOnce;
      }
    };
    const setFired = function (
      map: TouchMemory,
      spriteId: number,
      targetId: number,
      fired: boolean,
    ) {
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
    const callbackArgList: EventArgs[] = [];
    const previousCollisions = inputEvent.previous as TouchMemory | undefined;

    // We need to clear out previous, so that events get re-triggered when sprite animations change
    const collisions: TouchMemory = {};
    inputEvent.previous = collisions;
    sprites.forEach(sprite => {
      targets.forEach(target => {
        let firedOnce =
          getFired(previousCollisions, sprite.id, target.id) ?? false;
        if (sprite.overlap(target)) {
          if (!firedOnce) {
            // Sprites are overlapping, and we haven't fired yet for this collision,
            // so we should fire the callback
            this.eventLog.push(`whenTouch: ${sprite.id} ${target.id}`);
            callbackArgList.push({
              subjectSprite: sprite.id,
              objectSprite: target.id,
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
        setFired(collisions, sprite.id, target.id, firedOnce);
      });
    });
    return callbackArgList;
  }

  whileTouchEvent(inputEvent: InputEvent): EventArgs[] {
    const callbackArgList: EventArgs[] = [];
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
            objectSprite: target.id,
          });
        }
      });
    });
    return callbackArgList;
  }

  whenClickEvent(inputEvent: InputEvent): EventArgs[] {
    const callbackArgList: EventArgs[] = [];
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

  whileClickEvent(inputEvent: InputEvent): EventArgs[] {
    const callbackArgList: EventArgs[] = [];
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

  whenAllPromptsAnswered(inputEvent: InputEvent): EventArgs[] {
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
  getCallbackArgListForEvent(inputEvent: InputEvent): EventArgs[] {
    switch (inputEvent.type) {
      case 'atTime':
        return this.atTimeEvent(inputEvent);
      case 'collectData':
        return this.collectDataEvent(inputEvent);
      case 'everyInterval':
        return this.everyIntervalEvent(inputEvent);
      case 'repeatForever':
        return this.repeatForeverEvent();
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
      default:
        return [];
    }
  }

  runEvents(): void {
    this.inputEvents.forEach(inputEvent => {
      const callbackArgList = this.getCallbackArgListForEvent(inputEvent);
      callbackArgList.forEach(args => {
        inputEvent.callback(args);
      });
    });
  }

  addBehavior(
    sprite: RuntimeSprite | undefined,
    behavior: Behavior | undefined,
  ): void {
    if (sprite && behavior) {
      const existing = this.behaviors.find(
        b => b.sprite === sprite && b.name === behavior.name,
      );
      if (!existing) {
        this.behaviors.push({
          func: behavior.func,
          name: behavior.name,
          sprite: sprite,
        });
      }
    }
  }

  removeAllBehaviors(sprite: RuntimeSprite): void {
    this.behaviors = this.behaviors.filter(
      behavior => behavior.sprite !== sprite,
    );
  }

  removeBehavior(
    sprite: RuntimeSprite | undefined,
    behavior: Behavior | undefined,
  ): void {
    if (sprite && behavior) {
      const index = this.behaviors.findIndex(
        b => b.sprite === sprite && b.name === behavior.name,
      );
      if (index !== -1) {
        this.behaviors.splice(index, 1);
      }
    }
  }

  runBehaviors(): void {
    this.behaviors.forEach(behavior => behavior.func({id: behavior.sprite.id}));
  }

  /** A p5 color from `hex`, with `alpha` in the color mode's alpha range. */
  getP5Color(hex: string, alpha?: number): ReturnType<SpriteP5['color']> {
    const color = this.p5.color(hex);
    if (alpha !== undefined) {
      color.setAlpha(alpha);
    }
    return color;
  }
}
