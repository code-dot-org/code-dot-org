import {fireEvent, render, screen, act} from '@testing-library/react';
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

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import SectionOptionsDropdown from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionOptionsDropdown';
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
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
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
    unitPosition: null,
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
    studentCount: 0,
    syncEnabled: false,
    ttsAutoplayEnabled: false,
    unitId: null,
  },
  {
    id: 12,
    name: 'Period 2',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    unitPosition: null,
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
    studentCount: 2,
    syncEnabled: false,
    ttsAutoplayEnabled: false,
    unitId: null,
  },
];

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
    sectionId: 12,
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
  {
    id: 1,
    name: 'Daria',
    familyName: 'Morgendorffer',
    username: '',
    email: '',
    age: '',
    gender: '',
    genderTeacherInput: '',
    secretWords: '',
    secretPictureUrl: '',
    loginType: '',
    sectionId: 12,
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

const navigate = jest.fn();

describe('SectionOptionsDropdown', () => {
  const store: Store = getStore();
  registerReducers({teacherSections});
  store.dispatch(setSections(SECTIONS));
  store.dispatch(selectSection(11));

  let sendEventSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate,
    }));
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: STUDENTS,
      response: new Response(),
    });
    $.ajax = jest.fn().mockImplementation(() => {
      const deferred = $.Deferred();
      deferred.resolve({data: 'success'});
      return deferred.promise();
    });
    HTMLFormElement.prototype.submit = jest.fn();
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
                  element={
                    <SectionOptionsDropdown
                      section={section}
                      onDeleteClickCallback={() => {}}
                    />
                  }
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
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_SETTINGS_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('displays roster option to navigate to roster page', () => {
    renderComponent();
    const link = screen.getByText(i18n.roster());
    fireEvent.click(link);
    screen.getByText('/sections/11/roster');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_ROSTER_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('displays login cards option to navigate to login_info page', () => {
    renderComponent();
    const link = screen.getByText(i18n.loginCards());
    fireEvent.click(link);
    screen.getByText('/sections/11/login_info');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('displays certificates option to print student certificates', async () => {
    renderComponent();
    const link = screen.getByText(i18n.certificates());
    fireEvent.click(link);
    await act(async () => await new Promise(process.nextTick));
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    expect(fetchSpy).toHaveBeenCalledWith('/dashboardapi/sections/11/students');
  });

  it('displays archive option to hide / restore section', () => {
    renderComponent();
    const archiveLink = screen.getByText(i18n.archive());
    fireEvent.click(archiveLink);
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_ARCHIVE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('displays delete option to initiate section delete', () => {
    renderComponent();

    const link = screen.getByText(i18n.delete());
    fireEvent.click(link);
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_DELETE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  it('does not display delete option if section has students', async () => {
    renderComponent(SECTIONS[1]);
    expect(screen.queryByText(i18n.delete())).toBeNull();
  });
});
