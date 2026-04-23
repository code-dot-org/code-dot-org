import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import DemoSectionOptionsDropdown from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/DemoSectionOptionsDropdown';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const LocationElement = () => {
  const location = useLocation();
  return <div>{location.pathname}</div>;
};

const SECTION: Section = {
  id: 0,
  name: 'High School Practice Section',
  hidden: false,
  code: 'DEMO-123',
  courseVersionName: 'csd-2024',
  unitName: 'csd3-2024',
  unitPosition: null,
  aiTutorEnabled: false,
  atRiskAgeGatedDate: new Date(),
  atRiskAgeGatedUsState: 'ca',
  anyStudentHasProgress: false,
  codeReviewExpiresAt: null,
  course: null,
  courseDisplayName: 'Computer Science Discoveries',
  courseId: 1,
  courseOfferingId: 1,
  courseVersionId: 1,
  createdAt: '2024-10-04T18:19:41.000Z',
  grades: [],
  isAssignedCSA: false,
  lessonExtras: false,
  loginType: 'picture',
  loginTypeName: 'Picture Password',
  pairingAllowed: false,
  participantType: 'student',
  postMilestoneDisabled: false,
  providerManaged: false,
  restrictSection: false,
  sectionInstructors: [],
  sharingDisabled: false,
  studentCount: 3,
  syncEnabled: false,
  ttsAutoplayEnabled: false,
  unitId: 1,
};

const RESOLVED_SECTION: Section = {
  ...SECTION,
  id: 11,
};

const STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Bobby',
    familyName: 'Hill',
    username: '',
    email: '',
    age: '',
    gender: '',
    genderTeacherInput: '',
    secretWords: '',
    secretPictureUrl: '',
    loginType: '',
    sectionId: 11,
    sharingDisabled: false,
    hasEverSignedIn: true,
    dependsOnThisSectionForLogin: true,
    isEditing: false,
    isSaving: false,
    rowType: '',
    userType: 'student',
    atRiskAgeGatedDate: new Date(),
    childAccountComplianceState: '',
    latestPermissionRequestSentAt: new Date(),
    usState: '',
  },
];

describe('DemoSectionOptionsDropdown', () => {
  let resolveSectionForAction: jest.Mock;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSectionForAction = jest.fn().mockResolvedValue(RESOLVED_SECTION);
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: STUDENTS,
      response: new Response(),
    });
    HTMLFormElement.prototype.submit = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(initialRoute = '/teacher_dashboard/home') {
    return render(
      <RouterProvider
        router={createMemoryRouter(
          createRoutesFromElements([
            <Route path="/">
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={
                  <DemoSectionOptionsDropdown
                    section={SECTION}
                    resolveSectionForAction={resolveSectionForAction}
                  />
                }
              />
              <Route
                path={TEACHER_NAVIGATION_SECTIONS_URL}
                element={<Outlet />}
              >
                <Route path={SPECIFIC_SECTION_BASE_URL} element={<Outlet />}>
                  <Route
                    path={TEACHER_NAVIGATION_PATHS.settings}
                    element={<LocationElement />}
                  />
                  <Route
                    path={TEACHER_NAVIGATION_PATHS.roster}
                    element={<LocationElement />}
                  />
                  <Route
                    path={TEACHER_NAVIGATION_PATHS.loginInfo}
                    element={<LocationElement />}
                  />
                </Route>
              </Route>
            </Route>,
          ]),
          {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
        )}
      />
    );
  }

  it('creates a section and navigates to settings', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(i18n.sectionSettings()));

    await act(async () => await new Promise(process.nextTick));

    expect(resolveSectionForAction).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_SETTINGS_CLICKED,
      'settings'
    );
    screen.getByText('/sections/11/settings');
  });

  it('creates a section and prints certificates for the resolved section', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(i18n.certificates()));

    await act(async () => await new Promise(process.nextTick));

    expect(resolveSectionForAction).toHaveBeenCalledWith(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      'certificates'
    );
    expect(fetchSpy).toHaveBeenCalledWith('/dashboardapi/sections/11/students');
    expect(HTMLFormElement.prototype.submit).toHaveBeenCalled();
  });

  it('swallows create failures and allows retrying the menu action', async () => {
    resolveSectionForAction
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(RESOLVED_SECTION);

    renderComponent();

    fireEvent.click(screen.getByText(i18n.sectionSettings()));
    await act(async () => await new Promise(process.nextTick));

    fireEvent.click(screen.getByText(i18n.sectionSettings()));
    await act(async () => await new Promise(process.nextTick));

    expect(resolveSectionForAction).toHaveBeenCalledTimes(2);
    screen.getByText('/sections/11/settings');
  });
});
