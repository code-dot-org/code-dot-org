import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {Store} from 'redux';

import announcements from '@cdo/apps/code-studio/announcementsRedux';
import TeacherUnitOverview from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import progress from '@cdo/apps/code-studio/progressRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSectionsRedux, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {LABELED_TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

const SECTIONS = [
  {
    id: 11,
    name: 'Period 1',
    course_id: null,
    unitName: 'coursea-2024',
    courseOfferingId: 1,
    courseVersionName: 'coursea-2024',
    courseVersionId: 1,
    scriptId: 2,
  },
  {
    id: 12,
    name: 'Period 2',
    course_id: 30,
    unitName: 'csd1-2024',
    courseOfferingId: 2,
    courseVersionName: 'csd-2024',
    courseVersionId: 2,
    scriptId: 1,
  },
  {
    id: 13,
    name: 'Period 3',
    course_id: 30,
    unitName: null,
    courseOfferingId: 2,
    courseVersionName: 'csd-2024',
    courseVersionId: 2,
    scriptId: null,
  },
];

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

const navigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigate,
}));

// Note: Uncaught [Error: Unmounting a ProtectedStatefulDiv is not allowed.] is an expected error.
// This is caused by UnitOverviewHeader adding a ProtectedStatefulDiv if we are not on the teacher dashboard.
// This test doesn't set the URL for `location.pathname` and so we get this error.

describe('TeacherUnitOverview Component', () => {
  let store: Store;

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    store = getStore();

    registerReducers({
      locales,
      announcements,
      teacherSectionsRedux,
      currentUser,
      progress,
    });

    store.dispatch(setLocaleCode('en-US'));

    store.dispatch(setInitialData({id: 1, user_type: 'teacher'}));
    store.dispatch(setSections(SECTIONS));
    store.dispatch(selectSection(12));

    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
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

  function renderDefault(
    initialRoute = '/teacher_dashboard/sections/12/unit/csd1-2024'
  ) {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={LABELED_TEACHER_NAVIGATION_PATHS.unitOverview.absoluteUrl}
                element={<TeacherUnitOverview />}
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('renders unit overview', async () => {
    renderDefault();

    await screen.findByText("Unit 1 - Problem Solving and Computing ('23-'24)");
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('navigates to unit if no unit is specified in URL', async () => {
    renderDefault('/teacher_dashboard/sections/12/unit');

    expect(navigate).toHaveBeenCalledWith('/sections/12/unit/csd1-2024', {
      replace: true,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows loading spinner while fetching data', async () => {
    fetchSpy.mockResolvedValue(new Promise(() => {}));
    renderDefault();

    await screen.findByTitle('Loading...');
  });
});
