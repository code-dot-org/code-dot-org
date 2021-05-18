import {CLEAR_CONSOLE, ADD_MESSAGE} from '../actions';

export default function textConsole(state, action) {
  state = state || [];
  switch (action.type) {
    case CLEAR_CONSOLE:
      return [];
    case ADD_MESSAGE:
      return [
        // 1000 items is an arbitrary limit. Change as needed.
        ...state.slice(0, 999),
        {
          name: action.name,
          text: action.text
        }
      ];
    default:
      return state;
  }
}

export function clearConsole() {
  return {
    type: CLEAR_CONSOLE
  };
}

export function addConsoleMessage(message) {
  return {
    type: ADD_MESSAGE,
    name: message.name,
    text: message.text
  };
}
