import React from 'react';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import RubricContainer from './RubricContainer';

export default {
  title: 'RubricContainer',
  component: RubricContainer,
};

const defaultRubric = {
  lesson: {
    position: 3,
    name: 'Testing',
  },
  learningGoals: [
    {
      key: 'story-learning-goal-1',
      learningGoal: 'Coding Proficiency',
      aiEnabled: false,
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
    },
    {
      key: 'story-learning-goal-2',
      learningGoal: 'Testing',
      aiEnabled: true,
      evidenceLevels: [
        {
          id: 1,
          understanding: RubricUnderstandingLevels.EXTENSIVE,
          teacherDescription: 'Student has written tests with high coverage',
        },
        {
          id: 2,
          understanding: 2,
          teacherDescription:
            'Student has written tests with significant coverage but missed a couple of cases',
        },
        {
          id: 3,
          understanding: RubricUnderstandingLevels.LIMITED,
          teacherDescription:
            'Student has written a test but misses several cases',
        },
        {
          id: 4,
          understanding: RubricUnderstandingLevels.NONE,
          teacherDescription: 'Student has not written any tests',
        },
      ],
    },
  ],
};

const defaultStudentLevelInfo = {
  name: 'Ada Lovelace',
  attempts: 2,
  timeSpent: 404,
  lastAttempt: '5/26/23',
};

const Template = args => (
  <RubricContainer
    rubric={defaultRubric}
    teacherHasEnabledAi={false}
    studentLevelInfo={defaultStudentLevelInfo}
    {...args}
  />
);

export const ViewingOwnWorkAiEnabled = Template.bind({});
ViewingOwnWorkAiEnabled.args = {
  studentLevelInfo: null,
  teacherHasEnabledAi: true,
};

export const ViewingOwnWorkAiDisabled = Template.bind({});
ViewingOwnWorkAiDisabled.args = {
  studentLevelInfo: null,
  teacherHasEnabledAi: false,
};

export const ViewingStudentWorkOnNonAssessmentLevelAiEnabled = Template.bind(
  {}
);
ViewingStudentWorkOnNonAssessmentLevelAiEnabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: true,
};

export const ViewingStudentWorkOnNonAssessmentLevelAiDisabled = Template.bind(
  {}
);
ViewingStudentWorkOnNonAssessmentLevelAiDisabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: false,
};

export const ViewingStudentWorkOnAssessmentLevelAiEnabled = Template.bind({});
ViewingStudentWorkOnAssessmentLevelAiEnabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: true,
  onLevelForEvaluation: true,
};

export const ViewingStudentWorkOnAssessmentLevelAiDisabled = Template.bind({});
ViewingStudentWorkOnAssessmentLevelAiDisabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: false,
  onLevelForEvaluation: true,
};
