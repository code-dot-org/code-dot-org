import {type Page} from '@playwright/test';

import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Level Group (multi-page) — lesson 23 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page.feature
 *
 * All scenarios are @no_mobile and @as_taught_student (student enrolled in a
 * teacher's section).  Background navigates to page 1 before each scenario.
 */

const PAGE1_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/1?noautoplay=true';
const PAGE2_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/2?noautoplay=true';
const PAGE3_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/3?noautoplay=true';

/**
 * Converts the small subset of jQuery selectors inherited from Cucumber into
 * Playwright locators.
 *
 * @param page - Playwright page on a legacy level-group level
 * @param selector - legacy selector from the source Cucumber scenario
 */
function legacyLocator(page: Page, selector: string) {
  const cssSelector = selector.replace(/\[index=(\d+)\]/g, '[index="$1"]');
  const eqMatch = cssSelector.match(/^(.*):eq\((\d+)\)(.*)$/);
  if (eqMatch) {
    const [, prefix, index, suffix] = eqMatch;
    return page.locator(prefix).nth(Number(index)).locator(suffix.trim());
  }

  if (cssSelector.endsWith(':first')) {
    return page.locator(cssSelector.slice(0, -':first'.length)).first();
  }

  return page.locator(cssSelector).first();
}

/**
 * Activates a legacy control without depending on jQuery.
 *
 * Agent Browser showed normal pointer clicks can report success on these
 * legacy answer buttons without changing the visible selected state. Calling
 * HTMLElement.click() matches the activation path the old jQuery step used.
 *
 * @param page - Playwright page on a legacy level-group level
 * @param selector - legacy selector for the control
 */
async function clickLegacyControl(page: Page, selector: string): Promise<void> {
  const target = legacyLocator(page, selector);
  await expect(target).toBeVisible();
  await target.evaluate(element => (element as HTMLElement).click());
}

/**
 * Activates an answer button and waits for the visible selected mark.
 *
 * @param page - Playwright page on a legacy level-group level
 * @param questionIndex - zero-based question index on the current page
 * @param answerIndex - answer index from the source Cucumber selector
 */
async function clickAnswerAndWait(
  page: Page,
  questionIndex: number,
  answerIndex: number,
): Promise<void> {
  const question = page.locator('.level-group-content').nth(questionIndex);
  const answer = question.locator(`.answerbutton[index="${answerIndex}"]`);
  const selectedMark = question.locator(`#checked_${answerIndex}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    await expect(answer).toBeVisible();
    await answer.evaluate(element => (element as HTMLElement).click());
    try {
      await expect(selectedMark).toBeVisible({timeout: 5000});
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
    }
  }
}

/**
 * Clicks a multi-page level-group pager and waits for visible page content.
 *
 * @param page - Playwright page on a multi-page level-group level
 * @param selector - selector for the pager control
 * @param urlPattern - expected URL after navigation
 */
async function clickPagerAndWait(
  page: Page,
  selector: string,
  urlPattern: RegExp,
): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await clickLegacyControl(page, selector);
    try {
      await page.waitForURL(urlPattern, {
        timeout: 30_000,
        waitUntil: 'domcontentloaded',
      });
      break;
    } catch (error) {
      if (urlPattern.test(page.url())) {
        break;
      }
      if (attempt === 3) {
        throw error;
      }
    }
  }
  await page
    .locator('.level-group-content')
    .first()
    .waitFor({state: 'visible', timeout: 30_000});
}

/**
 * Opens a level-group page and waits for its visible content.
 *
 * @param page - Playwright page
 * @param url - level-group page URL
 * @param expectedText - visible question/content text that identifies the page
 */
async function gotoLevelGroupPage(
  page: Page,
  url: string,
  expectedText: string,
): Promise<void> {
  await page.goto(url);
  await page
    .locator('.level-group-content')
    .first()
    .waitFor({state: 'visible', timeout: 30_000});
  await expect(
    page
      .locator('.level-group-content')
      .filter({hasText: expectedText})
      .first(),
  ).toBeVisible();
}

/**
 * Verifies page 1 answer selections are visibly persisted after reload.
 *
 * @param page - Playwright page on page 1
 */
async function expectPageOneAnswers(page: Page): Promise<void> {
  await expect(
    page.locator('.level-group-content').nth(0).locator('#checked_2'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(1).locator('#checked_1'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(2).locator('#checked_2'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(2).locator('#checked_0'),
  ).toBeVisible();
}

test.describe('Level group multi-page', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page.feature
   * Scenario: multi page level numbering
   */
  test(
    'multi-page level numbering is correct across all pages',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);

      await page.goto(PAGE1_URL);
      await page
        .locator('.nextPageButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Page 1 — first two numbered questions.
      await expect(page.locator('.level-group-number').nth(0)).toContainText(
        '1. ',
      );
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which arrow gets');

      await expect(page.locator('.level-group-number').nth(1)).toContainText(
        '2. ',
      );
      await expect(
        page.locator('.level-group-content').nth(1).locator('.multi-question'),
      ).toContainText('The standard QWERTY keyboard has');

      // Navigate to page 2.
      await clickPagerAndWait(page, '.nextPageButton', /\/page\/2/);

      // Page 2 — numbering continues from where page 1 left off.
      await expect(page.locator('.level-group-number').nth(0)).toContainText(
        '4. ',
      );
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('go at the beginning');

      await expect(page.locator('.level-group-number').nth(3)).toContainText(
        '7. ',
      );
      await expect(page.locator('.level-group-content').nth(3)).toContainText(
        'Reflecting on the ECS Curriculum',
      );

      // External level (unnumbered).
      await expect(page.locator('.level-group-content').nth(4)).toContainText(
        'Sample external 2',
      );

      await expect(page.locator('.level-group-number').nth(4)).toContainText(
        '8. ',
      );
      await expect(page.locator('.level-group-content').nth(5)).toContainText(
        'What are your goals',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page.feature
   * Scenario: Submit three pages.
   */
  test(
    'submit three pages persists all answers across reloads',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);

      await page.goto(PAGE1_URL);
      await page
        .locator('.nextPageButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which arrow gets');

      // Page 1 — answer three multis.
      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);
      // Pressing 1, 2, 0 keeps 2 and 0 (max-two selection rule).
      await clickAnswerAndWait(page, 2, 1);
      await clickAnswerAndWait(page, 2, 2);
      await clickAnswerAndWait(page, 2, 0);
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_1'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(2).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(2).locator('#checked_0'),
      ).toBeVisible();

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/2/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which step should go');
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectPageOneAnswers(page);
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');

      // Page 2 — answer three multis and two text fields.
      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 0);
      await clickAnswerAndWait(page, 2, 1);
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_0'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(2).locator('#checked_1'),
      ).toBeVisible();

      // Text with escape sequences — TypeScript \n resolves to actual newline.
      const textA = "First line \nsecond 'line'\n!@#$%^&*()_+-=~`\n\\ \\n \\t";
      const textB =
        'Another first line \nsecond "line"\n!@#$%^&*()_+-=~`\n\\ \\n \\t';
      await page.locator('textarea').nth(0).fill(textA);
      await expect(page.locator('textarea').nth(0)).toHaveValue(textA);
      await page.locator('textarea').nth(0).blur();
      await page.locator('textarea').nth(1).fill(textB);
      await expect(page.locator('textarea').nth(1)).toHaveValue(textB);
      await page.locator('textarea').nth(1).blur();
      await expect(page.locator('textarea').nth(0)).toHaveValue(textA);
      await expect(page.locator('textarea').nth(1)).toHaveValue(textB);

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/3/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which repeat block');
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_0'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(2).locator('#checked_1'),
      ).toBeVisible();
      await expect(page.locator('textarea').nth(0)).toHaveValue(textA);
      await expect(page.locator('textarea').nth(1)).toHaveValue(textB);
      await gotoLevelGroupPage(page, PAGE3_URL, 'Which repeat block');

      // Page 3 — answer two multis.
      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_1'),
      ).toBeVisible();

      // Submit the long assessment.
      await clickLegacyControl(page, '.submitButton:first');
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await Promise.all([
        page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
        clickLegacyControl(page, '.modal #ok-button'),
      ]);

      // Reload page 1 — verify selections preserved.
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectPageOneAnswers(page);

      // Reload page 2 — verify selections and text values preserved.
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_0'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(2).locator('#checked_1'),
      ).toBeVisible();
      await expect(page.locator('textarea').nth(0)).toHaveValue(textA);
      await expect(page.locator('textarea').nth(1)).toHaveValue(textB);

      // Reload page 3 — verify selections preserved.
      await gotoLevelGroupPage(page, PAGE3_URL, 'Which repeat block');
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_1'),
      ).toBeVisible();
    },
  );
});
