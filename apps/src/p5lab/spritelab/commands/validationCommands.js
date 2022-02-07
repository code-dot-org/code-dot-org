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

  anySpriteSpeaksThisFrame(spriteIds) {
    let result = false;
    spriteIds.forEach(spriteId => {
      if (commands.spriteSpeechRenderedThisFrame.call(this, spriteId)) {
        result = true;
      }
    });
    return result;
  },

  singleSpriteSpeaksThisFrame(spriteIds) {
    let result = false;
    let count = 0;
    spriteIds.forEach(spriteId => {
      if (commands.spriteSpeechRenderedThisFrame.call(this, spriteId)) {
        count++;
      }
    });
    result = count === 1;
    return result;
  },

  getCriteria() {
    return this.criteria;
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

  // Used in levels (typically first frame only) to create an ordered list of success criteria
  addCriteria(predicate, feedback) {
    if (typeof predicate === 'function' && typeof feedback === 'string') {
      this.criteria.push(new criteria(predicate, feedback));
    }
  },

  // Used in levels (typically every frame) to validate based on all criteria
  validate() {
    // Get the current (ie. previous frame) pass/fail state prior to validation
    let state = commands.getPassState(this.criteria);

    let barWidth =
      this.currentFrame() * commands.calculateBarScale(this.validationTimes);
    drawUtils.validationBar(this.p5, barWidth, state, {});

    if (this.previous.eventLogLength === undefined) {
      this.previous.eventLogLength = this.eventLog.length;
    }
    commands.initializePreviousCostumes.call(this, this.getSpriteIdsInUse());

    //check criteria and update complete status
    if (this.currentFrame() <= this.validationTimes.wait) {
      commands.checkAllCriteria(this.criteria);
    } else {
      //If wait time is over, determine if student passes or fails
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
    this.previous.eventLogLength = this.eventLog.length;
    commands.updatePreviousCostumes.call(this, this.getSpriteIdsInUse());
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

  minimumSprites(min) {
    return this.getSpriteIdsInUse().length >= min;
  },

  allSpriteHaveDifferentCostumes() {
    return this.getAnimationsInUse().length === this.getSpriteIdsInUse().length;
  },

  allSpriteHaveSameCostume() {
    return this.getAnimationsInUse().length === 1;
  },

  anyCostumeChangedThisFrame(spriteIds) {
    let result = false;
    spriteIds.forEach(id => {
      let currentCostume = this.nativeSpriteMap[
        spriteIds[id]
      ].getAnimationLabel();
      let previousCostume = this.previous.costumesById.costumes[id];
      if (currentCostume !== previousCostume) {
        result = true;
      }
    });
    return result;
  },

  onlyClickedCostumeChangedThisFrame(spriteIds) {
    let result = false;
    spriteIds.forEach(id => {
      let currentCostume = this.nativeSpriteMap[
        spriteIds[id]
      ].getAnimationLabel();
      let previousCostume = this.previous.costumesById.costumes[id];
      if (currentCostume !== previousCostume) {
        //sprite change costume
        result = true;
        if (
          !(
            this.p5.mouseIsOver(this.nativeSpriteMap[spriteIds[id]]) &&
            this.p5.mouseWentDown('left')
          )
        ) {
          //sprite was not clicked this frame
          result = false;
        }
      }
    });
    return result;
  },

  initializePreviousCostumes(spriteIds) {
    if (this.previous.costumesById === undefined) {
      this.previous.costumesById = {
        frame: this.currentFrame(),
        costumes: []
      };
      spriteIds.forEach(id => {
        this.previous.costumesById.costumes.push(
          this.nativeSpriteMap[spriteIds[id]].getAnimationLabel()
        );
      });
    }
  },

  updatePreviousCostumes(spriteIds) {
    if (this.previous.costumesById !== undefined) {
      if (this.previous.costumesById.frame !== this.currentFrame()) {
        this.previous.costumesById = {
          frame: this.currentFrame(),
          costumes: []
        };
        spriteIds.forEach(id => {
          this.previous.costumesById.costumes.push(
            this.nativeSpriteMap[spriteIds[id]].getAnimationLabel()
          );
        });
      }
    }
  },

  spritesDefaultSize(spriteIds) {
    let result = true;
    spriteIds.forEach(id => {
      if (this.nativeSpriteMap[spriteIds[id]].getScale() !== 1) {
        result = false;
      }
    });
    return result;
  },

  anySpriteClicked(spriteIds) {
    let result = false;
    if (this.p5.mouseWentDown('left')) {
      spriteIds.forEach(id => {
        if (this.p5.mouseIsOver(this.nativeSpriteMap[spriteIds[id]])) {
          result = true;
        }
      });
    }
    return result;
  },

  clickEventFound() {
    let result = false;
    let eventLog = this.eventLog;
    eventLog.forEach(currentEvent => {
      if (
        currentEvent.includes('whenClick: ') ||
        currentEvent.includes('whileClick: ')
      ) {
        result = true;
      }
    });
    return result;
  },

  clickEventFoundThisFrame() {
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
  }
};
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
