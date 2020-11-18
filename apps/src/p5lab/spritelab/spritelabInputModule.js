const SET_PROMPT = 'spritelabInput/SET_PROMPT';
const POP_PROMPT = 'spritelabInput/POP_PROMPT';
const CLEAR_PROMPTS = 'spritelabInput/CLEAR_PROMPTS';

export default function spritelabInputList(state, action) {
  state = state || [];
  switch (action.type) {
    case SET_PROMPT:
      return [
        ...state,
        {
          promptText: action.promptText,
          variableName: action.variableName
        }
      ];
    case POP_PROMPT:
      return state.slice(1);
    case CLEAR_PROMPTS:
      return [];
    default:
      return state;
  }
}

export function addPrompt(promptText, variableName) {
  return {
    type: SET_PROMPT,
    promptText,
    variableName
  };
}

export function popPrompt() {
  return {type: POP_PROMPT};
}

export function clearPrompts() {
  return {type: CLEAR_PROMPTS};
}
