import {APP_WIDTH} from '../p5lab/constants';
import * as drawUtils from '../p5lab/drawUtils';
import type {Criterion, PreviousSprite, ValidationResult} from '../types';

import {defineCommands} from './defineCommands';

type PassState = drawUtils.ValidationState;

export const commands = defineCommands({
  getCriteria() {
    return this.criteria;
  },

  getAnimationsInUse() {
    return this.getAnimationsInUse();
  },

  getBackground(): string | undefined {
    const background = this.getBackground();
    if (background === undefined) {
      return undefined;
    } else if (typeof background === 'string') {
      return background;
    } else {
      return background.name as string;
    }
  },

  getEventLog() {
    return this.eventLog;
  },

  getNumBehaviorsForAnimation(animation: string) {
    return this.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId: number) {
    return this.getNumBehaviorsForSpriteId(spriteId);
  },

  getBehaviorsForSpriteId(spriteId: number) {
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

  getSpeechForSpriteId(spriteId: number) {
    return this.getLastSpeechBubbleForSpriteId(spriteId)?.text;
  },

  getSpriteIdsInUse() {
    return this.getSpriteIdsInUse();
  },

  getTitle() {
    return {
      title: this.screenText.title,
      subtitle: this.screenText.subtitle,
    };
  },

  // Gets an array of ids for any sprite that has an associated event logged this frame.
  getEventSpriteIds(): number[] {
    // We want to store any ids that are included in events logged this frame.
    // Touch events include two distinct sprite ids.
    let idArray: number[] = [];

    // Only check for values that are new this frame.
    const start = this.previous.eventLogLength ?? this.eventLog.length;
    for (let i = start; i < this.eventLog.length; i++) {
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
            .filter(function (value) {
              return !Number.isNaN(value);
            }),
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
  addCriteria(predicate: unknown, feedback: unknown) {
    if (typeof predicate === 'function' && typeof feedback === 'string') {
      this.criteria.push(
        new ValidationCriterion(predicate as () => unknown, feedback),
      );
    }
  },

  addBonusCriteria(predicate: unknown) {
    if (typeof predicate === 'function') {
      this.bonusCriteria.push(
        new ValidationCriterion(predicate as () => unknown),
      );
    }
  },

  // Used in levels to override default validation settings.
  setSuccessMessage(message: string) {
    this.successMessage = message;
  },
  setBonusSuccessMessage(message: string) {
    this.bonusSuccessMessage = message;
  },
  setWaitTime(frames: number) {
    this.validationFrames.fail = frames;
    return true;
  },
  setFailTime(frames: number) {
    this.validationFrames.fail = frames;
    return true;
  },
  setDelayTime(frames: number) {
    this.validationFrames.delay = frames;
    return true;
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

  checkAndSetSuccessTime(state: PassState) {
    if (!this.validationFrames.successFrame && state !== 'fail') {
      this.validationFrames.successFrame = this.currentFrame();
      this.validationFrames.pass =
        this.validationFrames.delay + this.currentFrame();
    }
  },

  // Delay the pass time if the student is interacting with the app.
  delayEndInActiveApp() {
    const previousLength = this.previous.eventLogLength;
    if (previousLength !== undefined && previousLength < this.eventLog.length) {
      this.validationFrames.pass =
        this.validationFrames.delay + this.currentFrame();
    }
  },

  // updateValidation() is used in levels, typically running every frame.=
  // This function updates the completion status of each added criteria,
  // updates the pass/fail status of the level, and uses this information
  // to update UX elements, such as progress bars.
  updateValidation(): ValidationResult | undefined {
    // Get the current (ie. previous frame) pass/fail state prior to validation
    const state = commands.getPassState(this.criteria, this.bonusCriteria);

    // Check all criteria and update the completion status of each.
    commands.checkAllCriteria(this.criteria);
    commands.checkAllCriteria(this.bonusCriteria);
    commands.checkAndSetSuccessTime.call(this, state);
    // Calculate the size of the current progress bar as it fills to the right
    // across the screen.
    const barWidth =
      (this.currentFrame() - this.validationFrames.successFrame) *
      commands.calculateBarScale.call(this, state);
    drawUtils.validationBar(this.p5, barWidth, state, {});
    switch (state) {
      case 'fail':
        // End the level after enough time has passed.
        if (this.currentFrame() > this.validationFrames.fail) {
          // If a user fails a level, we currently console.log the criteria object.
          // As this is a new feature, it might be helpful to be able to get this
          // information from users should they run into any bugs.
          // To-do: Remove this statement once the feature is stable.
          console.log(this.criteria);
          return {
            state: 'failed',
            feedback: commands.chooseFailureFeedback(this.criteria),
          };
        }
        break;
      case 'bonus':
      case 'pass':
        if (state === 'bonus') {
          this.successMessage = this.bonusSuccessMessage;
        }
        if (this.currentFrame() > this.validationFrames.pass) {
          return {
            state: 'succeeded',
            feedback: this.successMessage,
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
  storeStateAsPrevious(): void {
    const spriteIds = this.getSpriteIdsInUse();
    this.previous.eventLogLength = this.eventLog.length;
    this.previous.printLogLength = this.printLog.length || 0;
    this.previous.soundLogLength = this.soundLog.length || 0;
    this.previous.foregroundEffectsLength = this.foregroundEffects.length || 0;
    this.previous.background = this.background;
    this.previous.screenText = this.screenText;

    // Store basic information about sprites.
    const sprites: PreviousSprite[] = [];
    this.previous.sprites = sprites;
    spriteIds.forEach(spriteId => {
      sprites.push({
        id: spriteId,
        costume: this.nativeSpriteMap[spriteId].getAnimationLabel(),
        x: this.nativeSpriteMap[spriteId].x,
        y: this.nativeSpriteMap[spriteId].y,
        behaviors: this.getBehaviorsForSpriteId(spriteId),
        tint: this.nativeSpriteMap[spriteId].tint || '',
        scale: this.nativeSpriteMap[spriteId].getScale(),
        speed: this.nativeSpriteMap[spriteId].speed,
        rotation: this.nativeSpriteMap[spriteId].rotation,
      });
    });

    // Store basic information about watched variables.
    const previousBubbles: NonNullable<typeof this.previous.variableBubbles> =
      [];
    this.previous.variableBubbles = previousBubbles;
    const variableBubbles = this.getVariableBubbles();
    variableBubbles.forEach(variableBubble => {
      previousBubbles.push({
        ...variableBubble,
        // Run the variable name through the JS interpreter to get its value,
        // using an empty string for undefined variables.
        // We need to store the previous value to validate changes between frames.
        value: this.getVariableValue(variableBubble.name, ''),
      });
    });
  },

  // If the student has not completed any criteria, they are "failing".
  // This determines things like the current color of the validation timer bar below the play area.
  getPassState(criteria: Criterion[], bonusCriteria: Criterion[]): PassState {
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        return 'fail';
      }
    }
    for (const criterion in bonusCriteria) {
      if (bonusCriteria[criterion].complete) {
        return 'bonus';
      }
    }
    return 'pass';
  },

  calculateBarScale(state: PassState): number {
    let scale = APP_WIDTH;
    switch (state) {
      case 'pass':
      case 'bonus':
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
  checkAllCriteria(criteria: Criterion[]): void {
    for (const criterion in criteria) {
      if (!criteria[criterion].complete) {
        if (criteria[criterion].predicate()) {
          criteria[criterion].complete = true;
        }
      }
    }
  },

  // Used at the end of a level. Find the first failed criteria and return associated feedback.
  chooseFailureFeedback(criteria: Criterion[]): string | undefined {
    return criteria.find(criterion => !criterion.complete)?.feedback;
  },

  // Returns an object with properties representing student Blockly variables.
  // Typically called in validation code to set `varLog` - a global variable
  // initialized by the interpreted variableLog helper library.
  buildVariableLog(): Record<string, unknown> {
    const studentVariables: Record<string, unknown> = {};

    for (const name of this.host.getVariableNames()) {
      const value = this.getVariableValue(name);
      if (
        ['number', 'string', 'boolean'].includes(typeof value) ||
        Array.isArray(value)
      ) {
        studentVariables[name] = value;
      }
    }

    return studentVariables;
  },
});

/**
 * A predicate the level's validation code checks each frame until it first
 * holds, and the feedback key shown if it never does. Bonus criteria have no
 * feedback.
 */
class ValidationCriterion implements Criterion {
  readonly predicate: () => unknown;
  readonly feedback: string | undefined;
  complete = false;

  constructor(predicate: () => unknown, feedback?: string) {
    this.predicate = predicate;
    this.feedback = feedback;
  }
}
