import React from 'react';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import LearningGoal from './LearningGoal';

export default {
  title: 'LearningGoal',
  component: LearningGoal,
};

const defaultLearningGoal = {
  learningGoal: 'Coding Proficiency',
  evidenceLevels: [
    {
      id: 1,
      understanding: RubricUnderstandingLevels.EXTENSIVE,
      teacherDescription: 'Student is able to write fully correct code',
    },
    {
      id: 2,
      understanding: 2,
      teacherDescription: 'Student is able to write some correct code',
    },
    {
      id: 3,
      understanding: RubricUnderstandingLevels.LIMITED,
      teacherDescription: 'Student is able to write partially correct code',
    },
    {
      id: 4,
      understanding: RubricUnderstandingLevels.NONE,
      teacherDescription: 'Student is unable to write correct code',
    },
  ],
};

export const AiDisabledFeedbackUnavailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: false}}
    teacherHasEnabledAi
    canProvideFeedback={false}
  />
);

export const AiDisabledFeedbackAvailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: false}}
    teacherHasEnabledAi
    canProvideFeedback
  />
);

export const AiEnabledFeedbackUnavailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: true}}
    teacherHasEnabledAi
    canProvideFeedback={false}
  />
);

export const AiEnabledFeedbackAvailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: true}}
    teacherHasEnabledAi
    canProvideFeedback
  />
);

export const WithTipsFeedbackAvailable = () => (
  <LearningGoal
    learningGoal={{
      ...defaultLearningGoal,
      tips: 'Show some tips for evaluation\n\nPossibly use newlines and _some_ **markdown**',
    }}
    canProvideFeedback
  />
);
