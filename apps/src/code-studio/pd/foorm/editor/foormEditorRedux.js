const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
const SET_HAS_ERROR = 'foormEditor/SET_HAS_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';
const RESET_AVAILABLE_FORMS = 'foormEditor/RESET_AVAILABLE_FORMS';
const ADD_AVAILABLE_FORM = 'foormEditor/ADD_AVAILABLE_FORMS';
const SET_LAST_SAVED = 'foormEditor/SET_LAST_SAVED';
const SET_SAVE_ERROR = 'foormEditor/SET_SAVE_ERROR';
const SET_LAST_SAVED_QUESTIONS = 'foormEditor/SET_LAST_SAVED_QUESTIONS';

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

export const resetAvailableForms = formsMetadata => ({
  type: RESET_AVAILABLE_FORMS,
  formsMetadata
});

export const addAvilableForm = formMetadata => ({
  type: ADD_AVAILABLE_FORM,
  formMetadata
});

export const setLastSaved = lastSaved => ({
  type: SET_LAST_SAVED,
  lastSaved
});

export const setSaveError = saveError => ({
  type: SET_SAVE_ERROR,
  saveError
});

export const setLastSavedQuestions = formQuestions => ({
  type: SET_LAST_SAVED_QUESTIONS,
  formQuestions
});

const initialState = {
  formQuestions: '',
  isFormPublished: null,
  hasError: false,
  formName: null,
  formVersion: null,
  formId: null,
  availableForms: [],
  saveError: null,
  lastSaved: null,
  lastSavedFormQuestions: ''
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
  if (action.type === RESET_AVAILABLE_FORMS) {
    return {
      ...state,
      availableForms: action.formsMetadata
    };
  }
  if (action.type === ADD_AVAILABLE_FORM) {
    let newFormList = [...state.availableForms];
    newFormList.push(action.formMetadata);
    return {
      ...state,
      availableForms: newFormList
    };
  }
  if (action.type === SET_LAST_SAVED) {
    return {
      ...state,
      lastSaved: action.lastSaved
    };
  }
  if (action.type === SET_SAVE_ERROR) {
    return {
      ...state,
      saveError: action.saveError
    };
  }
  if (action.type === SET_LAST_SAVED_QUESTIONS) {
    return {
      ...state,
      lastSavedFormQuestions: action.formQuestions
    };
  }

  return state;
}
