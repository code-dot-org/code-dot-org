import {expect, type Locator, type Page} from '@playwright/test';

/**
 * CSS color constants from the SCSS progress-bubble palette.
 * Sourced from dashboard/test/ui/features/step_definitions/progress.rb.
 */
const PERFECT_COLOR = 'rgb(14, 190, 14)';
const NOT_TRIED_BG_COLOR = 'rgb(254, 254, 254)';
const NOT_TRIED_BORDER_COLOR = 'rgb(198, 202, 205)';
const ASSESSMENT_COLOR = 'rgb(140, 82, 186)';

/**
 * Returns the progress bubble locator for level N (1-based) in the lesson
 * header nav bar.
 *
 * Mirrors `header_bubble_selector(level_num)` from progress.rb:
 *   `.header_level .react_stage a:eq(#{level_num - 1}) .progress-bubble`
 *
 * @param page - Playwright page
 * @param levelNum - 1-based level number within the current lesson
 */
export function headerBubble(page: Page, levelNum: number): Locator {
  return page
    .locator('.header_level .react_stage a')
    .nth(levelNum - 1)
    .locator('.progress-bubble');
}

/**
 * Asserts a progress bubble displays the "perfect" (fully completed) state.
 * Retries automatically via Playwright's built-in assertion retry.
 *
 * @param bubble - locator for the `.progress-bubble` element
 */
export async function expectPerfect(bubble: Locator): Promise<void> {
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveCSS('background-color', PERFECT_COLOR);
  await expect(bubble).toHaveCSS('border-top-color', PERFECT_COLOR);
}

/**
 * Asserts a progress bubble displays the "not tried" (pristine) state.
 *
 * @param bubble - locator for the `.progress-bubble` element
 */
export async function expectNotTried(bubble: Locator): Promise<void> {
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveCSS('background-color', NOT_TRIED_BG_COLOR);
  await expect(bubble).toHaveCSS('border-top-color', NOT_TRIED_BORDER_COLOR);
}

/**
 * Asserts a progress bubble displays the "perfect_assessment" state:
 * purple background and border (assessment color).
 *
 * @param bubble - locator for the `.progress-bubble` element
 */
export async function expectPerfectAssessment(bubble: Locator): Promise<void> {
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveCSS('background-color', ASSESSMENT_COLOR);
  await expect(bubble).toHaveCSS('border-top-color', ASSESSMENT_COLOR);
}

/**
 * Asserts a progress bubble displays the "attempted_assessment" state:
 * white background with purple border.
 *
 * @param bubble - locator for the `.progress-bubble` element
 */
export async function expectAttemptedAssessment(
  bubble: Locator,
): Promise<void> {
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveCSS('background-color', NOT_TRIED_BG_COLOR);
  await expect(bubble).toHaveCSS('border-top-color', ASSESSMENT_COLOR);
}
