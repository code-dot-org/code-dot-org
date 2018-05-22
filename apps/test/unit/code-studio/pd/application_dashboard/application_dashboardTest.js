import React from 'react';
import {mount} from 'enzyme';
import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import {expect} from 'chai';
import {
  UNMATCHED_PARTNER_LABEL,
  ALL_PARTNERS_LABEL
} from '@cdo/apps/code-studio/pd/application_dashboard/constants';

describe("ApplicationDashboard", () => {
  const mountApplicationDashboard = (regionalPartners, isWorkshopAdmin) => {
    const props = {
      isWorkshopAdmin: isWorkshopAdmin,
      regionalPartners: regionalPartners,
      canLockApplications: false
    };

    return mount(
      <ApplicationDashboard
        {...props}
      />
    );
  };

  describe("heading/title initially", () => {
    it("displays 'unmatched' for admins", () => {
      const applicationDashboard = mountApplicationDashboard([{id: 1, name: 'A+ College Ready', group: 1}], true);
      const store = applicationDashboard.find('Provider').prop('store');
      expect(store.getState().regionalPartnerFilter.label).to.eql(UNMATCHED_PARTNER_LABEL);

      // clean up saved filter for future tests
      sessionStorage.removeItem('regionalPartnerFilter');
    });

    it("displays 'all' for non-admins with multiple partners", () => {
      const applicationDashboard = mountApplicationDashboard([{id: 1, name: 'A+ College Ready', group: 1}, {id: 2, name: 'WNY Stem Hub', group: 1}], false);
      const store = applicationDashboard.find('Provider').prop('store');
      expect(store.getState().regionalPartnerFilter.label).to.eql(ALL_PARTNERS_LABEL);

      // clean up saved filter for future tests
      sessionStorage.removeItem('regionalPartnerFilter');
    });

    it("displays partner name for non-admins with one partner", () => {
      const applicationDashboard = mountApplicationDashboard([{id: 1, name: 'A+ College Ready', group: 1}], false);
      const store = applicationDashboard.find('Provider').prop('store');
      expect(store.getState().regionalPartnerFilter.label).to.eql('A+ College Ready');

      // clean up saved filter for future tests
      sessionStorage.removeItem('regionalPartnerFilter');
    });
  });
});
