import React from 'react';
import LearningGoal from './LearningGoal';

export default {
  title: 'LearningGoal',
  component: LearningGoal,
};

const defaultLearningGoal = {
  learningGoal: 'Program Development',
};

export const AiDisabledFeedbackUnavailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: false}}
    canProvideFeedback={false}
  />
);

export const AiDisabledFeedbackAvailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: false}}
    canProvideFeedback
  />
);

export const AiEnabledFeedbackUnavailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: true}}
    canProvideFeedback={false}
  />
);

export const AiEnabledFeedbackAvailable = () => (
  <LearningGoal
    learningGoal={{...defaultLearningGoal, aiEnabled: true}}
    canProvideFeedback
  />
);
