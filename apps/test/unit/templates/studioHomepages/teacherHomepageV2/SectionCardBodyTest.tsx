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
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {serverSectionFromSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  SPECIFIC_SECTION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

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
  registerReducers({teacherSections});
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(
    section = defaultSection,
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
                      element={<LocationElement />}
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

  it('renders an assigned Instant Section course in one button', () => {
    renderComponent({...defaultSection, isInstantSection: true});

    expect(
      screen.getByRole('link', {
        name: `Course: ${defaultSection.courseDisplayName}`,
      })
    ).toBeInTheDocument();
    expect(screen.queryByText('Go to course')).not.toBeInTheDocument();
    expect(screen.queryByText('View progress')).not.toBeInTheDocument();
    expect(screen.queryByText('View lesson materials')).not.toBeInTheDocument();
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
      expect(screen.getByLabelText('A B C D E F')).toHaveTextContent('ABCDEF');
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

  it('opens the recommended course modal for an Instant Section', async () => {
    const instantSection = {
      ...noCourseSection,
      isInstantSection: true,
      loginType: 'word' as const,
      participantType: 'student',
      courseOfferingId: null,
      courseVersionId: null,
    };
    const fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: [
        {
          key: 'oceans',
          display_name: 'AI for Oceans',
          display_name_with_latest_year: 'AI for Oceans',
          grade_levels: '3,4,5',
          duration: 'hour',
          image: null,
          course_version_path: '/courses/oceans',
          course_version_id: 2,
          course_id: 3,
          course_offering_id: 4,
          is_translated: true,
          ai_chat_tools_dependency: 'none',
        },
      ],
      response: new Response(),
    });
    const serverSection = {
      ...serverSectionFromSection(instantSection),
      instant_section: true,
    };
    store.dispatch(setSections([serverSection], false));
    const ajaxSpy = jest.spyOn($, 'ajax').mockImplementation(() => {
      const deferred = $.Deferred();
      deferred.resolve({
        ...serverSection,
        course_id: 3,
        course_offering_id: 4,
        course_version_id: 2,
        course_display_name: 'AI for Oceans',
      });
      return deferred.promise() as unknown as JQuery.jqXHR;
    });

    renderComponent(instantSection);
    fireEvent.click(screen.getByRole('button', {name: 'Assign a course'}));

    expect(
      await screen.findByRole('heading', {
        name: 'Recommended for your Instant Section',
      })
    ).toBeInTheDocument();
    expect(await screen.findByText('AI for Oceans')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith(
      '/course_offerings/instant_section_course_offerings'
    );
    expect(screen.queryByRole('button', {name: /Quick View/})).toBeNull();
    expect(screen.queryByText(/Grades:/)).toBeNull();

    const assignButton = screen.getByRole('button', {name: 'Assign'});
    expect(assignButton).toBeDisabled();
    const courseTile = screen.getByRole('button', {name: 'AI for Oceans'});
    expect(courseTile).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(courseTile);
    expect(courseTile).toHaveAttribute('aria-pressed', 'true');
    expect(assignButton).toBeEnabled();
    fireEvent.click(assignButton);
    await waitFor(() => expect(ajaxSpy).toHaveBeenCalledTimes(1));
    expect(ajaxSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/dashboardapi/sections/11',
        method: 'PATCH',
      })
    );
    const request = ajaxSpy.mock.calls[0]?.[0];
    if (!request) {
      throw new Error('Expected a section update request');
    }
    expect(JSON.parse(request.data as string)).toEqual(
      expect.objectContaining({
        course_id: 3,
        course_offering_id: 4,
        course_version_id: 2,
        unit_id: null,
      })
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', {
          name: 'Recommended for your Instant Section',
        })
      ).not.toBeInTheDocument()
    );
  });
});
