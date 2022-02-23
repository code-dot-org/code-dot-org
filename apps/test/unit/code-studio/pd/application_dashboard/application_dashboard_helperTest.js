import {expect} from 'chai';
import {
  dataByStatus,
  removeIncompleteAppsFromSummaryView
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
});
