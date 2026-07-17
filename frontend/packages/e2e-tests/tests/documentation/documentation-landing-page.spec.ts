import {expect, test} from '@playwright/test';

import {analyze, WCAG_AA_TAGS} from '../shared/axe';

import {DocumentationPage} from './documentation-page';

// Pre-existing WCAG AA color-contrast debt on the server-rendered docs pages,
// locked as a regression baseline: rule id -> failing node count (settle() makes
// the counts deterministic across engines). Scoped to the feature's own content
// so shared header/footer chrome does not count. The applab article body
// (.page-content) is deliberately not scanned — its count flaps 224/225 between
// firefox and the others — so the stable .nav-bar sidebar stands in for the
// IDE-docs page. A new violation, or a fixed one, breaks the test: re-baseline it.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  landingPage: {'color-contrast': 18},
  applabNavBar: {'color-contrast': 11},
};

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

  test(
    'Documentation landing page has no unexpected accessibility violations',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const docs = new DocumentationPage(page);

      await docs.gotoLandingPage();
      await expect(docs.mainContent).toBeVisible();

      expect(
        await analyze(page, {include: docs.mainSelector, tags: WCAG_AA_TAGS}),
      ).toEqual(EXPECTED_VIOLATIONS.landingPage);
    },
  );

  test(
    'Applab documentation sidebar has no unexpected accessibility violations',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const docs = new DocumentationPage(page);

      await docs.gotoProgrammingEnvironmentDocs('applab');
      await expect(docs.navBar).toBeVisible();

      expect(
        await analyze(page, {include: docs.navBarSelector, tags: WCAG_AA_TAGS}),
      ).toEqual(EXPECTED_VIOLATIONS.applabNavBar);
    },
  );
});
