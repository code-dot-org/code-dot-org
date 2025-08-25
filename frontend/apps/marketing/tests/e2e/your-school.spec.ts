import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {MarketingPage} from './pom/marketing';
import {getSiteType} from './utils/getSiteType';

test.describe('Adoption Map', () => {
  test(
    'should be able to render the adoption map',
    {tag: '@corporate'},
    async ({page}) => {
      test.skip(getSiteType() !== 'corporate', 'Only runs on corporate site');

      const marketingPage = new MarketingPage(page);
      await marketingPage.goto('/your-school');

      const adoptionMap = page.getByRole('region', {name: 'Map', exact: true});

      await expect(adoptionMap).toBeVisible();
    },
  );
});
