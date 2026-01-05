import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import StudentLessonProgressDetailsWidget from './index';

// --- Mock data for lesson + student progress so Storybook can show real UI ----
const mockUnitDataByUnit = {
  // unitId: unit info
  1: {
    id: 1,
    // lesson index in array: lesson info
    lessons: {
      0: {
        id: 10,
        script_id: 1,
        relative_position: 1,
        // level index in array: level info
        levels: {
          0: {
            id: '101',
            isValidated: true,
          },
          1: {
            id: '102',
            isValidated: true,
          },
          2: {
            id: '103',
            isValidated: false,
          },
        },
      },
      1: {
        id: 11,
        script_id: 1,
        relative_position: 2,
        // level index in array: level info
        levels: {
          0: {
            id: '111',
            isValidated: true,
          },
          1: {
            id: '112',
            isValidated: true,
          },
          2: {
            id: '113',
            isValidated: true,
          },
        },
      },
      2: {
        id: 12,
        script_id: 1,
        relative_position: 3,
        // level index in array: level info
        levels: {
          0: {
            id: '121',
            isValidated: true,
          },
          1: {
            id: '122',
            isValidated: false,
          },
          2: {
            id: '123',
            isValidated: false,
          },
        },
      },
      3: {
        id: 13,
        script_id: 1,
        relative_position: 4,
        // level index in array: level info
        levels: {
          0: {
            id: '131',
            isValidated: true,
          },
          1: {
            id: '132',
            isValidated: true,
          },
          2: {
            id: '133',
            isValidated: true,
          },
        },
      },
    },
  },
};
const mockStudentLevelProgressByUnit = {
  // unitId: unit info
  1: {
    // userId: user progress in unit
    1: {
      // levelId: user progress in level
      '101': {status: 'perfect'},
      '102': {status: 'not_tried'},
      '103': {status: 'not_tried'},
      '111': {status: 'not_tried'},
      '112': {status: 'not_tried'},
      '113': {status: 'not_tried'},
      '121': {status: 'perfect'},
      '122': {status: 'perfect'},
      '123': {status: 'not_tried'},
      '131': {status: 'perfect'},
      '132': {status: 'perfect'},
      '133': {status: 'perfect'},
    },
  },
};
const mockStudentLessonProgressByUnit = {
  // unitId: unit info
  1: {
    // userId: user progress in unit
    1: {
      // lessonId: user progress info in lesson
      10: {
        completedPercent: 33.33333333,
        timeSpent: 140,
      },
      11: {
        completedPercent: 0,
        timeSpent: 0,
      },
      12: {
        completedPercent: 66.66666666,
        timeSpent: 300,
      },
      13: {
        completedPercent: 100,
        timeSpent: 20,
      },
    },
  },
};

// Minimal mock Redux store used by lesson progress details widget
const initialState = {
  sectionProgress: {
    unitDataByUnit: mockUnitDataByUnit,
    studentLevelProgressByUnit: mockStudentLevelProgressByUnit,
    studentLessonProgressByUnit: mockStudentLessonProgressByUnit,
  },
};

const mockStore = createStore((state = initialState) => state);

const meta: Meta<typeof StudentLessonProgressDetailsWidget> = {
  component: StudentLessonProgressDetailsWidget,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Teacher-style lesson progress widget that uses redux info to display progress and validation of the selected student in the selected.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

console.log(mockStore);

export default meta;
type Story = StoryObj<typeof StudentLessonProgressDetailsWidget>;

export const Default: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 10,
    selectedStudentId: 1,
  },
};

export const WithNoProgress: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 11,
    selectedStudentId: 1,
  },
};

export const WithSomeProgressFullValidation: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 12,
    selectedStudentId: 1,
  },
};

export const WithFullProgressFullValidation: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 13,
    selectedStudentId: 1,
  },
};
