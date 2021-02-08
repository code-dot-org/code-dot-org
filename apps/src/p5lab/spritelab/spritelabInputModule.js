const SET_PROMPT = 'spritelabInput/SET_PROMPT';
const POP_PROMPT = 'spritelabInput/POP_PROMPT';
const CLEAR_PROMPTS = 'spritelabInput/CLEAR_PROMPTS';

export const PromptType = {
  TEXT: 'TEXT',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE'
};

export default function spritelabInputList(state, action) {
  state = state || [];
  switch (action.type) {
    case SET_PROMPT: {
      const newPromptInfo = {
        promptType: action.promptType,
        promptText: action.promptText,
        variableName: action.variableName
      };
      if (action.promptType === PromptType.MULTIPLE_CHOICE) {
        newPromptInfo.choices = action.choices;
      }
      return [...state, newPromptInfo];
    }
    case POP_PROMPT:
      return state.slice(1);
    case CLEAR_PROMPTS:
      return [];
    default:
      return state;
  }
}

export function addTextPrompt(promptText, variableName) {
  return {
    type: SET_PROMPT,
    promptType: PromptType.TEXT,
    promptText,
    variableName
  };
}

export function addMultipleChoicePrompt(promptText, variableName, choices) {
  return {
    type: SET_PROMPT,
    promptType: PromptType.MULTIPLE_CHOICE,
    promptText,
    variableName,
    choices
  };
}

export function popPrompt() {
  return {type: POP_PROMPT};
}

export function clearPrompts() {
  return {type: CLEAR_PROMPTS};
}
