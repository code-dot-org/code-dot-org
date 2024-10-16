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

  // Return true if the minimum number of sprites began speaking.
  anySpriteSpeaks(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id =>
        commands.spriteSpeechRenderedThisFrame.call(this, id)
      ).length >= min
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

  // Return true if a minimum number of sprites began speaking
  // and the text is not an empty string.
  strictAnySpriteSpeaks(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id =>
        commands.strictSpriteSpeechRenderedThisFrame.call(this, id)
      ).length >= min
    );
  },

  // Return true if a minimum number of sprites was speaking.
  anySpriteSpeaking(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id => this.getLastSpeechBubbleForSpriteId(id)).length >=
      min
    );
  },

  // Return true if a minimum number of sprites was speaking
  // and the text is not an empty string.
  strictAnySpriteSpeaking(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    return (
      spriteIds.filter(id => this.getLastSpeechBubbleForSpriteId(id)?.text)
        .length >= min
    );
  },

  // Return true if any sprite's speech include values from the given object(s).
  // The second parameter is optional, but exists in case the levelbuilder would
  // like to give students the flexibility of using the value from either the
  // current or previous frame.
  anySpeechIncludesValues(currentVariables, previousVariables) {
    const spriteIds = this.getSpriteIdsInUse();
    const values = Object.values(currentVariables).concat(
      previousVariables ? Object.values(previousVariables) : []
    );

    for (const spriteId of spriteIds) {
      const speechText = this.getLastSpeechBubbleForSpriteId(spriteId)?.text;
      if (
        speechText !== undefined &&
        values.some(value => `${speechText}`.includes(`${value}`))
      ) {
        return true;
      }
    }
    return false;
  },

  // Return true if exactly one sprite began speaking.
  singleSpriteSpeaks() {
    const spriteIds = this.getSpriteIdsInUse();
    let count = 0;

    for (const spriteId of spriteIds) {
      if (commands.spriteSpeechRenderedThisFrame.call(this, spriteId)) {
        count++;
        if (count > 1) {
          return false;
        }
      }
    }
    return count === 1;
  },

  // Returns true if some minimum number of sprites are in use.
  minimumSprites(min = 1) {
    return this.getSpriteIdsInUse().length >= min;
  },

  // Returns true if some minimum number of sprites have been been moved.
  // Tests whether the location picker has been used when making sprites.
  minimumSpritesNonDefaultLocation(min = 1) {
    const defaultLocation = {x: 200, y: 200};
    const spriteIds = this.getSpriteIdsInUse();
    let spritesNonDefaultLocation = 0;
    spriteIds.forEach(spriteId => {
      if (
        this.nativeSpriteMap[spriteId].x !== defaultLocation.x ||
        this.nativeSpriteMap[spriteId].y !== defaultLocation.y
      ) {
        spritesNonDefaultLocation++;
      }
    });
    return spritesNonDefaultLocation >= min;
  },

  // Returns true if any sprite(s) was removed this frame.
  spriteRemoved() {
    const currentSpriteIds = this.getSpriteIdsInUse();
    const previousSpriteIds =
      this.previous.sprites?.map(sprite => sprite.id) ?? [];

    return (
      currentSpriteIds.length < previousSpriteIds.length ||
      previousSpriteIds.some(id => !currentSpriteIds.includes(id))
    );
  },

  // Returns true only if (only) event sprites are removed.
  // Returns false if non-event sprites are removed, or if no sprites are removed.
  onlyEventSpriteRemoved() {
    const currentSpriteIds = this.getSpriteIdsInUse();
    const previousSpriteIds =
      this.previous.sprites?.map(sprite => sprite.id) ?? [];
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);

    const removedEventSpriteIds = previousSpriteIds.filter(
      id => !currentSpriteIds.includes(id) && eventSpriteIds.includes(id)
    );

    const removedOtherSpriteIds = previousSpriteIds.filter(
      id => !currentSpriteIds.includes(id) && !eventSpriteIds.includes(id)
    );
    return (
      removedEventSpriteIds.length > 0 && removedOtherSpriteIds.length === 0
    );
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
  minimumCostumeCount(count = 1) {
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
    for (const spriteId of spriteIds) {
      if (this.nativeSpriteMap[spriteId].tint) {
        return true;
      }
    }
    return false;
  },

  // Returns true if any sprite's costume changed this frame.
  anyCostumeChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    for (const spriteId of spriteIds) {
      const currentCostume = this.nativeSpriteMap[spriteId].getAnimationLabel();
      const previousCostume =
        this.previous.sprites?.find(sprite => sprite.id === spriteId)
          ?.costume ?? currentCostume;

      if (currentCostume !== previousCostume) {
        return true;
      }
    }
    return false;
  },

  // Returns true if sprite costumes change, but only event sprites.
  // Returns false if non-event sprites change costume, or if no sprites change costume.
  onlyClickedCostumeChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    let foundEventSpriteChange = false;

    for (const spriteId of spriteIds) {
      const currentCostume = this.nativeSpriteMap[spriteId].getAnimationLabel();
      const previousCostume =
        this.previous.sprites?.find(sprite => sprite.id === spriteId)
          ?.costume ?? currentCostume;

      if (currentCostume !== previousCostume) {
        if (eventSpriteIds.includes(spriteId)) {
          foundEventSpriteChange = true;
        } else {
          // Fail immediately if a non-event sprite changed.
          return false;
        }
      }
    }

    return foundEventSpriteChange;
  },

  anyPropChanged(prop) {
    const spriteIds = this.getSpriteIdsInUse();

    for (const spriteId of spriteIds) {
      let currentProp;
      let previousProp;

      switch (prop) {
        case 'costume':
          currentProp = this.nativeSpriteMap[spriteId].getAnimationLabel();
          break;
        case 'scale':
          currentProp = this.nativeSpriteMap[spriteId].getScale();
          break;
        default:
          currentProp = this.nativeSpriteMap[spriteId][prop];
      }

      previousProp =
        this.previous.sprites?.find(sprite => sprite.id === spriteId)?.[prop] ??
        currentProp;

      if (currentProp !== previousProp) {
        return true;
      }
    }

    return false;
  },

  // Returns true if sprite property changes, but only event sprites.
  // Returns false if non-event sprites change costume, or if no sprites change costume.
  onlyClickedPropChanged(prop) {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);
    let foundEventSpriteChange = false;

    for (const spriteId of spriteIds) {
      let currentProp;
      let previousProp;

      switch (prop) {
        case 'costume':
          currentProp = this.nativeSpriteMap[spriteId].getAnimationLabel();
          break;
        case 'scale':
          currentProp = this.nativeSpriteMap[spriteId].getScale();
          break;
        case 'tint':
          currentProp = this.nativeSpriteMap[spriteId].tint || '';
          break;
        default:
          currentProp = this.nativeSpriteMap[spriteId][prop];
      }

      previousProp =
        this.previous.sprites?.find(sprite => sprite.id === spriteId)?.[prop] ??
        currentProp;

      if (currentProp !== previousProp) {
        if (eventSpriteIds.includes(spriteId)) {
          foundEventSpriteChange = true;
        } else {
          // Fail immediately if a non-event sprite changed.
          return false;
        }
      }
    }

    return foundEventSpriteChange;
  },

  // Returns true if any sprite changed (started or stopped) behaviors this frame.
  anyBehaviorChanged() {
    const spriteIds = this.getSpriteIdsInUse();

    for (const spriteId of spriteIds) {
      const currentBehaviors = this.getBehaviorsForSpriteId(spriteId);
      const previousBehaviors =
        this.previous.sprites?.find(sprite => sprite.id === spriteId)
          ?.behaviors ?? currentBehaviors;

      if (!utils.arrayEquals(currentBehaviors, previousBehaviors)) {
        return true;
      }
    }

    return false;
  },

  // Returns true if sprites collectively have the minimum number of behaviors this frame.
  minimumBehaviors(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    let totalBehaviors = 0;
    for (const spriteId of spriteIds) {
      const currentBehaviors = this.getBehaviorsForSpriteId(spriteId);
      totalBehaviors += currentBehaviors.length;
    }
    return totalBehaviors >= min;
  },

  // Returns true if a minimum number of sprites has the specified behavior.
  minimumMatchingBehaviors(matchingBehavior, min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    const matchingSprites = spriteIds.filter(spriteId =>
      this.getBehaviorsForSpriteId(spriteId).includes(matchingBehavior)
    );
    return matchingSprites.length >= min;
  },

  // Returns true if sprites collectively have the minimum number of behaviors this frame,
  // excluding a specified default behavior.
  minimumNonMatchingBehaviors(excludedBehavior, min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    let totalNonMatchingBehaviors = 0;
    for (const spriteId of spriteIds) {
      const currentBehaviors = this.getBehaviorsForSpriteId(spriteId);
      const nonMatchingBehaviors = currentBehaviors.filter(
        behavior => behavior !== excludedBehavior
      );
      totalNonMatchingBehaviors += nonMatchingBehaviors.length;
      if (totalNonMatchingBehaviors >= min) {
        return true;
      }
    }
    return false;
  },

  // Returns true if a minimum number of sprites are in the specified group.
  minimumGroupSprites(group, min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    const groupSpriteIds = spriteIds.filter(
      id => this.nativeSpriteMap[id].group === group
    );
    return groupSpriteIds.length >= min;
  },

  // Returns true if a minimum number of sprites have no group.
  minimumNonGroupSprites(min = 1) {
    const spriteIds = this.getSpriteIdsInUse();
    const nonGroupSpriteIds = spriteIds.filter(
      id => !this.nativeSpriteMap[id].group
    );
    return nonGroupSpriteIds.length >= min;
  },

  // Returns true if sprites with a minimum number of costumes are in the specified group.
  minimumCostumesForGroup(group, min = 1) {
    const uniqueCostumes = [];
    const spriteIds = this.getSpriteIdsInUse();
    const spritesInUse = spriteIds.map(id => this.nativeSpriteMap[id]);
    const groupSprites = spritesInUse.filter(sprite => sprite.group === group);

    for (const sprite of groupSprites) {
      const costume = sprite.getAnimationLabel();
      if (!uniqueCostumes.includes(costume)) {
        uniqueCostumes.push(costume);
      }
    }
    return uniqueCostumes.length >= min;
  },

  // Returns true if there is exactly one sprite with the "players" group.
  playerSpriteFound() {
    const spriteIds = this.getSpriteIdsInUse();
    const groupSpriteIds = spriteIds.filter(
      id => this.nativeSpriteMap[id].group === 'players'
    );
    return groupSpriteIds.length === 1;
  },

  // Returns true if a player sprite has an upward vertical velocity
  playerSpriteJumping() {
    const spriteIds = this.getSpriteIdsInUse();
    const spritesInUse = spriteIds.map(id => this.nativeSpriteMap[id]);

    const jumpingSprites = spritesInUse.filter(
      sprite => sprite.group === 'players' && sprite.velocityY < 0
    );
    return jumpingSprites.length > 0;
  },

  // Special function for lesson: Mini-Project: Collector Game
  // Returns true if any sprite has one of: ['moving_with_arrow_keys', 'driving_with_arrow_keys', 'draggable'].
  interactiveBehaviorFound() {
    const spriteIds = this.getSpriteIdsInUse();
    for (const spriteId of spriteIds) {
      const currentBehaviors = this.getBehaviorsForSpriteId(spriteId);
      if (
        currentBehaviors.some(behavior =>
          [
            'moving_with_arrow_keys',
            'driving_with_arrow_keys',
            'draggable',
          ].includes(behavior)
        )
      ) {
        return true;
      }
    }
    return false;
  },

  // Returns true if only event sprite(s) change behaviors.
  // Returns false if non-event sprites or no sprites changed behaviors.
  onlyEventSpritesBehaviorChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = validationCommands.getEventSpriteIds.call(this);

    let foundEventSpriteChange = false;

    for (const spriteId of spriteIds) {
      const currentBehaviors = this.getBehaviorsForSpriteId(spriteId);
      const previousBehaviors =
        // Look for behaviors from the previous frame. If they do not exist (e.g first frame)
        // use the current behaviors.
        this.previous.sprites?.find(sprite => sprite.id === spriteId)
          ?.behaviors ?? currentBehaviors;

      const behaviorsChanged = !utils.arrayEquals(
        currentBehaviors,
        previousBehaviors
      );

      if (behaviorsChanged) {
        const isEventSprite = eventSpriteIds.includes(spriteId);
        if (isEventSprite) {
          foundEventSpriteChange = true;
        } else {
          // Fail immediately if a non-event sprite changed.
          return false;
        }
      }
    }

    return foundEventSpriteChange;
  },

  // Returns true if all sprites have the default size (100 for students)
  spritesDefaultSize() {
    const spriteIds = this.getSpriteIdsInUse();

    for (const spriteId of spriteIds) {
      if (this.nativeSpriteMap[spriteId].getScale() !== 1) {
        return false;
      }
    }

    return true;
  },

  // Returns true if any sprite was clicked, regardless of the eventLog.
  anySpriteClicked() {
    const spriteIds = this.getSpriteIdsInUse();

    // Check if the left mouse button was clicked
    if (this.p5.mouseWentDown('left')) {
      // Iterate through each sprite to check if the mouse is over it
      for (const spriteId of spriteIds) {
        if (this.p5.mouseIsOver(this.nativeSpriteMap[spriteId])) {
          return true; // Return true if mouse is over any sprite
        }
      }
    }
    return false; // Return false if mouse is not over any sprite or left mouse button wasn't clicked
  },

  // Returns true if any two sprites touched, regardless of the eventLog.
  anySpritesTouched() {
    let result = false;
    const allSprites = this.p5.World.allSprites;
    result = allSprites.isTouching(allSprites);
    return result;
  },

  // Returns true if sprites from the specified groups touched, regardless of the eventLog.
  groupSpritesTouched(subjectGroup, objectGroup) {
    let result = false;
    const allSprites = this.p5.World.allSprites;
    const subjectSprites = subjectGroup
      ? allSprites.filter(sprite => sprite.group === subjectGroup)
      : allSprites;
    const objectSprites = objectGroup
      ? allSprites.filter(sprite => sprite.group === objectGroup)
      : allSprites;
    // P5 adds an isTouching method to sprite group arrays:
    // https://github.com/code-dot-org/p5.play/blob/6b9a6ac479ce38a134cfc2fb9cadd50310741669/lib/p5.play.js#L3930
    // If we've modified the array by filtering, we'll need to re-add the method.
    if (!subjectSprites.isTouching) {
      subjectSprites.isTouching = allSprites.isTouching;
    }
    result = subjectSprites.isTouching(objectSprites);
    return result;
  },

  // Returns true if a click event was logged this frame.
  clickEventFound() {
    let result = false;
    // Only check for values that are new this frame
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
    // Only check for values that are new this frame
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

  // Returns true if a key press event was logged this frame.
  keyPressEventFound() {
    // Only check for values that are new this frame
    for (let i = this.previous.eventLogLength; i < this.eventLog.length; i++) {
      if (
        this.eventLog[i].includes('whenPress: ') ||
        this.eventLog[i].includes('whilePress: ')
      ) {
        return true;
      }
    }
    return false;
  },

  // Returns true if the background changed this frame.
  backgroundChanged() {
    if (this.previous.background) {
      return this.getBackground() !== this.previous.background;
    } else {
      return false;
    }
  },

  // Returns true if the title text changed this frame.
  titleChanged() {
    const previousScreenText = this.previous.screenText;
    if (previousScreenText) {
      return (
        this.screenText.title !== previousScreenText.title ||
        this.screenText.subtitle !== previousScreenText.subtitle
      );
    } else {
      return false;
    }
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

  // Returns true if a minimum number of foreground effects are currently active.
  // Disregards their initial render frame.
  foregroundEffectsActive(min = 1) {
    return this.getForegroundEffects().length >= min;
  },

  // Returns true if a minimum number of foreground effects were first rendered
  // this frame (e.g. using an event block)
  foregroundEffectRenderedThisFrame(min = 1) {
    const effects = this.getForegroundEffects();
    const newEffects = effects.filter(
      effect => effect.renderFrame === this.currentFrame()
    );
    return newEffects.length >= min;
  },

  // Returns true if a minimum number of variable bubbles are currently being drawn.
  variableBubblesCreated(min = 1) {
    return this.getVariableBubbles().length >= min;
  },

  // Returns true if a minimum number of watched variables have a valid value.
  // If unset, a variable's value is undefined.
  variableValueSet(min = 1) {
    const studentVars = this.getVariableBubbles();
    const filteredVars = studentVars.filter(
      studentVar =>
        typeof this.getVariableValue(studentVar.name) !== 'undefined'
    );
    return filteredVars.length >= min;
  },

  // Returns true if a watched variable's value changed this frame.
  // Optionally checks if the variable values have increased or decreased.
  // Since this command requires a variable bubble, it should be used in conjunction
  // with variableBubblesCreated.
  // Example usage:
  //   variableValueChanged(); // Checks if any watched variable changed.
  //   variableValueChanged('increase'); // Checks if any watched variable increased.
  //   variableValueChanged('decrease'); // Checks if any watched variable decreased.
  variableValueChanged(changeType = '') {
    const previousStudentVars = this.previous.variableBubbles;
    if (previousStudentVars) {
      const studentVars = this.getVariableBubbles();
      for (const studentVar of studentVars) {
        // Find a variable with the same name in the previous student variables
        const matchingPreviousVar = previousStudentVars.find(
          previousVar => previousVar.name === studentVar.name
        );

        // If the variable existed, compare its value with the value of the current student variable
        if (matchingPreviousVar) {
          const previousValue = matchingPreviousVar.value;
          const currentValue = this.getVariableValue(studentVar.name);

          // Compare the values
          if (previousValue !== currentValue) {
            switch (changeType) {
              case '':
                // If we're not explicitly looking for an increase or decrease,
                // any change to the value satisfies this criterion.
                return true;
              case 'decrease':
                if (
                  typeof previousValue === 'number' &&
                  typeof currentValue === 'number' &&
                  currentValue < previousValue
                ) {
                  return true;
                }
                break;
              case 'increase':
                if (
                  typeof previousValue === 'number' &&
                  typeof currentValue === 'number' &&
                  currentValue > previousValue
                ) {
                  return true;
                }
                break;
              default:
                console.error(
                  `Invalid argument for variableValueChanged: ${changeType}`
                );
                break;
            }
          }
        }
      }
    }
    // If we reach this point, none of the watched variables changed in the specified way.
    return false;
  },
};
