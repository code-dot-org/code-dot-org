import * as drawUtils from '@cdo/apps/p5lab/drawUtils';

export const commands = {
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

  spriteSpeechRenderedThisFrame(spriteId) {
    return (
      this.getLastSpeechBubbleForSpriteId(spriteId)?.renderFrame ===
      this.currentFrame()
    );
  },

  getCriteria() {
    return this.criteria;
  },

  setEarlyTime(frames) {
    this.validationTimes.early = frames;
  },

  setWaitTime(frames) {
    this.validationTimes.wait = frames;
  },

  setDelayTime(frames) {
    this.validationTimes.delay = frames;
  },

  setCriteria(predicate, feedback) {
    if (typeof predicate === 'function' && typeof feedback === 'string') {
      this.criteria.push(new criteria(predicate, feedback));
    }
  },

  validate() {
    let state = commands.getPassState(this.criteria);

    let barWidth =
      this.currentFrame() * commands.calculateBarScale(this.validationTimes);
    drawUtils.validationBar(this.p5, barWidth, state, {});

    //check criteria and update complete status
    if (this.currentFrame() <= this.validationTimes.wait) {
      commands.checkAllCriteria(this.criteria);
    } else {
      var results = {};
      if (state === 'fail') {
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

  passLevel() {
    return true;
  },

  minimumSprites(min) {
    return this.getSpriteIdsInUse().length >= min;
  },

  allSpriteHaveDifferentCostumes() {
    return this.getAnimationsInUse().length === this.getSpriteIdsInUse().length;
  },

  allSpriteHaveSameCostume() {
    return this.getAnimationsInUse().length === 1;
  }
};
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
