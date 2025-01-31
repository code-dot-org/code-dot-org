import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {selfPacedCourseConstants} from '@cdo/apps/code-studio/pd/professional_learning_landing/constants.js';
import {RegionalLandingPage as LandingPage} from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
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

      beforeEach(() => {
        sessionStorage.setItem('workshopCourse', 'TEST COURSE');
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
        currentYearApplicationId: null,
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
