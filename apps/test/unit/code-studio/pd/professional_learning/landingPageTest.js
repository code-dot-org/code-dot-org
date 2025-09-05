import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {selfPacedCourseConstants} from '@cdo/apps/code-studio/pd/professional_learning/constants.js';
import {RegionalLandingPage as LandingPage} from '@cdo/apps/code-studio/pd/professional_learning/LandingPage';
import {
  buildGoogleCalendarLink,
  buildOutlookCalendarLink,
  buildAppleCalendarLink,
} from '@cdo/apps/code-studio/pd/workshop_enrollment/WorkshopEnrollmentCelebrationDialog';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

const TEST_WORKSHOP = {
  id: 1,
  course: 'Test Course 1',
  subject: 'Test Subject',
  dates: '1/1/2000',
  location: 'Address 111',
  sessions: [],
  location_name: '111',
  location_address: 'Address 111',
  on_map: false,
  funded: false,
  virtual: false,
  enrolled_teacher_count: 0,
  capacity: 1,
  facilitators: ['Mx. Facilitator'],
  organizer: {name: 'Mx. Organizer'},
  enrollment_code: 'ABCD',
  status: 'Not Started',
};

const TEST_WORKSHOP_SESSIONS = [
  {
    id: 1,
    start: '2025-01-23 09:00:00',
    end: '2025-01-23 14:00:00',
    is_local: false,
  },
  {
    id: 2,
    start: '2025-01-24 09:00:00',
    end: '2025-01-24 14:00:00',
    is_local: false,
  },
];

const EXPECTED_DESCRIPTION_AND_NOTES =
  'example.zoom.com\n\nAttendee notes:\nPark in the back\n\nDescription:\nReally great workshop';

const EXPECTED_OUTLOOK_DESCRIPTION_AND_NOTES =
  EXPECTED_DESCRIPTION_AND_NOTES.replace(/\n/g, '<br>');

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  showDeeperLearning: true,
  hasEnrorolledInWorkshop: true,
  plCoursesStarted: selfPacedCourseConstants,
  userPermissions: [],
  joinedStudentSections: [],
  joinedPlSections: [],
  coursesAsFacilitator: [],
  plSectionIds: [],
  hiddenPlSectionIds: [],
};

