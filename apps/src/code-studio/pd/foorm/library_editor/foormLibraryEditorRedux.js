const SET_FORM_QUESTIONS = 'foormEditor/SET_FORM_QUESTIONS';
const SET_HAS_ERROR = 'foormLibraryEditor/SET_HAS_ERROR';
const SET_LIBRARY_QUESTION_DATA =
  'foormLibraryEditor/SET_LIBRARY_QUESTION_DATA';
const RESET_AVAILABLE_LIBRARIES =
  'foormLibraryEditor/RESET_AVAILABLE_LIBRARIES';
const ADD_AVAILABLE_FORM = 'foormEditor/ADD_AVAILABLE_FORMS';
const SET_LAST_SAVED = 'foormEditor/SET_LAST_SAVED';
const SET_SAVE_ERROR = 'foormEditor/SET_SAVE_ERROR';
const SET_LAST_SAVED_QUESTION = 'foormLibraryEditor/SET_LAST_SAVED_QUESTION';

// formQuestions is an object in surveyJS format that represents
// a single survey
export const setFormQuestions = formQuestions => ({
  type: SET_FORM_QUESTIONS,
  formQuestions
});

// need to confirm shape of this object returned from controller
// formData is an object in the format
// {published: true/false, questions: {...questions...}}
// where questions is a survey in surveyJS format.
export const setLibraryQuestionData = libraryQuestionData => ({
  type: SET_LIBRARY_QUESTION_DATA,
  libraryQuestionData
});

export const setHasError = hasError => ({
  type: SET_HAS_ERROR,
  hasError
});

export const resetAvailableLibraries = librariesMetadata => ({
  type: RESET_AVAILABLE_LIBRARIES,
  librariesMetadata
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

export const setLastSavedQuestion = formQuestions => ({
  type: SET_LAST_SAVED_QUESTION,
  formQuestions
});

const initialState = {
  libraryQuestion: '',
  isFormPublished: null,
  hasError: false,
  formName: null,
  formVersion: null,
  formId: null,
  availableLibraries: [],
  saveError: null,
  lastSaved: null,
  lastSavedFormQuestions: ''
};

export default function foormLibraryEditorRedux(state = initialState, action) {
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
  if (action.type === SET_LIBRARY_QUESTION_DATA) {
    // not sure if this works
    return {
      ...state,
      libraryQuestion: action.libraryQuestionData['question'],
      isFormPublished: action.libraryQuestionData['published']
      //formName: action.formData['name'],
      //formVersion: action.formData['version'],
      //formId: action.formData['id']
    };
  }
  if (action.type === RESET_AVAILABLE_LIBRARIES) {
    return {
      ...state,
      availableLibraries: action.librariesMetadata
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
  if (action.type === SET_LAST_SAVED_QUESTION) {
    return {
      ...state,
      lastSavedLibraryQuestion: action.libraryQuestion
    };
  }

  return state;
}
