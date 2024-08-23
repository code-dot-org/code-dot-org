import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';

import {registerReducers, restoreRedux, stubRedux} from '@cdo/apps/redux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import manageStudents from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {createStore} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';
import sectionStandardsProgress, {
  setTeacherCommentForReport,
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';

const DEFAULT_PROPS = {
  studioUrlPrefix: 'https://studio.code.org',
  marketingUrlPrefix: 'https://code.org',
  sectionId: 1,
  sectionName: 'My Section',
  studentCount: 5,
  sectionVersionId: 2,
  anyStudentHasProgress: true,
};

describe('TeacherDashboard', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
      manageStudents,
      sectionStandardsProgress,
      sectionAssessments,
    });

    store = createStore(5, 5);
    store.dispatch(setScriptId(1));
    store.dispatch(setTeacherCommentForReport('Comment!'));

    jest
      .spyOn(progressLoader, 'loadUnitProgress')
      .mockClear()
      .mockImplementation();

    jest.spyOn($, 'getJSON').mockClear().mockImplementation();

    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!',
      },
    });
  });

  afterEach(() => {
    restoreRedux();
    progressLoader.loadUnitProgress.mockRestore();
    $.getJSON.mockRestore();
    restoreOnWindow('opener');
  });

  function renderDefault(
    initialEntries = ['/manage_students'],
    propOverrides = {}
  ) {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <TeacherDashboard {...DEFAULT_PROPS} {...propOverrides} />
        </MemoryRouter>
      </Provider>
    );
  }

  it('renders TeacherDashboardHeader', () => {
    renderDefault();
    screen.getByText('Edit Section Details');
  });

  it('does not render TeacherDashboardHeader on /login_info', () => {
    renderDefault(['/login_info']);
    expect(screen.queryByText('Edit Section Details')).toBeNull();
  });

  it('does not render TeacherDashboardHeader on /standards_report', () => {
    renderDefault(['/standards_report']);
    expect(screen.queryByText('Edit Section Details')).toBeNull();
  });

  it('defaults to progress tab if no tab provided in route', () => {
    renderDefault(['/']);
    screen.getByTestId('section-progress', {exact: false});
  });

  it('defaults to progress tab if incorrect tab provided in route', () => {
    renderDefault(['/some_fake_path']);
    screen.getByTestId('section-progress', {exact: false});
  });

  it('defaults to manage students tab if no tab provided in route and section has 0 students', () => {
    renderDefault(['/'], {studentCount: 0});
    screen.getByTestId('manage-students-tab');
  });

  it('defaults to manage students tab if incorrect tab provided in route and section has 0 students', () => {
    renderDefault(['/some-fake-path'], {studentCount: 0});
    screen.getByTestId('manage-students-tab');
  });

  it('does not override given path if there are students and path is legitimate', () => {
    renderDefault(['/assessments']);
    screen.getByTestId('assessments-tab');
  });
});
