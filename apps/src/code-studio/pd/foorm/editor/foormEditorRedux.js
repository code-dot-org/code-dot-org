const SET_QUESTIONS = 'foormEditor/SET_QUESTIONS';
const SET_HAS_JSON_ERROR = 'foormEditor/SET_HAS_JSON_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';
const RESET_AVAILABLE_OPTIONS = 'foormEditor/RESET_AVAILABLE_OPTIONS';
const ADD_AVAILABLE_OPTION = 'foormEditor/ADD_AVAILABLE_OPTION';
const SET_LAST_SAVED = 'foormEditor/SET_LAST_SAVED';
const SET_SAVE_ERROR = 'foormEditor/SET_SAVE_ERROR';
const SET_LAST_SAVED_QUESTIONS = 'foormEditor/SET_LAST_SAVED_QUESTIONS';

// questions is an object in surveyJS format that represents
// a valid survey.
export const setQuestions = questions => ({
  type: SET_QUESTIONS,
  questions
});

// formData is an object in the format
// {published: true/false, questions: {...questions...}}
// where questions is a survey in surveyJS format.
export const setFormData = formData => ({
  type: SET_FORM_DATA,
  formData
});

export const setHasJSONError = hasJSONError => ({
  type: SET_HAS_JSON_ERROR,
  hasJSONError
});

export const resetAvailableOptions = optionsMetadata => ({
  type: RESET_AVAILABLE_OPTIONS,
  optionsMetadata
});

export const addAvailableOption = optionMetadata => ({
  type: ADD_AVAILABLE_OPTION,
  optionMetadata
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
  editorType: 'Form',
  questions: '',
  formQuestions: '',
  isPublished: null,
  hasJSONError: false,
  name: null,
  formName: null,
  version: null,
  formVersion: null,
  formId: null,
  availableOptions: [],
  saveError: null,
  lastSaved: null,
  lastSavedFormQuestions: ''
};

export default function foormEditorRedux(state = initialState, action) {
  if (action.type === SET_QUESTIONS) {
    return {
      ...state,
      questions: action.formQuestions
    };
  }
  if (action.type === SET_HAS_JSON_ERROR) {
    return {
      ...state,
      hasJSONError: action.hasJSONError
    };
  }
  if (action.type === SET_FORM_DATA) {
    return {
      ...state,
      formQuestions: action.formData['questions'],
      questions: action.formData['questions'],
      isFormPublished: action.formData['published'],
      formName: action.formData['name'],
      name: action.formData['name'],
      formVersion: action.formData['version'],
      version: action.formData['version'],
      formId: action.formData['id'],
      isPublished: action.formData['published']
    };
  }
  if (action.type === RESET_AVAILABLE_OPTIONS) {
    return {
      ...state,
      availableOptions: action.optionsMetadata
    };
  }
  if (action.type === ADD_AVAILABLE_OPTION) {
    let newOptionList = [...state.availableOptions];
    newOptionList.push(action.optionMetadata);
    return {
      ...state,
      availableOptions: newOptionList
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
