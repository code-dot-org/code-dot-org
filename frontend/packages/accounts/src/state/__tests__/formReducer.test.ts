import {describe, expect, it} from 'vitest';

import {
  createFormState,
  dirtyValues,
  fieldError,
  formReducer,
  isDirty,
  type FormState,
} from '../formReducer';

const INITIAL = {given_name: 'Ada', family_name: 'Lovelace', name: 'Ada L.'};

function edited(): FormState {
  return formReducer(createFormState(INITIAL), {
    type: 'edit',
    field: 'given_name',
    value: 'Augusta',
  });
}

describe('formReducer', () => {
  it('starts idle and clean', () => {
    const state = createFormState(INITIAL);
    expect(state.save.status).toBe('idle');
    expect(isDirty(state)).toBe(false);
    expect(dirtyValues(state)).toEqual({});
  });

  it('edit updates the value, marks dirty, and reports only changed fields', () => {
    const state = edited();
    expect(state.values.given_name).toBe('Augusta');
    expect(state.save.status).toBe('dirty');
    expect(isDirty(state)).toBe(true);
    expect(dirtyValues(state)).toEqual({given_name: 'Augusta'});
  });

  it('saveStarted → saving; saveSucceeded clears dirty and rebases initial', () => {
    let state = formReducer(edited(), {type: 'saveStarted'});
    expect(state.save.status).toBe('saving');

    state = formReducer(state, {type: 'saveSucceeded'});
    expect(state.save.status).toBe('idle');
    expect(isDirty(state)).toBe(false);
    expect(dirtyValues(state)).toEqual({});
  });

  it('saveFailed surfaces field errors; editing clears them', () => {
    let state = formReducer(edited(), {type: 'saveStarted'});
    state = formReducer(state, {
      type: 'saveFailed',
      fieldErrors: {given_name: ['is invalid']},
      formErrors: ['form-level'],
    });
    expect(state.save.status).toBe('error');
    expect(fieldError(state, 'given_name')).toEqual(['is invalid']);

    state = formReducer(state, {
      type: 'edit',
      field: 'given_name',
      value: 'Grace',
    });
    expect(state.save.status).toBe('dirty');
    expect(fieldError(state, 'given_name')).toEqual([]);
  });

  it('reset restores the initial values', () => {
    const state = formReducer(edited(), {type: 'reset'});
    expect(state.values).toEqual(INITIAL);
    expect(state.save.status).toBe('idle');
    expect(isDirty(state)).toBe(false);
  });
});
