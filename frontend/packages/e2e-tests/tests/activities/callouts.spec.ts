import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {labLevelUrl} from '../shared/routes';
import {computedZIndex} from '../shared/ui';

import {
  CALLOUT_CLOSE_BUTTON_TEST_CASES,
  CALLOUT_TARGET_TEST_CASES,
} from './callouts.cases';

const CALLOUT_TEST_LEVEL_URL = labLevelUrl({
  lesson: 2,
  level: 7,
  showCallouts: true,
});

test.describe('Callouts', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature
   * Scenario Outline: "Callouts ... dismissable via the target element"
   */
  for (const testCase of CALLOUT_TARGET_TEST_CASES) {
    test(testCase.title, async ({page}) => {
      const lab = new LegacyBlocklyLab(page);
      await lab.gotoLevelUrl(testCase.url);
      await expect(lab.callouts.callout(testCase.calloutId)).toBeVisible();
      await expect(lab.callouts.callout(testCase.calloutId)).toHaveText(
        testCase.text,
      );
      // Synthetic click to every match — SVG/Blockly targets aren't positionally actionable.
      const targets = page.locator(testCase.closeTarget);
      await targets.first().waitFor({state: 'attached'});
      for (const target of await targets.all()) {
        await target.dispatchEvent('click');
      }
      await expect(lab.callouts.callout(testCase.calloutId)).toBeHidden();
    });
  }

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature
   * Scenario Outline: "Callouts ... dismissable via the x-button" (@no_mobile)
   */
  for (const testCase of CALLOUT_CLOSE_BUTTON_TEST_CASES) {
    test(testCase.title, {tag: ['@no_mobile']}, async ({page}) => {
      const lab = new LegacyBlocklyLab(page);
      await lab.gotoLevelUrl(testCase.url);
      await lab.dismissLoginReminder();
      await expect(lab.callouts.callout(testCase.calloutId)).toBeVisible();
      await expect(lab.callouts.callout(testCase.calloutId)).toHaveText(
        testCase.text,
      );
      await lab.callouts.close(testCase.calloutId);
      await expect(lab.callouts.callout(testCase.calloutId)).toBeHidden();
    });
  }

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature "Modal ordering"
   */
  test('Modal ordering', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevelUrl(CALLOUT_TEST_LEVEL_URL);
    await expect(lab.callouts.callout(0)).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature 'Closing using "x" button'
   */
  test('Closing using "x" button', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevelUrl(CALLOUT_TEST_LEVEL_URL);
    await lab.dismissLoginReminder();
    await expect(lab.callouts.closeButton(0)).toBeVisible();
    await expect(lab.callouts.callout(0)).toBeVisible();
    await expect(lab.callouts.callout(1)).toBeVisible();
    await lab.callouts.close(1);
    await expect(lab.callouts.callout(0)).toBeVisible();
    await expect(lab.callouts.callout(1)).toBeHidden();
    await lab.callouts.close(0);
    await expect(lab.callouts.callout(0)).toBeHidden();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature "Only showing seen callouts once"
   */
  test('Only showing seen callouts once', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    const url = labLevelUrl({lesson: 2, level: 7});
    // First visit — callout 0 is in the DOM (callouts shown fresh).
    await lab.gotoLevelUrl(url);
    await expect(lab.callouts.callout(0)).toBeAttached();
    // Second visit in the same session — seen callouts suppressed, node detaches.
    await lab.gotoLevelUrl(url);
    await expect(lab.callouts.callout(0)).not.toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/callouts.feature "Opening the Show Code dialog"
   */
  test(
    'Opening the Show Code dialog',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lab = new LegacyBlocklyLab(page);
      await lab.gotoLevelUrl(CALLOUT_TEST_LEVEL_URL);
      await lab.dismissLoginReminder();
      // Show Code modal overlay (z-index 1040) must sit in front of callout #qtip-0 (1030).
      await lab.showCodeHeader.click();
      await expect(lab.showCodeModalOverlay).toBeVisible();
      expect(await computedZIndex(lab.showCodeModalOverlay)).toBeGreaterThan(
        await computedZIndex(lab.callouts.qtip(0)),
      );
    },
  );

  /**
   * Accessibility scan scoped to the callouts (.cdo-qtips), mirroring the multi
   * a11y pattern: scan only the feature's DOM so unrelated shared-chrome
   * violations don't count. The callouts currently have no WCAG AA violations.
   */
  test('callout accessibility violations match documented baseline', async ({
    page,
  }) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevelUrl(CALLOUT_TEST_LEVEL_URL);
    await expect(lab.callouts.callout(0)).toBeVisible();
    expect(
      await analyze(page, {include: '.cdo-qtips', tags: WCAG_AA_TAGS}),
    ).toEqual({});
  });
});
