import React from 'react';
import {shallow} from 'enzyme';
import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage';
import {expect} from 'chai';

describe("Tests for Professional Learning Landing Page", () => {
  const generateLandingPage = (landingPageProps = []) => {
    return shallow(
      <LandingPage
        {...landingPageProps}
      />
    );
  };

  describe("Tests related to the initial state of the landing page for given teacher", () => {
    it("page is as expected for a teacher with a pending survey", () => {
      const landingPage = generateLandingPage({
        lastWorkshopSurveyUrl: 'url',
        lastWorkshopSurveyCourse: 'CS Fundamentals',
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('TwoPartBanner')).to.be.true;
      expect(landingPage.childAt(2).shallow().text().indexOf('Submit feedback and order free course kit') >= 0).to.be.true;
      expect(landingPage.childAt(3).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(4).is('ProfessionalLearningCourseProgress')).to.be.true;
    });

    it("page is as expected for a CSD/CSP teacher with a pending survey", () => {
      const landingPage = generateLandingPage({
        lastWorkshopSurveyUrl: 'url',
        lastWorkshopSurveyCourse: 'CS Discoveries',
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('TwoPartBanner')).to.be.true;
      expect(landingPage.childAt(2).shallow().text().indexOf('Submit feedback and order free course kit')).to.equal(-1);
      expect(landingPage.childAt(3).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(4).is('ProfessionalLearningCourseProgress')).to.be.true;
    });

    it("page is as expected for a teacher with no pending survey but upcoming workshops and plc enrollments", () => {
      const landingPage = generateLandingPage({
        professionalLearningCourseData: [{data: 'oh yeah'}]
      });

      expect(landingPage.childAt(2).is('EnrolledWorkshops')).to.be.true;
      expect(landingPage.childAt(3).is('ProfessionalLearningCourseProgress')).to.be.true;
    });
  });
});
