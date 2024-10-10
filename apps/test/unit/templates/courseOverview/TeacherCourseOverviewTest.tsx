import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import announcements from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
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
  announcements: [],
  has_verified_resources: false,
};

// const fakeTeacherAnnouncement = {
//   notice: 'Notice - Teacher',
//   details: 'Teachers are the best',
//   link: '/foo/bar/teacher',
//   type: NotificationType.information,
//   visibility: VisibilityType.teacher,
// };
// const fakeStudentAnnouncement = {
//   notice: 'Notice - Student',
//   details: 'Students are the best',
//   link: '/foo/bar/student',
//   type: NotificationType.information,
//   visibility: VisibilityType.student,
// };
// const fakeTeacherAndStudentAnnouncement = {
//   notice: 'Notice - Teacher And Student',
//   details: 'More detail here',
//   link: '/foo/bar/teacherAndStudent',
//   type: NotificationType.information,
//   visibility: VisibilityType.teacherAndStudent,
// };

const sections = [
  {
    id: 11,
    name: 'Period 1',
    course_id: 30,
    unitName: 'csd1-2024',
    courseVersionName: 'csd-2024',
    scriptId: 1,
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
    });

    store.dispatch(setInitialData({id: 1}));

    store.dispatch(setSections(sections));
    store.dispatch(selectSection(12));

    // jest.spyOn(globalAny, 'fetch').mockImplementation(
    //   jest.fn(() =>
    //     Promise.resolve({
    //       json: () =>
    //         Promise.resolve({
    //
    //         }),
    //     })
    //   ) as jest.Mock
    // );
    HttpClient.fetchJson = jest.fn().mockResolvedValue({
      value: {
        unit_group: COURSE_SUMMARY,
        is_verified_instructor: true,
        hidden_scripts: [],
      },
      response: new Response(),
    });
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
  });
});
