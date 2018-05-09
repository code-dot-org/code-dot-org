import {PropTypes} from 'react';

export const sectionTextResponsePropType = PropTypes.shape({
  puzzle: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  response: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  studentId: PropTypes.number.isRequired,
  studentName: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

/**
 * Initial state of textResponsesRedux
 * responseData - object of arrays where the key is the sectionId and value is an array of sectionTextResponsePropType
 */
const initialState = {
  responseData: PropTypes.objectOf(PropTypes.number)
};

const SET_TEXT_RESPONSES = 'responseData/SET_TEXT_RESPONSES';

// Action creators
export const setTextResponses = (sectionId, responseData) => ({ type: SET_TEXT_RESPONSES, sectionId, responseData});

export const asyncLoadTextResponses = (sectionId, onComplete) => {
  return (dispatch, getState) => {
    const state = getState().textResponses;

    // Don't load data if it's already stored in redux.
    if (state.responseData[sectionId]) {
      onComplete();
      return;
    }

    loadTextResponsesFromServer(sectionId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        dispatch(setTextResponses(sectionId, data));
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
        [action.sectionId]: action.responseData
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
const loadTextResponsesFromServer = (sectionId, onComplete) => {
  $.ajax({
    url: `/dashboardapi/section_text_responses/${sectionId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  }).done(responseData => {
    onComplete(null, convertTextResponseServerData(responseData));
  }).fail((jqXhr, status) => {
    onComplete(status, jqXhr.responseJSON);
  });
};
