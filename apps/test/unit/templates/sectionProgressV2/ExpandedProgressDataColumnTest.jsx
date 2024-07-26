import {fireEvent, render, screen} from '@testing-library/react';
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
  fakeStudentLevelProgress,
  fakeLevelWithSubLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import sectionProgress, {
  addDataByUnit,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import ExpandedProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';
import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const NUM_LEVELS = 4;
const LESSON = fakeLessonWithLevels({}, NUM_LEVELS);
const LEVEL_PROGRESS = fakeStudentLevelProgress(LESSON.levels, STUDENTS);

const FAKE_SECTION = {
  id: 101,
  location: '/v2/sections/101',
  name: 'My Section',
  login_type: 'google_oauth2',
  participant_type: 'student',
  grade: '2',
  code: 'PMTKVH',
  lesson_extras: false,
  pairing_allowed: true,
  sharing_disabled: false,
  script: null,
  course_id: 29,
  studentCount: 5,
  students: Object.values(STUDENTS),
  hidden: false,
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

    store.dispatch(setSections([FAKE_SECTION]));
    store.dispatch(selectSection(FAKE_SECTION.id));
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
    ).toHaveLength(2);

    LESSON.levels.forEach(level => {
      expect(
        screen.getByText(LESSON.relative_position + '.' + level.bubbleText)
      ).toBeDefined();
    });

    expect(screen.queryAllByRole('link')).toHaveLength(
      LESSON.levels.length * STUDENTS.length
    );
  });

  it('Shows unexpanded choice level', () => {
    const {lesson, levelWithSublevels} = renderWithSublevels();

    lesson.levels.forEach(level => {
      expect(
        screen.getByText(lesson.relative_position + '.' + level.bubbleText)
      ).toBeDefined();
    });

    levelWithSublevels.sublevels.forEach(sublevel => {
      expect(screen.queryByText(sublevel.bubbleText)).toBeFalsy();
    });

    expect(screen.queryAllByRole('link')).toHaveLength(
      lesson.levels.length * STUDENTS.length
    );
  });

  it('Shows expanded choice level', () => {
    const {lesson, levelWithSublevels} = renderWithSublevels();
    const choiceLevelHeader = screen.getByText(
      lesson.relative_position + '.' + levelWithSublevels.bubbleText
    );
    fireEvent.click(choiceLevelHeader);

    expect(screen.queryAllByRole('link')).toHaveLength(
      (lesson.levels.length + levelWithSublevels.sublevels.length) *
        STUDENTS.length
    );

    expect(
      screen.queryAllByLabelText(ITEM_TYPE.CHOICE_LEVEL.title)
    ).toHaveLength(STUDENTS.length);
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
      ).toBeDefined();
    });

    levelWithSublevels.sublevels.forEach(sublevel => {
      expect(screen.queryByText(sublevel.bubbleText)).toBeFalsy();
    });
  });
});
