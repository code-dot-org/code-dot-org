import {PropTypes} from 'react';
import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

// Shape for an individual assessment
export const assessmentPropType = PropTypes.shape({
});

 // Initial state of textResponsesRedux
 // responseDataByScript - object - key is scriptId, value is array of textResponsePropType
const initialState = {
  assessmentsByScript: {},
  isLoadingAssessments: false
};

const SET_ASSESSMENTS = 'sectionAssessments/SET_ASSESSMENTS';
const START_LOADING_ASSESSMENTS = 'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS = 'sectionAssessments/FINISH_LOADING_ASSESSMENTS';

// Action creators
export const setAssessments = (scriptId, assessments) => ({ type: SET_ASSESSMENTS, scriptId, assessments});
export const startLoadingAssessments = () => ({ type: START_LOADING_ASSESSMENTS });
export const finishLoadingAssessments = () => ({ type: FINISH_LOADING_ASSESSMENTS });

export const asyncLoadAssessments = (sectionId, scriptId, onComplete) => {
  return (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored in redux.
    if (state.assessmentsByScript[scriptId]) {
      onComplete();
      return;
    }

    dispatch(startLoadingAssessments());
    loadAssessmentsFromServer(sectionId, scriptId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        dispatch(setAssessments(scriptId, data));
        onComplete();
      }
      dispatch(finishLoadingAssessments());
    });
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
// scriptId is not required; endpoint will use the default script if no scriptId is supplied
const loadAssessmentsFromServer = (sectionId, scriptId, onComplete) => {
  let payload = {};
  if (scriptId) {
    payload.script_id = scriptId;
  }

  // also fetch section_surveys
  $.ajax({
    url: `/dashboardapi/section_assessments/${sectionId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  }).done(assessmentsData => {
    onComplete(null, assessmentsData);
  }).fail((jqXhr, status) => {
    onComplete(status, jqXhr.responseJSON);
  });
};
