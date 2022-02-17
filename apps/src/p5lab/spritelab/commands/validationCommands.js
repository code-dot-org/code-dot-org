import * as drawUtils from '@cdo/apps/p5lab/drawUtils';
import * as utils from '@cdo/apps/p5lab/utils';

export const commands = {
  getCriteria() {
    return this.criteria;
  },

  getAnimationsInUse() {
    return this.getAnimationsInUse();
  },

  getBackground() {
    const background = this.getBackground();
    if (background === undefined) {
      return undefined;
    } else if (typeof background === 'string') {
      return background;
    } else {
      return background.name;
    }
  },

  getEventLog() {
    return this.eventLog;
  },

  getNumBehaviorsForAnimation(animation) {
    return this.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return this.getNumBehaviorsForSpriteId(spriteId);
  },

  getBehaviorsForSpriteId(spriteId) {
    return this.getBehaviorsForSpriteId(spriteId);
  },

  getPrintLog() {
    return this.printLog;
  },

  getPromptVars() {
    return this.promptVars;
  },

  getSoundLog() {
    return this.soundLog;
  },

  getSpeechForSpriteId(spriteId) {
    return this.getLastSpeechBubbleForSpriteId(spriteId)?.text;
  },

  getSpriteIdsInUse() {
    return this.getSpriteIdsInUse();
  },

  getTitle() {
    return {
      title: this.screenText.title,
      subtitle: this.screenText.subtitle
    };
  },

  // Gets an array of ids for any sprite that has an associated event logged this frame.
  getEventSpriteIds() {
    // We want to store any ids that are included in events logged this frame.
    // Touch events include two distinct sprite ids.
    let idArray = [];

    // Only check for values that are new this frame.
    for (let i = this.previous.eventLogLength; i < this.eventLog.length; i++) {
      if (
        // Check for each event type that includes sprite ids (NOT time or key events).
        this.eventLog[i].includes('whenClick: ') ||
        this.eventLog[i].includes('whileClick: ') ||
        this.eventLog[i].includes('whenTouch: ') ||
        this.eventLog[i].includes('whileTouch: ') ||
        this.eventLog[i].includes('spriteCreated: ')
      ) {
        // Use .concat because it's possible for multiple events to be logged in the same frame.
        idArray = idArray.concat(
          // Take whatever was in the current eventLog entry...
          this.eventLog[i]
            // ...remove the spaces and create an array...
            .split(' ')
            // ...convert each string in the array to a number...
            .map(Number)
            // ...remove NaN values. (ex. 'whenClick: 0' results in [Nan, 0] above)
            .filter(function(value) {
              return !Number.isNaN(value);
            })
        );
      }
    }
    return idArray;
  },

  // addCriteria() is used in levels (typically first frame only) to create
  // an ordered list of success criteria. Validation is essentially an ordered
  // list of one or more "criteria", each consisting of a predicate function and
  // a feedback message key. The predicate functions run each tick, and if true,
  // mark the criteria as completed. At the end of the program, if all the
  // criteria are complete, the student passes the level. If any criteria are
  // not complete, the student sees the feedback message corresponding to the
  // first unmet criteria.
  addCriteria(predicate, feedback) {
    if (typeof predicate === 'function' && typeof feedback === 'string') {
      this.criteria.push(new criteria(predicate, feedback));
    }
  },

  // Used in levels to override default validation timing.
  setEarlyTime(frames) {
    this.validationFrames.early = frames;
  },
  setWaitTime(frames) {
    this.validationFrames.wait = frames;
  },
  setDelayTime(frames) {
    this.validationFrames.delay = frames;
  },

  // updateValidation() is used in levels, typically running every frame.=
  // This function updates the completion status of each added criteria,
  // updates the pass/fail status of the level, and use this information
  // to update UX elements, such a progress bars.
  updateValidation() {
    // Get the current (ie. previous frame) pass/fail state prior to validation
    const state = commands.getPassState(this.criteria);

    // Calculate the size of the current progress bar as it fills to the right
    // across the screen.
    const barWidth =
      this.currentFrame() * commands.calculateBarScale(this.validationFrames);
    drawUtils.validationBar(this.p5, barWidth, state, {});

    // Check all criteria and update the completion status of each.
    if (this.currentFrame() <= this.validationFrames.wait) {
      commands.checkAllCriteria(this.criteria);
    } else {
      // If "wait time" is over, determine if student passes or fails.
      var results = {};
      if (state === 'fail') {
        console.log(this.criteria);
        results = {
          state: 'failed',
          feedback: commands.reportFailure(this.criteria)
        };
      } else if (
        this.currentFrame() >=
        this.validationFrames.wait + this.validationFrames.delay
      ) {
        results = {
          state: 'succeeded',
          feedback: commands.reportSuccess(this.criteria)
        };
      }
      return results;
    }
    // For programs where students work with events, we need to make comparisons
    // between the current state and the state during the previous frame. After all
    // validation checks are complete, we store the current state in this.previous
    // so that those comparisons can be made next time updateValidation() occurs.
    commands.storeStateAsPrevious.call(this);
  },

  // Store information about this frame for comparisons during the next frame.
  storeStateAsPrevious() {
    const spriteIds = this.getSpriteIdsInUse();
    this.previous.eventLogLength = this.eventLog.length;
    this.previous.printLogLength = this.printLog.length || 0;
    this.previous.sprites = [];
    for (let i = 0; i < spriteIds.length; i++) {
      let spriteId = spriteIds[i];
      this.previous.sprites.push({
        id: spriteId,
        costume: this.nativeSpriteMap[spriteId].getAnimationLabel(),
        x: this.nativeSpriteMap[spriteId].x,
        y: this.nativeSpriteMap[spriteId].y,
        behaviors: this.getBehaviorsForSpriteId(spriteId),
        tint: this.nativeSpriteMap[spriteId].tint || '',
        scale: this.nativeSpriteMap[spriteId].getScale(),
        speed: this.nativeSpriteMap[spriteId].speed,
        rotation: this.nativeSpriteMap[spriteId].rotation
      });
    }
  },

  // If the student has not completed any criteria, they are "failing".
  // This determines things like the current color of the validation timer bar below the play area.
  getPassState(criteria) {
    var state = 'pass';
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        state = 'fail';
      }
    }
    return state;
  },

  calculateBarScale(validationFrames) {
    return 400 / (validationFrames.wait + validationFrames.delay);
  },

  checkAllCriteria(criteria) {
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        if (criteria[criterion].predicate()) {
          criteria[criterion].complete = true;
        }
      }
    }
  },

  // Used at the end of a level. Find the first failed criteria and pass associated feedback.
  reportFailure(criteria) {
    let firstFailed = -1;
    for (const criterion in criteria) {
      if (!criteria[criterion].complete && firstFailed === -1) {
        firstFailed = criterion;
      }
    }
    if (firstFailed > -1) {
      return criteria[firstFailed].feedback;
    }
  },

  // Used at the end of a level. If there are no failed criteria, pass the generic success feedback.
  reportSuccess(criteria) {
    let firstFailed = -1;
    for (const criterion in criteria) {
      if (!criteria[criterion].complete && firstFailed === -1) {
        firstFailed = criterion;
      }
    }
    if (firstFailed === -1) {
      return 'genericSuccess';
    }
  },

  // CRITERIA FUNCTIONS

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
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      if (commands.spriteSpeechRenderedThisFrame.call(this, i)) {
        result = true;
      }
    }
    return result;
  },

  // Return true if any sprite was speaking.
  anySpriteSpeaking() {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      if (this.getLastSpeechBubbleForSpriteId(spriteIds[i])) {
        result = true;
      }
    }
    return result;
  },

  // Return true if any sprite's speech include values from a given object.
  anySpeechIncludesValues(object) {
    const spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      Object.values(object).forEach(value => {
        let speechText = this.getLastSpeechBubbleForSpriteId(spriteIds[i])
          ?.text;
        let type = typeof speechText;
        switch (type) {
          case 'string':
            result = speechText.includes(value);
            break;
          case 'number':
            result = speechText === value;
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
      if (commands.spriteSpeechRenderedThisFrame.call(this, i)) {
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

    const eventSpriteIds = commands.getEventSpriteIds.call(this);
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
      const currentCostume = this.nativeSpriteMap[
        spriteIds[i]
      ].getAnimationLabel();
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
    const eventSpriteIds = commands.getEventSpriteIds.call(this);
    let result = false;
    let foundEventSpriteChange = false;
    let foundNoneventSpriteChange = false;
    for (let i = 0; i < spriteIds.length; i++) {
      const currentCostume = this.nativeSpriteMap[
        spriteIds[i]
      ].getAnimationLabel();
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
    const eventSpriteIds = commands.getEventSpriteIds.call(this);
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

  // Returns true if only event sprite(s) change behaviors.
  // Returns false if non-event sprites or no sprites changed behaviors.
  onlyEventSpritesBehaviorChanged() {
    const spriteIds = this.getSpriteIdsInUse();
    const eventSpriteIds = commands.getEventSpriteIds.call(this);
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

  // Returns true text was printed this frame.
  printedText() {
    const previousPrintLogLength = this.previous.printLogLength || 0;
    let result = previousPrintLogLength < this.printLog.length;
    return result;
  },

  // Returns true if the student set a variable to any number, string, or boolean.
  variableCreated() {
    let result = this.studentVars.length >= 1;
    return result;
  }
};
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
