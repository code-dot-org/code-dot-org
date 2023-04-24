import * as utils from '@cdo/apps/p5lab/utils';
import {commands as validationCommands} from './validationCommands';

/**
 * Validation is essentially an ordered list of one or more "criteria", each
 * consisting of a predicate function and a feedback message key. The predicate
 * functions run each tick, and if true, the criteria is marked as completed.
 * At the end of the program, if all the criteria are complete, the student
 * passes the level. If any criteria are not complete, the student sees the
 * feedback messagecorresponding to the first unmet criteria.
 *
 * The command functions in this file can be called directly in level
 * validation code. Each is designed to work as as a predicate function for a
 * criterion for validation. They are designed to be called multiple times per
 * frame if needed.
 */

export const commands = {
  // Return true if the specified sprite began speaking.
  spriteSpeechRenderedThisFrame(spriteId) {
    return (
      this.getLastSpeechBubbleForSpriteId(spriteId)?.renderFrame ===
      this.currentFrame()
    );
  },

  // Return true if any sprite began speaking.
  anySpriteSpeaks() {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id =>
        commands.spriteSpeechRenderedThisFrame.call(this, id)
      ).length > 0
    );
  },

  // Return true if the specified sprite began speaking
  // and the text is not an empty string.
  strictSpriteSpeechRenderedThisFrame(spriteId) {
    return (
      this.getLastSpeechBubbleForSpriteId(spriteId)?.renderFrame ===
        this.currentFrame() &&
      this.getLastSpeechBubbleForSpriteId(spriteId)?.text
    );
  },

  // Return true if any sprite began speaking
  // and the text is not an empty string.
  strictAnySpriteSpeaks() {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id =>
        commands.strictSpriteSpeechRenderedThisFrame.call(this, id)
      ).length > 0
    );
  },

  // Return true if any sprite was speaking.
  anySpriteSpeaking() {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id => this.getLastSpeechBubbleForSpriteId(id)).length > 0
    );
  },

  // Return true if any sprite was speaking
  // and the text is not an empty string.
  strictAnySpriteSpeaking() {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id => this.getLastSpeechBubbleForSpriteId(id)?.text)
        .length > 0
    );
  },

  // Return true if any sprite's speech include values from the given object(s).
  // The second parameter is optional, but exists in case the levelbuilder would
  // like to give students the flexibility of using the value from either the
  // current or previous frame.
  anySpeechIncludesValues(currentVariables, previousVariables) {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    const values = previousVariables
      ? Object.values(currentVariables).concat(Object.values(previousVariables))
      : Object.values(currentVariables);
    for (let i = 0; i < spriteIds.length; i++) {
      values.forEach(value => {
        const speechText = this.getLastSpeechBubbleForSpriteId(
          spriteIds[i]
        )?.text;
        const type = typeof speechText;
        // We only want to set result to true here, so that any positive test
        // allows the overall criterion to pass.
        switch (type) {
          case 'string':
            if (speechText.includes(value)) {
              result = true;
            }
            break;
          case 'number':
            if (speechText === value) {
              result = true;
            }
            break;
          default:
            break;
        }
      });
    }
    return result;
  },

  // Return true if exactly one sprite began speaking.
  singleSpriteSpeaks() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    let count = 0;
    for (let i = 0; i < spriteIds.length; i++) {
      if (commands.spriteSpeechRenderedThisFrame.call(this, spriteIds[i])) {
        count++;
      }
    }
    result = count === 1;
    return result;
  },

  // Returns true if some minimum number of sprites are in use.
  minimumSprites(min) {
    return this.getSpriteIdsInUse().length >= min;
  },

  // Returns true if any sprite(s) was removed this frame.
  spriteRemoved() {
    let result = false;
    const currentSpriteIds = this.getSpriteIdsInUse();
    const previousSpriteIds =
      this.previous.sprites === undefined
        ? []
        : this.previous.sprites.map(sprite => sprite.id);
    if (currentSpriteIds.length < previousSpriteIds.length) {
      result = true;
    } else {
      for (let i = 0; i < previousSpriteIds.length; i++) {
        if (!currentSpriteIds.includes(previousSpriteIds[i])) {
          result = true;
        }
      }
    }
    return result;
  },

  // Returns true only if (only) event sprites are removed.
  // Returns false if non-event sprites are removed, or if no sprites are removed.
  onlyEventSpriteRemoved() {
    let result = false;
    const currentSpriteIds = this.getSpriteIdsInUse();
    const previousSpriteIds =
      this.previous.sprites === undefined
        ? []
        : this.previous.sprites.map(sprite => sprite.id);

    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    for (let i = 0; i < previousSpriteIds.length; i++) {
      if (!currentSpriteIds.includes(previousSpriteIds[i])) {
        result = true;
        if (!eventSpriteIds.includes(previousSpriteIds[i])) {
          result = false;
          break;
        }
      }
    }
    return result;
  },

  // Returns true if the number of costumes in use matches the number of sprites.
  allSpriteHaveDifferentCostumes() {
    return this.getAnimationsInUse().length === this.getSpriteIdsInUse().length;
  },

  // Returns true if there is exactly one costume in use.
  allSpriteHaveSameCostume() {
    return this.getAnimationsInUse().length === 1;
  },

  // Returns true if there is at least some number of costumes in use.
  minimumCostumeCount(count) {
    return this.getAnimationsInUse().length >= count;
  },

  // Returns true new sprites were created this frame.
  // A minimum number of new sprites can be specified, but this is optional.
  newSpriteCreated(n = 1) {
    let result = false;
    const spriteIds = this.getSpriteIdsInUse();
    const prevSpriteIds =
      this.previous.sprites === undefined
        ? spriteIds
        : this.previous.sprites.map(sprite => sprite.id);
    result = spriteIds.filter(id => !prevSpriteIds.includes(id)).length >= n;
    return result;
  },

  // Returns true if any sprite has a tint
  anySpriteHasTint() {
    const spriteIds = this.getSpriteIdsInUse();
    for (let i = 0; i < spriteIds.length; i++) {
      if (this.nativeSpriteMap[spriteIds[i]].tint) {
        return true;
      }
    }
    return false;
  },

  // Returns true if any sprite's costume changed this frame.
  anyCostumeChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentCostume =
        this.nativeSpriteMap[spriteIds[i]].getAnimationLabel();
      const previousCostume =
        this.previous.sprites === undefined
          ? currentCostume
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])
              .costume;
      if (currentCostume !== previousCostume) {
        result = true;
      }
    }
    return result;
  },

  // Returns true if sprite costumes change, but only event sprites.
  // Returns false if non-event sprites change costume, or if no sprites change costume.
  onlyClickedCostumeChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    let result = false;
    let foundEventSpriteChange = false;
    let foundNoneventSpriteChange = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentCostume =
        this.nativeSpriteMap[spriteIds[i]].getAnimationLabel();
      const previousCostume =
        this.previous.sprites === undefined
          ? currentCostume
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])
              .costume;
      if (
        currentCostume !== previousCostume &&
        eventSpriteIds.includes(spriteIds[i])
      ) {
        foundEventSpriteChange = true;
      } else if (currentCostume !== previousCostume) {
        foundNoneventSpriteChange = true;
      }
    }
    result = foundEventSpriteChange && !foundNoneventSpriteChange;
    return result;
  },

  // Returns true if any-sprite specified-property changes this frame.
  anyPropChanged(prop) {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    let currentProp;
    let previousProp;
    for (let i = 0; i < spriteIds.length; i++) {
      switch (prop) {
        case 'costume':
          currentProp = this.nativeSpriteMap[spriteIds[i]].getAnimationLabel();
          break;
        case 'scale':
          currentProp = this.nativeSpriteMap[spriteIds[i]].getScale();
          break;
        default:
          currentProp = this.nativeSpriteMap[spriteIds[i]][prop];
      }
      previousProp =
        this.previous.sprites === undefined
          ? currentProp
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])[
              prop
            ];
      if (currentProp !== previousProp) {
        result = true;
      }
    }
    return result;
  },

  // Returns true if sprite property changes, but only event sprites.
  // Returns false if non-event sprites change costume, or if no sprites change costume.
  onlyClickedPropChanged(prop) {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    let currentProp;
    let previousProp;
    let result = false;
    let foundEventSpriteChange = false;
    let foundNoneventSpriteChange = false;
    for (let i = 0; i < spriteIds.length; i++) {
      switch (prop) {
        case 'costume':
          currentProp = this.nativeSpriteMap[spriteIds[i]].getAnimationLabel();
          break;
        case 'scale':
          currentProp = this.nativeSpriteMap[spriteIds[i]].getScale();
          break;
        // .tint is undefined for a sprite until set with a command
        case 'tint':
          currentProp = this.nativeSpriteMap[spriteIds[i]].tint || '';
          break;
        default:
          currentProp = this.nativeSpriteMap[spriteIds[i]][prop];
      }
      previousProp =
        this.previous.sprites === undefined
          ? currentProp
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])[
              prop
            ];
      if (
        currentProp !== previousProp &&
        eventSpriteIds.includes(spriteIds[i])
      ) {
        foundEventSpriteChange = true;
      } else if (currentProp !== previousProp) {
        foundNoneventSpriteChange = true;
      }
    }
    result = foundEventSpriteChange && !foundNoneventSpriteChange;
    return result;
  },

  // Returns true if any sprite changed (started or stopped) behaviors this frame.
  anyBehaviorChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentBehaviors = this.getBehaviorsForSpriteId(i);
      const previousBehaviors =
        this.previous.sprites === undefined
          ? currentBehaviors
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])
              .behaviors;
      if (!utils.arrayEquals(currentBehaviors, previousBehaviors)) {
        result = true;
      }
    }
    return result;
  },

  // Special function for lesson: Mini-Project: Collector Game
  // Returns true if any sprite has one of: ['moving_with_arrow_keys', 'driving_with_arrow_keys', 'draggable'].
  interactiveBehaviorFound() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentBehaviors = this.getBehaviorsForSpriteId(i);
      if (
        currentBehaviors.some(behavior =>
          [
            'moving_with_arrow_keys',
            'driving_with_arrow_keys',
            'draggable',
          ].includes(behavior)
        )
      ) {
        result = true;
      }
    }
    return result;
  },

  // Special function for lesson: Mini-Project: Collector Game
  // Returns true if any sprite has one of the "non-interactive" behaviors.
  itemBehaviorFound() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentBehaviors = this.getBehaviorsForSpriteId(i);
      if (
        currentBehaviors.some(behavior =>
          [
            'moving_with_arrow_keys',
            'driving_with_arrow_keys',
            'draggable',
          ].includes(behavior)
        )
      ) {
        result = true;
      }
    }
    return result;
  },

  // Returns true if only event sprite(s) change behaviors.
  // Returns false if non-event sprites or no sprites changed behaviors.
  onlyEventSpritesBehaviorChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    let result = false;
    let foundEventSpriteChange = false;
    let foundNoneventSpriteChange = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentBehaviors = this.getBehaviorsForSpriteId(i);
      const previousBehaviors =
        this.previous.sprites === undefined
          ? currentBehaviors
          : this.previous.sprites.find(sprite => sprite.id === spriteIds[i])
              .behaviors;
      if (
        !utils.arrayEquals(currentBehaviors, previousBehaviors) &&
        eventSpriteIds.includes(spriteIds[i])
      ) {
        foundEventSpriteChange = true;
      } else if (!utils.arrayEquals(currentBehaviors, previousBehaviors)) {
        foundNoneventSpriteChange = true;
      }
    }
    result = foundEventSpriteChange && !foundNoneventSpriteChange;
    return result;
  },

  // Returns true if all sprites have the default size (100 for students)
  spritesDefaultSize() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = true;
    for (let i = 0; i < spriteIds.length; i++) {
      if (this.nativeSpriteMap[spriteIds[i]].getScale() !== 1) {
        result = false;
      }
    }
    return result;
  },

  // Returns true if any sprite was clicked, regardless of the eventLog.
  anySpriteClicked() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    if (this.p5.mouseWentDown('left')) {
      for (let i = 0; i < spriteIds.length; i++) {
        if (this.p5.mouseIsOver(this.nativeSpriteMap[spriteIds[i]])) {
          result = true;
        }
      }
    }
    return result;
  },

  // Returns true if any two sprites touched, regardless of the eventLog.
  anySpritesTouched() {
    let result = false;
    const allSprites = this.p5.World.allSprites;
    result = allSprites.isTouching(allSprites);
    return result;
  },

  // Returns true if a click event was logged this frame.
  clickEventFound() {
    let result = false;

    //Only check for values that are new this frame
    for (let i = this.previous.eventLogLength; i < this.eventLog.length; i++) {
      if (
        this.eventLog[i].includes('whenClick: ') ||
        this.eventLog[i].includes('whileClick: ')
      ) {
        result = true;
      }
    }

    return result;
  },

  // Returns true if a touch event was logged this frame.
  touchEventFound() {
    let result = false;

    //Only check for values that are new this frame
    for (let i = this.previous.eventLogLength; i < this.eventLog.length; i++) {
      if (
        this.eventLog[i].includes('whenTouch: ') ||
        this.eventLog[i].includes('whileTouch: ')
      ) {
        result = true;
      }
    }

    return result;
  },

  // Returns true if a time event was logged this frame.
  atTimeEventFound() {
    let result = false;

    //Only check for values that are new this frame

    for (let i = this.previous.eventLogLength; i < this.eventLog.length; i++) {
      if (this.eventLog[i].includes('atTime: ')) {
        result = true;
      }
    }
    return result;
  },

  // Returns true if text was printed this frame.
  printedText() {
    const previousPrintLogLength = this.previous.printLogLength || 0;
    const result = previousPrintLogLength < this.printLog.length;
    return result;
  },

  // Returns true if a sound began playing this frame.
  playedSound() {
    const previousSoundLogLength = this.previous.soundLogLength || 0;
    const result = previousSoundLogLength < this.soundLog.length;
    return result;
  },

  // Returns true if the student set a variable to any number, string, or boolean.
  variableCreated() {
    const result = this.studentVars.length >= 1;
    return result;
  },
};
