import {describe, expect, it, vi} from 'vitest';

import type {AppOptions, ExemplarSettings} from '@code-dot-org/core/api/data';

import ProgressManager, {getInitialValidationState} from '../ProgressManager';
import type {
  Condition,
  Validation,
  ValidationResult,
  Validator,
} from '../types';

// A test-double Validator with knobs for each method. Only the methods
// ProgressManager actually calls need realistic behavior; the rest can be
// permissive defaults.
class FakeValidator implements Validator {
  shouldCheck = true;
  shouldCheckNextOnly = false;
  conditionsMetResult = false;
  validationResults: ValidationResult[] | undefined = undefined;
  passedExemplar = false;

  checkConditionsCalls = 0;
  clearCalls = 0;
  conditionsMetCalls: Condition[][] = [];

  shouldCheckConditions(): boolean {
    return this.shouldCheck;
  }
  shouldCheckNextConditionsOnly(): boolean {
    return this.shouldCheckNextOnly;
  }
  checkConditions(): void {
    this.checkConditionsCalls++;
  }
  conditionsMet(conditions: Condition[]): boolean {
    this.conditionsMetCalls.push(conditions);
    return this.conditionsMetResult;
  }
  clear(): void {
    this.clearCalls++;
  }
  getValidationResults(): ValidationResult[] | undefined {
    return this.validationResults;
  }
  didPassExemplarValidation(): boolean {
    return this.passedExemplar;
  }
}

// Just the field ProgressManager reads from AppOptions. Casting keeps the
// test independent of the zod-inferred shape (~50 unrelated fields).
function makeAppOptions(isEditingExemplar = false): AppOptions {
  return {isEditingExemplar} as unknown as AppOptions;
}

const exemplar: ExemplarSettings = {
  validationEnabled: true,
  validationSuccessMessage: 'Looks like the exemplar!',
  validationFailureMessage: 'Different from the exemplar.',
};

const validationA: Validation = {
  conditions: [{name: 'cond_a'}],
  message: 'A satisfied',
  next: true,
  key: 'a',
};
const validationFail: Validation = {
  conditions: [{name: 'cond_x'}],
  message: 'X failed',
  next: false,
  key: 'x',
};

describe('getInitialValidationState', () => {
  it('produces hasConditions=false, unsatisfied, no message, index=0', () => {
    expect(getInitialValidationState()).toEqual({
      hasConditions: false,
      satisfied: false,
      message: null,
      callout: undefined,
      index: 0,
    });
  });
});

describe('ProgressManager.getCurrentState', () => {
  it('starts with the initial validation state', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    expect(pm.getCurrentState()).toEqual(getInitialValidationState());
  });
});

describe('ProgressManager.onLevelChange + resetValidation', () => {
  it('hasConditions reflects whether validations were provided', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);

    pm.onLevelChange(makeAppOptions(), [validationA]);
    expect(pm.getCurrentState().hasConditions).toBe(true);

    pm.onLevelChange(makeAppOptions(), []);
    expect(pm.getCurrentState().hasConditions).toBe(false);
  });

  it('clears the validator and notifies on each reset', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    pm.setValidator(validator);

    pm.onLevelChange(makeAppOptions(), [validationA]);
    pm.onLevelChange(makeAppOptions(), [validationA]);

    expect(validator.clearCalls).toBe(2);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('increments the validation index on every reset so React keys differ', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const before = pm.getCurrentState().index;

    pm.resetValidation();
    pm.resetValidation();

    expect(pm.getCurrentState().index).toBe(before + 2);
  });
});

