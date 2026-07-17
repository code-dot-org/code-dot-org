import {expect, test} from '@playwright/test';

import {DocumentationPage} from './documentation-page';

test.describe('Documentation Landing Page', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/documentation_landing_page.feature "Documentation landing page displays"
   */
  test(
    'Documentation landing page displays',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const docs = new DocumentationPage(page);

      await docs.gotoLandingPage();

      await expect(docs.mainContent).toBeVisible();
      await expect(docs.mainContent).toContainText('IDEs');
      await expect(docs.mainContent).toContainText('Sprite Lab');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/documentation_landing_page.feature "Applab Documentation landing page displays"
   */
  test(
    'Applab Documentation landing page displays',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const docs = new DocumentationPage(page);

      await docs.gotoProgrammingEnvironmentDocs('applab');

      await expect(docs.mainContent).toBeVisible();
      await expect(docs.heading).toContainText('App Lab Documentation');
      await expect(docs.pageContent).toContainText('UI controls');
      await expect(docs.pageContent).toContainText('onEvent');
      await expect(docs.navBar).toContainText('UI controls');
    },
  );
});
