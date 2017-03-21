import React from 'react';
import {shallow} from 'enzyme';
import LandingPage from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage';
import {expect} from 'chai';
import _ from 'lodash';

describe("Tests for Professional Learning Landing Page", () => {
  const generateLandingPage = (landingPageProps = []) => {
    return shallow(
      <LandingPage
        {...landingPageProps}
      />
    );
  };

  const getImmediateChildren = (landingPage) => {
    return _.compact(landingPage.children().nodes.map( (node) => {return node.key;}));
  };

  describe("Tests related to the initial state of the landing page for given teacher", () => {
    it("page is as expected for CSF in progress teacher", () => {
      const landingPage = generateLandingPage({
        coursesTaught: ['CS Fundamentals'],
        coursesCompleted: [],
      });
      const csFundamentalsSection = landingPage.find('CsFundamentalsSection');
      expect(csFundamentalsSection).to.have.length(1);
      expect(csFundamentalsSection.prop('lastWorkshopSurveyUrl')).to.equal(null);
      expect(csFundamentalsSection.prop('printCsfCertificateUrl')).to.equal(undefined);
      expect(landingPage.find('CsPrinciplesAndDiscoveriesSection')).to.have.length(0);
      expect(csFundamentalsSection.prop('csfCompleted')).to.be.false;
      expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops', 'csFundamentalsSection']);
    });

    it("page is as expected for a CSF completed teacher", () => {
      const landingPage = generateLandingPage({
        coursesTaught: ['CS Fundamentals'],
        coursesCompleted: ['CS Fundamentals'],
        printCsfCertificateUrl: 'certificateUrl'
      });
      const csFundamentalsSection = landingPage.find('CsFundamentalsSection');
      expect(csFundamentalsSection).to.have.length(1);
      expect(csFundamentalsSection.prop('printCsfCertificateUrl')).to.equal('certificateUrl');
      expect(landingPage.find('CsPrinciplesAndDiscoveriesSection')).to.have.length(0);
      expect(csFundamentalsSection.prop('csfCompleted')).to.be.true;
      expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops', 'csFundamentalsSection']);
    });

    it("page is as expected for a CSD/CSP teacher", () => {
      ['CS Principles', 'CS Discoveries'].forEach((course) => {
        const landingPage = generateLandingPage({
          coursesTaught: [course],
          coursesCompleted: [course]
        });

        expect(landingPage.find('CsFundamentalsSection')).to.have.length(0);
        const csPrinciplesAndDiscoveriesSection = landingPage.find('CsPrinciplesAndDiscoveriesSection');
        expect(csPrinciplesAndDiscoveriesSection).to.have.length(1);
        expect(csPrinciplesAndDiscoveriesSection.prop('lastWorkshopSurveyUrl')).to.equal(null);
        expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops', 'csPrinciplesAndDiscoveriesSection']);
      });

      const landingPage = generateLandingPage({
        coursesTaught: ['CS Discoveries'],
        coursesCompleted: [],
        lastWorkshopSurveyUrl: 'url',
        lastWorkshopSurveyCourse: 'CS Discoveries'
      });

      expect(landingPage.find('CsFundamentalsSection')).to.have.length(0);
      const csPrinciplesAndDiscoveriesSection = landingPage.find('CsPrinciplesAndDiscoveriesSection');
      expect(csPrinciplesAndDiscoveriesSection).to.have.length(1);
      expect(csPrinciplesAndDiscoveriesSection.prop('lastWorkshopSurveyUrl')).to.equal('url');
      expect(getImmediateChildren(landingPage)).to.deep.equal(['csPrinciplesAndDiscoveriesSection', 'upcomingWorkshops']);
    });

    it("page is as expected for a teacher in both CSF and CSD/CSP", () => {
      const landingPage = generateLandingPage({
        coursesTaught: ['CS Fundamentals', 'CS Discoveries'],
        coursesCompleted: ['CS Fundamentals', 'CS Discoveries']
      });

      expect(landingPage.find('CsFundamentalsSection')).to.have.length(1);
      expect(landingPage.find('CsPrinciplesAndDiscoveriesSection')).to.have.length(1);
      expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops', 'csFundamentalsSection', 'csPrinciplesAndDiscoveriesSection']);
    });

    it("page is as expected for a teacher who teaches neither CSF, CSD, nor CSP", () => {
      const landingPage = generateLandingPage({coursesTaught: [], coursesCompleted: []});

      expect(landingPage.find('CsFundamentalsSection')).to.have.length(0);
      expect(landingPage.find('CsPrinciplesAndDiscoveriesSection')).to.have.length(0);
      expect(landingPage.find('UpcomingWorkshops')).to.have.length(1);
      expect(landingPage.find('ProfessionalLearningCourseProgress')).to.have.length(0);
      expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops']);
    });

    it("page has section for professional learning if user is enrolled in professional learning courses", () => {
      const landingPage = generateLandingPage({
        coursesTaught: [],
        coursesCompleted: [],
        professionalLearningCourseData: [{data: 'woohoo'}]
      });
      expect(landingPage.find('ProfessionalLearningCourseProgress')).to.have.length(1);
      expect(getImmediateChildren(landingPage)).to.deep.equal(['upcomingWorkshops', 'plcData']);
    });
  });
});
