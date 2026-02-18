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
      4: {
        id: 14,
        script_id: 1,
        relative_position: 5,
        // level index in array: level info
        levels: {
          0: {
            id: '141',
            isValidated: false,
          },
          1: {
            id: '142',
            isValidated: false,
          },
          2: {
            id: '143',
            isValidated: false,
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
    // User 1 completed a mix of levels
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
      '141': {status: 'not_tried'},
      '142': {status: 'not_tried'},
      '143': {status: 'not_tried'},
    },
    // User 2 completed all levels
    2: {
      // levelId: user progress in level
      '101': {status: 'perfect'},
      '102': {status: 'perfect'},
      '103': {status: 'perfect'},
      '111': {status: 'perfect'},
      '112': {status: 'perfect'},
      '113': {status: 'perfect'},
      '121': {status: 'perfect'},
      '122': {status: 'perfect'},
      '123': {status: 'perfect'},
      '131': {status: 'perfect'},
      '132': {status: 'perfect'},
      '133': {status: 'perfect'},
      '141': {status: 'perfect'},
      '142': {status: 'perfect'},
      '143': {status: 'perfect'},
    },
    // User 3 completed no levels so they have no entry in studentLevelProgressByUnit
  },
};
const mockStudentLessonProgressByUnit = {
  // unitId: unit info
  1: {
    // userId: user progress in unit
    // User 1 made some progress
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
      14: {
        completedPercent: 0,
        timeSpent: 0,
      },
    },
    // User 2 finished everything
    2: {
      // lessonId: user progress info in lesson
      10: {
        completedPercent: 100,
        timeSpent: 200,
      },
      11: {
        completedPercent: 100,
        timeSpent: 20,
      },
      12: {
        completedPercent: 100,
        timeSpent: 300,
      },
      13: {
        completedPercent: 100,
        timeSpent: 200,
      },
      14: {
        completedPercent: 100,
        timeSpent: 50,
      },
    },
    // User 3 did nothing so they have no data in studentLessonProgressByUnit
  },
};

// Mock Redux store
const initialState = {
  sectionProgress: {
    unitDataByUnit: mockUnitDataByUnit,
    studentLevelProgressByUnit: mockStudentLevelProgressByUnit,
    studentLessonProgressByUnit: mockStudentLessonProgressByUnit,
  },
  teacherSections: {
    selectedStudents: [{id: 1}, {id: 2}, {id: 3}],
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
