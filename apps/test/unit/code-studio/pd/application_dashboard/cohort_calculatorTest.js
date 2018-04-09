import React from 'react';
import {shallow} from 'enzyme';
import CohortCalculator from '@cdo/apps/code-studio/pd/application_dashboard/cohort_calculator';
import {expect} from 'chai';
import sinon from 'sinon';

describe("Cohort Calculator", () => {
  describe("Initially", () => {
    let cohortCalculator;
    const regionalPartnerValue = "all";
    before(() => {
      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerValue={regionalPartnerValue}
          role="csp_teachers"
          accepted={0}
          registered={0}
        />
      );
    });

    it("Is loading", () => {
      expect(cohortCalculator.state('loading')).to.be.true;
    });
    it("Does not render a table", () => {
      expect(cohortCalculator.find("table")).to.have.length(0);
    });
  });

  describe("After receiving null capacity from server", () => {
    const data = {capacity: null};
    const regionalPartnerValue = "all";
    let server;
    let cohortCalculator;

    before(() => {
      server = sinon.fakeServer.create();
      server.respondWith("GET", `/api/v1/regional_partners/capacity?role=csp_teachers&regional_partner_value=${regionalPartnerValue}`,
        [
          200,
          {"Content-Type": "json"},
          JSON.stringify(data)
        ]
      );

      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerValue={regionalPartnerValue}
          role="csp_teachers"
          accepted={0}
          registered={0}
        />
      );

      server.respond();
    });
    after(() => {
      server.restore();
    });

    it("Is no longer loading", () => {
      expect(cohortCalculator.state('loading')).to.be.false;
    });
    it("Does not render anything", () => {
      expect(cohortCalculator.html()).to.be.null;
    });
  });

  describe("After receiving non-null capacity from server", () => {
    const data = {capacity: 25};
    const regionalPartnerValue = 1;
    let server;
    let cohortCalculator;
    before(() => {
      server = sinon.fakeServer.create();
      server.respondWith("GET", `/api/v1/regional_partners/capacity?role=csp_teachers&regional_partner_value=${regionalPartnerValue}`,
        [
          200,
          {"Content-Type": "json"},
          JSON.stringify(data)
        ]
      );

      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerValue={regionalPartnerValue}
          role="csp_teachers"
          accepted={0}
          registered={0}
        />
      );

      server.respond();
    });
    after(() => {
      server.restore();
    });

    it("Is no longer loading", () => {
      expect(cohortCalculator.state('loading')).to.be.false;
    });
    it("Renders a table", () => {
      expect(cohortCalculator.find('thead')).to.have.length(1);
    });
  });
});
