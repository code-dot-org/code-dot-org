import '@testing-library/jest-dom';
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

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SectionCard} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionCard';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

jest.mock('@cdo/apps/util/copyToClipboard');

describe('SectionCard', () => {
  const section: Section = {
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
    studentCount: 1,
    syncEnabled: false,
    ttsAutoplayEnabled: false,
    unitId: null,
    avatar_color: 1,
    avatar_emoji: 1,
  };

  const store: Store = getStore();
  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

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
                element={
                  <SectionCard
                    studioUrlPrefix="https://studio.code.org"
                    id={section.id}
                    section={section}
                    onDeleteClickCallback={() => {}}
                  />
                }
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
    renderComponent();
    const link = screen.getByRole('button', {name: 'ABCDEF'});
    fireEvent.click(link);

    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://studio.code.org/join/ABCDEF'
    );
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.SECTION_CARD_CLASS_CODE_CLICKED,
      {source: 'teacherHomepage'},
      PLATFORMS.BOTH
    );
  });

  it('renders section options dropdown', () => {
    renderComponent();
    screen.getByLabelText('Section options dropdown');
  });

  it('renders section options dropdown', () => {
    renderComponent();
    screen.getByLabelText('Section options dropdown');
  });

  it('renders the SectionAvatar component', () => {
    renderComponent();
    screen.getByText('🐧');
  });
});
