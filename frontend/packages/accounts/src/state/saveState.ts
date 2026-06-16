import type {FieldErrors} from '../api/accounts.types';

// The form's save lifecycle as its own pure reducer, testable in isolation;
// the full form reducer holds field values and delegates these transitions.
export type SaveState =
  | {status: 'idle'}
  | {status: 'dirty'}
  | {status: 'saving'}
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
      // Inputs are disabled while saving, so ignore a stray edit then.
      return state.status === 'saving' ? state : {status: 'dirty'};
    case 'save':
      // Only a dirty or previously-errored form starts a save; a 'save' while
      // already saving is the double-submit no-op.
      return state.status === 'dirty' || state.status === 'error'
        ? {status: 'saving'}
        : state;
    case 'saveSucceeded':
      // Straight back to idle: the success toast confirms the save, so the bar
      // just clears rather than lingering with a redundant "saved" message.
      return state.status === 'saving' ? initialSaveState : state;
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
