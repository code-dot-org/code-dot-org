import React from 'react';
import {render, screen} from '@testing-library/react';
import i18n from '@cdo/locale';
import {expect} from '../../../../util/reconfiguredChai';
import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  deeperLearningCourseData: [{data: 'oh yeah'}],
  currentYearApplicationId: 2024,
  workshopsAsParticipant: [{data: 'workshops'}],
  plCoursesStarted: [{data: 'courses'}],
};

describe('LandingPage', () => {
  function renderDefault(propOverrides = {}) {
    render(<LandingPage {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('page shows a getting started banner for a new teacher without an existing application, upcoming workshop, or pl course', () => {
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
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows a survey banner for a CSD/CSP teacher with a pending survey', () => {
    renderDefault();
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });

  it('page shows upcoming workshops and plc enrollments but no survey banner if no pending survey exists', () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
    });
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    expect(screen.queryByText(i18n.plLandingStartSurvey())).to.not.exist;
    screen.getByTestId('enrolled-workshops-loader');
    screen.getByText('Online Professional Learning Courses');
    screen.getByText(i18n.plLandingStaticPLMidHighHeading());
  });
});
