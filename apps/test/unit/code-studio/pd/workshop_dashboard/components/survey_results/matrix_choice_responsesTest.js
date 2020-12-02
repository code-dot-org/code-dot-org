import React from 'react';
import {expect} from 'chai';
import MatrixChoiceResponses from '@cdo/apps/code-studio/pd/workshop_dashboard/components/survey_results/matrix_choice_responses';
import mount from 'enzyme/build/mount';

describe('Matrix Choice Responses', () => {
  const sampleMatrixAnswers = {
    best_pd: {7: 2},
    feel_community: {2: 1, 7: 1},
    more_prepared: {4: 1, 5: 1}
  };

  const sampleFacilitators = {
    '1': 'Facilitator 1',
    '2': 'Facilitator 2'
  };

  const sampleQuestion = {
    columns: {
      '1': 'Strongly Disagree',
      '2': 'Disagree',
      '3': 'Slightly Disagree',
      '4': 'Neutral',
      '5': 'Slightly Agree',
      '6': 'Agree',
      '7': 'Strongly Agree'
    },
    rows: {
      best_pd:
        'This was the absolute best professional development I’ve ever participated in.',
      feel_community:
        'I feel connected to a community of computer science teachers.',
      more_prepared:
        'I feel more prepared to teach the material covered in this workshop than before I came.',
      suitable_my_level:
        'This professional development was suitable for my level of experience with teaching CS.'
    },
    title: 'sample'
  };

  it('only renders matrix rows with answers', () => {
    const matrixChoiceResponses = mount(
      <MatrixChoiceResponses
        answer={sampleMatrixAnswers}
        question={sampleQuestion}
        section="general"
        questionId="overall_success"
        facilitators={sampleFacilitators}
      />
    );

    // there are 4 questions but only 3 have responses
    const choiceResponses = matrixChoiceResponses.find('ChoiceResponses');
    expect(choiceResponses).to.have.length(3);
    expect(choiceResponses.last().props().question).to.equal(
      'sample -> I feel more prepared to teach the material covered in this workshop than before I came.'
    );
  });

  it('pulls out facilitator data correctly', () => {
    const facilitatorMatrixData = {
      '1': {
        best_pd: {7: 2},
        feel_community: {2: 1, 7: 1},
        more_prepared: {4: 1, 5: 1}
      },
      '2': {
        best_pd: {6: 1},
        feel_community: {1: 1, 2: 1, 3: 1},
        more_prepared: {6: 1, 7: 1},
        suitable_my_level: {5: 2}
      }
    };

    const matrixChoiceResponses = mount(
      <MatrixChoiceResponses
        answer={facilitatorMatrixData}
        question={sampleQuestion}
        section="facilitator"
        questionId="overall_success"
        facilitators={sampleFacilitators}
      />
    );

    // there are 4 questions with responses across both facilitators
    const choiceResponses = matrixChoiceResponses.find('ChoiceResponses');
    expect(choiceResponses).to.have.length(4);

    const expectedPdAnswers = {
      '1': {7: 2},
      '2': {6: 1}
    };
    expect(
      choiceResponses
        .first()
        .props()
        .answers.toString()
    ).to.equal(expectedPdAnswers.toString());

    // suitable_my_level only had a response for facilitator 2
    const expectedSuitableAnswers = {
      '2': {5: 2}
    };
    expect(
      choiceResponses
        .last()
        .props()
        .answers.toString()
    ).to.equal(expectedSuitableAnswers.toString());
  });
});
