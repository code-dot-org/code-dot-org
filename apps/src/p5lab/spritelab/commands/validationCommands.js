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

  // Gets an array of ids for any sprite that has an associated event triggered this frame.
  getEventSpriteIds() {
    // We want to store any ids that are included in events logged this frame.
    // Touch events include two distinct sprite ids.
    let idArray = [];

    //Only check for values that are new this frame
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

  // Used in levels (typically first frame only) to create an ordered list of success criteria
  addCriteria(predicate, feedback) {
    if (typeof predicate === 'function' && typeof feedback === 'string') {
      this.criteria.push(new criteria(predicate, feedback));
    }
  },

  // Used in levels to override default validation timing.
  setEarlyTime(frames) {
    this.validationTimes.early = frames;
  },
  setWaitTime(frames) {
    this.validationTimes.wait = frames;
  },
  setDelayTime(frames) {
    this.validationTimes.delay = frames;
  },

  // Used in levels (typically every frame) to validate based on all criteria
  validate() {
    // Get the current (ie. previous frame) pass/fail state prior to validation
    const state = commands.getPassState(this.criteria);

    const barWidth =
      this.currentFrame() * commands.calculateBarScale(this.validationTimes);
    drawUtils.validationBar(this.p5, barWidth, state, {});

    //check criteria and update complete status
    if (this.currentFrame() <= this.validationTimes.wait) {
      commands.checkAllCriteria(this.criteria);
    } else {
      //If wait time is over, determine if student passes or fails
      var results = {};
      if (state === 'fail') {
        console.log(this.criteria);
        results = {
          state: 'failed',
          feedback: commands.reportFailure(this.criteria)
        };
      } else if (
        this.currentFrame() >=
        this.validationTimes.wait + this.validationTimes.delay
      ) {
        results = {
          state: 'succeeded',
          feedback: commands.reportSuccess(this.criteria)
        };
      }
      return results;
    }
    commands.updatePrevious.call(this);
  },

  updatePrevious() {
    const spriteIds = this.getSpriteIdsInUse();
    this.previous.eventLogLength = this.eventLog.length;
    this.previous.sprites = [];
    for (let i = 0; i < spriteIds.length; i++) {
      let spriteId = spriteIds[i];
      this.previous.sprites.push({
        id: spriteId,
        costume: this.nativeSpriteMap[spriteId].getAnimationLabel(),
        x: this.nativeSpriteMap[spriteId].x,
        y: this.nativeSpriteMap[spriteId].y,
        behaviors: this.getBehaviorsForSpriteId(spriteId)
      });
    }
  },

  getPassState(criteria) {
    var state = 'pass';
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        state = 'fail';
      }
    }
    return state;
  },

  calculateBarScale(validationTimes) {
    return 400 / (validationTimes.wait + validationTimes.delay);
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
    let spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      if (commands.spriteSpeechRenderedThisFrame.call(this, i)) {
        result = true;
      }
    }
    return result;
  },

  // Return true if exactly one sprite began speaking.
  singleSpriteSpeaks() {
    let spriteIds = this.getSpriteIdsInUse();
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

  // Returns true if any sprite's costume changed this frame.
  anyCostumeChanged() {
    let spriteIds = this.getSpriteIdsInUse();
    let result = false;
    for (let i = 0; i < spriteIds.length; i++) {
      let currentCostume = this.nativeSpriteMap[
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
    let spriteIds = this.getSpriteIdsInUse();
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
    let spriteIds = this.getSpriteIdsInUse();
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
    let allSprites = this.p5.World.allSprites;
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
  }
};
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
