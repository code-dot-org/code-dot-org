import {
  initialSaveState,
  saveStateReducer,
  type FieldErrors,
  type SaveState,
} from './saveState';

// A flat map of field name to string value. Keyed by whatever wire name the
// consumer's backend uses, so server validation errors map directly.
export type FormValues = Record<string, string>;

export interface FormState {
  values: FormValues;
  /** Last-saved values; the form is dirty when `values` differs from these. */
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

// `values` and `initial` are seeded from one object and 'saveSucceeded' rebases
// initial = values, so their keysets stay equal: values change, keys never do.
export function isDirty(state: FormState): boolean {
  return Object.keys(state.values).some(
    field => state.values[field] !== state.initial[field],
  );
}

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
      // Ignore edits mid-save: otherwise a keystroke lands in `values` (never
      // sent) and 'saveSucceeded' rebases it into `initial` as a phantom baseline.
      if (state.save.status === 'saving') return state;
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

export function fieldError(state: FormState, field: string): string[] {
  return state.save.status === 'error'
    ? (state.save.fieldErrors[field] ?? [])
    : [];
}
