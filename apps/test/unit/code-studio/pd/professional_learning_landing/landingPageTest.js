import React from 'react';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import i18n from '@cdo/locale';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedLandingPage as LandingPage} from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import {selfPacedCourseConstants} from '@cdo/apps/code-studio/pd/professional_learning_landing/constants.js';

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  deeperLearningCourseData: [{data: 'oh yeah'}],
  currentYearApplicationId: 2024,
  workshopsAsParticipant: [{data: 'workshops'}],
  plCoursesStarted: selfPacedCourseConstants,
  userPermissions: [],
  plSectionIds: [],
  hiddenPlSectionIds: [],
};

describe('LandingPage', () => {
  function renderDefault(propOverrides = {}) {
    const store = getStore();
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
      workshopsAsParticipant: [],
      plCoursesStarted: [],
    });
    screen.getByText(i18n.plLandingGettingStartedHeading());
    expect(screen.queryByText(i18n.plLandingStartSurvey())).to.not.exist;
    screen.getByTestId('enrolled-workshops-loader');
    expect(screen.queryByText(i18n.plLandingSelfPacedProgressHeading())).to.not
      .exist;
    expect(screen.queryByText('Online Professional Learning Courses')).to.not
      .exist;
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a teacher with a pending survey', () => {
    renderDefault();
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a CSD/CSP teacher with a pending survey', () => {
    renderDefault();
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows upcoming workshops, self-paced courses, and plc enrollments but no survey banner if no pending survey exists', () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
    });
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    expect(screen.queryByText(i18n.plLandingStartSurvey())).to.not.exist;
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows self-paced progress table if enrolled in self-paced courses', () => {
    renderDefault();
    screen.getByText(i18n.plLandingSelfPacedProgressHeading());
    expect(screen.getAllByTestId('progress-bar').length).to.equal(2);
    expect(screen.getByText(i18n.selfPacedPlCompleted()));
    expect(
      screen.getAllByText(i18n.selfPacedPlContinueCourse()).length
    ).to.equal(2);
    expect(
      screen.getAllByText(i18n.selfPacedPlPrintCertificates()).length
    ).to.equal(2);
  });

  it('page shows no tabs for teacher with no relevant permissions', () => {
    renderDefault();

    // Should only see the banner header labeled "Professional Learning" but not the tab of the same name
    expect(screen.queryAllByText(i18n.professionalLearning())).to.have.lengthOf(
      1
    );
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())).to.be
      .null;
    expect(screen.queryByText(i18n.plLandingTabInstructors())).to.be.null;
  });

  it('page shows Professional Learning and Facilitator Center tabs for facilitator', () => {
    renderDefault({
      userPermissions: ['facilitator'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).to.have.lengthOf(
      2
    );
    expect(screen.getByText(i18n.plLandingTabFacilitatorCenter()));
    expect(screen.queryByText(i18n.plLandingTabInstructors())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())).to.be
      .null;
  });

  it('page shows Professional Learning and Instructors tabs for universal instructors', () => {
    renderDefault({
      userPermissions: ['universal_instructor'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).to.have.lengthOf(
      2
    );
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).to.be.null;
    expect(screen.getByText(i18n.plLandingTabInstructors()));
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())).to.be
      .null;
  });

  it('page shows Professional Learning and Instructors tabs for peer reviewers', () => {
    renderDefault({
      userPermissions: ['plc_reviewer'],
    });

    expect(screen.queryAllByText(i18n.professionalLearning())).to.have.lengthOf(
      2
    );
    expect(screen.queryByText(i18n.plLandingTabFacilitatorCenter())).to.be.null;
    expect(screen.getByText(i18n.plLandingTabInstructors()));
    expect(screen.queryByText(i18n.plLandingTabRPCenter())).to.be.null;
    expect(screen.queryByText(i18n.plLandingTabWorkshopOrganizerCenter())).to.be
      .null;
  });
});
