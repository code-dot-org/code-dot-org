import {expect} from '@playwright/test';

import {test} from './fixtures/base';
import {AllTheThingsPage} from './pom/all-the-things';
import {getAppStageFromTestStage, getTestStage} from './utils/stage';

test.describe('Environment Variable Tests', () => {
  test('should set the correct environment variables on the client', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only runs in Chromium');
    test.skip(getTestStage() === 'development', 'Only runs in Docker mode');

    const allTheThingsPage = new AllTheThingsPage(page, {locale: 'en-US'});
    await allTheThingsPage.goto();

    // The window['__ENV'] variable should be set to the appropriate environment variables
    await expect(page.evaluate(() => window['__ENV'])).resolves.toEqual({
      NEXT_PUBLIC_STAGE: getAppStageFromTestStage(),
    });
  });
});
