import {createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {RegionalWorkshopCatalogPage} from './RegionalWorkshopCatalogPage';

const REGGIE_PARTNER_NAME = 'Reggie Partner';
const REGGIE_ZIP = '90210';

test.describe('Regional workshop catalog', () => {
  test.describe.configure({mode: 'serial'});

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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature
   * Scenario: Entering a zip with a regional partner match allows user to see more info about and contact them
   */
  test(
    'regional partner match allows partner info and contact',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'New Teacher'});
      const catalog = new RegionalWorkshopCatalogPage(page);

      await catalog.goto();
      await catalog.searchZip(REGGIE_ZIP);
      await catalog.expectRegionalPartnerWorkshops(REGGIE_PARTNER_NAME);
      await catalog.openAndClosePartnerInfo();
      await catalog.expectPartnerContactHref(REGGIE_ZIP);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature
   * Scenario: Entering a zip with a regional partner match shows user the available workshops
   */
  test(
    'regional partner match shows available workshops',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'New Teacher'});
      const catalog = new RegionalWorkshopCatalogPage(page);

      await catalog.goto();
      await catalog.searchZip(REGGIE_ZIP);
      await catalog.expectRegionalPartnerWorkshops(REGGIE_PARTNER_NAME);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/regional_workshop_catalog.feature
   * Scenario: If sent to this page with a zip code url param the page obtains the regional partner and relevant workshops
   */
  test(
    'zip URL param loads regional partner and workshops',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'New Teacher'});
      const catalog = new RegionalWorkshopCatalogPage(page);

      await catalog.gotoWithZip(REGGIE_ZIP);
      await catalog.expectRegionalPartnerWorkshops(REGGIE_PARTNER_NAME);
    },
  );
});
