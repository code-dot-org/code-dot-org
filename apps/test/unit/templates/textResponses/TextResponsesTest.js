import React from 'react';
import {act} from 'react-dom/test-utils';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTextResponses as TextResponses} from '@cdo/apps/templates/textResponses/TextResponses';
import * as textReponsesDataApi from '@cdo/apps/templates/textResponses/textReponsesDataApi';
import sinon from 'sinon';
import {isolateComponent} from 'isolate-components';

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
    url: 'http://fake.url'
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url'
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url'
  }
];

describe('TextResponses', () => {
  describe('when there are text responses', () => {
    beforeEach(() => {
      sinon
        .stub(textReponsesDataApi, 'loadTextResponsesFromServer')
        .returns(Promise.resolve(responses));
    });

    afterEach(() => {
      textReponsesDataApi.loadTextResponsesFromServer.restore();
    });

    it('renders the UnitSelector dropdown', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            validScripts={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('UnitSelector')).to.be.true;
    });

    it('renders the TextResponsesTable', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            validScripts={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('TextResponsesTable')).to.be.true;
      const textResponsesTable = wrapper.findOne('TextResponsesTable');
      expect(textResponsesTable.props.responses).to.eql(responses);
      expect(textResponsesTable.props.sectionId).to.equal(2);
      expect(textResponsesTable.props.scriptName).to.equal('A Script');
    });

    it('renders a CSVLink if there are 1 or more text responses', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            validScripts={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('CSVLink')).to.be.true;
      expect(wrapper.exists('Button')).to.be.true;
    });

    it('renders a filter if there are 2+ lessons to filter by', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            validScripts={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('TextResponsesLessonSelector')).to.be.true;
      expect(
        wrapper.findOne('TextResponsesLessonSelector').props.lessons
      ).to.eql(['Lesson 1', 'Lesson 2']);
    });
  });

  describe('when there are no text responses', () => {
    beforeEach(() => {
      sinon
        .stub(textReponsesDataApi, 'loadTextResponsesFromServer')
        .returns(Promise.resolve({}));
    });

    afterEach(() => {
      textReponsesDataApi.loadTextResponsesFromServer.restore();
    });

    it('does not render actions when there are no text responses', async () => {
      let wrapper;

      await act(async () => {
        wrapper = isolateComponent(
          <TextResponses
            sectionId={2}
            validScripts={[]}
            scriptId={1}
            setScriptId={() => {}}
            scriptName="A Script"
          />
        );
      });

      expect(wrapper.exists('#uitest-response-actions')).to.be.false;
      expect(wrapper.exists('TextResponsesLessonSelector')).to.be.false;
      expect(wrapper.exists('CSVLink')).to.be.false;
    });
  });
});
