import {Validator} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

// Matches the condition Ailab#get_validations derives from requireAccuracy.
export const ACCURACY_AT_LEAST = 'ACCURACY_AT_LEAST';

export default class AccuracyValidator extends Validator {
  latestAccuracy = 0;

  shouldCheckConditions(): boolean {
    return true;
  }

  shouldCheckNextConditionsOnly(): boolean {
    return false;
  }

  checkConditions(): void {}

  conditionsMet(conditions: Condition[]): boolean {
    return conditions.every(
      ({name, value}) =>
        name !== ACCURACY_AT_LEAST || this.latestAccuracy >= Number(value)
    );
  }

  clear(): void {}

  getValidationResults() {
    return undefined;
  }
}
