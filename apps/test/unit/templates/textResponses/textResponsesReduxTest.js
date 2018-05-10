import {assert} from '../../../util/configuredChai';
import textResponses, {
  setTextResponses,
  startLoadingResponses,
  finishLoadingResponses,
  convertTextResponseServerData
} from '@cdo/apps/templates/textResponses/textResponsesRedux';

describe('textResponsesRedux', () => {
  const initialState = textResponses(undefined, {});

  describe('setTextResponses', () => {
    it('associates the response data to the correct section and script', () => {
      const sectionId = 1;
      const scriptId = 2;
      const responseData = {
        question: 'Free Response',
        response: 'I love to code!'
      };
      const action = setTextResponses(sectionId, scriptId, responseData);
      const nextState = textResponses(initialState, action);
      const actualResponseData = nextState.responseData[sectionId][scriptId];
      assert.deepEqual(actualResponseData, responseData);
    });
  });

  describe('startLoadingResponses', () => {
    it('sets isLoadingResponses to true', () => {
      const action = startLoadingResponses();
      const nextState = textResponses(initialState, action);
      assert.isTrue(nextState.isLoadingResponses);
    });
  });

  describe('finishLoadingResponses', () => {
    it('sets isLoadingResponses to false', () => {
      const action = finishLoadingResponses();
      const nextState = textResponses(initialState, action);
      assert.isFalse(nextState.isLoadingResponses);
    });
  });

  describe('convertTextResponseServerData', () => {
    it('re-formats server data correctly', () => {
      const serverTextResponses = [
        {
          question: 'Question 1',
          response: 'Response 1',
          student: {
            id: 1,
            name: 'Student 1'
          }
        },
        {
          question: 'Question 2',
          response: 'Response 2',
          student: {
            id: 2,
            name: 'Student 2'
          }
        },
      ];
      const expectedTextResponses = [
        {
          question: 'Question 1',
          response: 'Response 1',
          studentId: 1,
          studentName: 'Student 1'
        },
        {
          question: 'Question 2',
          response: 'Response 2',
          studentId: 2,
          studentName: 'Student 2'
        },
      ];

      const convertedTextResponses = convertTextResponseServerData(serverTextResponses);
      assert.deepEqual(convertedTextResponses, expectedTextResponses);
    });
  });
});
