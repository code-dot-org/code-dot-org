const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
export const setFormQuestions = formQuestions => ({
  type: SET_FORM_QUESTIONS,
  formQuestions
});

const initialState = {
  foormQuestions: ''
};

export default function formQuestions(state = initialState, action) {
  if (action.type === SET_FORM_QUESTIONS) {
    return {
      formQuestions: action.formQuestions
    };
  }

  return state;
}
