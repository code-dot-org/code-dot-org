const SET_QUESTION = 'spritelabInput/SET_QUESTION';

export default function spritelabInput(state, action) {
  switch (action.type) {
    case SET_QUESTION:
      return action.question;
    default:
      return '';
  }
}

export function setQuestion(question) {
  return {
    type: SET_QUESTION,
    question: question
  };
}
