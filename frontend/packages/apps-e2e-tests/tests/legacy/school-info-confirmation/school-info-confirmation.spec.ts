import {test} from '../../shared/fixtures';

test.describe('School info confirmation dialog', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/school_info_confirmation_dialog.feature
   * Scenario: School Info Confirmation Dialog
   */
  test('school info confirmation dialog time-travel flow', async () => {
    test.skip(
      true,
      'Cucumber mutates User.created_at, last_seen_school_info_interstitial, and UserSchoolInfo.last_confirmation_date directly in Rails. The apps-e2e suite has no test endpoint for that state. Source: dashboard/test/ui/features/acquisition_products/school_info_confirmation_dialog.feature Scenario: School Info Confirmation Dialog',
    );
  });
});
