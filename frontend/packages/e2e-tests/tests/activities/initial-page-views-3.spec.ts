import {type Locator, type Page} from '@playwright/test';

import {expect, test} from '../fixtures';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {SignInPage} from '../pages/sign-in';
import {UnitOverviewPage} from '../pages/unit-overview-page';
import {createStudent, resetSession, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {
  waitForHeaderSettled,
  waitForVisualStability,
} from '../shared/stability';

interface ScenarioSurface {
  rootSelector: string;
  masks: Locator[];
}

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/initial_page_views3.feature "Temporarily
 * circle disabled simple dashboard page view without instructions dialog"
 */
test.describe('Looking at a few things with Applitools Eyes - Part 3', () => {
  test(
    'embedded blocks',
    {tag: ['@visual', '@no_ci']},
    async ({page, visualCheck}) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await createStudent(page, {name: 'Tester'});

      const level = new LessonLevelPage(page);
      // lesson 13/level 1 no longer hosts a lab (its embedded-Blockly feature
      // was deprecated in 2025); it renders as a plain instructional level with
      // no #overlay, so there is no overlay to close here.
      await level.gotoLevel({lesson: 13, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();

      await waitForVisualStability(page);
      await visualCheck('embedded blocks');

      await signOut(page);
    },
  );

  /** New coverage; the Cucumber feature has no equivalent. */
  test(
    'embedded blocks: no unexpected accessibility violations',
    {tag: '@no_ci'},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await createStudent(page, {name: 'Tester'});

      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 13, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();

      // color-contrast: the "deprecated" markdown link, #0596ce on #ffffff,
      // 3.35:1 against 4.5:1 (same shared link style Part 2 measured at 3.36:1).
      expect(
        await analyze(page, {
          include: level.mainContentSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual({'color-contrast': 1});

      await signOut(page);
    },
  );

  interface Scenario {
    testName: string;
    goto: (page: Page) => Promise<ScenarioSurface>;
    /** Measured on all three engines, which agree. */
    violations: Record<string, number>;
  }

  // The outline also dismisses the language selector on both pages. That step
  // clicks ".close" on the LocalizeJS language-suggestion widget, which this
  // build no longer renders: measured 0 matches on both pages, so the step is
  // dropped. Today's language selector is the chrome locale <select>, a
  // different widget that needs no dismissal.
  const LOGGED_OUT_SCENARIOS: Scenario[] = [
    {
      testName: 'logged out studio homepage',
      async goto(page) {
        // Anonymous "/" 302-redirects to the sign-in page, so the surface under
        // test is that page (HomeController#index).
        const signIn = new SignInPage(page);
        await page.goto('/', {waitUntil: 'domcontentloaded'});
        return {
          rootSelector: signIn.mainContentSelector,
          // The autofocused "Email or Username" field's focus ring anti-aliases
          // differently between loads (measured: byte-diff, no visible region).
          masks: [signIn.loginInput],
        };
      },
      // color-contrast: "Continue with Google", #ffffff on #0f9d58, 3.5:1
      // against 4.5:1.
      violations: {'color-contrast': 1},
    },
    {
      testName: 'logged out script progress',
      async goto(page) {
        const overview = new UnitOverviewPage(page);
        await overview.gotoOverview();
        return {rootSelector: overview.mainContentSelector, masks: []};
      },
      violations: {},
    },
  ];

  for (const scenario of LOGGED_OUT_SCENARIOS) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views3.feature "Logged
     * out simple page view without instructions dialog"
     */
    test(scenario.testName, {tag: '@visual'}, async ({page, visualCheck}) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});

      const {masks} = await scenario.goto(page);

      // The sign-in page's OAuth-button icons do use Font Awesome on this
      // build, unlike the Cucumber comment's claim, but skipping that wait
      // stays safe: waitForVisualStability only ever awaits document.fonts.
      await waitForVisualStability(page);
      await visualCheck(scenario.testName, {mask: masks});
    });
  }

  for (const scenario of LOGGED_OUT_SCENARIOS) {
    /** New coverage; the Cucumber feature has no equivalent. */
    test(`${scenario.testName}: no unexpected accessibility violations`, async ({
      page,
    }) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});

      const {rootSelector} = await scenario.goto(page);

      expect(
        await analyze(page, {include: rootSelector, tags: WCAG_AA_TAGS}),
      ).toEqual(scenario.violations);
    });
  }
});
