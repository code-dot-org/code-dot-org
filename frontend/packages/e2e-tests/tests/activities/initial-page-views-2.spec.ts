import {type Locator, type Page} from '@playwright/test';

import {expect, test} from '../fixtures';
import {ApplabLab} from '../pages/applab-lab';
import {HomePage} from '../pages/home-page';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {StandaloneVideoLevel} from '../pages/standalone-video-level';
import {UnitOverviewPage} from '../pages/unit-overview-page';
import {createStudent, resetSession, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {
  waitForHeaderSettled,
  waitForVisualStability,
} from '../shared/stability';

interface ScenarioSurface {
  rootSelector: string;
  /** Third-party markup this app cannot correct. See shared/axe.ts. */
  axeExclude?: string | string[];
  /** Content that changes between runs without moving the layout. */
  masks: Locator[];
}

interface Scenario {
  testName: string;
  goto: (page: Page) => Promise<ScenarioSurface>;
  /** Measured on all three engines, which agree. */
  violations: Record<string, number>;
}

// Two deliberate differences from the Cucumber outline:
//
// labLevelUrl() adds ?noautoplay=true, which the literal URLs omit. Part 1 sets
// it on every URL for the same reason: a video that starts by itself makes the
// first screenshot unreliable.
//
// The outline also closes the instructions overlay and waits for
// ".uitest-attachment" to hide, on all seven pages. Neither element reaches the
// document on any of them, as measured, so only App Lab still closes the
// overlay.
const SCENARIOS: Scenario[] = [
  {
    testName: 'new applab project',
    async goto(page) {
      const lab = new ApplabLab(page);
      await lab.gotoNewProject();
      await lab.closeInstructionsOverlayIfShown();
      return {
        rootSelector: lab.mainContentSelector,
        masks: [lab.projectUpdatedAt],
      };
    },
    // color-contrast: #runButton, #ffffff on #f46800, 3.07:1 against 4.5:1.
    // label: three hidden droplet keystroke inputs. scrollable-region-focusable:
    // .droplet-palette-scroller scrolls without a tabindex.
    violations: {
      'color-contrast': 1,
      label: 3,
      'scrollable-region-focusable': 1,
    },
  },
  {
    testName: 'logged in student studio homepage',
    async goto(page) {
      const home = new HomePage(page);
      await home.goto();
      await waitForHeaderSettled(page);
      return {rootSelector: home.mainContentSelector, masks: []};
    },
    violations: {},
  },
  {
    testName: 'logged in script progress',
    async goto(page) {
      const overview = new UnitOverviewPage(page);
      await overview.gotoOverview();
      await waitForHeaderSettled(page);
      return {rootSelector: overview.mainContentSelector, masks: []};
    },
    violations: {},
  },
  {
    testName: 'unplugged video level',
    async goto(page) {
      const level = new StandaloneVideoLevel(page);
      await level.gotoLevel({lesson: 34, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      return {
        rootSelector: level.mainContentSelector,
        axeExclude: level.videoIframeSelector,
        masks: [level.videoIframe],
      };
    },
    // color-contrast: "Download Video", the shared link style, 3.36:1 against 4.5:1.
    violations: {'color-contrast': 1},
  },
  {
    testName: 'no iframe in dsl',
    async goto(page) {
      // Not ExternalLevel: its gotoLevel() waits for #extra-details-tag, which
      // the curriculum sets on a different external level.
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 18, level: 14});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      return {rootSelector: level.mainContentSelector, masks: []};
    },
    // color-contrast: the markdown link, same shared style, 3.36:1 against 4.5:1.
    violations: {'color-contrast': 1},
  },
  {
    testName: 'rich long assessment',
    async goto(page) {
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 26, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      return {rootSelector: level.mainContentSelector, masks: []};
    },
    // image-alt: 10 authored screenshots and answer-choice images, none with alt text.
    violations: {'image-alt': 10},
  },
  {
    testName: 'free response',
    async goto(page) {
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 27, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      return {rootSelector: level.mainContentSelector, masks: []};
    },
    violations: {},
  },
];

test.describe('Looking at a few things with Applitools Eyes - Part 2', () => {
  for (const scenario of SCENARIOS) {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/initial_page_views2.feature "Logged in simple page view without instructions dialog"
     */
    test(scenario.testName, {tag: '@visual'}, async ({page, visualCheck}) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await createStudent(page, {name: 'Tester'});

      const {masks} = await scenario.goto(page);

      await waitForVisualStability(page);
      await visualCheck(scenario.testName, {mask: masks});

      await signOut(page);
    });
  }

  for (const scenario of SCENARIOS) {
    /** New coverage; the Cucumber feature has no equivalent. */
    test(`${scenario.testName}: no unexpected accessibility violations`, async ({
      page,
    }) => {
      await resetSession(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await createStudent(page, {name: 'Tester'});

      const {rootSelector, axeExclude} = await scenario.goto(page);

      expect(
        await analyze(page, {
          include: rootSelector,
          exclude: axeExclude,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(scenario.violations);

      await signOut(page);
    });
  }
});
