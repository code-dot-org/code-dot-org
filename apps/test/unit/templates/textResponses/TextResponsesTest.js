import {isolateComponent} from 'isolate-react';
import React from 'react';
import {act} from 'react-dom/test-utils';

import * as textReponsesDataApi from '@cdo/apps/templates/textResponses/textReponsesDataApi';
import {UnconnectedTextResponses as TextResponses} from '@cdo/apps/templates/textResponses/TextResponses';

// responses (object) - keys are scriptIds, values are
// array of student text responses for that script
const responses = [
  {
    puzzle: 2,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url',
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url',
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url',
  },
];

describe('TextResponses', () => {
  describe('when there are text responses', () => {
    beforeEach(() => {
      jest
        .spyOn(textReponsesDataApi, 'loadTextResponsesFromServer')
        .mockClear()
        .mockReturnValue(Promise.resolve(responses));
    });

    afterEach(() => {
      textReponsesDataApi.loadTextResponsesFromServer.mockRestore();
    });

    it('renders the UnitSelector dropdown', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            coursesWithProgress={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('UnitSelector')).toBe(true);
    });

    it('renders the TextResponsesTable', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            coursesWithProgress={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('TextResponsesTable')).toBe(true);
      const textResponsesTable = wrapper.findOne('TextResponsesTable');
      expect(textResponsesTable.props.responses).toEqual(responses);
      expect(textResponsesTable.props.sectionId).toBe(2);
      expect(textResponsesTable.props.scriptName).toBe('A Script');
    });

    it('renders a CSVLink if there are 1 or more text responses', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            coursesWithProgress={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('CSVLink')).toBe(true);
      expect(wrapper.exists('Button')).toBe(true);
    });

    it('renders a filter if there are 2+ lessons to filter by', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            coursesWithProgress={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('TextResponsesLessonSelector')).toBe(true);
      expect(
        wrapper.findOne('TextResponsesLessonSelector').props.lessons
      ).toEqual(['Lesson 1', 'Lesson 2']);
    });
  });

  describe('when there are no text responses', () => {
    beforeEach(() => {
      jest
        .spyOn(textReponsesDataApi, 'loadTextResponsesFromServer')
        .mockClear()
        .mockReturnValue(Promise.resolve({}));
    });

    afterEach(() => {
      textReponsesDataApi.loadTextResponsesFromServer.mockRestore();
    });

    it('does not render actions when there are no text responses', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            coursesWithProgress={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('#uitest-response-actions')).toBe(false);
      expect(wrapper.exists('TextResponsesLessonSelector')).toBe(false);
      expect(wrapper.exists('CSVLink')).toBe(false);
    });
  });
});
