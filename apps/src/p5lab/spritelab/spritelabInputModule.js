const SET_QUESTION = 'spritelabInput/SET_QUESTION';
const POP_QUESTION = 'spritelabInput/POP_QUESTION';
const CLEAR_QUESTIONS = 'spritelabInput/CLEAR_QUESTIONS';

export default function spritelabInputList(state, action) {
  state = state || [];
  switch (action.type) {
    case SET_QUESTION:
      return [
        ...state,
        {
          questionText: action.questionText,
          variableName: action.variableName
        }
      ];
    case POP_QUESTION:
      return state.slice(1);
    case CLEAR_QUESTIONS:
      return [];
    default:
      return state;
  }
}

export function addQuestion(questionText, variableName) {
  return {
    type: SET_QUESTION,
    questionText,
    variableName
  };
}

export function popQuestion() {
  return {type: POP_QUESTION};
}

export function clearQuestions() {
  return {type: CLEAR_QUESTIONS};
}
