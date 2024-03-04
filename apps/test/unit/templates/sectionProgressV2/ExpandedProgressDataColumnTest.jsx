import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';

import ExpandedProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';

import {Provider} from 'react-redux';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import {PROGRESS_ICON_TITLE_PREFIX} from '@cdo/apps/templates/sectionProgressV2/ProgressIcon';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {
  fakeLessonWithLevels,
  fakeStudentLevelProgress,
  fakeLevelWithSubLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const NUM_LEVELS = 4;
const LESSON = fakeLessonWithLevels({}, NUM_LEVELS);
const LEVEL_PROGRESS = fakeStudentLevelProgress(LESSON.levels, STUDENTS);
const SECTION = {
  name: 'My Section',
  id: 1,
};

const DEFAULT_PROPS = {
  lesson: LESSON,
  sortedStudents: STUDENTS,
  removeExpandedLesson: () => {},
};

describe('ExpandedProgressDataColumn', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress, unitSelection, teacherSections});
    store = getStore();
    store.dispatch(setScriptId(1));
    store.dispatch(
      addDataByUnit({studentLevelProgressByUnit: {1: LEVEL_PROGRESS}})
    );
    store.dispatch(selectSection(1));
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <ExpandedProgressDataColumn {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  function renderWithSublevels() {
    const levelWithSublevels = fakeLevelWithSubLevels(3, NUM_LEVELS + 1);
    const lesson = fakeLessonWithLevels({}, NUM_LEVELS);
    lesson.levels.push(levelWithSublevels);
    const levelProgress = fakeStudentLevelProgress(
      [...lesson.levels, ...levelWithSublevels.sublevels],
      STUDENTS
    );
    store.dispatch(
      addDataByUnit({studentLevelProgressByUnit: {1: levelProgress}})
    );

    renderDefault({lesson});

    return {lesson, levelWithSublevels};
  }

  it('Shows all levels for all students', () => {
    renderDefault();

    expect(
      screen.getAllByText(
        'Lesson ' + LESSON.relative_position + ': ' + LESSON.name
      )
    ).to.have.length(2);

    LESSON.levels.forEach(level => {
      expect(
        screen.getByText(LESSON.relative_position + '.' + level.bubbleText)
      ).to.exist;
    });

    expect(screen.queryAllByRole('link')).to.have.length(
      LESSON.levels.length * STUDENTS.length
    );
  });

  it('Shows unexpanded choice level', () => {
    const {lesson, levelWithSublevels} = renderWithSublevels();

    lesson.levels.forEach(level => {
      expect(
        screen.getByText(lesson.relative_position + '.' + level.bubbleText)
      ).to.exist;
    });

    levelWithSublevels.sublevels.forEach(sublevel => {
      expect(screen.queryByText(sublevel.bubbleText)).to.not.exist;
    });

    expect(screen.queryAllByRole('link')).to.have.length(
      lesson.levels.length * STUDENTS.length
    );
  });

  it('Shows expanded choice level', () => {
    const {lesson, levelWithSublevels} = renderWithSublevels();

    const choiceLevelHeader = screen.getByText(
      lesson.relative_position + '.' + levelWithSublevels.bubbleText
    );
    fireEvent.click(choiceLevelHeader);

    expect(screen.queryAllByRole('link')).to.have.length(
      (lesson.levels.length + levelWithSublevels.sublevels.length) *
        STUDENTS.length
    );

    expect(
      screen.queryAllByLabelText(PROGRESS_ICON_TITLE_PREFIX + 'split')
    ).to.have.length(STUDENTS.length);
  });

  it('Shows unexpanded choice level after clicking twice', () => {
    const {lesson, levelWithSublevels} = renderWithSublevels();

    const choiceLevelHeader = screen.getByText(
      lesson.relative_position + '.' + levelWithSublevels.bubbleText
    );
    fireEvent.click(choiceLevelHeader);

    const expandedChoiceLevelHeader = screen.getByText(
      lesson.relative_position + '.' + levelWithSublevels.bubbleText
    );
    fireEvent.click(expandedChoiceLevelHeader);

    lesson.levels.forEach(level => {
      expect(
        screen.getByText(lesson.relative_position + '.' + level.bubbleText)
      ).to.exist;
    });

    levelWithSublevels.sublevels.forEach(sublevel => {
      expect(screen.queryByText(sublevel.bubbleText)).to.not.exist;
    });
  });
});
