import PropTypes from 'prop-types';

// Make a request to the server for text responses
// scriptId is not required; endpoint will use the default script if no scriptId is supplied
export const loadTextResponsesFromServer = (
  sectionId,
  scriptId,
  onComplete
) => {
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

// Flatten text responses returned from server to remove nested student object
const convertTextResponseServerData = textResponses => {
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
