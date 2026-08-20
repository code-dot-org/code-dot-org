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
  /** Scoped a11y-scan include selector; every POM here inherits #main_content from BasePage. */
  rootSelector: string;
  /**
   * Frame-selector chain excluded from the a11y scan (see shared/axe.ts). Only
   * the unplugged-video-level scenario needs this: its #video iframe embeds a
   * live, cross-origin YouTube player whose own UI axe otherwise descends
   * into, producing violations (aria-allowed-attr, aria-prohibited-attr,
   * button-name) that belong to YouTube, not this app, and that vary with
   * YouTube's own markup.
   */
  axeExclude?: string | string[];
  /** Elements masked out of the visual check for run-to-run content that never affects the app's own layout. */
  masks: Locator[];
}

interface Scenario {
  testName: string;
  goto: (page: Page) => Promise<ScenarioSurface>;
  /** Measured against rootSelector (minus axeExclude), identical on all three engines. */
  violations: Record<string, number>;
}

// The literal Cucumber URLs for the four lesson/level scenarios below (unplugged
// video level, no iframe in dsl, rich long assessment, free response) carry no
// query string at all, but labLevelUrl()'s noautoplay default appends
// ?noautoplay=true to every one of them. Accepted deliberately, not silently:
// Part 1's own Examples table bakes the identical ?noautoplay=true onto every
// literal URL for the same reason (autoplaying video is the one thing that can
// make an "initial load" screenshot non-deterministic), so this matches
// established suite convention rather than diverging from it.
const SCENARIOS: Scenario[] = [
  {
    testName: 'new applab project',
    async goto(page) {
      const lab = new ApplabLab(page);
      await lab.gotoNewProject();
      await lab.closeInstructionsOverlayIfShown();
      await lab.assertAttachmentsWidgetSettled();
      return {
        rootSelector: lab.mainContentSelector,
        masks: [lab.savedTimestamp],
      };
    },
    // color-contrast: #runButton label, #ffffff on #f46800 is 3.07:1 (needs 4.5:1) — shared Run-button style, same as Part 1.
    // label: droplet's three hidden keystroke-capture inputs (.ace_text-input, .droplet-hidden-input, an unclassed textarea).
    // scrollable-region-focusable: .droplet-palette-scroller, a scrollable toolbox panel with no tabindex.
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
      await home.closeInstructionsOverlayIfShown();
      await home.assertAttachmentsWidgetSettled();
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
      await overview.closeInstructionsOverlayIfShown();
      await overview.assertAttachmentsWidgetSettled();
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
      await level.closeInstructionsOverlayIfShown();
      await level.assertAttachmentsWidgetSettled();
      // A live, cross-origin YouTube embed; its own player chrome/thumbnail can vary run-to-run.
      return {
        rootSelector: level.mainContentSelector,
        axeExclude: ['#video', '*'],
        masks: [level.videoIframe],
      };
    },
    // color-contrast: "Download Video" link, #0596ce on #ffffff is 3.36:1 (needs 4.5:1) — shared link style.
    // frame-title: #video has no title attribute (a11y gap; the iframe's own YouTube content is excluded above).
    violations: {'color-contrast': 1, 'frame-title': 1},
  },
  {
    testName: 'no iframe in dsl',
    async goto(page) {
      // Not ExternalLevel: its gotoLevel() waits for #extra-details-tag, authored
      // only on a different external level than this one. This level needs no
      // lab-specific locator, so the plain LessonLevelPage base is enough.
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 18, level: 14});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      await level.closeInstructionsOverlayIfShown();
      await level.assertAttachmentsWidgetSettled();
      return {rootSelector: level.mainContentSelector, masks: []};
    },
    // color-contrast: the markdown-authored "this link", #0596ce on #ffffff is 3.36:1 (needs 4.5:1) — same shared link style as above.
    violations: {'color-contrast': 1},
  },
  {
    testName: 'rich long assessment',
    async goto(page) {
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 26, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      await level.closeInstructionsOverlayIfShown();
      await level.assertAttachmentsWidgetSettled();
      return {rootSelector: level.mainContentSelector, masks: []};
    },
    // image-alt: 10 authored screenshots illustrating Next/Previous/Submit and answer-choice images, none carrying alt text.
    violations: {'image-alt': 10},
  },
  {
    testName: 'free response',
    async goto(page) {
      const level = new LessonLevelPage(page);
      await level.gotoLevel({lesson: 27, level: 1});
      await waitForHeaderSettled(page);
      await level.waitForLessonHeaderRendered();
      await level.closeInstructionsOverlayIfShown();
      // The deflake hack this scenario's Cucumber comment names: the Attachments
      // widget shows "Loading..." for ~200ms after domcontentloaded before
      // settling (empty, for this fresh-account fixture).
      await level.assertAttachmentsWidgetSettled();
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
      await page.goto('/');
      await createStudent(page, {name: 'Tester'});

      const {masks} = await scenario.goto(page);

      await waitForVisualStability(page);
      await visualCheck(scenario.testName, {mask: masks});

      await signOut(page);
    });
  }

  for (const scenario of SCENARIOS) {
    /** Net-new coverage; no Cucumber source. */
    test(`${scenario.testName}: no unexpected accessibility violations`, async ({
      page,
    }) => {
      await resetSession(page);
      await page.goto('/');
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
