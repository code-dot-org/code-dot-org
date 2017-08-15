import FreeResponseSection from '@cdo/apps/code-studio/pd/workshop_dashboard/components/survey_results/free_response_section';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';

describe("Free Response Section", () => {
  const questions = [
    {text: 'Question 1', key: 'question_1'},
    {text: 'Question 2', key: 'question_2'}
  ];

  it("Renders divs for non facilitator specific free responses", () => {
    const freeResponseSection = shallow(
      <FreeResponseSection
        questions={questions}
        responseData={{
          'question_1': ['Q1 Feedback', 'Q1 Feedback'],
          'question_2': ['Q2 Feedback', 'Q2 Feedback']
        }}
        facilitatorBreakdown={false}
      />
    );

    expect(freeResponseSection.find('Well')).to.have.length(2);
    expect(freeResponseSection.find('li')).to.have.length(4);
  });

  it("Renders divs for facilitator specific free responses", () => {
    const freeResponseSection = shallow(
      <FreeResponseSection
        questions={questions}
        responseData={{
          'question_1': {
            'Facilitator 1': ['Q1 Feedback', 'Q1 Feedback'],
            'Facilitator 2': ['Q1 Feedback', 'Q1 Feedback']
          },
          'question_2': {
            'Facilitator 1': ['Q1 Feedback', 'Q1 Feedback'],
            'Facilitator 2': ['Q1 Feedback', 'Q1 Feedback']
          }
        }}
        facilitatorBreakdown={true}
      />
    );

    expect(freeResponseSection.find('Well')).to.have.length(2);
    expect(freeResponseSection.find('ul')).to.have.length(4);
    expect(freeResponseSection.find('li')).to.have.length(12);
    expect(freeResponseSection.find('b')).to.have.length(2);
  });
});
