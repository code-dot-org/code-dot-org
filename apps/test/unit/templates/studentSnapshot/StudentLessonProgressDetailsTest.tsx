import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import StudentLessonProgressDetailsWidget from '@cdo/apps/templates/studentSnapshot/studentLessonProgressDetailsWidget';

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
      14: {
        completedPercent: 0,
        timeSpent: 0,
      },
    },
  },
};

// Mock Redux store
const mockStore = createStore(() => ({
  sectionProgress: {
    unitDataByUnit: mockUnitDataByUnit,
    studentLevelProgressByUnit: mockStudentLevelProgressByUnit,
    studentLessonProgressByUnit: mockStudentLessonProgressByUnit,
  },
}));

describe('StudentLessonProgressDetailsWidget', () => {
  function renderDefault(lessonId: number) {
    render(
      <Provider store={mockStore}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={lessonId}
          selectedStudentId={1}
        />
      </Provider>
    );
  }

  it('renders all 3 details', () => {
    renderDefault(10);

    screen.getByText('Progress');
    screen.getByText('33% complete');
    screen.getByText('Validation tests');
    screen.getByText('1 of 2 passed');
    screen.getByText('Time spent');
    screen.getByText('00:02:20');
  });

  it('shows 0s across the board if no progress has been made', () => {
    renderDefault(11);

    screen.getByText('Progress');
    screen.getByText('0% complete');
    screen.getByText('Validation tests');
    screen.getByText('0 of 3 passed');
    screen.getByText('Time spent');
    screen.getByText('00:00:00');
  });

  it('shows all validation is complete if those are finished even if all levels are not finished', () => {
    renderDefault(12);

    screen.getByText('Progress');
    screen.getByText('66% complete');
    screen.getByText('Validation tests');
    screen.getByText('100% complete');
    screen.getByText('Time spent');
    screen.getByText('00:05:00');
  });

  it('shows complete progress and complete validation if everything is done', () => {
    renderDefault(13);

    screen.getByText('Progress');
    screen.getByText('Validation tests');
    expect(screen.getAllByText('100% complete').length).toBe(2);
    screen.getByText('Time spent');
    screen.getByText('00:00:20');
  });

  it('shows complete validation if lesson has no validation levels', () => {
    renderDefault(14);

    screen.getByText('Progress');
    screen.getByText('0% complete');
    screen.getByText('Validation tests');
    screen.getByText('100% complete');
    screen.getByText('Time spent');
    screen.getByText('00:00:00');
  });

  it('shows 0s across the board if no data for the given unit is available', () => {
    render(
      <Provider store={mockStore}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={-1}
          selectedLessonId={11}
          selectedStudentId={1}
        />
      </Provider>
    );

    screen.getByText('Progress');
    screen.getByText('0% complete');
    screen.getByText('Validation tests');
    screen.getByText('0 of 0 passed');
    screen.getByText('Time spent');
    screen.getByText('00:00:00');
  });

  it('shows 0s across the board if no data for the given lesson is available', () => {
    render(
      <Provider store={mockStore}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={-1}
          selectedStudentId={1}
        />
      </Provider>
    );

    screen.getByText('Progress');
    screen.getByText('0% complete');
    screen.getByText('Validation tests');
    screen.getByText('0 of 0 passed');
    screen.getByText('Time spent');
    screen.getByText('00:00:00');
  });

  it('shows 0s across the board if no data for the given student is available', () => {
    render(
      <Provider store={mockStore}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={11}
          selectedStudentId={-1}
        />
      </Provider>
    );

    screen.getByText('Progress');
    screen.getByText('0% complete');
    screen.getByText('Validation tests');
    screen.getByText('0 of 3 passed');
    screen.getByText('Time spent');
    screen.getByText('00:00:00');
  });
});