describe('LandingPage', () => {
  let fetchStub;
  let store;
  let defaultCreateObjectURL;
  let blobContentPromise;
  let workshopTitle = 'New Workshop';

  beforeAll(() => {
    defaultCreateObjectURL = window.URL.createObjectURL;
  });

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([TEST_WORKSHOP]),
    });
    let mockCreateObjectUrl = jest.fn().mockImplementation(blob => {
      blobContentPromise = new Promise(res => {
        const fileReader = new FileReader();
        fileReader.onload = () => res(fileReader.result);
        fileReader.readAsText(blob);
      });
      return 'testCreateObjectURL';
    });
    window.URL.createObjectURL = mockCreateObjectUrl;
    stubRedux();
    registerReducers({isRtl, teacherSections});
    store = getStore();
    window.open = jest.fn();
  });

  afterEach(() => {
    restoreRedux();
    window.URL.createObjectURL = defaultCreateObjectURL;
    jest.resetAllMocks();
    blobContentPromise = undefined;
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <LandingPage {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('page shows a getting started banner for a new teacher without an upcoming workshop, self-paced courses, or pl course', async () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
      deeperLearningCourseData: null,
      hasEnrolledInWorkshop: false,
      plCoursesStarted: [],
    });
    screen.getByText(i18n.plLandingGettingStartedHeading());
    expect(screen.queryByText(i18n.plLandingStartSurvey())).toBeFalsy();
    expect(
      screen.queryByText(i18n.plLandingSelfPacedProgressHeading())
    ).toBeFalsy();
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a teacher with a pending survey', () => {
    renderDefault();
    expect(
      screen.queryByText(i18n.plLandingGettingStartedHeading())
    ).toBeFalsy();
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a CSD/CSP teacher with a pending survey', () => {
    renderDefault();
    expect(
      screen.queryByText(i18n.plLandingGettingStartedHeading())
    ).toBeFalsy();
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows upcoming workshops, self-paced courses, and plc enrollments but no survey banner if no pending survey exists', async () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
    });
    expect(
      screen.queryByText(i18n.plLandingGettingStartedHeading())
    ).toBeFalsy();
    expect(screen.queryByText(i18n.plLandingStartSurvey())).toBeFalsy();
    await waitFor(() => {
      screen.getByText(i18n.myWorkshops());
      screen.getByText(TEST_WORKSHOP.location_address);
      screen.getByText(i18n.plLandingSelfPacedProgressHeading());
      screen.getByText(i18n.plLandingStaticPLMidHighHeading());
    });

    fetchStub.mockRestore();
  });

  it('page shows self-paced progress table if enrolled in self-paced courses', () => {
    renderDefault();
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    // eslint-disable-next-line no-restricted-properties
    expect(screen.getAllByTestId('progress-bar').length).toBe(2);
    expect(screen.getByText(i18n.selfPacedPlCompleted()));
    expect(screen.getAllByText(i18n.selfPacedPlContinueCourse()).length).toBe(
      2
    );
    expect(
      screen.getAllByText(i18n.selfPacedPlPrintCertificates()).length
    ).toBe(2);
  });

  it('page shows joined PL sections table', () => {
    renderDefault();

    screen.getByText(i18n.joinedProfessionalLearningSectionsHomepageTitle());
  });

  it('page shows enrolled workshops table', async () => {
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([TEST_WORKSHOP]),
      });

    renderDefault();

    await waitFor(() => {
      screen.getByText(i18n.myWorkshops());
      screen.getByText(TEST_WORKSHOP.location_address);
    });
    fetchStub.mockRestore();
  });

  it('page shows no tabs for teacher with no relevant permissions', () => {
    renderDefault();

    // Should only see the banner header labeled "Professional Learning" but not the tab of the same name
    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(1);
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabInstructorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Facilitator Center tabs for facilitator', () => {
    renderDefault({
      userPermissions: ['facilitator'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    screen.getByText(i18n.plLandingTabFacilitatorCenter());
    expect(screen.queryByText(i18n.plLandingTabInstructorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Facilitator Center tabs for users with facilitator and (universal instructor or peer reviewer) permissions', () => {
    renderDefault({
      userPermissions: ['facilitator', 'universal_instructor', 'plc_reviewer'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    screen.getByText(i18n.plLandingTabFacilitatorCenter());
    expect(screen.queryByText(i18n.plLandingTabInstructorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Instructor Center tabs for universal instructors', () => {
    renderDefault({
      userPermissions: ['universal_instructor'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).toBeNull();
    screen.getByText(i18n.plLandingTabInstructorCenter());
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Instructor Center tabs for peer reviewers', () => {
    renderDefault({
      userPermissions: ['plc_reviewer'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).toBeNull();
    screen.getByText(i18n.plLandingTabInstructorCenter());
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Regional Partner Center tabs for program managers', () => {
    renderDefault({
      userPermissions: ['program_manager'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabInstructorCenter())).toBeNull();
    screen.getByText(i18n.plLandingTabRPCenter());
    expect(
      screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())
    ).toBeNull();
  });

  it('page only shows Professional Learning and Workshop Organizer Center tabs for workshop organizers', () => {
    renderDefault({
      userPermissions: ['workshop_organizer'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).toHaveLength(2);
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabInstructorCenter())).toBeNull();
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).toBeNull();
    screen.getByText(i18n.plLandingTabWorkshopOrganizerCenter());
  });

  it('page shows expected sections in Facilitator Center tab', async () => {
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockImplementation(args => {
        if (args.includes('workshops_user_enrolled_in')) {
          return Promise.resolve({ok: true, json: () => []});
        } else if (args.includes('workshops_as_facilitator_for_pl_page')) {
          return Promise.resolve({
            ok: true,
            json: () => {
              return {workshops_as_facilitator: [TEST_WORKSHOP]};
            },
          });
        }
      });

    await waitFor(() => {
      renderDefault({
        userPermissions: ['facilitator'],
        coursesAsFacilitator: ['CS Discoveries', 'Computer Science A'],
      });
    });
    fireEvent.click(screen.getByText(i18n.plLandingTabFacilitatorCenter()));

    // Last workshop survey banner
    screen.getByText(i18n.plLandingSubheading());

    // Facilitator Resources
    screen.getByText(i18n.plSectionsWorkshopTitle());
    screen.getByText(
      i18n.plSectionsFacilitatorResourcesTitle({
        course_name: 'CSD',
      })
    );
    screen.getByText(
      i18n.plSectionsFacilitatorResourcesTitle({
        course_name: 'CSA',
      })
    );
    screen.getByText(i18n.plSectionsOnboardingTitle());

    // Instructor Professional Learning sections table
    screen.getByText(i18n.plSectionsInstructorTitle());

    // Facilitated workshop table
    screen.getByText(i18n.inProgressAndUpcomingWorkshops());

    fetchStub.mockRestore();
  });

  it('page shows expected sections in Instructor Center tab (for universal instructor)', () => {
    renderDefault({
      userPermissions: ['universal_instructor'],
    });
    fireEvent.click(
      screen.getAllByText(i18n.plLandingTabInstructorCenter())[0]
    );

    // Instructor Professional Learning sections table
    screen.getByText(i18n.plSectionsInstructorTitle());
  });

  it('page shows expected sections in Instructor Center tab (for peer reviewer)', () => {
    renderDefault({
      userPermissions: ['plc_reviewer'],
    });
    fireEvent.click(screen.getByText(i18n.plLandingTabInstructorCenter()));

    // Instructor Professional Learning sections table
    screen.getByText(i18n.plSectionsInstructorTitle());
  });

  it('page shows expected sections in Regional Partner Center tab', async () => {
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockImplementation(args => {
        if (args.includes('workshops_user_enrolled_in')) {
          return Promise.resolve({ok: true, json: () => []});
        } else if (args.includes('workshops_as_program_manager_for_pl_page')) {
          return Promise.resolve({
            ok: true,
            json: () => {
              return {workshops_as_program_manager: [TEST_WORKSHOP]};
            },
          });
        }
      });

    await waitFor(() => {
      renderDefault({
        userPermissions: ['program_manager'],
      });
    });
    fireEvent.click(screen.getByText(i18n.plLandingTabRPCenter()));

    // Regional Partner resource center
    screen.getByText(i18n.plSectionsWorkshopTitle());
    screen.getByText(i18n.plSectionsRegionalPartnerPlaybookTitle());

    // Regional Partner workshop table
    screen.getByText(i18n.inProgressAndUpcomingWorkshops());

    fetchStub.mockRestore();
  });

  it('page shows expected sections in Workshop Organizer Center tab', async () => {
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockImplementation(args => {
        if (args.includes('workshops_user_enrolled_in')) {
          return Promise.resolve({ok: true, json: () => []});
        } else if (args.includes('workshops_as_organizer_for_pl_page')) {
          return Promise.resolve({
            ok: true,
            json: () => {
              return {workshops_as_organizer: [TEST_WORKSHOP]};
            },
          });
        }
      });
    renderDefault({
      userPermissions: ['workshop_organizer'],
    });
    await waitFor(() => {
      screen.getByText(i18n.plLandingTabWorkshopOrganizerCenter());
    });
    fireEvent.click(
      screen.getByText(i18n.plLandingTabWorkshopOrganizerCenter())
    );

    // Workshop Organizer Resources
    screen.getByText(i18n.plSectionsWorkshopResources());

    await waitFor(() => {
      // Workshop Organizer workshop table
      screen.getByText(i18n.inProgressAndUpcomingWorkshops());
    });

    fetchStub.mockRestore();
  });

  it('page does not show success dialog when not redirected here from successful enrollment', () => {
    renderDefault();

    expect(screen.queryByText(i18n.enrollmentCelebrationTitle())).toBeNull();
  });

  it('page shows success dialog stating workshop course when redirected here from successful non-BYOW enrollment', () => {
    const workshopCourse = 'TEST COURSE';
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem(
      'sessionTimeInfo',
      JSON.stringify([TEST_WORKSHOP_SESSIONS[0]])
    );

    renderDefault();

    screen.getByText(i18n.enrollmentCelebrationTitle());
    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopCourse})
    );

    sessionStorage.clear();
  });

  it('page shows success dialog stating workshop name when redirected here from successful BYOW enrollment', () => {
    const workshopCourse = 'TEST COURSE';
    const workshopName = 'TEST NAME';
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem('workshopName', workshopName);
    sessionStorage.setItem(
      'sessionTimeInfo',
      JSON.stringify([TEST_WORKSHOP_SESSIONS[0]])
    );

    renderDefault();

    screen.getByText(i18n.enrollmentCelebrationTitle());
    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopName})
    );

    sessionStorage.clear();
  });

  it('enroll success dialog shows buttons with links to add session to calendar for workshops with one session', () => {
    const workshopCourse = 'TEST COURSE';
    const workshopSession = TEST_WORKSHOP_SESSIONS[0];
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem(
      'sessionTimeInfo',
      JSON.stringify([workshopSession])
    );

    renderDefault();

    screen.getByText(i18n.enrollmentCelebrationTitle());
    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopCourse})
    );
    screen.getByText(i18n.addToYourCalendar());

    // Add to Apple calendar button has expected download .ics file link
    const expectedAppleCalendarDownloadLink = buildAppleCalendarLink(
      [workshopSession],
      workshopCourse
    );
    fireEvent.click(
      screen.getByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Apple',
        })
      )
    );
    expect(window.open).toHaveBeenCalledWith(
      expectedAppleCalendarDownloadLink,
      '_blank',
      'noopener',
      'noreferrer'
    );

    // Add to Google calendar button has expected link to add event to calendar
    const expectedGoogleCalendarLink = buildGoogleCalendarLink(
      workshopSession,
      workshopCourse
    );
    fireEvent.click(
      screen.getByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Google',
        })
      )
    );
    expect(window.open).toHaveBeenCalledWith(
      expectedGoogleCalendarLink,
      '_blank',
      'noopener',
      'noreferrer'
    );

    // Add to Outlook calendar button has expected link to add event to calendar
    const expectedOutlookCalendarLink = buildOutlookCalendarLink(
      workshopSession,
      workshopCourse
    );
    fireEvent.click(
      screen.getByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Outlook',
        })
      )
    );
    expect(window.open).toHaveBeenCalledWith(
      expectedOutlookCalendarLink,
      '_blank',
      'noopener',
      'noreferrer'
    );

    // Does not show the dialog for adding multiple sessions to calendar
    expect(
      screen.queryByText(i18n.enrollmentCelebrationAddToCalendarButton())
    ).toBe(null);

    sessionStorage.clear();
  });

  it('enroll success dialog shows buttons that open dialog to add multiple sessions to calendar for workshops with multiple sessions', () => {
    const workshopCourse = 'TEST COURSE';
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem(
      'sessionTimeInfo',
      JSON.stringify(TEST_WORKSHOP_SESSIONS)
    );

    renderDefault();

    screen.getByText(i18n.enrollmentCelebrationTitle());
    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopCourse})
    );
    screen.getByText(i18n.addToYourCalendar());

    // Google and Outlook Calendar buttons are not links if there are multiple sessions
    expect(screen.queryByRole('link', {name: 'Google'})).toBe(null);
    expect(screen.queryByRole('link', {name: 'Outlook'})).toBe(null);

    // Apple calendar button is link to download .ics file with multiple sessions
    const expectedAppleCalendarDownloadLink = buildAppleCalendarLink(
      TEST_WORKSHOP_SESSIONS,
      workshopCourse
    );
    fireEvent.click(
      screen.getByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Apple',
        })
      )
    );
    expect(window.open).toHaveBeenCalledWith(
      expectedAppleCalendarDownloadLink,
      '_blank',
      'noopener',
      'noreferrer'
    );

    // Can open the Google calendar dialog
    fireEvent.click(screen.getByRole('button', {name: 'Google'}));
    screen.getByText(i18n.enrollmentCelebrationAddToCalendarTitle());

    const googleCalendarButtonLinks = screen.getAllByLabelText(
      i18n.addToCalendarType({
        calendar_type: 'Google',
      })
    );
    googleCalendarButtonLinks.forEach((googleCalendarButton, index) => {
      const expectedGoogleButtonLink = buildGoogleCalendarLink(
        TEST_WORKSHOP_SESSIONS[index],
        workshopCourse
      );
      fireEvent.click(googleCalendarButton);
      expect(window.open).toHaveBeenCalledWith(
        expectedGoogleButtonLink,
        '_blank',
        'noopener',
        'noreferrer'
      );
    });

    // Can close the Google calendar dialog with the 'Change calendar' button and open the Outlook calendar dialog
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.enrollmentCelebrationChangeCalendarButton(),
      })
    );
    fireEvent.click(screen.getByRole('button', {name: 'Outlook'}));
    screen.getByText(i18n.enrollmentCelebrationAddToCalendarTitle());

    const outlookCalendarButtonLinks = screen.getAllByLabelText(
      i18n.addToCalendarType({
        calendar_type: 'Outlook',
      })
    );
    outlookCalendarButtonLinks.forEach((outlookCalendarButton, index) => {
      const expectedOutlookButtonLink = buildOutlookCalendarLink(
        TEST_WORKSHOP_SESSIONS[index],
        workshopCourse
      );
      fireEvent.click(outlookCalendarButton);
      expect(window.open).toHaveBeenCalledWith(
        expectedOutlookButtonLink,
        '_blank',
        'noopener',
        'noreferrer'
      );
    });

    // Can close all dialogs with 'Go to my professional learning' dialog
    fireEvent.click(
      screen.getAllByText(i18n.enrollmentCelebrationCallToAction())[0]
    );
    expect(screen.queryByText(i18n.enrollmentCelebrationTitle())).toBe(null);
    expect(
      screen.queryByText(i18n.enrollmentCelebrationAddToCalendarTitle())
    ).toBe(null);

    sessionStorage.clear();
  });

  describe('buildGoogleCalendarLink', () => {
    it('creates link with UTC datetime when session is not local', () => {
      const session = {
        start: '2025-02-11T16:00:00Z', // 9 AM MST
        end: '2025-02-12T00:00:00Z', // 5 PM MST
        is_local: false,
      };

      const result = buildGoogleCalendarLink(session, workshopTitle);

      expect(result).toContain(
        `dates=${encodeURIComponent('20250211T160000Z/20250212T000000Z')}`
      );
    });

    it('creates a link with local time for legacy sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        is_local: true,
      };

      const result = buildGoogleCalendarLink(session, workshopTitle);

      // datetime params do not have trailing 'Z' indicating user's local time
      expect(result).toContain(
        `dates=${encodeURIComponent('20250211T090000/20250211T170000')}`
      );
    });

    it('creates a link with notes and description', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
        description: 'Really great workshop',
        notes: 'Park in the back',
      };

      const result = buildGoogleCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          details: EXPECTED_DESCRIPTION_AND_NOTES,
        }).toString()
      );
    });

    it('creates a link with meeting link for virtual sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
      };

      const result = buildGoogleCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'Virtual meeting: example.zoom.com',
        }).toString()
      );
      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          details: 'example.zoom.com',
        }).toString()
      );
    });

    it('creates a link with full location info for in person sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      const result = buildGoogleCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'The ritz carlton, 123 Main St, Denver, CO, 12345',
        }).toString()
      );
    });

    it('creates a link with partial location info for in person sessions', () => {
      const session1 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      const result1 = buildGoogleCalendarLink(session1, workshopTitle);

      expect(result1).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: '123 Main St, Denver, CO, 12345',
        }).toString()
      );

      const session2 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        session_format: 'in_person',
      };

      const result2 = buildGoogleCalendarLink(session2, workshopTitle);

      expect(result2).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'The ritz carlton',
        }).toString()
      );
    });
  });

  describe('buildOutlookCalendarLink', () => {
    it('creates link with UTC datetime when session is not local', () => {
      const session = {
        start: '2025-02-11T16:00:00Z',
        end: '2025-02-12T00:00:00Z',
        is_local: false,
      };

      const link = buildOutlookCalendarLink(session, workshopTitle);

      expect(link).toContain(
        `startdt=${encodeURIComponent('2025-02-11T16:00:00Z')}`
      );
      expect(link).toContain(
        `enddt=${encodeURIComponent('2025-02-12T00:00:00Z')}`
      );
    });

    it('creates a link with local time for legacy sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        is_local: true,
      };

      const link = buildOutlookCalendarLink(session, workshopTitle);

      // datetime params do not have trailing 'Z' indicating user's local time
      expect(link).toContain(
        `startdt=${encodeURIComponent('2025-02-11T09:00:00')}`
      );
      expect(link).toContain(
        `enddt=${encodeURIComponent('2025-02-11T17:00:00')}`
      );
    });

    it('creates a link with notes and description', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
        description: 'Really great workshop',
        notes: 'Park in the back',
      };

      const result = buildOutlookCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          body: EXPECTED_OUTLOOK_DESCRIPTION_AND_NOTES,
        }).toString()
      );
    });

    it('creates a link with meeting link for virtual sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
      };

      const result = buildOutlookCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'Virtual meeting: example.zoom.com',
        }).toString()
      );
      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          body: 'example.zoom.com',
        }).toString()
      );
    });

    it('creates a link with full location info for in person sessions', () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      const result = buildOutlookCalendarLink(session, workshopTitle);

      expect(result).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'The ritz carlton, 123 Main St, Denver, CO, 12345',
        }).toString()
      );
    });

    it('creates a link with partial location info for in person sessions', () => {
      const session1 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      const result1 = buildOutlookCalendarLink(session1, workshopTitle);

      expect(result1).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: '123 Main St, Denver, CO, 12345',
        }).toString()
      );

      const session2 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        session_format: 'in_person',
      };

      const result2 = buildOutlookCalendarLink(session2, workshopTitle);

      expect(result2).toContain(
        // URLSearchParams uses + to encode spaces but encodeURIComponent uses %20
        new URLSearchParams({
          location: 'The ritz carlton',
        }).toString()
      );
    });
  });

  describe('buildAppleCalendarLink', () => {
    const workshopSessions = [
      {
        start: '2025-02-11T16:00:00Z',
        end: '2025-02-12T00:00:00Z',
        is_local: false,
      },
      {
        start: '2025-02-12T16:00:00Z',
        end: '2025-02-13T00:00:00Z',
        is_local: false,
      },
    ];

    it('should generate a valid ics file content for sessions with time zones', async () => {
      buildAppleCalendarLink(workshopSessions, workshopTitle);

      // wait for blob content to be read
      const icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain('BEGIN:VCALENDAR');
      expect(icsFileContent).toContain('VERSION:2.0');
      expect(icsFileContent).toContain(
        `PRODID:${workshopTitle} 20250211T160000Z/ics`
      );
      expect(icsFileContent).toContain('DTSTART:20250211T160000Z');
      expect(icsFileContent).toContain('DTEND:20250212T000000Z');
      expect(icsFileContent).toContain('DTSTART:20250212T160000Z');
      expect(icsFileContent).toContain('DTEND:20250213T000000Z');
      expect(icsFileContent).toContain('SUMMARY:New Workshop');
      expect(icsFileContent).toContain('END:VCALENDAR');
    });

    it('should handle legacy sessions stored as local time without time zone', async () => {
      const legacySessions = [
        {
          start: '2025-02-11T09:00:00Z',
          end: '2025-02-11T17:00:00Z',
          is_local: true,
        },
      ];

      buildAppleCalendarLink(legacySessions, workshopTitle);

      const icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain('BEGIN:VCALENDAR');
      expect(icsFileContent).toContain('VERSION:2.0');
      expect(icsFileContent).toContain(
        `PRODID:${workshopTitle} 20250211T090000/ics`
      );
      expect(icsFileContent).toContain('DTSTART:20250211T090000');
      expect(icsFileContent).toContain('DTEND:20250211T170000');
      expect(icsFileContent).toContain('SUMMARY:New Workshop');
      expect(icsFileContent).toContain('END:VCALENDAR');
    });

    it('creates a link with notes and description', async () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
        description: 'Really great workshop',
        notes: 'Park in the back',
      };

      buildAppleCalendarLink([session], workshopTitle);
      const icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain(EXPECTED_DESCRIPTION_AND_NOTES);
    });

    it('creates a link with meeting link for virtual sessions', async () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        meeting_link: 'example.zoom.com',
        session_format: 'virtual',
      };

      buildAppleCalendarLink([session], workshopTitle);
      const icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain(
        'LOCATION:Virtual meeting: example.zoom.com'
      );
      expect(icsFileContent).toContain('DESCRIPTION:example.zoom.com');
    });

    it('creates a link with full location info for in person sessions', async () => {
      const session = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      buildAppleCalendarLink([session], workshopTitle);
      const icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain(
        'LOCATION:The ritz carlton, 123 Main St, Denver, CO, 12345'
      );
    });

    it('creates a link with partial location info for in person sessions', async () => {
      const session1 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_address: '123 Main St, Denver, CO, 12345',
        session_format: 'in_person',
      };

      buildAppleCalendarLink([session1], workshopTitle);
      let icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain(
        'LOCATION:123 Main St, Denver, CO, 12345'
      );

      const session2 = {
        start: '2025-02-11T09:00:00Z',
        end: '2025-02-11T17:00:00Z',
        location_name: 'The ritz carlton',
        session_format: 'in_person',
      };

      buildAppleCalendarLink([session2], workshopTitle);
      icsFileContent = await blobContentPromise;
      expect(icsFileContent).toContain('LOCATION:The ritz carlton');
    });
  });

  describe('Global Edition Configurations', () => {
    describe('hideMyFacilitatorCenterTab', () => {
      let props = {
        userPermissions: ['facilitator'],
      };

      const findFacilitatorCenterTab = () =>
        screen.queryByRole('tab', {name: 'Facilitator Center'});

      it('renders Facilitator Center tab', () => {
        renderDefault(props);
        expect(findFacilitatorCenterTab()).toBeInTheDocument();
      });

      describe('when hideMyFacilitatorCenterTab is true', () => {
        beforeEach(() => {
          props['hideMyFacilitatorCenterTab'] = true;
        });

        it('does not render Facilitator Center tab', () => {
          renderDefault(props);
          expect(findFacilitatorCenterTab()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideInstructorCenterTab', () => {
      let props = {
        userPermissions: ['universal_instructor'],
      };

      const findInstructorCenterTab = () =>
        screen.queryByRole('tab', {name: 'Instructor Center'});

      it('renders Instructor Center tab', () => {
        renderDefault(props);
        expect(findInstructorCenterTab()).toBeInTheDocument();
      });

      describe('when hideInstructorCenterTab is true', () => {
        beforeEach(() => {
          props['hideInstructorCenterTab'] = true;
        });

        it('does not render Instructor Center tab', () => {
          renderDefault(props);
          expect(findInstructorCenterTab()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideRPCenterTab', () => {
      let props = {
        userPermissions: ['program_manager'],
      };

      const findRPCenterTab = () =>
        screen.queryByRole('tab', {name: 'Regional Partner Center'});

      it('renders Regional Partner Center tab', () => {
        renderDefault(props);
        expect(findRPCenterTab()).toBeInTheDocument();
      });

      describe('when hideRPCenterTab is true', () => {
        beforeEach(() => {
          props['hideRPCenterTab'] = true;
        });

        it('does not render Regional Partner Center tab', () => {
          renderDefault(props);
          expect(findRPCenterTab()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideWorkshopOrganizerCenterTab', () => {
      let props = {
        userPermissions: ['workshop_organizer'],
      };

      const findWorkshopOrganizerCenterTab = () =>
        screen.queryByRole('tab', {name: 'Workshop Organizer Center'});

      it('renders Workshop Organizer Center tab', () => {
        renderDefault(props);
        expect(findWorkshopOrganizerCenterTab()).toBeInTheDocument();
      });

      describe('when hideWorkshopOrganizerCenterTab is true', () => {
        beforeEach(() => {
          props['hideWorkshopOrganizerCenterTab'] = true;
        });

        it('does not render Workshop Organizer Center tab', () => {
          renderDefault(props);
          expect(findWorkshopOrganizerCenterTab()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLWorkshopEnrollmentCelebrationDialog', () => {
      let props = {};

      const findWorkshopEnrollmentCelebrationDialog = () =>
        screen.queryByRole('heading', {
          name: "You've been enrolled!",
        });

      const createObjectURL = 'testCreateObjectURL';
      const workshopCourse = 'TEST COURSE';
      const sessionTimeInfo = JSON.stringify([TEST_WORKSHOP_SESSIONS[0]]);

      beforeEach(() => {
        window.URL.createObjectURL = () => createObjectURL;
        sessionStorage.setItem('workshopCourse', workshopCourse);
        sessionStorage.setItem('sessionTimeInfo', sessionTimeInfo);
      });

      afterEach(() => {
        sessionStorage.clear();
      });

      it('renders Workshop Enrollment Celebration dialog', () => {
        renderDefault(props);
        expect(findWorkshopEnrollmentCelebrationDialog()).toBeInTheDocument();
      });

      describe('when hideMyPLWorkshopEnrollmentCelebrationDialog is true', () => {
        beforeEach(() => {
          props['hideMyPLWorkshopEnrollmentCelebrationDialog'] = true;
        });

        it('does not render Workshop Enrollment Celebration dialog', () => {
          renderDefault(props);
          expect(
            findWorkshopEnrollmentCelebrationDialog()
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLBanner', () => {
      let props = {
        hasEnrorolledInWorkshop: false,
        plCoursesStarted: [],
      };

      const findMyPLBanner = () =>
        screen.queryByRole('heading', {
          name: 'Getting started with Professional Learning',
        });

      it('renders Professional Learning banner', () => {
        renderDefault(props);
        expect(findMyPLBanner()).toBeInTheDocument();
      });

      describe('when hideMyPLBanner is true', () => {
        beforeEach(() => {
          props['hideMyPLBanner'] = true;
        });

        it('does not render Professional Learning banner', () => {
          renderDefault(props);
          expect(findMyPLBanner()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLSelfPacedPL', () => {
      let props = {};

      const findSelfPacedPLCourses = () =>
        screen.queryByRole('heading', {
          name: 'Self-Paced Professional Learning Courses',
        });

      it('renders Self-Paced PL Courses table', () => {
        renderDefault(props);
        expect(findSelfPacedPLCourses()).toBeInTheDocument();
      });

      describe('when hideMyPLSelfPacedPL is true', () => {
        beforeEach(() => {
          props['hideMyPLSelfPacedPL'] = true;
        });

        it('does not render Self-Paced PL Courses table', () => {
          renderDefault(props);
          expect(findSelfPacedPLCourses()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLJoinSectionArea', () => {
      let props = {};

      const findMyPLBanner = () =>
        screen.queryByRole('heading', {
          name: 'Joined Professional Learning Sections',
        });

      it('renders Joined Sections area', () => {
        renderDefault(props);
        expect(findMyPLBanner()).toBeInTheDocument();
      });

      describe('when hideMyPLJoinSectionArea is true', () => {
        beforeEach(() => {
          props['hideMyPLJoinSectionArea'] = true;
        });

        it('does not render Joined Sections area', () => {
          renderDefault(props);
          expect(findMyPLBanner()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLLandingPageWorkshopsTable', () => {
      let props = {};
      let fetchStub;

      beforeEach(() => {
        fetchStub = jest
          .spyOn(window, 'fetch')
          .mockClear()
          .mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([TEST_WORKSHOP]),
          });
      });

      afterEach(() => {
        fetchStub.mockRestore();
      });

      const findLandingPageWorkshopsTable = () =>
        screen.queryByRole('heading', {
          name: 'My Workshops',
        });

      it('renders Workshops table', async () => {
        renderDefault(props);

        await waitFor(() => {
          expect(findLandingPageWorkshopsTable()).toBeInTheDocument();
        });
      });

      describe('when hideMyPLLandingPageWorkshopsTable is true', () => {
        beforeEach(() => {
          props['hideMyPLLandingPageWorkshopsTable'] = true;
        });

        it('does not render Workshops table', async () => {
          renderDefault(props);

          await waitFor(() => {
            expect(findLandingPageWorkshopsTable()).not.toBeInTheDocument();
          });
        });
      });
    });

    describe('hideMyPLStaticRecommendedPL', () => {
      let props = {};

      const findStaticRecommendedPL = () =>
        screen.queryByRole('heading', {
          name: 'Recommended for you',
        });

      it('renders Recommended block', () => {
        renderDefault(props);
        expect(findStaticRecommendedPL()).toBeInTheDocument();
      });

      describe('when hideMyPLStaticRecommendedPL is true', () => {
        beforeEach(() => {
          props['hideMyPLStaticRecommendedPL'] = true;
        });

        it('does not render Recommended block', () => {
          renderDefault(props);
          expect(findStaticRecommendedPL()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLStaticRecommendedPLMidHighBlock', () => {
      let props = {};

      const findMidHighBlock = () =>
        screen.queryByRole('heading', {
          name: '6-12 Teacher Workshops',
        });

      it('renders 6-12 Teacher Workshops block', () => {
        renderDefault(props);
        expect(findMidHighBlock()).toBeInTheDocument();
      });

      describe('when hideMyPLStaticRecommendedPLMidHighBlock is true', () => {
        beforeEach(() => {
          props['hideMyPLStaticRecommendedPLMidHighBlock'] = true;
        });

        it('does not render 6-12 Teacher Workshops block', () => {
          renderDefault(props);
          expect(findMidHighBlock()).not.toBeInTheDocument();
        });
      });
    });

    describe('hideMyPLStaticRecommendedPLSelfPacedBlock', () => {
      let props = {};

      const findSelfPacedBlock = () =>
        screen.queryByRole('heading', {
          name: 'Self-Paced Professional Learning',
        });

      it('renders Self-Paced PL block', () => {
        renderDefault(props);
        expect(findSelfPacedBlock()).toBeInTheDocument();
      });

      describe('when hideMyPLStaticRecommendedPLSelfPacedBlock is true', () => {
        beforeEach(() => {
          props['hideMyPLStaticRecommendedPLSelfPacedBlock'] = true;
        });

        it('does not render Self-Paced PL block', () => {
          renderDefault(props);
          expect(findSelfPacedBlock()).not.toBeInTheDocument();
        });
      });
    });

    describe('myPLStaticRecommendedPLSelfPacedBlockButtonUrl', () => {
      let props = {};

      const findSelfPacedBlockLink = () =>
        screen.queryByRole('link', {
          name: 'Start professional learning courses',
        });

      it('renders Self-Paced PL block with the default link', () => {
        renderDefault(props);
        expect(findSelfPacedBlockLink()).toHaveAttribute(
          'href',
          '/educate/professional-development-online'
        );
      });

      describe('when myPLStaticRecommendedPLSelfPacedBlockButtonUrl is assigned a custom value', () => {
        const buttonUrl = '/test/url';

        beforeEach(() => {
          props['myPLStaticRecommendedPLSelfPacedBlockButtonUrl'] = buttonUrl;
        });

        it('renders Self-Paced PL block button with the custom link', () => {
          renderDefault(props);
          expect(findSelfPacedBlockLink()).toHaveAttribute('href', buttonUrl);
        });
      });
    });
  });
});
