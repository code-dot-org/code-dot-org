import React from 'react';
import {Provider} from 'react-redux';

import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

import teacherSections from '../teacherDashboard/teacherSectionsRedux';

import RubricContainer from './RubricContainer';

export default {
  component: RubricContainer,
};

const createRubricContainerStore = () => {
  registerReducers({
    teacherPanel,
    teacherSections,
  });
  const store = createStoreWithReducers();
  return store;
};

const rubricLevelName = 'free_play_level';

const defaultRubric = {
  lesson: {
    position: 3,
    name: 'Testing',
  },
  script: {
    id: 107,
  },
  level: {
    id: 42,
    name: rubricLevelName,
    position: 5,
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
  user_id: 107,
};

const Template = args => (
  <Provider store={createRubricContainerStore()}>
    <RubricContainer
      rubric={defaultRubric}
      teacherHasEnabledAi={false}
      studentLevelInfo={defaultStudentLevelInfo}
      currentLevelName={rubricLevelName}
      open
      {...args}
    />
  </Provider>
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
  currentLevelName: 'not_free_play_level',
};

export const ViewingStudentWorkOnNonAssessmentLevelAiDisabled = Template.bind(
  {}
);
ViewingStudentWorkOnNonAssessmentLevelAiDisabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: false,
  currentLevelName: 'not_free_play_level',
};

export const ViewingStudentWorkOnAssessmentLevelAiEnabled = Template.bind({});
ViewingStudentWorkOnAssessmentLevelAiEnabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: true,
};

export const ViewingStudentWorkOnAssessmentLevelAiDisabled = Template.bind({});
ViewingStudentWorkOnAssessmentLevelAiDisabled.args = {
  studentLevelInfo: {...defaultStudentLevelInfo, submitted: true},
  teacherHasEnabledAi: false,
};
