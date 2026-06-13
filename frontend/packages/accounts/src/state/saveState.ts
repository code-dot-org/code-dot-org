import type {FieldErrors} from '../api/accounts.types';

// The save lifecycle of the Account Details form. The full form reducer
// (task 5.3) holds field values and derives these transitions; modeling the
// save status as its own pure reducer keeps the lifecycle testable in isolation.
export type SaveState =
  | {status: 'idle'}
  | {status: 'dirty'}
  | {status: 'saving'}
  | {status: 'saved'}
  | {status: 'error'; fieldErrors: FieldErrors; formErrors: string[]};

export type SaveStateAction =
  | {type: 'edit'}
  | {type: 'save'}
  | {type: 'saveSucceeded'}
  | {type: 'saveFailed'; fieldErrors: FieldErrors; formErrors: string[]}
  | {type: 'reset'};

export const initialSaveState: SaveState = {status: 'idle'};

export function saveStateReducer(
  state: SaveState,
  action: SaveStateAction,
): SaveState {
  switch (action.type) {
    case 'edit':
      // Inputs are disabled while saving, so an edit cannot land then; from any
      // other state an edit means there are unsaved changes.
      return state.status === 'saving' ? state : {status: 'dirty'};
    case 'save':
      // Only a dirty or previously-errored form starts a save. A second 'save'
      // while already saving is the double-submit guard (no-op).
      return state.status === 'dirty' || state.status === 'error'
        ? {status: 'saving'}
        : state;
    case 'saveSucceeded':
      return state.status === 'saving' ? {status: 'saved'} : state;
    case 'saveFailed':
      return state.status === 'saving'
        ? {
            status: 'error',
            fieldErrors: action.fieldErrors,
            formErrors: action.formErrors,
          }
        : state;
    case 'reset':
      return initialSaveState;
  }
}
