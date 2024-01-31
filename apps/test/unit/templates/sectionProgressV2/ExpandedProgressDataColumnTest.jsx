import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';

import ExpandedProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';

import {Provider} from 'react-redux';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  fakeLessonWithLevels,
  fakeStudentLevelProgress,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const NUM_LEVELS = 4;
const LESSON = fakeLessonWithLevels({}, NUM_LEVELS);
const LEVEL_PROGRESS = fakeStudentLevelProgress(LESSON.levels, STUDENTS);

const DEFAULT_PROPS = {
  lesson: LESSON,
  sortedStudents: STUDENTS,
  removeExpandedLesson: () => {},
};

describe('ExpandedProgressDataColumn', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress, unitSelection});
    store = getStore();
    store.dispatch(setScriptId(1));
    store.dispatch(
      addDataByUnit({studentLevelProgressByUnit: {1: LEVEL_PROGRESS}})
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault() {
    render(
      <Provider store={store}>
        <ExpandedProgressDataColumn {...DEFAULT_PROPS} />
      </Provider>
    );
  }
  it('Shows all levels for all students', () => {
    renderDefault();

    expect(
      screen.getByText(
        'Lesson ' + LESSON.relative_position + ': ' + LESSON.name
      )
    ).to.exist;

    LESSON.levels.forEach(level => {
      expect(
        screen.getByText(LESSON.relative_position + '.' + level.bubbleText)
      ).to.exist;
    });
  });
});
