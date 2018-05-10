import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedTextResponses as TextResponses} from '@cdo/apps/templates/textResponses/TextResponses';

// responses - object where keys are scriptIds and values are
// array of student text responses for that script
const responses = {
  1: [
    {
      puzzle: 2,
      question: "Free Response",
      response: "Lorem ipsum dolor sit amet, postea pericula",
      stage: "Lesson 1",
      studentId: 1,
      studentName: "Student A",
      url: "http://fake.url"
    },
    {
      puzzle: 3,
      question: "Free Response",
      response: "Lorem ipsum dolor sit amet, postea pericula",
      stage: "Lesson 1",
      studentId: 3,
      studentName: "Student C",
      url: "http://fake.url"
    }
  ],
  2: []
};


describe('TextResponses', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
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
  });

  it('renders the ScriptSelector dropdown', () => {
    expect(wrapper.find('ScriptSelector').exists()).to.be.true;
  });

  it('renders the TextResponsesTable', () => {
    expect(wrapper.find('TextResponsesTable').exists()).to.be.true;
  });
});
