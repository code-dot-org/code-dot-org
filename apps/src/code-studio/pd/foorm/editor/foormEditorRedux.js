const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
const SET_HAS_ERROR = 'foormEditor/SET_HAS_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';

// formQuestions is an object in surveyJS format that represents
// a single survey
export const setFormQuestions = formQuestions => ({
  type: SET_FORM_QUESTIONS,
  formQuestions
});

// formData is an object in the format
// {published: true/false, questions: {...questions...}}
// where questions is a survey in surveyJS format.
export const setFormData = formData => ({
  type: SET_FORM_DATA,
  formData
});

export const setHasError = hasError => ({
  type: SET_HAS_ERROR,
  hasError
});

const initialState = {
  formQuestions: '',
  isFormPublished: null,
  hasError: false,
  formName: null,
  formVersion: null,
  formId: null
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
  if (action.type === SET_FORM_DATA) {
    return {
      ...state,
      formQuestions: action.formData['questions'],
      isFormPublished: action.formData['published'],
      formName: action.formData['name'],
      formVersion: action.formData['version'],
      formId: action.formData['id']
    };
  }

  return state;
}
