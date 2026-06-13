import type {FieldErrors} from '../api/accounts.types';

import {initialSaveState, saveStateReducer, type SaveState} from './saveState';

// Editable profile fields are keyed by their Rails wire name (given_name,
// family_name, name, username, ...) so server validation errors map directly.
export type FormValues = Record<string, string>;

export interface FormState {
  values: FormValues;
  /** Last-saved values; the form is dirty when `values` differs from this. */
  initial: FormValues;
  save: SaveState;
}

export type FormAction =
  | {type: 'edit'; field: string; value: string}
  | {type: 'saveStarted'}
  | {type: 'saveSucceeded'}
  | {type: 'saveFailed'; fieldErrors: FieldErrors; formErrors: string[]}
  | {type: 'reset'};

export function createFormState(initial: FormValues): FormState {
  return {values: initial, initial, save: initialSaveState};
}

export function isDirty(state: FormState): boolean {
  return Object.keys(state.values).some(
    field => state.values[field] !== state.initial[field],
  );
}

/** Fields whose value differs from the last save. */
export function dirtyValues(state: FormState): FormValues {
  return Object.fromEntries(
    Object.entries(state.values).filter(
      ([field, value]) => value !== state.initial[field],
    ),
  );
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'edit':
      // Editing moves the save lifecycle back to `dirty`, which drops any prior
      // field/form errors (they're re-derived on the next save).
      return {
        ...state,
        values: {...state.values, [action.field]: action.value},
        save: saveStateReducer(state.save, {type: 'edit'}),
      };
    case 'saveStarted':
      return {...state, save: saveStateReducer(state.save, {type: 'save'})};
    case 'saveSucceeded':
      return {
        ...state,
        initial: state.values,
        save: saveStateReducer(state.save, {type: 'saveSucceeded'}),
      };
    case 'saveFailed':
      return {
        ...state,
        save: saveStateReducer(state.save, {
          type: 'saveFailed',
          fieldErrors: action.fieldErrors,
          formErrors: action.formErrors,
        }),
      };
    case 'reset':
      return {
        ...state,
        values: state.initial,
        save: saveStateReducer(state.save, {type: 'reset'}),
      };
  }
}

/** Server error messages for a field, when the last save failed. */
export function fieldError(state: FormState, field: string): string[] {
  return state.save.status === 'error'
    ? (state.save.fieldErrors[field] ?? [])
    : [];
}
