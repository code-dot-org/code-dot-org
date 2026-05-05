import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import DemoSectionOptionsDropdown from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/DemoSectionOptionsDropdown';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import {Student} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const SECTION: Section = {
  id: 0,
  name: 'High School Practice Section',
  hidden: false,
  code: 'DEMO-123',
  courseVersionName: 'csd-2024',
  unitName: 'csd3-2024',
  unitPosition: null,
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
  let handleNavigationClick: jest.Mock;
  let createSectionForAction: jest.Mock;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    handleNavigationClick = jest.fn().mockResolvedValue(undefined);
    createSectionForAction = jest.fn().mockResolvedValue(RESOLVED_SECTION);
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
      value: STUDENTS,
      response: new Response(),
    });
    HTMLFormElement.prototype.submit = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent(disabled = false) {
    return render(
      <DemoSectionOptionsDropdown
        section={SECTION}
        disabled={disabled}
        handleNavigationClick={handleNavigationClick}
        createSectionForAction={createSectionForAction}
      />
    );
  }

  it('handles settings navigation clicks', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(i18n.sectionSettings()));

    await act(async () => await new Promise(process.nextTick));

    expect(handleNavigationClick).toHaveBeenCalledWith(
      TEACHER_NAVIGATION_PATHS.settings,
      EVENTS.SECTION_CARD_SETTINGS_CLICKED
    );
    expect(createSectionForAction).not.toHaveBeenCalled();
  });

  it('handles login card navigation clicks', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(i18n.loginCards()));

    await act(async () => await new Promise(process.nextTick));

    expect(handleNavigationClick).toHaveBeenCalledWith(
      TEACHER_NAVIGATION_PATHS.loginInfo,
      EVENTS.SECTION_CARD_LOGIN_CARDS_CLICKED
    );
  });

  it('creates a section and prints certificates for the resolved section', async () => {
    renderComponent();

    fireEvent.click(screen.getByText(i18n.certificates()));

    await act(async () => await new Promise(process.nextTick));

    expect(createSectionForAction).toHaveBeenCalledWith(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      'certificates'
    );
    expect(handleNavigationClick).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith('/dashboardapi/sections/11/students');
    expect(HTMLFormElement.prototype.submit).toHaveBeenCalled();
  });

  it('does not handle menu actions when disabled', async () => {
    renderComponent(true);

    fireEvent.click(screen.getByText(i18n.sectionSettings()));
    fireEvent.click(screen.getByText(i18n.certificates()));

    expect(handleNavigationClick).not.toHaveBeenCalled();
    expect(createSectionForAction).not.toHaveBeenCalled();
  });

  it('swallows certificate create failures', async () => {
    createSectionForAction.mockRejectedValueOnce(new Error('boom'));

    renderComponent();

    fireEvent.click(screen.getByText(i18n.certificates()));
    await act(async () => await new Promise(process.nextTick));

    expect(createSectionForAction).toHaveBeenCalledWith(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      'certificates'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(HTMLFormElement.prototype.submit).not.toHaveBeenCalled();
  });
});
