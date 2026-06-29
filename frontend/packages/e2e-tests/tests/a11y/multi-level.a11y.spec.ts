import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';
import {expectBaselineViolations} from '../shared/a11y';

/**
 * Dedicated accessibility coverage for the multi (multiple-choice) level page.
 * One test per meaningful page state; each scans with axe-core and asserts the
 * violations match a known baseline. New violations fail. Functional behavior
 * lives in tests/levels/multi.spec.ts — this file is a11y only.
 */
test.describe('Accessibility: multi level', () => {
  test('multi level — initial load', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1});

    await expectBaselineViolations(page, ['color-contrast', 'image-alt']);
  });

  test('multi level — win modal', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1});

    // Index 1 is the correct answer; the win modal is server-gated behind the
    // milestone POST.
    await level.clickAnswer(1);
    await level.submit();
    await expect(level.modal).toBeVisible();

    // Scope to the modal: the background re-renders on the milestone POST, and a
    // page-level scan flakes there.
    await expectBaselineViolations(page, ['color-contrast'], {
      selector: '.modal',
    });
  });

  test('multi level — dismissed incorrect modal', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1, lang: 'en-US'});

    // Index 0 is incorrect.
    await level.clickAnswer(0);
    await level.submit();
    await expect(level.modal).toBeVisible();
    await level.dismissModal();
    await expect(level.crossMark(0)).toBeVisible();

    await expectBaselineViolations(page, ['color-contrast', 'image-alt']);
  });
});
