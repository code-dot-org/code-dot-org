const SET_QUESTIONS = 'foormEditor/SET_QUESTIONS';
const SET_HAS_JSON_ERROR = 'foormEditor/SET_HAS_JSON_ERROR';
const SET_HAS_LINT_ERROR = 'foormEditor/SET_HAS_LINT_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';
const SET_LIBRARY_QUESTION_DATA = 'foormEditor/SET_LIBRARY_QUESTION_DATA';
const SET_LIBRARY_DATA = 'foormEditor/SET_LIBRARY_DATA';
const SET_FETCHABLE_ENTITIES = 'foormEditor/SET_FETCHABLE_ENTITIES';
const SET_FETCHABLE_SUB_ENTITIES = 'foormEditor/SET_FETCHABLE_SUB_ENTITIES';
const ADD_FETCHABLE_ENTITY = 'foormEditor/ADD_FETCHABLE_ENTITY';
const ADD_FETCHABLE_SUB_ENTITY = 'foormEditor/ADD_FETCHABLE_SUB_ENTITY';
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

export const setHasLintError = hasLintError => ({
  type: SET_HAS_LINT_ERROR,
  hasLintError
});

// "Entities" represent metadata (ID, name, etc.) about the forms or libraries
// that a user can select to edit in the Foorm form and library editors, respectively.
// Once selected, an AJAX call fetches the actual form or library from our server,
// containing the SurveyJS configuration that can be edited.
export const setFetchableEntities = entitiesMetadata => ({
  type: SET_FETCHABLE_ENTITIES,
  entitiesMetadata
});

export const addFetchableEntity = entityMetadata => ({
  type: ADD_FETCHABLE_ENTITY,
  entityMetadata
});

// "Sub-entities" are library question metadata (ID, name, etc.)
// within a selected library that a user can choose to edit.
// There is no equivalent "sub-entity" when editing forms currently.
export const setFetchableSubEntities = subEntitiesMetadata => ({
  type: SET_FETCHABLE_SUB_ENTITIES,
  subEntitiesMetadata
});

export const addFetchableSubEntity = subEntityMetadata => ({
  type: ADD_FETCHABLE_SUB_ENTITY,
  subEntityMetadata
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
  // State relevant for both Form and Library editors
  questions: '',
  hasJSONError: false,
  hasLintError: false,
  fetchableEntities: [],
  saveError: null,
  lastSaved: null,
  lastSavedQuestions: '',
  // Represents either form ID or library question ID -- our database ID for the thing being edited.
  // Needed for validation of library questions.
  // to do would be to move references to formId and libraryQuestionId to use this.
  foormEntityId: null,
  // State specific to Foorm Form editor
  formId: null,
  formName: null,
  formVersion: null,
  isFormPublished: null,
  // State specific to Foorm Library editor
  libraryId: null,
  libraryName: null,
  libraryVersion: null,
  libraryQuestionId: null,
  libraryQuestionName: null,
  fetchableSubEntities: []
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
  if (action.type === SET_HAS_LINT_ERROR) {
    return {
      ...state,
      hasLintError: action.hasLintError
    };
  }
  if (action.type === SET_FORM_DATA) {
    return {
      ...state,
      questions: action.formData['questions'],
      isFormPublished: action.formData['published'],
      formName: action.formData['name'],
      formVersion: action.formData['version'],
      formId: action.formData['id'],
      foormEntityId: action.formData['id']
    };
  }
  if (action.type === SET_LIBRARY_QUESTION_DATA) {
    return {
      ...state,
      questions: action.libraryQuestionData['question'],
      libraryQuestionName: action.libraryQuestionData['name'],
      libraryQuestionId: action.libraryQuestionData['id'],
      foormEntityId: action.libraryQuestionData['id']
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
  if (action.type === SET_FETCHABLE_ENTITIES) {
    return {
      ...state,
      fetchableEntities: action.entitiesMetadata
    };
  }
  if (action.type === SET_FETCHABLE_SUB_ENTITIES) {
    return {
      ...state,
      fetchableSubEntities: action.subEntitiesMetadata
    };
  }
  if (action.type === ADD_FETCHABLE_ENTITY) {
    let updatedEntities = mergeNewItem(
      state.fetchableEntities,
      action.entityMetadata
    );

    return {
      ...state,
      fetchableEntities: updatedEntities
    };
  }
  if (action.type === ADD_FETCHABLE_SUB_ENTITY) {
    let updatedSubEntities = mergeNewItem(
      state.fetchableSubEntities,
      action.subEntityMetadata
    );

    return {
      ...state,
      fetchableSubEntities: updatedSubEntities
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

function mergeNewItem(oldItems, newItem) {
  let unchangedItems = oldItems.filter(item => item['id'] !== newItem['id']);

  return [...unchangedItems, newItem];
}
