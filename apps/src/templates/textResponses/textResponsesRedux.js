import PropTypes from 'prop-types';
import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

// Shape for an individual text response
export const textResponsePropType = PropTypes.shape({
  puzzle: PropTypes.number.isRequired,
  question: PropTypes.string,
  response: PropTypes.string.isRequired,
  lesson: PropTypes.string.isRequired,
  studentId: PropTypes.number.isRequired,
  studentName: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

// Initial state of textResponsesRedux
// responseDataByScript - object - key is scriptId, value is array of textResponsePropType
const initialState = {
  responseDataByScript: {},
  isLoadingResponses: false
};

const SET_TEXT_RESPONSES = 'textResponses/SET_TEXT_RESPONSES';
const START_LOADING_TEXT_RESPONSES =
  'textResponses/START_LOADING_TEXT_RESPONSES';
const FINISH_LOADING_TEXT_RESPONSES =
  'textResponses/FINISH_LOADING_TEXT_RESPONSES';

// Action creators
export const setTextResponses = (scriptId, responseData) => ({
  type: SET_TEXT_RESPONSES,
  scriptId,
  responseData
});
export const startLoadingResponses = () => ({
  type: START_LOADING_TEXT_RESPONSES
});
export const finishLoadingResponses = () => ({
  type: FINISH_LOADING_TEXT_RESPONSES
});

export const asyncLoadTextResponses = (
  sectionId,
  scriptId,
  onComplete = () => {}
) => {
  return (dispatch, getState) => {
    const state = getState().textResponses;

    // Don't load data if it's already stored in redux.
    if (state.responseDataByScript[scriptId]) {
      onComplete();
      return;
    }

    dispatch(startLoadingResponses());
    loadTextResponsesFromServer(sectionId, scriptId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        dispatch(setTextResponses(scriptId, data));
        onComplete();
      }
      dispatch(finishLoadingResponses());
    });
  };
};

export default function textResponses(state = initialState, action) {
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState
    };
  }
  if (action.type === SET_TEXT_RESPONSES) {
    return {
      ...state,
      responseDataByScript: {
        ...state.responseDataByScript,
        [action.scriptId]: action.responseData
      }
    };
  }
  if (action.type === START_LOADING_TEXT_RESPONSES) {
    return {
      ...state,
      isLoadingResponses: true
    };
  }
  if (action.type === FINISH_LOADING_TEXT_RESPONSES) {
    return {
      ...state,
      isLoadingResponses: false
    };
  }

  return state;
}

// Flatten text responses returned from server to remove nested student object
export const convertTextResponseServerData = textResponses => {
  let responses = [];
  textResponses.forEach(response => {
    const {id, name} = response.student;
    delete response.student;

    responses.push({
      ...response,
      studentId: id,
      studentName: name
    });
  });

  return responses;
};

// Make a request to the server for text responses
// scriptId is not required; endpoint will use the default script if no scriptId is supplied
const loadTextResponsesFromServer = (sectionId, scriptId, onComplete) => {
  let payload = {};
  if (scriptId) {
    payload.script_id = scriptId;
  }

  $.ajax({
    url: `/dashboardapi/section_text_responses/${sectionId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  })
    .done(responseData => {
      onComplete(null, convertTextResponseServerData(responseData));
    })
    .fail((jqXhr, status) => {
      onComplete(status, jqXhr.responseJSON);
    });
};
