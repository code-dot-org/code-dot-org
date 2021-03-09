const SET_QUESTIONS = 'foormEditor/SET_QUESTIONS';
const SET_HAS_JSON_ERROR = 'foormEditor/SET_HAS_JSON_ERROR';
const SET_FORM_DATA = 'foormEditor/SET_FORM_DATA';
const SET_AVAILABLE_ENTITIES = 'foormEditor/SET_AVAILABLE_ENTITIES';
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
  saveError: null,
  lastSaved: null,
  lastSavedQuestions: '',
  // State specific to Foorm Form editor
  isFormPublished: null,
  formName: null,
  formVersion: null,
  formId: null
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
  if (action.type === SET_AVAILABLE_ENTITIES) {
    return {
      ...state,
      availableEntities: action.entitiesMetadata
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
