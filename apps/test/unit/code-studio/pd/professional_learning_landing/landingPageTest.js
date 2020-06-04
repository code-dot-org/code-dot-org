import React from 'react';
import {shallow, mount} from 'enzyme';
import i18n from '@cdo/locale';
import {expect} from '../../../../util/reconfiguredChai';
import LandingPage, {
  LastWorkshopSurveyBanner
} from '@cdo/apps/code-studio/pd/professional_learning_landing/LandingPage';
import Button from '@cdo/apps/templates/Button';

describe('Tests for Professional Learning Landing Page', () => {
  const generateLandingPage = (landingPageProps = []) => {
    return shallow(<LandingPage {...landingPageProps} />);
  };

  describe('Tests related to the initial state of the landing page for given teacher', () => {
    it('page is as expected for a teacher with a pending survey', () => {
      const landingPage = generateLandingPage({
        lastWorkshopSurveyUrl: 'url',
        lastWorkshopSurveyCourse: 'CS Fundamentals',
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('LastWorkshopSurveyBanner')).to.be.true;
      expect(landingPage.childAt(2).prop('subHeading')).to.equal(
        'Submit your feedback'
      );
      expect(landingPage.childAt(3).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(4).is('ProfessionalLearningCourseProgress')).to
        .be.true;
    });

    it('page is as expected for a CSD/CSP teacher with a pending survey', () => {
      const landingPage = generateLandingPage({
        lastWorkshopSurveyUrl: 'url',
        lastWorkshopSurveyCourse: 'CS Discoveries',
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('LastWorkshopSurveyBanner')).to.be.true;
      expect(
        landingPage
          .childAt(2)
          .shallow()
          .text()
          .indexOf('Submit your feedback')
      ).to.equal(-1);
      expect(landingPage.childAt(3).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(4).is('ProfessionalLearningCourseProgress')).to
        .be.true;
    });

    it('page is as expected for a teacher with no pending survey but upcoming workshops and plc enrollments', () => {
      const landingPage = generateLandingPage({
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(3).is('ProfessionalLearningCourseProgress')).to
        .be.true;
    });
  });
});

describe('LastWorkshopSurveyBanner', () => {
  let wrapper;

  const TEST_SURVEY_URL = 'https//example.com';

  beforeEach(() => {
    wrapper = mount(
      <LastWorkshopSurveyBanner
        subHeading="Test subheading"
        description="Test description"
        surveyUrl={TEST_SURVEY_URL}
      />
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('makes a button that opens the survey URL in a new tab', () => {
    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href={TEST_SURVEY_URL}
          target="_blank"
          text={i18n.plLandingStartSurvey()}
        />
      )
    ).to.be.ok;
  });
});
