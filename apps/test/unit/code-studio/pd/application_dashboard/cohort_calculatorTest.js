import {expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CohortCalculator from '@cdo/apps/code-studio/pd/application_dashboard/cohort_calculator';
import {AllPartnersValue} from '@cdo/apps/code-studio/pd/application_dashboard/constants';

describe('Cohort Calculator', () => {
  describe('Initially', () => {
    let cohortCalculator;
    let xhr;
    const regionalPartnerFilterValue = AllPartnersValue;

    beforeAll(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerFilterValue={regionalPartnerFilterValue}
          role="csp_teachers" // eslint-disable-line jsx-a11y/aria-role
          accepted={0}
        />
      );
    });

    afterAll(() => {
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

    beforeAll(() => {
      server = sinon.fakeServer.create();
      server.respondWith(
        'GET',
        `/api/v1/regional_partners/enrolled?role=csp_teachers&regional_partner_value=${regionalPartnerFilterValue}`,
        [200, {'Content-Type': 'json'}, JSON.stringify(data)]
      );

      cohortCalculator = shallow(
        <CohortCalculator
          regionalPartnerFilterValue={regionalPartnerFilterValue}
          role="csp_teachers" // eslint-disable-line jsx-a11y/aria-role
          accepted={0}
        />
      );

      server.respond();
    });
    afterAll(() => {
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
