import { PropTypes } from 'react';
import $ from 'jquery';

/**
 * Reducer for section data in teacher dashboard.
 * Tab specific reducers can import actions from this file
 * if they need to respond to a section changing.
 */

 /**
  * Shape for the section
  * The section we get directly from angular right now. This gives us a
  * different shape than some other places we use sections. For now, I'm just
  * going to document the parts of section that we use here
  */
 export const sectionDataPropType = PropTypes.shape({
   id: PropTypes.number.isRequired,
   script: PropTypes.object,
   students: PropTypes.arrayOf(PropTypes.shape({
     id: PropTypes.number.isRequired,
     name: PropTypes.string.isRequired,
   })).isRequired
 });

 /**
  * Status for loading section data from server.
  */
  export const LoadingStatus = {
    IN_PROGRESS: "inProgress",
    SUCCESS: "success",
    FAIL: "fail",
  };

/**
 * Action type constants
 */
export const SET_SECTION = 'sectionData/SET_SECTION';
const CLEAR_SECTION_DATA = 'sectionData/CLEAR_SECTION_DATA';
const START_LOADING_SECTION = 'sectionData/START_LOADING_SECTION';
const LOAD_SECTION_SUCCESS = 'sectionData/LOAD_SECTION_SUCCESS';
const LOAD_SECTION_FAIL = 'sectionData/LOAD_SECTION_FAIL';

/**
 * Action creators
 */
export const setSection = (section) => {
  // Sort section.students by name.
  const sortedStudents = section.students.sort((a, b) => a.name.localeCompare(b.name));

  // Filter data to match sectionDataPropType
  const filteredSectionData = {
    id: section.id,
    script: section.script,
    students: sortedStudents,
  };
  return { type: SET_SECTION, section: filteredSectionData };
};

/**
 * Initial state of sectionDataRedux
 */
const initialState = {
  section: {},
  loadingStatus: null,
};

/**
 * Reducer
 */
export default function sectionData(state=initialState, action) {
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState,
      section: action.section,
    };
  }

  if (action.type === CLEAR_SECTION_DATA) {
    return initialState;
  }

  if (action.type === START_LOADING_SECTION) {
    return {
      ...state,
      loadingStatus: LoadingStatus.IN_PROGRESS,
    };
  }

  if (action.type === LOAD_SECTION_SUCCESS) {
    return {
      ...state,
      loadingStatus: LoadingStatus.SUCCESS,
    };
  }

  if (action.type === LOAD_SECTION_FAIL) {
    return {
      ...state,
      loadingStatus: LoadingStatus.FAIL,
    };
  }

  return state;
}

/**
 * Selector functions
 */
export const getTotalStudentCount = (state) => {
  return state.sectionData.section.students.length;
};

export const getStudentList = (state) => {
  return state.sectionData.section.students;
};

/**
 * Helper functions
 */
export const asyncSetSection = (sectionId) => (dispatch) => {
  // Clear any existing section data and begin loading.
  dispatch({ type: CLEAR_SECTION_DATA });
  dispatch({ type: START_LOADING_SECTION });

  $.ajax({
    url: `/api/v1/sections/${sectionId}`,
    method: 'GET',
    dataType: 'json'
  }).done(section => {
    dispatch(setSection(section));
    dispatch({ type: LOAD_SECTION_SUCCESS });
  }).fail((jqXhr, status) => {
    dispatch({ type: LOAD_SECTION_FAIL });
  });
};
