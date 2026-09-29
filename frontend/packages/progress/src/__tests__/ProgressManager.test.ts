import {describe, expect, it, vi} from 'vitest';

import ProgressManager from '../ProgressManager';
import type {Condition, Validation} from '../types';
import {Validator} from '../types';

// Meets exactly the conditions it is given.
class SetValidator extends Validator {
  met = new Set<string>();
  clear = vi.fn();
  exemplarPassed = false;
  shouldCheckConditions() {
    return true;
  }
  shouldCheckNextConditionsOnly() {
    return false;
  }
  checkConditions() {}
  conditionsMet(conditions: Condition[]) {
    return conditions.every(c => this.met.has(c.name));
  }
  getValidationResults() {
    return undefined;
  }
  didPassExemplarValidation() {
    return this.exemplarPassed;
  }
}

const validations: Validation[] = [
  {
    key: 'hint',
    conditions: [{name: 'PLAYED_ONE'}],
    message: 'Now play two.',
    next: false,
  },
  {
    key: 'done',
    conditions: [{name: 'PLAYED_TWO'}],
    message: 'Well done.',
    next: true,
  },
];

function managerWith(v: Validation[] | undefined = validations) {
  const onChange = vi.fn();
  const manager = new ProgressManager(onChange);
  const validator = new SetValidator();
  manager.setValidator(validator);
  manager.onLevelChange({}, v);
  return {manager, validator, onChange};
}

describe('ProgressManager', () => {
  it('clears the validator for a level change, and not for a re-run', () => {
    const {manager, validator} = managerWith();
    expect(validator.clear).toHaveBeenLastCalledWith(true);
    manager.resetValidation();
    expect(validator.clear).toHaveBeenLastCalledWith(false);
  });

  it('reports whether the level has conditions', () => {
    expect(managerWith().manager.getCurrentState().hasConditions).toBe(true);
    expect(managerWith([]).manager.getCurrentState().hasConditions).toBe(false);
  });

  it('shows a feedback message without satisfying the level', () => {
    const {manager, validator} = managerWith();
    validator.met.add('PLAYED_ONE');
    manager.updateProgress();
    expect(manager.getCurrentState()).toMatchObject({
      satisfied: false,
      message: 'Now play two.',
    });
  });

  it('satisfies the level on a validation that allows continuing', () => {
    const {manager, validator} = managerWith();
    validator.met.add('PLAYED_TWO');
    manager.updateProgress();
    expect(manager.getCurrentState()).toMatchObject({
      satisfied: true,
      message: 'Well done.',
    });
  });

  it('bumps the index on every reset so feedback renders fresh', () => {
    const {manager} = managerWith();
    const index = manager.getCurrentState().index;
    manager.resetValidation();
    expect(manager.getCurrentState().index).toBe(index + 1);
  });

  describe('exemplar validation', () => {
    const exemplarSettings = {
      validationEnabled: true,
      validationSuccessMessage: 'Matches the exemplar.',
      validationFailureMessage: 'Not yet.',
    };

    it('applies when there are no other validations', () => {
      const onChange = vi.fn();
      const manager = new ProgressManager(onChange);
      const validator = new SetValidator();
      validator.exemplarPassed = true;
      manager.setValidator(validator);
      manager.onLevelChange({}, [], exemplarSettings);
      manager.updateProgress();
      expect(manager.getCurrentState()).toMatchObject({
        satisfied: true,
        message: 'Matches the exemplar.',
      });
    });

    it('does not apply while the exemplar is being edited', () => {
      const manager = new ProgressManager(vi.fn());
      const validator = new SetValidator();
      validator.exemplarPassed = true;
      manager.setValidator(validator);
      manager.onLevelChange({isEditingExemplar: true}, [], exemplarSettings);
      manager.updateProgress();
      expect(manager.getCurrentState().satisfied).toBe(false);
    });
  });

  it('calls a replaced progress callback', () => {
    const {manager, onChange} = managerWith();
    const replacement = vi.fn();
    manager.setOnProgressChange(replacement);
    onChange.mockClear();
    manager.resetValidation();
    expect(replacement).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
