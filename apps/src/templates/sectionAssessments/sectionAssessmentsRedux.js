import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

 // Initial state of sectionAssessmentsRedux
 // TODO(caleybrock): define a shape for sectionAssessment data that gets stored in redux.
const initialState = {
  assessmentsByScript: {},
  assessmentsStructureByScript: {},
  isLoadingAssessments: false
};

const SET_ASSESSMENTS = 'sectionAssessments/SET_ASSESSMENTS';
const SET_ASSESSMENTS_STRUCTURE = 'sectionAssessments/SET_ASSESSMENTS_STRUCTURE';
const START_LOADING_ASSESSMENTS = 'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS = 'sectionAssessments/FINISH_LOADING_ASSESSMENTS';

// Action creators
export const setAssessments = (scriptId, assessments) => ({ type: SET_ASSESSMENTS, scriptId, assessments});
export const setAssessmentsStructure = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENTS_STRUCTURE, scriptId, assessments});
export const startLoadingAssessments = () => ({ type: START_LOADING_ASSESSMENTS });
export const finishLoadingAssessments = () => ({ type: FINISH_LOADING_ASSESSMENTS });

export const asyncLoadAssessments = (sectionId, scriptId) => {
  return async (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored in redux.
    if (state.assessmentsByScript[scriptId]) {
      return;
    }

    dispatch(startLoadingAssessments());

    const loadResponses = loadAssessmentsFromServer(sectionId, scriptId);
    const loadStructure = loadAssessmentsStructureFromServer(scriptId);
    const [responses, structure] = await Promise.all([loadResponses, loadStructure]);

    dispatch(setAssessments(scriptId, responses));
    dispatch(setAssessmentsStructure(scriptId, structure));

    dispatch(finishLoadingAssessments(responses, structure));
  };
};

export default function sectionAssessments(state=initialState, action) {
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState
    };
  }
  if (action.type === SET_ASSESSMENTS) {
    return {
      ...state,
      assessmentsByScript: {
        ...state.assessmentsByScript,
        [action.scriptId]: action.assessments
      }
    };
  }
  if (action.type === SET_ASSESSMENTS_STRUCTURE) {
    return {
      ...state,
      assessmentsStructureByScript: {
        ...state.assessmentsStructureByScript,
        [action.scriptId]: action.assessments
      }
    };
  }
  if (action.type === START_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoadingAssessments: true
    };
  }
  if (action.type === FINISH_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoadingAssessments: false
    };
  }

  return state;
}

// Selector functions

export const getAssessmentsForCurrentScript = (state) => {
  return state.sectionAssessments.assessmentsByScript[state.scriptSelection.scriptId] || [];
};

// Make a request to the server for assessment data
const loadAssessmentsFromServer = (sectionId, scriptId) => {
  let payload = {};
  if (scriptId) {
    payload.script_id = scriptId;
  }
  // TODO(caleybrock): also fetch /dashboardapi/section_surveys
  return $.ajax({
    url: `/dashboardapi/section_assessments_responses/${sectionId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

const loadAssessmentsStructureFromServer = (scriptId) => {
  return $.ajax({
    url: `/dashboardapi/assessments_structure/${scriptId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
  });
};
