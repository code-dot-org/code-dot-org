import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {RegionalWorkshopCatalogPage} from './RegionalWorkshopCatalogPage';

test.describe('Regional workshop catalog', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature
   * Scenario: Entering a zip with no matches shows No Workshops Found view
   */
  test(
    'zip with no regional partner shows no-workshops view',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'New Teacher'});
      const catalog = new RegionalWorkshopCatalogPage(page);

      await catalog.goto();
      await catalog.searchZip('99999');

      await expect(page.getByText('No regional partner found')).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.getByRole('heading', {name: 'No workshops found'}),
      ).toBeVisible();
    },
  );
});
