import {fireEvent, render, screen} from '@testing-library/react';
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
import {SectionCard} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionCard';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import * as urlHelpers from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

describe('SectionCard', () => {
  const section: Section = {
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

  const store: Store = getStore();

  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(initialRoute = '/teacher_dashboard/home') {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={<SectionCard section={section} />}
              />,
            ]),
            {initialEntries: [initialRoute], basename: '/teacher_dashboard'}
          )}
        />
      </Provider>
    );
  }

  it('renders section name in header', () => {
    renderComponent();
    screen.getByText('Period 1');
  });

  it('renders section class code with login info link', () => {
    const teacherDashboardUrlSpy = jest.spyOn(
      urlHelpers,
      'teacherDashboardUrl'
    );

    renderComponent();
    const link = screen.getByText('ABCDEF');
    fireEvent.click(link);
    expect(teacherDashboardUrlSpy).toHaveBeenCalled();
  });

  it('renders section options dropdown', () => {
    renderComponent();
    screen.getByLabelText('Section options dropdown');
  });
});
