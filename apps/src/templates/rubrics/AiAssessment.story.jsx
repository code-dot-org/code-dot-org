import React from 'react';
import AiAssessment from './AiAssessment';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';

export default {
  title: 'AiAssessment',
  component: AiAssessment,
};

const Template = args => (
  <AiAssessment isAiAssessed studentName={'Ada'} studentSubmitted {...args} />
);

export const NotAiAssessed = Template.bind({});
NotAiAssessed.args = {
  isAiAssessed: false,
  aiEvaluation: null,
};

export const LimitedUnderstandingLowConfidence = Template.bind({});
LimitedUnderstandingLowConfidence.args = {
  aiEvaluation: {
    understanding: RubricUnderstandingLevels.LIMITED,
    ai_confidence: 1,
  },
};

export const ExtensiveUnderstandingMediumConfidence = Template.bind({});
ExtensiveUnderstandingMediumConfidence.args = {
  aiEvaluation: {
    understanding: RubricUnderstandingLevels.EXTENSIVE,
    ai_confidence: 2,
  },
};

export const LimitedUnderstandingHighConfidence = Template.bind({});
LimitedUnderstandingHighConfidence.args = {
  aiEvaluation: {
    understanding: RubricUnderstandingLevels.CONVINCING,
    ai_confidence: 3,
  },
};

export const NoUnderstandingLowConfidence = Template.bind({});
NoUnderstandingLowConfidence.args = {
  aiEvaluation: {
    understanding: RubricUnderstandingLevels.NONE,
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
