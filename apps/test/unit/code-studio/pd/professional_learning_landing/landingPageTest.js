import React from 'react';
import {render, screen} from '@testing-library/react';
import i18n from '@cdo/locale';
import {expect} from '../../../../util/reconfiguredChai';
// import sinon from 'sinon';
// import $ from 'jquery';
import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
// import {serializedWorkshopFactory} from '../../../../factories/professionalLearning';

const DEFAULT_PROPS = {
  lastWorkshopSurveyUrl: 'url',
  lastWorkshopSurveyCourse: 'CS Fundamentals',
  deeperLearningCourseData: [{data: 'oh yeah'}],
  currentYearApplicationId: 2024,
  workshopsAsParticipant: [{data: 'workshops'}],
  plCoursesStarted: [{data: 'courses'}],
};

// const WORKSHOP_DATA = [
//   serializedWorkshopFactory.build({
//     pre_workshop_survey_url: 'code.org/pre_survey_url',
//     workshop_starting_date: '2020-01-17T00:44:05.000Z',
//   }),
//   serializedWorkshopFactory.build({state: 'In Progress'}),
//   serializedWorkshopFactory.build({state: 'Ended', attended: true}),
//   serializedWorkshopFactory.build({state: 'Ended'}),
// ];

describe('LandingPage', () => {
  // let ajaxStub;

  // beforeEach(() => {
  //   ajaxStub = sinon.stub($, 'ajax').returns({done: sinon.stub()});
  // });

  // afterEach(() => {
  //   ajaxStub.restore();
  // });

  function renderDefault(propOverrides = {}) {
    render(<LandingPage {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('page is as expected for a new teacher', () => {
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
    expect(screen.queryByTestId('enrolled-workshops')).to.not.exist;
    expect(screen.queryByText('Online Professional Learning Courses')).to.not
      .exist;
  });

  it('page is as expected for a teacher with a pending survey', () => {
    renderDefault();
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops');
    screen.getByText('Online Professional Learning Courses');
  });

  it('page is as expected for a CSD/CSP teacher with a pending survey', () => {
    renderDefault();
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    screen.getByText(i18n.plLandingStartSurvey());
    screen.getByTestId('enrolled-workshops');
    screen.getByText('Online Professional Learning Courses');
  });

  it('page is as expected for a teacher with no pending survey but upcoming workshops and plc enrollments', () => {
    renderDefault({
      lastWorkshopSurveyUrl: null,
      lastWorkshopSurveyCourse: null,
    });
    expect(screen.queryByText(i18n.plLandingGettingStartedHeading())).to.not
      .exist;
    expect(screen.queryByText(i18n.plLandingStartSurvey())).to.not.exist;
    screen.getByTestId('enrolled-workshops');
    screen.getByText('Online Professional Learning Courses');
  });
});
