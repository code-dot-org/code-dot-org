const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
const SET_HAS_ERROR = 'foormEditor/SET_HAS_ERROR';

export const setFormQuestions = formQuestions => ({
  type: SET_FORM_QUESTIONS,
  formQuestions
});

export const setHasError = hasError => ({
  type: SET_HAS_ERROR,
  hasError
});

const initialState = {
  formQuestions: '',
  hasError: false
};

export default function foormEditorRedux(state = initialState, action) {
  if (action.type === SET_FORM_QUESTIONS) {
    return {
      ...state,
      formQuestions: action.formQuestions
    };
  }
  if (action.type === SET_HAS_ERROR) {
    return {
      ...state,
      hasError: action.hasError
    };
  }

  return state;
}
