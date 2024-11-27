import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import announcements, {
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import TeacherCourseOverview from '@cdo/apps/templates/courseOverview/TeacherCourseOverview';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {LABELED_TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue(Promise.resolve('authToken')),
}));

jest.mock('@cdo/apps/code-studio/initSigninState', () => ({
  getUserSignedInFromCookieAndDom: jest.fn().mockReturnValue({
    signedIn: true,
    userType: 'teacher',
  }),
}));

const navigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigate,
}));

const fakeTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher,
};

const COURSE_SUMMARY = {
  name: 'csp',
  title: 'Computer Science Principles 2017',
  assignment_family_title: 'Computer Science Principles',
  id: 30,
  course_offering_id: 1,
  course_version_id: 1,
  description_student:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  description_teacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  teacher_resources: [],
  student_resources: [],
  scripts: [
    {
      course_id: 30,
      id: 112,
      title: 'CSP Unit 1',
      name: 'csp1',
      description: 'desc',
    },
    {
      course_id: 30,
      id: 113,
      title: 'CSP Unit 2',
      name: 'csp2',
      description: 'desc',
    },
  ],
  show_assign_button: true,
  participant_audience: 'Student',
  course_versions: {},
  announcements: [fakeTeacherAnnouncement],
  has_verified_resources: false,
};

const sections = [
  {
    id: 11,
    name: 'Period 1',
    course_id: null,
    unitName: 'coursea-2024',
    courseVersionName: 'coursea-2024',
    scriptId: 2,
  },
  {
    id: 12,
    name: 'Period 2',
    course_id: 30,
    unitName: 'csd1-2024',
    courseVersionName: 'csd-2024',
    scriptId: 1,
  },
  {
    id: 13,
    name: 'Period 3',
    course_id: 30,
    unitName: null,
    courseVersionName: 'csd-2024',
    scriptId: null,
  },
];

describe('TeacherCourseOverview', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    const store = getStore();

    registerReducers({
      teacherSections,
      currentUser,
      verifiedInstructor,
      announcements,
      viewAs,
      hiddenLesson,
      progress,
      isRtl,
    });

    store.dispatch(setInitialData({id: 1}));

    store.dispatch(setSections(sections));
    store.dispatch(selectSection(12));

    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: {
        unit_group: COURSE_SUMMARY,
        is_verified_instructor: true,
        hidden_scripts: [],
      },
      response: new Response(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function renderDefault(initialRoute = '/sections/12/courses/csd-2024') {
    render(
      <Provider store={getStore()}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={
                  LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl
                }
                element={<TeacherCourseOverview />}
              />,
            ]),
            {initialEntries: [initialRoute]}
          )}
        />
      </Provider>
    );
  }

  it('renders course overview', async () => {
    renderDefault();

    await screen.findByText('Computer Science Principles');
    screen.getByText('Teacher description');
    // renders announcement
    screen.getByText('Teachers are the best');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('redirects to course if no course name in URL', async () => {
    renderDefault('/sections/12/courses/');

    expect(navigate).toHaveBeenCalledWith('../courses/csd-2024', {
      replace: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('redirects to course if wrong course in URL', async () => {
    renderDefault('/sections/12/courses/csp-2024');

    expect(navigate).toHaveBeenCalledWith('../courses/csd-2024', {
      replace: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('redirects to unit if standalone unit', async () => {
    getStore().dispatch(selectSection(11));

    renderDefault('/sections/11/courses/csd-2024');

    expect(navigate).toHaveBeenCalledWith('../unit/coursea-2024', {
      replace: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows loading spinner while fetching data', async () => {
    HttpClient.fetchJson = jest.fn().mockResolvedValue(new Promise(() => {}));

    renderDefault();

    screen.getByTitle('Loading...');
  });
});
