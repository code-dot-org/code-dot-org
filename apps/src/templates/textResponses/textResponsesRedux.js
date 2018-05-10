import {PropTypes} from 'react';

// Shape for an individual text response
export const textResponsePropType = PropTypes.shape({
  puzzle: PropTypes.number.isRequired,
  question: PropTypes.string,
  response: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  studentId: PropTypes.number.isRequired,
  studentName: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

 // Initial state of textResponsesRedux
const initialState = {
  responseData: {}
};

const SET_TEXT_RESPONSES = 'responseData/SET_TEXT_RESPONSES';

// Action creators
export const setTextResponses = (sectionId, scriptId, responseData) => ({ type: SET_TEXT_RESPONSES, sectionId, scriptId, responseData});

export const asyncLoadTextResponses = (sectionId, scriptId, onComplete) => {
  return (dispatch, getState) => {
    const state = getState().textResponses;

    // Don't load data if it's already stored in redux.
    if (state.responseData[sectionId] && state.responseData[sectionId][scriptId]) {
      onComplete();
      return;
    }

    loadTextResponsesFromServer(sectionId, scriptId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        dispatch(setTextResponses(sectionId, scriptId, data));
        onComplete();
      }
    });
  };
};

export default function textResponses(state=initialState, action) {
  if (action.type === SET_TEXT_RESPONSES) {
    return {
      ...state,
      responseData: {
        ...state.responseData,
        [action.sectionId]: {
          [action.scriptId]: action.responseData
        }
      }
    };
  }

  return state;
}

// Flatten text responses returned from server to remove nested student object
const convertTextResponseServerData = (textResponses) => {
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
  }).done(responseData => {
    onComplete(null, convertTextResponseServerData(responseData));
  }).fail((jqXhr, status) => {
    onComplete(status, jqXhr.responseJSON);
  });
};
