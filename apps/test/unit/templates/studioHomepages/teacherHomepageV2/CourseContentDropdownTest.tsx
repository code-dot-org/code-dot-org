import {render, screen, act} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {Store} from 'redux';

import {getStore} from '@cdo/apps/redux';
import {CourseContentDropdown} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/CourseContentDropdown';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('CourseContentDropdown', () => {
  const nonUnitSection: Section = {
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
  };

  const unitSection: Section = {
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
    unitId: 1,
  };

  const lessons = [
    {
      text: "Unit 3 - Interactive Animations and Games ('24-'25)",
      value: '/unit/csd3-2024',
    },
    {
      text: '1: Programming for a Purpose',
      value: '/s/csd3-2024/lessons/1/levels/1',
    },
    {
      text: '2: Plotting Shapes',
      value: '/s/csd3-2024/lessons/2/levels/1',
    },
    {
      text: '3: Drawing in Game Lab',
      value: '/s/csd3-2024/lessons/3/levels/1',
    },
    {
      text: '4: Shapes and Parameters',
      value: '/s/csd3-2024/lessons/4/levels/1',
    },
  ];

  const store: Store = getStore();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: lessons,
      response: new Response(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(
    section = nonUnitSection,
    initialRoute = '/teacher_dashboard/home'
  ) {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={<CourseContentDropdown section={section} />}
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('renders course display name', () => {
    renderComponent();
    screen.getByText("Computer Science Discoveries ('24-'25)");
  });

  it('renders section Go to Course page button when no unit is assigned', () => {
    renderComponent();
    screen.getByText('Go to Course page');
  });

  it('renders Go to a lesson dropdown when a unit is assigned', async () => {
    renderComponent(unitSection);
    await act(async () => await new Promise(process.nextTick));
    expect(fetchSpy).toHaveBeenCalled();
    screen.getByLabelText('Go to a lesson');
  });
});
