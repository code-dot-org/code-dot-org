import * as drawUtils from '@cdo/apps/p5lab/drawUtils';
import {APP_WIDTH} from '../../constants';

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
  // the criteria is marked as completed. At the end of the program, if all the
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
    this.validationFrames.fail = frames;
  },
  setFailTime(frames) {
    this.validationFrames.fail = frames;
  },
  setDelayTime(frames) {
    this.validationFrames.pass = frames;
  },
  getFailTime() {
    return this.validationFrames.fail;
  },
  getPassTime() {
    return this.validationFrames.pass;
  },
  getDelayTime() {
    return this.validationFrames.delay;
  },

  checkAndSetSuccessTime(state) {
    if (!this.validationFrames.successFrame && state === 'pass') {
      this.validationFrames.successFrame = this.currentFrame();
      this.validationFrames.pass =
        this.validationFrames.delay + this.currentFrame();
    }
  },

  // Delay the pass time if the student is interacting with the app.
  delayEndInActiveApp() {
    if (this.previous.eventLogLength < this.eventLog.length) {
      this.validationFrames.pass =
        this.validationFrames.delay + this.currentFrame();
    }
  },

  // updateValidation() is used in levels, typically running every frame.=
  // This function updates the completion status of each added criteria,
  // updates the pass/fail status of the level, and uses this information
  // to update UX elements, such as progress bars.
  updateValidation() {
    // Get the current (ie. previous frame) pass/fail state prior to validation
    const state = commands.getPassState(this.criteria);

    // Check all criteria and update the completion status of each.
    commands.checkAllCriteria(this.criteria);
    commands.checkAndSetSuccessTime.call(this, state);
    // Calculate the size of the current progress bar as it fills to the right
    // across the screen.
    const barWidth =
      (this.currentFrame() - this.validationFrames.successFrame) *
      commands.calculateBarScale.call(this, state);
    drawUtils.validationBar(this.p5, barWidth, state, {});
    switch (state) {
      case 'fail':
        // End the level.
        if (this.currentFrame() > this.validationFrames.fail) {
          // If a user fails a level, we currently console.log the criteria object.
          // As this is a new feature, it might be helpful to be able to get this
          // information from users should they run into any bugs.
          // To-do: Remove this statement once the feature is stable.
          console.log(this.criteria);
          return {
            state: 'failed',
            feedback: commands.reportFailure(this.criteria)
          };
        }
        break;
      case 'pass':
        if (this.currentFrame() > this.validationFrames.pass) {
          return {
            state: 'succeeded',
            feedback: commands.reportSuccess(this.criteria)
          };
        }
        break;
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

  calculateBarScale(state) {
    let scale = APP_WIDTH;
    switch (state) {
      case 'pass':
        scale =
          APP_WIDTH /
          (this.validationFrames.pass - this.validationFrames.successFrame);
        break;
      case 'fail':
        scale = APP_WIDTH / this.validationFrames.fail;
        break;
      default:
        scale = APP_WIDTH;
        break;
    }
    return scale;
  },

  // checkAllCriteria() is used in levels, typically occuring once per frame
  // as part of updateValidation(). Validation is essentially an ordered
  // list of one or more "criteria", each consisting of a predicate function and
  // a feedback message key. The predicate functions run each tick, and if true,
  // the criteria is marked as completed. At the end of the program, if all the
  // criteria are complete, the student passes the level. If any criteria are
  // not complete, the student sees the feedback message corresponding to the
  // first unmet criteria.
  checkAllCriteria(criteria) {
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        if (criteria[criterion].predicate()) {
          criteria[criterion].complete = true;
        }
      }
    }
  },

  // Used at the end of a level. Find the first failed criteria and return associated feedback.
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

  // Used at the end of a level. If there are no failed criteria, return the generic success feedback.
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
  }
};

/**
 * Validation is essentially an ordered list of one or more "criteria", each
 * consisting of a predicate function and a feedback message key. The predicate
 * functions run each tick, and if true, the criteria is marked as completed.
 * At the end of the program, if all the criteria are complete, the student
 * passes the level. If any criteria are not complete, the student sees the
 * feedback messagecorresponding to the first unmet criteria.
 *
 * Properties of a criteria object:
 * @property {function} predicate - The function that determines if the student
 * is passing the criteria.
 * @property {string} feedback - A translatable string key (see /apps/i18n/spritelab/en_us.js)
 * @property {boolean} complete - Set to true once the predicate passes successfully.
 * Criteria are only checked until marked complete.
 */
class criteria {
  constructor(predicate, feedback) {
    this.predicate = predicate;
    this.feedback = feedback;
    this.complete = false;
  }
}
