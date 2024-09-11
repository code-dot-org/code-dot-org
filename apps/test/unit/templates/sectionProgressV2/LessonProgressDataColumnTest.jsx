import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import LessonProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/LessonProgressDataColumn.jsx';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);
const LEVEL = LESSON.levels[0];
const LESSON_PROGRESS = {
  [STUDENT_1.id]: {
    [LESSON.id]: {
      incompletePercent: 20,
      imperfectPercent: 20,
      completedPercent: 60,
      timeSpent: 300, // time spent = 5 minutes
      lastTimestamp: 1614841198, // date = 3/4
    },
  },
  [STUDENT_2.id]: {
    [LESSON.id]: {
      incompletePercent: 0,
      imperfectPercent: 0,
      completedPercent: 100,
      timeSpent: 300, // time spent = 5 minutes
      lastTimestamp: 1614841198, // date = 3/4
    },
  },
};
const LEVEL_PROGRESS = {
  [STUDENT_1.id]: {
    [LEVEL.id]: {
      locked: false,
      status: 'perfect',
      result: 100,
      paired: true,
      teacherFeedbackNew: false,
    },
  },
  [STUDENT_2.id]: {
    [LESSON.id]: {
      locked: true,
      status: 'not_tried',
      result: 1,
      paired: false,
      teacherFeedbackNew: true,
    },
  },
};

const DEFAULT_PROPS = {
  lesson: LESSON,
  sortedStudents: STUDENTS,
  addExpandedLesson: () => {},
};

describe('LessonProgressDataColumn', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      sectionProgress,
      unitSelection,
      teacherSections,
    });

    store = getStore();
    store.dispatch(setScriptId(1));
    store.dispatch(
      addDataByUnit({
        unitDataByUnit: {},
        studentLevelProgressByUnit: {1: LEVEL_PROGRESS},
        studentLessonProgressByUnit: {1: LESSON_PROGRESS},
        studentLastUpdateByUnit: {},
      })
    );

    store = getStore();
  });

  function renderDefault(propOverrides) {
    render(
      <Provider store={store}>
        <LessonProgressDataColumn {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  afterEach(() => {
    restoreRedux();
  });
  it('Shows header lesson', () => {
    renderDefault();

    screen.findAllByText(LESSON.id);
  });

  it('Shows no expansion if no levels', () => {
    renderDefault({lesson: fakeLesson()});

    expect(screen.queryByRole('button')).toBeNull;
  });

  it('shows progress for all students', () => {
    renderDefault();

    expect(screen.queryAllByTestId(/lesson-data-cell/)).toHaveLength(
      STUDENTS.length
    );
  });
});
