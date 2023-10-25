import React from 'react';
import AiAssessment from './AiAssessment';

export default {
  title: 'AiAssessment',
  component: AiAssessment,
};

const Template = args => (
  <AiAssessment
    isAiAssessed={true}
    studentName={'Ada'}
    studentSubmitted={true}
    {...args}
  />
);

export const NotAiAssessed = Template.bind({});
NotAiAssessed.args = {
  isAiAssessed: false,
  aiEvaluation: null,
};

export const LowUnderstandingLowConfidence = Template.bind({});
LowUnderstandingLowConfidence.args = {
  isAiAssessed: true,
  aiEvaluation: {
    understanding: 1,
    ai_confidence: 1,
  },
};

export const HighUnderstandingLowConfidence = Template.bind({});
HighUnderstandingLowConfidence.args = {
  isAiAssessed: true,
  aiEvaluation: {
    understanding: 3,
    ai_confidence: 1,
  },
};

export const NotSubmitted = Template.bind({});
NotSubmitted.args = {
  isAiAssessed: true,
  aiEvaluation: null,
  studentSubmitted: false,
};

export const NoEvaluation = Template.bind({});
NoEvaluation.args = {
  isAiAssessed: true,
  aiEvaluation: null,
  studentSubmitted: true,
};
