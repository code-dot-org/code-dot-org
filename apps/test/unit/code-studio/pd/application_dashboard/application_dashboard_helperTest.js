import {expect} from 'chai';
import {
  dataByStatus,
  removeIncompleteAppsFromSummaryView,
  removeIncompleteAppsFromQuickView
} from '@cdo/apps/code-studio/pd/application_dashboard/applicationDashboardHelper';

describe('applicationDashboardHelpers', () => {
  describe('removeIncompleteAppsFromSummaryView', () => {
    it('strips incomplete applications from data', () => {
      const dataWithIncompletes = {
        csd_teachers: {
          ...dataByStatus,
          incomplete: {locked: 0, total: 0}
        },
        csp_teachers: {
          ...dataByStatus,
          incomplete: {locked: 0, total: 0}
        },
        csa_teachers: {
          ...dataByStatus,
          incomplete: {locked: 0, total: 0}
        }
      };

      expect(
        removeIncompleteAppsFromSummaryView(dataWithIncompletes)
      ).to.deep.equal({
        csd_teachers: {
          ...dataByStatus
        },
        csp_teachers: {
          ...dataByStatus
        },
        csa_teachers: {
          ...dataByStatus
        }
      });
    });
  });
  describe('removeIncompleteAppsFromQuickView', () => {
    it('removes incomplete applications', () => {
      const incompleteApplication = {
        applicant_name: 'Harry',
        id: 16,
        status: 'incomplete'
      };

      const applications = [
        incompleteApplication,
        {
          applicant_name: 'Severus',
          id: 30,
          status: 'unreviewed'
        },
        {
          applicant_name: 'Jenny',
          id: 13,
          status: 'withdrawn'
        }
      ];

      expect(removeIncompleteAppsFromQuickView(applications)).to.deep.equal(
        applications.slice(1)
      );
    });
  });
});
