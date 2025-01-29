import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {selfPacedCourseConstants} from '@cdo/apps/code-studio/pd/professional_learning_landing/constants.js';
import {UnconnectedLandingPage as LandingPage} from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import {
  buildGoogleCalendarLink,
  buildOutlookCalendarLink,
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
    year: '2030',
    month: '02',
    day: '03',
    start_hour: '09',
    start_min: '30',
    end_hour: '14',
    end_min: '00',
    time_text: '9:30AM - 2:00PM',
    date_text: 'February 3, 2025',
  },
  {
    year: '2030',
    month: '02',
    day: '04',
    start_hour: '09',
    start_min: '30',
    end_hour: '14',
    end_min: '00',
    time_text: '9:30AM - 2:00PM',
    date_text: 'February 4, 2025',
  },
];

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  showDeeperLearning: true,
  currentYearApplicationId: 2024,
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
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({isRtl, teacherSections});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <LandingPage {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('page shows a getting started banner for a new teacher without an existing application, upcoming workshop, self-paced courses, or pl course', () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
      deeperLearningCourseData: null,
      currentYearApplicationId: null,
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
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([TEST_WORKSHOP]),
    });

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
    screen.getByText(i18n.plSectionsRegionalPartnerApplicationTitle());
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

    renderDefault();

    screen.getByText(i18n.enrollmentCelebrationTitle());
    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopName})
    );

    sessionStorage.clear();
  });

  it('enroll success dialog shows buttons with links to add session to calendar for workshops with one session', () => {
    const workshopCourse = 'TEST COURSE';
    const workshopLocation = 'Seattle, WA';
    const workshopSession = TEST_WORKSHOP_SESSIONS[0];
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem('workshopLocation', workshopLocation);
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

    // Add to Google calendar button has expected link to add event to calendar
    const expectedGoogleCalendarLink = buildGoogleCalendarLink(
      workshopSession,
      workshopCourse,
      workshopLocation
    );
    expect(
      screen
        .getByLabelText(
          i18n.addToCalendarType({
            calendar_type: 'Google',
          })
        )
        .getAttribute('href')
    ).toBe(expectedGoogleCalendarLink);

    // Add to Outlook calendar button has expected link to add event to calendar
    const expectedOutlookCalendarLink = buildOutlookCalendarLink(
      workshopSession,
      workshopCourse,
      workshopLocation
    );
    expect(
      screen
        .getByLabelText(
          i18n.addToCalendarType({
            calendar_type: 'Outlook',
          })
        )
        .getAttribute('href')
    ).toBe(expectedOutlookCalendarLink);

    // Does not show the dialog for adding multiple sessions to calendar
    expect(
      screen.queryByText(i18n.enrollmentCelebrationAddToCalendarButton())
    ).toBe(null);

    sessionStorage.clear();
  });

  it('enroll success dialog shows buttons that open dialog to add multiple sessions to calendar for workshops with multiple sessions', () => {
    const workshopCourse = 'TEST COURSE';
    const workshopLocation = 'Seattle, WA';
    sessionStorage.setItem('workshopCourse', workshopCourse);
    sessionStorage.setItem('workshopLocation', workshopLocation);
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

    // Calendar buttons are not links
    expect(screen.queryByRole('link', {name: 'Google'})).toBe(null);
    expect(screen.queryByRole('link', {name: 'Outlook'})).toBe(null);

    // Can open dialog to add multiple sessions to Google calendar
    fireEvent.click(screen.getByRole('button', {name: 'Google'}));
    screen.getByText(i18n.enrollmentCelebrationAddToCalendarTitle());
    const googleCalendarButtonLinks = screen
      .getAllByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Google',
        })
      )
      .map(button => {
        return button.getAttribute('href');
      });

    const expectedGoogleCalendarLinks = TEST_WORKSHOP_SESSIONS.map(session => {
      return buildGoogleCalendarLink(session, workshopCourse, workshopLocation);
    });
    expect(googleCalendarButtonLinks).toStrictEqual(
      expectedGoogleCalendarLinks
    );

    // Can close the Google calendar dialog with the 'Change calendar' button and open the Outlook calendar dialog
    fireEvent.click(
      screen.getByRole('button', {
        name: i18n.enrollmentCelebrationChangeCalendarButton(),
      })
    );
    fireEvent.click(screen.getByRole('button', {name: 'Outlook'}));

    screen.getByText(i18n.enrollmentCelebrationAddToCalendarTitle());
    const outlookCalendarButtonLinks = screen
      .getAllByLabelText(
        i18n.addToCalendarType({
          calendar_type: 'Outlook',
        })
      )
      .map(button => {
        return button.getAttribute('href');
      });

    const expectedOutlookCalendarLinks = TEST_WORKSHOP_SESSIONS.map(session => {
      return buildOutlookCalendarLink(
        session,
        workshopCourse,
        workshopLocation
      );
    });
    expect(outlookCalendarButtonLinks).toStrictEqual(
      expectedOutlookCalendarLinks
    );

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
});
