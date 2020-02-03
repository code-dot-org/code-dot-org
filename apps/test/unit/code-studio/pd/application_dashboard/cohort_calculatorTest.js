import React from 'react';
import {shallow} from 'enzyme';
import CohortCalculator from '@cdo/apps/code-studio/pd/application_dashboard/cohort_calculator';
import {AllPartnersValue} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Cohort Calculator', () => {
  describe('Initially', () => {
    let cohortCalculator;
    let xhr;
    const regionalPartnerFilterValue = AllPartnersValue;

    before(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerFilterValue={regionalPartnerFilterValue}
          role="csp_teachers"
          accepted={0}
        />
      );
    });

    after(() => {
      xhr.restore();
    });

    it('Is loading', () => {
      expect(cohortCalculator.state('loadingEnrollmentCount')).to.be.true;
    });
    it('Does not render a table', () => {
      expect(cohortCalculator.find('table')).to.have.length(0);
    });
  });

  describe('After receiving enrollment count from server', () => {
    const data = {enrolled: 1};
    const regionalPartnerFilterValue = AllPartnersValue;
    let server;
    let cohortCalculator;

    before(() => {
      server = sinon.fakeServer.create();
      server.respondWith(
        'GET',
        `/api/v1/regional_partners/enrolled?role=csp_teachers&regional_partner_value=${regionalPartnerFilterValue}`,
        [200, {'Content-Type': 'json'}, JSON.stringify(data)]
      );

      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerFilterValue={regionalPartnerFilterValue}
          role="csp_teachers"
          accepted={0}
        />
      );

      server.respond();
    });
    after(() => {
      server.restore();
    });

    it('Is no longer loading', () => {
      expect(cohortCalculator.state('loadingEnrollmentCount')).to.be.false;
    });
    it('Get correct enrollment count from server', () => {
      expect(cohortCalculator.state('enrolled')).to.equal(data.enrolled);
    });
    it('Renders a table', () => {
      cohortCalculator.update();
      expect(cohortCalculator.find('thead')).to.have.length(1);
    });
  });
});
