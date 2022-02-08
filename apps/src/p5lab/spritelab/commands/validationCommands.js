import * as drawUtils from '@cdo/apps/p5lab/drawUtils';
import * as utils from '@cdo/apps/p5lab/utils';

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

    commands.initializePrevious.call(
      this,
      'eventLogLength',
      this.getSpriteIdsInUse()
    );
    commands.initializePrevious.call(
      this,
      'behaviorsById',
      this.getSpriteIdsInUse()
    );
    commands.initializePrevious.call(
      this,
      'costumesById',
      this.getSpriteIdsInUse()
    );
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
      console.log(this.criteria);
      return results;
    }
    commands.updatePrevious.call(
      this,
      'eventLogLength',
      this.getSpriteIdsInUse()
    );
    commands.updatePrevious.call(
      this,
      'behaviorsById',
      this.getSpriteIdsInUse()
    );
    commands.updatePrevious.call(
      this,
      'costumesById',
      this.getSpriteIdsInUse()
    );
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

  anyBehaviorChangedThisFrame(spriteIds) {
    let result = false;
    spriteIds.forEach(id => {
      let currentBehaviors = this.getBehaviorsForSpriteId(id);
      let previousBehaviors = this.previous.behaviorsById.behaviors[id];
      if (!utils.arrayEquals(currentBehaviors, previousBehaviors)) {
        result = true;
      }
    });
    return result;
  },

  onlyEventSpritesBehaviorChanged(spriteIds) {
    let result = false;
    spriteIds.forEach(id => {
      let currentBehaviors = this.getBehaviorsForSpriteId(id);
      let previousBehaviors = this.previous.behaviorsById.behaviors[id];
      if (!utils.arrayEquals(currentBehaviors, previousBehaviors)) {
        result = true;
        if (!commands.currentFrameEventSpriteIds.call(this).includes(id)) {
          result = false;
        }
      }
    });
    return result;
  },

  initializePrevious(type, spriteIds) {
    switch (type) {
      case 'eventLogLength':
        if (this.previous.eventLogLength === undefined) {
          this.previous.eventLogLength = this.eventLog.length;
        }
        break;
      case 'behaviorsById':
        if (this.previous.behaviorsById === undefined) {
          this.previous.behaviorsById = {
            frame: this.currentFrame(),
            behaviors: []
          };
          spriteIds.forEach(id => {
            this.previous.behaviorsById.behaviors[
              id
            ] = this.getBehaviorsForSpriteId(id);
          });
        }
        break;
      case 'costumesById':
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
        break;
    }
  },

  updatePrevious(type, spriteIds) {
    switch (type) {
      case 'eventLogLength':
        this.previous.eventLogLength = this.eventLog.length;
        break;
      case 'behaviorsById':
        if (this.previous.behaviorsById !== undefined) {
          if (this.previous.behaviorsById.frame !== this.currentFrame()) {
            this.previous.behaviorsById = {
              frame: this.currentFrame(),
              behaviors: []
            };
            spriteIds.forEach(id => {
              this.previous.behaviorsById.behaviors.push(
                this.getBehaviorsForSpriteId(id)
              );
            });
          }
        }
        break;
      case 'costumesById':
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
        break;
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

  anySpritesTouched() {
    let result = false;
    let allSprites = this.p5.World.allSprites;
    result = allSprites.isTouching(allSprites);
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
  },

  touchEventFoundThisFrame() {
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

  currentFrameEventSpriteIds() {
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
    //console.log(idArray);

    return idArray;
  }
};
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
