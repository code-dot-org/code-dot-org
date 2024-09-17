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
import {fakeLessonWithLevels} from '@cdo/apps/templates/progress/progressTestHelpers';
import sectionProgress, {
  expandMetadataForStudents,
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import SkeletonProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/SkeletonProgressDataColumn.jsx';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);

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
  expandedMetadataStudentIds: [],
};

const getTestId = (lessonId, studentId, suffix = '') =>
  `lesson-skeleton-cell-${studentId}.${lessonId}${suffix}`;

describe('SkeletonProgressDataColumn', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress, unitSelection, teacherSections});
    store = getStore();
    store.dispatch(setScriptId(1));

    store.dispatch(setSections([FAKE_SECTION]));
    store.dispatch(selectSection(FAKE_SECTION.id));
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <SkeletonProgressDataColumn {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('Shows skeleton if fake lesson', () => {
    renderDefault({lesson: {id: 1, isFake: true}});

    screen.getByTestId(getTestId(1, STUDENT_1.id));
    screen.getByTestId(getTestId(1, STUDENT_2.id));
    screen.getByLabelText('Loading lesson');
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).toHaveLength(2);
  });

  it('Shows real header', () => {
    renderDefault();

    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_2.id));
    expect(screen.queryByLabelText('Loading lesson')).toBeFalsy();
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).toHaveLength(2);
  });

  it('Shows expanded metadata rows', () => {
    renderDefault({expandedMetadataStudentIds: [1]});
    store.dispatch(expandMetadataForStudents([STUDENT_1.id]));

    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id, '-last-updated'));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id, '-time-spent'));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_2.id));
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).toHaveLength(4);
  });
});
