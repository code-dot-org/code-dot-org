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

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SectionOptionsDropdown} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionOptionsDropdown';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

describe('SectionOptionsDropdown', () => {
  const cdo_section: Section = {
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

  const google_section: Section = {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    aiTutorEnabled: false,
    atRiskAgeGatedDate: new Date(),
    atRiskAgeGatedUsState: 'xyz',
    anyStudentHasProgress: false,
    code: 'G-ABCDEF',
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
    loginType: 'google_classroom',
    loginTypeName: 'Google Classroom',
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

  const clever_section: Section = {
    id: 11,
    name: 'Period 1',
    hidden: false,
    courseVersionName: 'csd-2024',
    unitName: null,
    aiTutorEnabled: false,
    atRiskAgeGatedDate: new Date(),
    atRiskAgeGatedUsState: 'xyz',
    anyStudentHasProgress: false,
    code: 'C-ABCDEF',
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
    loginType: 'clever',
    loginTypeName: 'Clever',
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

  let sendEventSpy: jest.SpyInstance;

  beforeEach(() => {
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(
    section = cdo_section,
    initialRoute = '/teacher_dashboard/home'
  ) {
    return render(
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(
            createRoutesFromElements([
              <Route
                path={TEACHER_NAVIGATION_PATHS.home}
                element={
                  <SectionOptionsDropdown
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

  it('displays Google sync option if section is linked to Google Classroom', () => {
    renderComponent(google_section);
    const sync = screen.getByText(i18n.syncGoogle());
    expect(screen.queryByText(i18n.loginCards())).toBe(null);
    expect(screen.queryByText(i18n.syncCleverDropdown())).toBe(null);
    fireEvent.click(sync);
    expect(sendEventSpy).toHaveBeenCalled();
  });

  it('displays Clever sync option if section is linked to Clever', () => {
    renderComponent(clever_section);
    const sync = screen.getByText(i18n.syncCleverDropdown());
    expect(screen.queryByText(i18n.loginCards())).toBe(null);
    expect(screen.queryByText(i18n.syncGoogle())).toBe(null);
    fireEvent.click(sync);
    expect(sendEventSpy).toHaveBeenCalled();
  });

  it('displays login cards option if section is not LTI linked', () => {
    renderComponent(cdo_section);
    screen.getByText(i18n.loginCards());
    expect(screen.queryByText(i18n.syncCleverDropdown())).toBe(null);
    expect(screen.queryByText(i18n.syncGoogle())).toBe(null);
  });
});
