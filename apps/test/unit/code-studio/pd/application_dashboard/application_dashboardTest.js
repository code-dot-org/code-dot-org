import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import {
  UNMATCHED_PARTNER_LABEL,
  ALL_PARTNERS_LABEL,
} from '@cdo/apps/code-studio/pd/components/regional_partner_dropdown';

describe('ApplicationDashboard', () => {
  const getReduxStateFor = ({regionalPartners, isWorkshopAdmin}) => {
    const applicationDashboard = mount(
      <ApplicationDashboard
        regionalPartners={regionalPartners}
        isWorkshopAdmin={isWorkshopAdmin}
        canLockApplications={false}
      />
    );
    return applicationDashboard.find('Provider').prop('store').getState();
  };

  describe('heading/title initially', () => {
    afterEach(() => {
      sessionStorage.removeItem('regionalPartnerFilter');
    });

    it("displays 'unmatched' for admins", () => {
      const state = getReduxStateFor({
        regionalPartners: [{id: 1, name: 'A+ College Ready', group: 1}],
        isWorkshopAdmin: true,
      });
      expect(state.regionalPartners.regionalPartnerFilter.label).toEqual(
        UNMATCHED_PARTNER_LABEL
      );
    });

    it("displays 'all' for non-admins with multiple partners", () => {
      const state = getReduxStateFor({
        regionalPartners: [
          {id: 1, name: 'A+ College Ready', group: 1},
          {id: 2, name: 'WNY Stem Hub', group: 1},
        ],
        isWorkshopAdmin: false,
      });
      expect(state.regionalPartners.regionalPartnerFilter.label).toEqual(
        ALL_PARTNERS_LABEL
      );
    });

    it('displays partner name for non-admins with one partner', () => {
      const state = getReduxStateFor({
        regionalPartners: [{id: 1, name: 'A+ College Ready', group: 1}],
        isWorkshopAdmin: false,
      });
      expect(state.regionalPartners.regionalPartnerFilter.label).toEqual(
        'A+ College Ready'
      );
    });
  });
});
