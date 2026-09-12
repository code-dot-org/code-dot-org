import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
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

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import SectionCardBody from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionCardBody';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import DashboardSectionSettings from '@cdo/apps/templates/teacherNavigation/DashboardSectionSettings';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import * as windowUtils from '@cdo/apps/utils';

const LocationElement = () => {
  const location = useLocation();
  return <div>{location.pathname}</div>;
};

describe('SectionCardBody', () => {
  const defaultSection: Section = {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    unitPosition: null,
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
    studentCount: 1,
    syncEnabled: false,
    ttsAutoplayEnabled: false,
    unitId: null,
  };

  const noCourseSection: Section = {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: '',
    unitName: null,
    unitPosition: null,
    atRiskAgeGatedDate: new Date(),
    atRiskAgeGatedUsState: 'xyz',
    anyStudentHasProgress: false,
    code: 'ABCDEF',
    codeReviewExpiresAt: null,
    course: null,
    courseDisplayName: '',
    courseId: null,
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
  };

  const noStudentsection: Section = {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    unitPosition: null,
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
  };

  const store: Store = getStore();
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(
    section = defaultSection,
    initialRoute = '/teacher_dashboard/home',
    useSettingsPage = false
  ) {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route path="/">
                <Route
                  path={TEACHER_NAVIGATION_PATHS.home}
                  element={<SectionCardBody section={section} />}
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
                      path={TEACHER_NAVIGATION_PATHS.progress}
                      element={
                        <div>
                          <LocationElement />
                        </div>
                      }
                    />
                    <Route
                      path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
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
                      path={TEACHER_NAVIGATION_PATHS.settings}
                      element={
                        useSettingsPage ? (
                          <DashboardSectionSettings redirectUrl="/teacher_dashboard/sections/11/progress" />
                        ) : (
                          <LocationElement />
                        )
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

  it('renders section content dropdown component with course display name', () => {
    renderComponent();
    screen.getByText('Course:');
    screen.getByText("Computer Science Discoveries ('24-'25)");
  });

  it('renders task button with link to section progress', () => {
    renderComponent();
    const progressButton = screen.getByText('View progress');
    fireEvent.click(progressButton);
    screen.getByText('/sections/11/progress');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_VIEW_PROGRESS_CLICKED,
      {}
    );
  });

  it('renders task button with link to lesson materials', () => {
    renderComponent();
    const materialsButton = screen.getByText('View lesson materials');
    fireEvent.click(materialsButton);
    screen.getByText('/sections/11/materials');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_VIEW_LESSON_MATERIALS_CLICKED,
      {}
    );
  });

  it('renders empty state button when no course is assigned', () => {
    renderComponent(noCourseSection);
    screen.getByText('Assign a course');
  });

  it('renders student count alert when no course is assigned but students are enrolled', () => {
    renderComponent(noCourseSection);
    screen.getByText('2 students added');
  });

  it('renders empty state button when no students have been added', () => {
    renderComponent(noStudentsection);
    expect(
      screen.queryByRole('button', {name: /Show join code/})
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Add students'));
    screen.getByText('/sections/11/roster');
  });

  it.each([
    {studentCount: 0, courseId: null},
    {studentCount: 2, courseId: null},
    {studentCount: 0, courseId: 52},
    {studentCount: 2, courseId: 52},
  ])(
    'reopens the Instant Section code with $studentCount students and course $courseId',
    ({studentCount, courseId}) => {
      renderComponent({
        ...defaultSection,
        isInstantSection: true,
        loginType: 'word',
        studentCount,
        courseId,
      });
      const trigger = screen.getByRole('button', {
        name: `Show join code (${studentCount} joined so far)`,
      });
      expect(screen.queryByText(/students added/)).not.toBeInTheDocument();
      expect(screen.queryByText('Add students')).not.toBeInTheDocument();
      trigger.focus();
      fireEvent.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('ABCDEF')).toBeInTheDocument();
      expect(screen.getByText('code.org/join')).toBeInTheDocument();
      fireEvent.keyDown(document, {key: 'Escape'});
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();

      fireEvent.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    }
  );

  it('opens the existing section settings page and returns home after conversion', async () => {
    registerReducers({teacherSections});
    const instantSection = {
      ...noCourseSection,
      isInstantSection: true,
      loginType: 'word' as const,
      participantType: 'student',
      courseOfferingId: null,
      courseVersionId: null,
    };
    const serverSection = {
      ...serverSectionFromSection(instantSection),
      instant_section: true,
    };
    store.dispatch(setSections([serverSection], false));
    store.dispatch(selectSection(11));
    const navigateSpy = jest
      .spyOn(windowUtils, 'navigateToHref')
      .mockImplementation(() => {});
    const fetchSpy = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    renderComponent(instantSection, '/teacher_dashboard/home', true);
    const link = screen.getByRole('link', {name: 'Convert to regular section'});
    expect(link).toHaveAttribute(
      'href',
      '/teacher_dashboard/sections/11/settings?convertInstantSection=true'
    );
    fireEvent.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const nameField = await screen.findByRole('textbox', {name: /Class name/i});
    expect(nameField).toHaveValue('Period 1');
    fireEvent.change(nameField, {target: {value: 'Period 2'}});
    fetchSpy.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    expect(fetchSpy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', {name: '3'}));
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...serverSection,
        instant_section: false,
        name: 'Period 2',
        grades: ['3'],
      }),
    } as Response);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    await waitFor(() =>
      expect(navigateSpy).toHaveBeenCalledWith(
        window.location.origin + '/teacher_dashboard/home'
      )
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/sections/11',
      expect.objectContaining({method: 'PATCH'})
    );
    expect(JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)).toEqual(
      expect.objectContaining({
        id: 11,
        name: 'Period 2',
        grades: ['3'],
        convert_instant_section: true,
      })
    );
  });
});
