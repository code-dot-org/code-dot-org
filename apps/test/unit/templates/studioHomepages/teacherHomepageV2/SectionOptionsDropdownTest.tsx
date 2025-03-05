import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import {Store} from 'redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import {SectionOptionsDropdown} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionOptionsDropdown';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

const LocationElement = () => {
  const location = useLocation();
  return <div>{location.pathname}</div>;
};

const SECTIONS: Section[] = [
  {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    aiTutorEnabled: false,
    atRiskAgeGatedDate: new Date(),
    atRiskAgeGatedUsState: 'xyz',
    anyStudentHasProgress: false,
    code: 'ABCDEF',
    codeReviewExpiresAt: null,
    course: null,
    courseDisplayName: "Computer Science Discoveries ('24-'25)",
    courseId: 52,
    courseOfferingId: 192,
    courseVersionId: 553,
    createdAt: '2024-10-04T18:19:41.000Z',
    grades: [],
    isAssignedCSA: false,
    isAssignedStandaloneCourse: false,
    lessonExtras: false,
    loginType: 'picture',
    loginTypeName: 'Picture Password',
    pairingAllowed: false,
    participantType: undefined,
    postMilestoneDisabled: false,
    providerManaged: false,
    restrictSection: false,
    sectionInstructors: [],
    sharingDisabled: false,
    studentCount: 1,
    syncEnabled: false,
    ttsAutoplayEnabled: false,
    unitId: null,
  },
];

const navigate = jest.fn();

describe('SectionOptionsDropdown', () => {
  const store: Store = getStore();
  registerReducers({teacherSections});
  store.dispatch(setSections(SECTIONS));
  store.dispatch(selectSection(11));

  beforeEach(() => {
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(
    section: Section = SECTIONS[0],
    initialRoute = '/teacher_dashboard/home'
  ) {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route path="/">
                <Route
                  path={TEACHER_NAVIGATION_PATHS.home}
                  element={<SectionOptionsDropdown sectionId={section.id} />}
                />
                <Route
                  path={TEACHER_NAVIGATION_SECTIONS_URL}
                  element={
                    <div>
                      <Outlet />
                    </div>
                  }
                >
                  <Route
                    path={SPECIFIC_SECTION_BASE_URL}
                    element={
                      <div>
                        <Outlet />
                      </div>
                    }
                  >
                    <Route
                      path={TEACHER_NAVIGATION_PATHS.settings}
                      element={
                        <div>
                          <LocationElement />
                        </div>
                      }
                    />
                    <Route
                      path={TEACHER_NAVIGATION_PATHS.roster}
                      element={
                        <div>
                          <LocationElement />
                        </div>
                      }
                    />
                    <Route
                      path={TEACHER_NAVIGATION_PATHS.loginInfo}
                      element={
                        <div>
                          <LocationElement />
                        </div>
                      }
                    />
                  </Route>
                </Route>
              </Route>,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('displays section settings option to navigate to settings page', () => {
    renderComponent();
    const link = screen.getByText(i18n.sectionSettings());
    fireEvent.click(link);
    screen.getByText('/sections/11/settings');
  });

  it('displays roster option to navigate to roster page', () => {
    renderComponent();
    const link = screen.getByText(i18n.roster());
    fireEvent.click(link);
    screen.getByText('/sections/11/roster');
  });

  it('displays login cards option to navigate to login_info page', () => {
    renderComponent();
    const link = screen.getByText(i18n.loginCards());
    fireEvent.click(link);
    screen.getByText('/sections/11/login_info');
  });
});
