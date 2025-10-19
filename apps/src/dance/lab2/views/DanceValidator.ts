// Dance Lab2 specific validations.

import {
  ValidationResult,
  Validator,
} from '@cdo/apps/lab2/progress/ProgressManager';
import {Condition} from '@cdo/apps/lab2/types';

export default class DanceValidator extends Validator {
  constructor(
    private readonly getCurrentCondition: () => Condition | undefined
  ) {
    super();
  }

  shouldCheckConditions() {
    return true;
  }

  shouldCheckNextConditionsOnly() {
    return false;
  }

  checkConditions() {
    return true;
  }

  conditionsMet(conditions: Condition[]): boolean {
    return this.getCurrentCondition()?.name === conditions[0].name;
  }

  clear() {}

  getValidationResults(): ValidationResult[] | undefined {
    return undefined;
  }
}
