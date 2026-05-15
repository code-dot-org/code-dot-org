import {type Page} from '@playwright/test';

import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {
  expectAttemptedAssessment,
  expectNotTried,
  expectPerfectAssessment,
  headerBubble,
} from '../../shared/progress';

/**
 * Level Group (multi-page) progress dots — lesson 23 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page_dots.feature
 *
 * All scenarios tagged @no_mobile and @as_taught_student.
 * The multi-page assessment lives at lessons/23/levels/2 (pages 1–3).
 * Header progress bubble positions: level 2 = page 1, level 3 = page 2, level 4 = page 3.
 */

const PAGE1_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/1?noautoplay=true';
const PAGE2_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/2?noautoplay=true';
const PAGE3_URL =
  '/courses/allthethingscourse/units/1/lessons/23/levels/2/page/3?noautoplay=true';
const UNIT_URL = '/courses/allthethingscourse/units/1';

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

/**
 * Verifies the optional-free-play page 1 selections are visibly selected.
 *
 * @param page - Playwright page on page 1
 */
async function expectOptionalPageOneAnswers(page: Page): Promise<void> {
  await expect(
    page.locator('.level-group-content').nth(0).locator('#checked_2'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(1).locator('#checked_1'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(2).locator('#checked_0'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(2).locator('#checked_1'),
  ).toBeVisible();
}

/**
 * Verifies the optional-free-play page 2 selections are visibly selected.
 *
 * @param page - Playwright page on page 2
 */
async function expectOptionalPageTwoMultis(page: Page): Promise<void> {
  await expect(
    page.locator('.level-group-content').nth(0).locator('#checked_2'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(1).locator('#checked_1'),
  ).toBeVisible();
  await expect(
    page.locator('.level-group-content').nth(2).locator('#checked_0'),
  ).toBeVisible();
}

/**
 * Returns a unit progress-table bubble matching Cucumber's lesson/level index.
 *
 * @param page - Playwright page with a summary progress table attached
 * @param lesson - 1-based lesson number
 * @param level - 1-based level number
 */
function progressTableBubble(page: Page, lesson: number, level: number) {
  return page
    .locator('.uitest-summary-progress-table .uitest-summary-progress-row')
    .nth(lesson - 1)
    .locator('.progress-bubble')
    .nth(level - 1);
}

/**
 * Opens the header progress dropdown and waits for its summary table.
 *
 * @param page - Playwright page on a level
 */
async function openProgressDropDown(page: Page): Promise<void> {
  await dismissInstructionsOverlayIfPresent(page);
  await page.locator('.header_popup_link').click();
  await page
    .locator('.uitest-summary-progress-table')
    .waitFor({state: 'attached', timeout: 30_000});
}

/**
 * Dismisses the instruction overlay shown by the standalone level reached after
 * assessment submission. The header is visible while the overlay is open, but
 * the overlay intercepts pointer events.
 *
 * @param page - Playwright page that may have an instructions overlay
 */
async function dismissInstructionsOverlayIfPresent(page: Page): Promise<void> {
  const okButton = page.getByRole('button', {name: 'OK'});
  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click();
  }
  await page
    .locator('#overlay')
    .waitFor({state: 'hidden', timeout: 5000})
    .catch(() => undefined);
}

/**
 * Checks the page 1, 2, and 3 assessment progress bubbles.
 *
 * @param bubbleFor - callback returning a bubble by level number
 */
async function expectPageProgress(
  bubbleFor: (level: number) => ReturnType<typeof headerBubble>,
): Promise<void> {
  await expectPerfectAssessment(bubbleFor(2));
  await expectNotTried(bubbleFor(3));
  await expectAttemptedAssessment(bubbleFor(4));
}

/**
 * Opens the unit page and waits for its visible progress table to catch up.
 *
 * @param page - Playwright page
 */
async function gotoUnitAndExpectPageProgress(page: Page): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(UNIT_URL);
    await page
      .locator('.uitest-summary-progress-table')
      .waitFor({state: 'attached', timeout: 30_000});
    try {
      await expectPageProgress(level => progressTableBubble(page, 23, level));
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
    }
  }
}

test.describe('Level group multi-page dots', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page_dots.feature
   * Scenario: Submit three pages as... 1. all, 2. none, 3. some questions answered.
   */
  test(
    'progress dots reflect partial/full/none answers across three pages',
    {tag: '@no_mobile'},
    async ({page}) => {
      test.slow();
      await createTeacherAssociatedStudent(page);

      await page.goto(PAGE1_URL);
      await page
        .locator('.nextPageButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which arrow gets');

      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);
      await clickAnswerAndWait(page, 2, 1);
      await clickAnswerAndWait(page, 2, 2);
      await clickAnswerAndWait(page, 2, 0);
      await expectPageOneAnswers(page);

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/2/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which step should go');
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectPageOneAnswers(page);
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/3/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which repeat block');
      await clickAnswerAndWait(page, 0, 2);
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();

      await clickPagerAndWait(page, '.previousPageButton', /\/page\/2/);
      await gotoLevelGroupPage(page, PAGE3_URL, 'Which repeat block');
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectPageOneAnswers(page);
      await clickPagerAndWait(page, '.nextPageButton', /\/page\/2/);
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectPageOneAnswers(page);

      await page.reload();
      await page
        .locator('.react_stage')
        .waitFor({state: 'visible', timeout: 30_000});
      await expectPageProgress(level => headerBubble(page, level));

      await openProgressDropDown(page);
      await expectPageProgress(level => progressTableBubble(page, 23, level));

      await gotoUnitAndExpectPageProgress(page);

      await page.goto(PAGE3_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await clickLegacyControl(page, '.submitButton');
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.dialog-title')).toContainText(
        'Submit your assessment',
      );
      await Promise.all([
        page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
        clickLegacyControl(page, '#ok-button'),
      ]);

      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/23/levels/1?noautoplay=true',
      );
      await page
        .locator('.react_stage')
        .waitFor({state: 'visible', timeout: 30_000});
      await expectPageProgress(level => headerBubble(page, level));

      await openProgressDropDown(page);
      await expectPageProgress(level => progressTableBubble(page, 23, level));

      await gotoUnitAndExpectPageProgress(page);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_group_multi_page_dots.feature
   * Scenario: optional free play level
   */
  test(
    'optional free play level: incomplete warning clears after answering optional question',
    {tag: '@no_mobile'},
    async ({page}) => {
      test.slow();
      await createTeacherAssociatedStudent(page);

      // ── Page 1 — answer all three multis ────────────────────────────────────
      await page.goto(PAGE1_URL);
      await page
        .locator('.nextPageButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which arrow gets');

      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);
      // Last question requires two boxes checked.
      await clickAnswerAndWait(page, 2, 0);
      await clickAnswerAndWait(page, 2, 1);
      await expectOptionalPageOneAnswers(page);

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/2/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which step should go');
      await gotoLevelGroupPage(page, PAGE1_URL, 'Which arrow gets');
      await expectOptionalPageOneAnswers(page);
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');

      // ── Page 2 — answer three multis; skip markdown and free response ───────
      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);
      await clickAnswerAndWait(page, 2, 0);
      await expectOptionalPageTwoMultis(page);

      await clickPagerAndWait(page, '.nextPageButton', /\/page\/3/);
      await expect(
        page.locator('.level-group-content').nth(0).locator('.multi-question'),
      ).toContainText('Which repeat block');

      // ── Page 3 — answer both multis ─────────────────────────────────────────
      await clickAnswerAndWait(page, 0, 2);
      await clickAnswerAndWait(page, 1, 1);

      // Page 2 (level 3) is "attempted_assessment" — optional free response unanswered.
      await expectAttemptedAssessment(headerBubble(page, 3));

      // Submit — modal warns about incomplete questions.
      await clickLegacyControl(page, '.submitButton');
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.dialog-title')).toContainText(
        'Submit your assessment',
      );
      await expect(page.locator('.modal-body')).toContainText(
        'You left some questions incomplete',
      );

      // Cancel — go back to page 2 to fill the optional free response.
      await clickLegacyControl(page, '#cancel-button');
      await clickPagerAndWait(page, '.previousPageButton', /\/page\/2/);

      // Fill the optional free response on page 2.
      await page.locator('.response').first().fill('hello world');
      await expect(page.locator('.response').first()).toHaveValue(
        'hello world',
      );
      await page.locator('.response').first().blur();
      await expectOptionalPageTwoMultis(page);

      // Navigate to page 3.
      await clickPagerAndWait(page, '.nextPageButton', /\/page\/3/);
      await gotoLevelGroupPage(page, PAGE2_URL, 'Which step should go');
      await expectOptionalPageTwoMultis(page);
      await expect(page.locator('.response').first()).toHaveValue(
        'hello world',
      );
      await gotoLevelGroupPage(page, PAGE3_URL, 'Which repeat block');
      await expect(
        page.locator('.level-group-content').nth(0).locator('#checked_2'),
      ).toBeVisible();
      await expect(
        page.locator('.level-group-content').nth(1).locator('#checked_1'),
      ).toBeVisible();

      // All three pages now show perfect_assessment.
      await expectPerfectAssessment(headerBubble(page, 2));
      await expectPerfectAssessment(headerBubble(page, 3));
      await expectPerfectAssessment(headerBubble(page, 4));

      // Submit — no incomplete-questions warning.
      await clickLegacyControl(page, '.submitButton');
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.dialog-title')).toContainText(
        'Submit your assessment',
      );
      await expect(page.locator('.modal-body')).not.toContainText(
        'You left some questions incomplete',
      );
    },
  );
});
