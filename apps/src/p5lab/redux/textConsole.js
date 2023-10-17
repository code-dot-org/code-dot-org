import {CLEAR_CONSOLE, ADD_MESSAGE} from '../actions';
import {MAX_NUM_TEXTS} from '../spritelab/constants';

export default function textConsole(state, action) {
  state = state || [];
  switch (action.type) {
    case CLEAR_CONSOLE:
      return [];
    case ADD_MESSAGE:
      return [
        // the last MAX_NUM_TEXTS text console statements will be displayed
        ...state.slice(-(MAX_NUM_TEXTS - 1)),
        {
          name: action.name,
          text: action.text,
        },
      ];
    default:
      return state;
  }
}

export function clearConsole() {
  return {
    type: CLEAR_CONSOLE,
  };
}

export function addConsoleMessage(message) {
  return {
    type: ADD_MESSAGE,
    name: message.name,
    text: message.text,
  };
}
