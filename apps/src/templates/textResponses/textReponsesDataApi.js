import PropTypes from 'prop-types';

// Make a request to the server for text responses
// scriptId is not required; endpoint will use the default script if no scriptId is supplied
export const loadTextResponsesFromServer = (sectionId, scriptId) => {
  let requestUrl = `/dashboardapi/section_text_responses/${sectionId}`;

  if (scriptId) {
    requestUrl += `?script_id=${scriptId}`;
  }

  return fetch(requestUrl, {
    credentials: 'same-origin',
  })
    .then(response => {
      return response.json();
    })
    .then(responseData => {
      return convertTextResponseServerData(responseData);
    });
};

// Flatten text responses returned from server to remove nested student object
const convertTextResponseServerData = textResponses => {
  let responses = [];
  textResponses.forEach(response => {
    const {id, name, familyName} = response.student;
    delete response.student;

    responses.push({
      ...response,
      studentId: id,
      studentName: name,
      studentFamilyName: familyName,
    });
  });

  return responses;
};

// Shape for an individual text response
export const textResponsePropType = PropTypes.shape({
  puzzle: PropTypes.number.isRequired,
  question: PropTypes.string,
  response: PropTypes.string.isRequired,
  lesson: PropTypes.string.isRequired,
  studentId: PropTypes.number.isRequired,
  studentName: PropTypes.string.isRequired,
  studentFamilyName: PropTypes.string,
  url: PropTypes.string.isRequired,
});
