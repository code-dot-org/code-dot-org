import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTextResponses as TextResponses} from '@cdo/apps/templates/textResponses/TextResponses';

// responses (object) - keys are scriptIds, values are
// array of student text responses for that script
const responses = {
  1: [
    {
      puzzle: 2,
      question: 'Free Response',
      response: 'Lorem ipsum dolor sit amet, postea pericula',
      stage: 'Lesson 1',
      studentId: 1,
      studentName: 'Student A',
      url: 'http://fake.url'
    },
    {
      puzzle: 3,
      question: 'Free Response',
      response: 'Lorem ipsum dolor sit amet, postea pericula',
      stage: 'Lesson 2',
      studentId: 1,
      studentName: 'Student A',
      url: 'http://fake.url'
    },
    {
      puzzle: 3,
      question: 'Free Response',
      response: 'Lorem ipsum dolor sit amet, postea pericula',
      stage: 'Lesson 2',
      studentId: 3,
      studentName: 'Student C',
      url: 'http://fake.url'
    }
  ],
  2: []
};

describe('TextResponses', () => {
  it('renders the ScriptSelector dropdown', () => {
    const wrapper = shallow(
      <TextResponses
        sectionId={2}
        responses={responses}
        isLoadingResponses={false}
        validScripts={[]}
        scriptId={1}
        setScriptId={() => {}}
        asyncLoadTextResponses={() => {}}
      />
    );

    expect(wrapper.find('ScriptSelector').exists()).to.be.true;
  });

  it('renders the TextResponsesTable', () => {
    const wrapper = shallow(
      <TextResponses
        sectionId={2}
        responses={responses}
        isLoadingResponses={false}
        validScripts={[]}
        scriptId={1}
        setScriptId={() => {}}
        asyncLoadTextResponses={() => {}}
      />
    );

    expect(wrapper.find('TextResponsesTable').exists()).to.be.true;
  });

  describe('action row', () => {
    it('does not render when there are no text responses', () => {
      const wrapper = shallow(
        <TextResponses
          sectionId={2}
          responses={{}}
          isLoadingResponses={false}
          validScripts={[]}
          scriptId={1}
          setScriptId={() => {}}
          asyncLoadTextResponses={() => {}}
        />
      );

      expect(wrapper.find('#uitest-response-actions').exists()).to.be.false;
      expect(wrapper.find('#uitest-lesson-filter').exists()).to.be.false;
      expect(wrapper.find('CSVLink').exists()).to.be.false;
    });

    it('renders a CSVLink if there are 1 or more text responses', () => {
      const wrapper = shallow(
        <TextResponses
          sectionId={2}
          responses={responses}
          isLoadingResponses={false}
          validScripts={[]}
          scriptId={1}
          setScriptId={() => {}}
          asyncLoadTextResponses={() => {}}
        />
      );

      const csvLink = wrapper.find('CSVLink');
      expect(csvLink.exists()).to.be.true;
      expect(csvLink.find('Button').exists()).to.be.true;
    });

    it('renders a filter if there are 2+ lessons to filter by', () => {
      const wrapper = shallow(
        <TextResponses
          sectionId={2}
          responses={responses}
          isLoadingResponses={false}
          validScripts={[]}
          scriptId={1}
          setScriptId={() => {}}
          asyncLoadTextResponses={() => {}}
        />
      );

      const filterDropdown = wrapper.find('#uitest-lesson-filter');
      const filterOptions = filterDropdown.find('option');
      expect(filterDropdown.exists()).to.be.true;
      expect(filterOptions).to.have.length(3);
      expect(filterOptions.at(0)).to.have.text('All');
      expect(filterOptions.at(1)).to.have.text('Lesson 1');
      expect(filterOptions.at(2)).to.have.text('Lesson 2');
    });
  });
});
