const SET_QUESTIONS = 'foormEditor/SET_QUESTIONS';
const SET_HAS_JSON_ERROR = 'foormEditor/SET_HAS_JSON_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';
const SET_LIBRARY_QUESTION_DATA = 'foormEditor/SET_LIBRARY_QUESTION_DATA';
const SET_LIBRARY_DATA = 'foormEditor/SET_LIBRARY_DATA';
const SET_AVAILABLE_ENTITIES = 'foormEditor/SET_AVAILABLE_ENTITIES';
const SET_AVAILABLE_SUB_ENTITIES = 'foormEditor/SET_AVAILABLE_SUB_ENTITIES';
const ADD_AVAILABLE_ENTITY = 'foormEditor/ADD_AVAILABLE_ENTITY';
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

// libraryQuestionData is an object in the format
// {name: 'a_question_name', question: {...questions...}}
// where questions is a valid survey element in surveyJS format.
export const setLibraryQuestionData = libraryQuestionData => ({
  type: SET_LIBRARY_QUESTION_DATA,
  libraryQuestionData
});

// libraryData is an object that contains
// metadata about the currently selected library
// (name, version, ID)
export const setLibraryData = libraryData => ({
  type: SET_LIBRARY_DATA,
  libraryData
});

export const setHasJSONError = hasJSONError => ({
  type: SET_HAS_JSON_ERROR,
  hasJSONError
});

// "Entities" are the list of forms or libraries from which a user can select to edit
// in the Foorm form and library editors, respectively.
export const setAvailableEntities = entitiesMetadata => ({
  type: SET_AVAILABLE_ENTITIES,
  entitiesMetadata
});

// "Sub-entities" are the list of library questions
// in a selected library that a user can choose to edit.
// There is no equivalent "sub-entity" when editing forms currently.
export const setAvailableSubEntities = subEntitiesMetadata => ({
  type: SET_AVAILABLE_SUB_ENTITIES,
  subEntitiesMetadata
});

// An "entity" (form or library) is added to the list of forms or libraries that can be edited
// after a new form or library is created.
export const addAvailableEntity = entityMetadata => ({
  type: ADD_AVAILABLE_ENTITY,
  entityMetadata
});

export const setLastSaved = lastSaved => ({
  type: SET_LAST_SAVED,
  lastSaved
});

export const setSaveError = saveError => ({
  type: SET_SAVE_ERROR,
  saveError
});

export const setLastSavedQuestions = questions => ({
  type: SET_LAST_SAVED_QUESTIONS,
  questions
});

const initialState = {
  questions: '',
  hasJSONError: false,
  availableEntities: [],
  availableSubEntities: [],
  saveError: null,
  lastSaved: null,
  lastSavedQuestions: '',
  // State specific to Foorm Form editor
  isFormPublished: null,
  formName: null,
  formVersion: null,
  formId: null,
  // State specific to Foorm Library editor
  libraryQuestion: '',
  libraryQuestionName: null,
  libraryQuestionId: null,
  libraryName: null,
  libraryId: null,
  libraryVersion: null
};

export default function foormEditorRedux(state = initialState, action) {
  if (action.type === SET_QUESTIONS) {
    return {
      ...state,
      questions: action.questions
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
      questions: action.formData['questions'],
      isFormPublished: action.formData['published'],
      formName: action.formData['name'],
      formVersion: action.formData['version'],
      formId: action.formData['id']
    };
  }
  if (action.type === SET_LIBRARY_QUESTION_DATA) {
    return {
      ...state,
      question: action.libraryQuestionData['question'],
      libraryQuestionName: action.libraryQuestionData['name'],
      libraryQuestionId: action.libraryQuestionData['id']
    };
  }
  if (action.type === SET_LIBRARY_DATA) {
    return {
      ...state,
      libraryName: action.libraryData['name'],
      libraryVersion: action.libraryData['version'],
      libraryId: action.libraryData['id']
    };
  }
  if (action.type === SET_AVAILABLE_ENTITIES) {
    return {
      ...state,
      availableEntities: action.entitiesMetadata
    };
  }
  if (action.type === SET_AVAILABLE_SUB_ENTITIES) {
    return {
      ...state,
      availableSubEntities: action.subEntitiesMetadata
    };
  }
  if (action.type === ADD_AVAILABLE_ENTITY) {
    let newEntitiesList = [...state.availableEntities];
    newEntitiesList.push(action.entityMetadata);
    return {
      ...state,
      availableEntities: newEntitiesList
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
      lastSavedQuestions: action.questions
    };
  }

  return state;
}
