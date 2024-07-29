import React from 'react';

import FreeResponseSection from './free_response_section';

export default {
  component: FreeResponseSection,
};

const Template = args => (
  <div id="application-container">
    <FreeResponseSection {...args} />
  </div>
);

export const SingleFacilitator = Template.bind({});
SingleFacilitator.args = {
  questions: [
    {text: 'Question 1', key: 'question_1'},
    {text: 'Question 2', key: 'question_2'},
  ],
  responseData: {
    question_1: ['Feedback 1_1', 'Feedback 1_2'],
    question_2: ['Feedback 2_1', 'Feedback 2_2'],
  },
};

export const MultipleFacilitators = Template.bind({});
MultipleFacilitators.args = {
  questions: [
    {text: 'Question 1', key: 'question_1'},
    {text: 'Question 2', key: 'question_2'},
  ],
  responseData: {
    question_1: {
      'Facilitator 1': ['Q1F1 feedback', 'Q1F1 feedback'],
      'Facilitator 2': ['Q1F2 feedback', 'Q1F2 feedback'],
    },
    question_2: {
      'Facilitator 1': ['Q2F1 feedback', 'Q2F1 feedback'],
      'Facilitator 2': ['Q2F2 feedback', 'Q2F2 feedback'],
    },
  },
};
