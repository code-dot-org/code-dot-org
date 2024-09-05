import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {selfPacedCourseConstants} from '@cdo/apps/code-studio/pd/professional_learning_landing/constants.js';
import {UnconnectedLandingPage as LandingPage} from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import {
  setWindowLocation,
  resetWindowLocation,
} from '@cdo/apps/code-studio/utils';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

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

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  deeperLearningCourseData: [{data: 'oh yeah'}],
  currentYearApplicationId: 2024,
  hasEnrorolledInWorkshop: true,
  workshopsAsFacilitator: [],
  workshopsAsOrganizer: [],
  workshopsAsRegionalPartner: [],
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
    screen.getByTestId('enrolled-workshops-loader');
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
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a CSD/CSP teacher with a pending survey', () => {
    renderDefault();
    expect(
      screen.queryByText(i18n.plLandingGettingStartedHeading())
    ).toBeFalsy();
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows upcoming workshops, self-paced courses, and plc enrollments but no survey banner if no pending survey exists', () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
    });
    expect(
      screen.queryByText(i18n.plLandingGettingStartedHeading())
    ).toBeFalsy();
    expect(screen.queryByText(i18n.plLandingStartSurvey())).toBeFalsy();
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows self-paced progress table if enrolled in self-paced courses', () => {
    renderDefault();
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
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

  it('page shows enrolled workshops table', () => {
    renderDefault();

    screen.getByTestId('enrolled-workshops-loader');
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

  it('page shows expected sections in Facilitator Center tab', () => {
    renderDefault({
      userPermissions: ['facilitator'],
      workshopsAsFacilitator: [TEST_WORKSHOP],
      coursesAsFacilitator: ['CS Discoveries', 'Computer Science A'],
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
    screen.getByText('In Progress and Upcoming Workshops');
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

  it('page shows expected sections in Regional Partner Center tab', () => {
    renderDefault({
      userPermissions: ['program_manager'],
      workshopsAsRegionalPartner: [TEST_WORKSHOP],
    });
    fireEvent.click(screen.getByText(i18n.plLandingTabRPCenter()));

    // Regional Partner resource center
    screen.getByText(i18n.plSectionsRegionalPartnerApplicationTitle());
    screen.getByText(i18n.plSectionsWorkshopTitle());
    screen.getByText(i18n.plSectionsRegionalPartnerPlaybookTitle());

    // Regional Partner workshop table
    screen.getByText('In Progress and Upcoming Workshops');
  });

  it('page shows expected sections in Workshop Organizer Center tab', () => {
    renderDefault({
      userPermissions: ['workshop_organizer'],
      workshopsAsOrganizer: [TEST_WORKSHOP],
    });
    fireEvent.click(
      screen.getAllByText(i18n.plLandingTabWorkshopOrganizerCenter())[0]
    );

    // Workshop Organizer Resources
    screen.getByText(i18n.plSectionsWorkshopResources());

    // Workshop Organizer workshop table
    screen.getByText('In Progress and Upcoming Workshops');
  });

  it('page does not show success dialog when not redirected here from successful enrollment', () => {
    renderDefault();

    expect(
      screen.queryByText(
        i18n.enrollmentCelebrationBody({workshopName: 'a new workshop'})
      )
    ).toBeNull();
  });

  it('page shows success dialog when redirected here from successful enrollment', () => {
    const workshopCourseName = 'TEST COURSE';
    setWindowLocation({search: `?wsCourse=${workshopCourseName}`});
    renderDefault();

    screen.getByText(
      i18n.enrollmentCelebrationBody({workshopName: workshopCourseName})
    );
    resetWindowLocation();
  });
});
