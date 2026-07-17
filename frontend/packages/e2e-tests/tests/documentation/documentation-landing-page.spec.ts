import {expect, test} from '@playwright/test';

import {analyze, WCAG_AA_TAGS} from '../shared/axe';

import {DocumentationPage} from './documentation-page';

// Pre-existing WCAG AA color-contrast debt on the docs pages, locked as a
// regression baseline: rule id -> failing node count. settle() makes the counts
// deterministic across chromium/firefox/webkit; a new violation, or a fixed one,
// breaks the test and prompts a re-baseline. Both scopes exclude the shared
// header/footer chrome. The applab .page-content article body is intentionally
// NOT scanned: its count flaps 224/225 across engines and would flake the gate,
// so the stable .nav-bar sidebar stands in for that page.
//
// landingPage (#main_content) = 18 = two failures on each of the 9 IDE cards:
//   - lab-name <h2> heading, teal #0093a4 on #fff, 3.67:1 (needs 4.5:1)   x9
//   - "View Code Docs" pill, #fff on orange #ffa400, 1.98:1               x9
// applabNavBar (.nav-bar) = 11 = the 11 block-category toggle titles (Canvas,
//   Data, Turtle, Control, Math, Variables, Functions, Advanced, Maker, Circuit,
//   micro:bit): grey #696969 on each category's pastel accent, 1.71:1-4.08:1.
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

      expect(
        await analyze(page, {
          include: docs.mainContentSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.landingPage);
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

      expect(
        await analyze(page, {include: docs.navBarSelector, tags: WCAG_AA_TAGS}),
      ).toEqual(EXPECTED_VIOLATIONS.applabNavBar);
    },
  );
});