describe('ProgressManager.updateProgress', () => {
  it('is a no-op when no validator is set', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    pm.onLevelChange(makeAppOptions(), [validationA]);
    onChange.mockClear();

    pm.updateProgress();

    expect(onChange).not.toHaveBeenCalled();
    expect(pm.getCurrentState().satisfied).toBe(false);
  });

  it('does nothing further when validations are absent and exemplar is disabled', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), undefined);
    onChange.mockClear();

    pm.updateProgress();

    expect(validator.checkConditionsCalls).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('runs exemplar-only validation when there are no conditions but exemplar is enabled', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.passedExemplar = true;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), undefined, exemplar);
    onChange.mockClear();

    pm.updateProgress();

    const state = pm.getCurrentState();
    expect(state.satisfied).toBe(true);
    expect(state.message).toBe('Looks like the exemplar!');
    expect(onChange).toHaveBeenCalledTimes(1);
    // No regular validations means the validator's condition-checking path
    // is never reached.
    expect(validator.checkConditionsCalls).toBe(0);
  });

  it('skips the exemplar branch when isEditingExemplar=true', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.passedExemplar = true;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(true), undefined, exemplar);
    onChange.mockClear();

    pm.updateProgress();

    // Exemplar gate disabled → no exemplar message, no state change.
    expect(pm.getCurrentState().satisfied).toBe(false);
    expect(pm.getCurrentState().message).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('honors shouldCheckConditions=false as a hard gate', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.shouldCheck = false;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationA]);
    onChange.mockClear();

    pm.updateProgress();

    expect(validator.checkConditionsCalls).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('records a satisfied successful validation and notifies', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.conditionsMetResult = true;
    validator.validationResults = [{message: 'r1', result: 'PASS'}];
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationA]);
    onChange.mockClear();

    pm.updateProgress();

    const state = pm.getCurrentState();
    expect(state.satisfied).toBe(true);
    expect(state.message).toBe('A satisfied');
    expect(state.validationResults).toEqual([{message: 'r1', result: 'PASS'}]);
    expect(validator.checkConditionsCalls).toBe(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not re-notify on a second matching update once already satisfied', () => {
    // The implementation guards the state-write with `if
    // (!this.currentValidationState.satisfied)`. The early return after
    // matching means onProgressChange runs once, but on the next call the
    // loop hits the early `return` again — so no notification.
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.conditionsMetResult = true;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationA]);
    onChange.mockClear();

    pm.updateProgress();
    pm.updateProgress();

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('falls through and notifies when no validation matches', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.conditionsMetResult = false;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationA]);
    onChange.mockClear();

    pm.updateProgress();

    expect(pm.getCurrentState().satisfied).toBe(false);
    // The tail call to onProgressChange always runs when there were
    // validations but none matched.
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('skips non-next validations when shouldCheckNextConditionsOnly=true', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.shouldCheckNextOnly = true;
    validator.conditionsMetResult = true;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationFail, validationA]);
    onChange.mockClear();

    pm.updateProgress();

    // validationFail (next=false) is skipped; validationA (next=true) is
    // the first one actually evaluated.
    expect(validator.conditionsMetCalls).toHaveLength(1);
    expect(validator.conditionsMetCalls[0]).toEqual(validationA.conditions);
    expect(pm.getCurrentState().satisfied).toBe(true);
    expect(pm.getCurrentState().message).toBe('A satisfied');
  });

  it('overwrites message-only validations (no conditions) without claiming satisfaction', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    pm.setValidator(validator);

    const messageOnly: Validation = {
      conditions: undefined as unknown as Condition[],
      message: 'hint',
      next: true,
      key: 'hint',
    };
    pm.onLevelChange(makeAppOptions(), [messageOnly]);
    onChange.mockClear();

    pm.updateProgress();

    expect(pm.getCurrentState().message).toBe('hint');
    expect(pm.getCurrentState().satisfied).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('runs exemplar validation alongside a successful condition match', () => {
    const onChange = vi.fn();
    const pm = new ProgressManager(onChange);
    const validator = new FakeValidator();
    validator.conditionsMetResult = true;
    validator.passedExemplar = false;
    pm.setValidator(validator);
    pm.onLevelChange(makeAppOptions(), [validationA], exemplar);
    onChange.mockClear();

    pm.updateProgress();

    const state = pm.getCurrentState();
    // Condition was satisfied with next=true, exemplar check ran and
    // overwrote satisfied/message with the exemplar result.
    expect(state.satisfied).toBe(false);
    expect(state.message).toBe('Different from the exemplar.');
  });
});
