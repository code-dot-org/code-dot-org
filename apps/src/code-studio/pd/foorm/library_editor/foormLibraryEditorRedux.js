const SET_LIBRARY_QUESTION = 'foormLibraryEditor/SET_LIBRARY_QUESTION';
const SET_HAS_ERROR = 'foormLibraryEditor/SET_HAS_ERROR';
const SET_LIBRARY_QUESTION_DATA =
  'foormLibraryEditor/SET_LIBRARY_QUESTION_DATA';
const SET_LIBRARY_DATA = 'foormLibraryEditor/SET_LIBRARY_DATA';
const RESET_AVAILABLE_LIBRARIES =
  'foormLibraryEditor/RESET_AVAILABLE_LIBRARIES';
const RESET_AVAILABLE_LIBRARY_QUESTIONS =
  'foormLibraryEditor/RESET_AVAILABLE_LIBRARY_QUESTIONS';
const ADD_AVAILABLE_LIBRARY = 'foormEditor/ADD_AVAILABLE_LIBRARY';
const ADD_AVAILABLE_LIBRARY_QUESTION =
  'foormEditor/ADD_AVAILABLE_LIBRARY_QUESTION';
const SET_LAST_SAVED = 'foormEditor/SET_LAST_SAVED';
const SET_SAVE_ERROR = 'foormEditor/SET_SAVE_ERROR';
const SET_LAST_SAVED_QUESTION = 'foormLibraryEditor/SET_LAST_SAVED_QUESTION';

// libraryQuestion is an object in surveyJS format that represents
// a single question
export const setLibraryQuestion = libraryQuestion => ({
  type: SET_LIBRARY_QUESTION,
  libraryQuestion
});

// libraryQuestionData is an object in the format
// {name: 'a_question_name', question: {...questions...}}
// where questions is a valid survey element in surveyJS format.
export const setLibraryQuestionData = libraryQuestionData => ({
  type: SET_LIBRARY_QUESTION_DATA,
  libraryQuestionData
});

export const setLibraryData = libraryData => ({
  type: SET_LIBRARY_DATA,
  libraryData
});

export const setHasError = hasError => ({
  type: SET_HAS_ERROR,
  hasError
});

export const resetAvailableLibraries = librariesMetadata => ({
  type: RESET_AVAILABLE_LIBRARIES,
  librariesMetadata
});

export const resetAvailableLibraryQuestions = libraryQuestionsMetadata => ({
  type: RESET_AVAILABLE_LIBRARY_QUESTIONS,
  libraryQuestionsMetadata
});

export const addAvailableLibrary = libraryMetadata => ({
  type: ADD_AVAILABLE_LIBRARY,
  libraryMetadata
});

export const addAvailableLibraryQuestion = libraryQuestionMetadata => ({
  type: ADD_AVAILABLE_LIBRARY_QUESTION,
  libraryQuestionMetadata
});

export const setLastSaved = lastSaved => ({
  type: SET_LAST_SAVED,
  lastSaved
});

export const setSaveError = saveError => ({
  type: SET_SAVE_ERROR,
  saveError
});

export const setLastSavedQuestion = libraryQuestion => ({
  type: SET_LAST_SAVED_QUESTION,
  libraryQuestion
});

// need to set available library questions redux state on load of library
const initialState = {
  libraryQuestion: '',
  libraryQuestionName: null,
  libraryQuestionId: null,
  libraryName: null,
  libraryId: null,
  libraryVersion: null,
  availableLibraries: [],
  availableLibraryQuestionsForCurrentLibrary: [],
  hasError: false,
  saveError: null,
  lastSaved: null,
  lastSavedLibraryQuestion: ''
};

export default function foormLibraryEditorRedux(state = initialState, action) {
  if (action.type === SET_LIBRARY_QUESTION) {
    return {
      ...state,
      libraryQuestion: action.libraryQuestion
    };
  }
  if (action.type === SET_HAS_ERROR) {
    return {
      ...state,
      hasError: action.hasError
    };
  }
  // if (action.type === SET_LIBRARY_QUESTION_DATA) {
  //   return {
  //     ...state,
  //     libraryQuestion: action.libraryQuestionData['question'],
  //     libraryQuestionName: action.libraryQuestionData['name'],
  //     libraryQuestionId: action.libraryQuestionData['id']
  //   };
  // }
  // if (action.type === SET_LIBRARY_DATA) {
  //   return {
  //     ...state,
  //     libraryName: action.libraryData['name'],
  //     libraryVersion: action.libraryData['version'],
  //     libraryId: action.libraryData['id']
  //   };
  // }
  if (action.type === RESET_AVAILABLE_LIBRARIES) {
    return {
      ...state,
      availableLibraries: action.librariesMetadata
    };
  }
  if (action.type === RESET_AVAILABLE_LIBRARY_QUESTIONS) {
    return {
      ...state,
      availableLibraryQuestionsForCurrentLibrary:
        action.libraryQuestionsMetadata
    };
  }
  // do we want to merge instead of push (in case library already exists)
  if (action.type === ADD_AVAILABLE_LIBRARY) {
    let updatedLibraries = mergeNewItem(
      state.availableLibraries,
      action.libraryMetadata
    );

    return {
      ...state,
      availableLibraries: updatedLibraries
    };
  }
  // do we want to merge instead of push (in case library question already exists)
  if (action.type === ADD_AVAILABLE_LIBRARY_QUESTION) {
    let updatedLibraryQuestions = mergeNewItem(
      state.availableLibraryQuestionsForCurrentLibrary,
      action.libraryQuestionMetadata
    );

    return {
      ...state,
      availableLibraryQuestionsForCurrentLibrary: updatedLibraryQuestions
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

function mergeNewItem(oldItems, newItem) {
  let unchangedItems = oldItems.filter(item => item['id'] !== newItem['id']);

  return [...unchangedItems, newItem];
}
