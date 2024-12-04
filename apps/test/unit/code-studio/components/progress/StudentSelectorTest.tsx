import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import StudentSelector from '@cdo/apps/code-studio/components/progress/StudentSelector';
import progress, {initProgress} from '@cdo/apps/code-studio/progressRedux';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {ServerStudent} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {InitProgressPayload} from '@cdo/apps/types/progressTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const STUDENTS: ServerStudent[] = [
  {
    id: 1,
    family_name: 'hill',
    name: 'bobby',
    user_type: 'STUDENT',
    secret_picture_name: '',
    secret_picture_path: '',
    secret_words: '',
    sectionId: 1,
    sharing_disabled: true,
  },
  {
    id: 2,
    family_name: 'morgendorffer',
    name: 'daria',
    user_type: 'STUDENT',
    secret_picture_name: '',
    secret_picture_path: '',
    secret_words: '',
    sectionId: 1,
    sharing_disabled: true,
  },
];

const PROGRESS: InitProgressPayload = {
  currentLevelId: '',
  deeperLearningCourse: false,
  saveAnswersBeforeNavigation: false,
  lessons: [],
  lessonGroups: [],
  scriptId: 1,
  scriptName: 'csd3-2024',
  scriptDisplayName: '',
  unitTitle: '',
  unitDescription: '',
  unitStudentDescription: '',
  courseId: 1,
  courseVersionId: 1,
  isLessonExtras: false,
  peerReviewLessonInfo: {
    name: '',
    levels: [],
    lesson_group_display_name: '',
    lockable: false,
  },
  isFullProgress: false,
  currentPageNumber: 1,
};

const UNIT_SUMMARY = {
  id: 1,
  name: 'csd1-2024',
  lessons: [],
  title: "Unit 1 - Problem Solving and Computing ('23-'24)",
  description: 'CSD description',
  studentDescription: 'CSD student description',
  course_versions: {},
  courseVersionId: 2,
  lessonGroups: [],
  isPlCourse: false,
  plc: false,
};

describe('StudentSelector', () => {
  let store: Store;
  let updateQueryParamSpy: jest.SpyInstance;

  beforeEach(() => {
    store = getStore();
    registerReducers({progress, teacherSections});
    store.dispatch(setStudentsForCurrentSection(1, STUDENTS));
    store.dispatch(initProgress(PROGRESS));

    updateQueryParamSpy = jest.spyOn(codeStudioUtils, 'updateQueryParam');

    jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: {
        unitData: UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2024',
          course_view_path: 'http://example.com/course',
        },
      },
      response: new Response(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dropdown displays a list of students enrolled in the section', () => {
    render(
      <Provider store={store}>
        <StudentSelector />
      </Provider>
    );

    expect(
      (screen.getByRole('option', {name: 'Me'}) as HTMLOptionElement).selected
    ).toBe(true);

    screen.getByText('bobby hill');
    screen.getByText('daria morgendorffer');
  });

  it('changes url search parameter when student is selected', () => {
    render(
      <Provider store={store}>
        <StudentSelector />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(i18n.viewingProgressFor()));
    expect(updateQueryParamSpy).toHaveBeenCalled();
  });
});
