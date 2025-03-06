import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {SectionCard} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/SectionCard';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import * as urlHelpers from '@cdo/apps/templates/teacherDashboard/urlHelpers';

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

  function renderComponent() {
    return render(<SectionCard section={section} />);
  }

  it('renders section name in header', async () => {
    renderComponent();
    await screen.findByText('Class Code:');
    screen.getByText('Period 1');
  });

  it('renders section class code with login info link', async () => {
    const teacherDashboardUrlSpy = jest.spyOn(
      urlHelpers,
      'teacherDashboardUrl'
    );

    renderComponent();
    await screen.findByText('Class Code:');
    const link = screen.getByText('ABCDEF');
    fireEvent.click(link);
    expect(teacherDashboardUrlSpy).toHaveBeenCalled();
  });
});
