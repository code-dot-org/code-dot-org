import {type Page} from '@playwright/test';

import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Level Group level type — lesson 33 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/level_group.feature
 *
 * All scenarios tagged @no_mobile (propagated from the source feature).
 */

const LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/33/levels/1?noautoplay=true';

/**
 * Drag an answer tile from a match level's unplaced pool into its first
 * empty slot.  The match level is identified by its 0-based index within all
 * `.match` containers on the page.
 *
 * Mirrors `I drag match level N unplaced answer 0 to empty slot 0` from
 * match_steps.rb (uses `.match:eq(N) .match_answers .answer:eq(0)` → slot).
 *
 * @param page - Playwright page
 * @param matchIndex - 0-based index of the `.match` container
 */
async function dragFirstUnplacedToFirstSlot(
  page: Page,
  matchIndex: number,
): Promise<void> {
  const match = page.locator('.match').nth(matchIndex);
  const answer = match.locator('.match_answers .answer').first();
  const slot = match.locator('.match_slots .emptyslot').first();
  await answer.scrollIntoViewIfNeeded();
  await slot.scrollIntoViewIfNeeded();

  for (let attempt = 1; attempt <= 3; attempt++) {
    const remainingSlots = await match
      .locator('.match_slots .emptyslot')
      .count();
    await answer.dragTo(slot, {force: true});

    try {
      await expect(match.locator('.match_slots .emptyslot')).toHaveCount(
        remainingSlots - 1,
        {timeout: 3000},
      );
      return;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

// ─── Scenario 1 — @as_student: submit three multi answers ────────────────────

test.describe('Level group — submit multi answers', () => {
  test(
    'submit three answers shows incomplete warning; reload restores selections',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Scenario: Submit three answers.
      await studentPage.goto(LEVEL_URL);
      await studentPage
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        studentPage
          .locator('.level-group-content')
          .nth(1)
          .locator('.multi-question'),
      ).toContainText('The standard QWERTY keyboard has');

      // Select one answer in each of the three multi sub-levels.
      // Sub-level 0: answer index 2.
      await studentPage
        .locator('.level-group-content')
        .nth(0)
        .locator('.answerbutton[index="2"]')
        .click();
      // Sub-level 1: answer index 1.
      await studentPage
        .locator('.level-group-content')
        .nth(1)
        .locator('.answerbutton[index="1"]')
        .click();
      // Sub-level 2: press 1, 2, 0 → keeps 2 and 0 (max-two rule drops 1).
      await studentPage
        .locator('.level-group-content')
        .nth(2)
        .locator('.answerbutton[index="1"]')
        .click();
      await studentPage
        .locator('.level-group-content')
        .nth(2)
        .locator('.answerbutton[index="2"]')
        .click();
      await studentPage
        .locator('.level-group-content')
        .nth(2)
        .locator('.answerbutton[index="0"]')
        .click();

      // Submit and handle the warning modal.
      await studentPage.locator('.submitButton').first().click();
      await studentPage
        .locator('.modal')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(studentPage.locator('.modal-body')).toContainText(
        'You cannot edit your assessment after submitting it.',
      );
      await expect(studentPage.locator('.modal-body')).toContainText(
        'You left some questions incomplete.',
      );

      // Confirm — navigates to next level.
      await Promise.all([
        studentPage.waitForNavigation(),
        studentPage.locator('#ok-button').click(),
      ]);

      // Reload the level; previously selected answers should still be checked.
      await studentPage.goto(LEVEL_URL);
      await expect(
        studentPage
          .locator('.level-group-content')
          .nth(0)
          .locator('#checked_2'),
      ).toBeVisible();
      await expect(
        studentPage
          .locator('.level-group-content')
          .nth(1)
          .locator('#checked_1'),
      ).toBeVisible();
      await expect(
        studentPage
          .locator('.level-group-content')
          .nth(2)
          .locator('#checked_2'),
      ).toBeVisible();
      await expect(
        studentPage
          .locator('.level-group-content')
          .nth(2)
          .locator('#checked_0'),
      ).toBeVisible();
    },
  );
});

// ─── Scenario 2 — teacher-associated student: match levels within group ───────

test.describe('Level group — match levels', () => {
  test(
    'match levels within level group: drag, submit, reload, teacher view',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Match levels within level group
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page);

      await page.goto(LEVEL_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Verify match level questions.
      await expect(
        page.locator('.match').nth(0).locator('.question'),
      ).toContainText('Match the code to the image that it will produce.');
      await expect(
        page.locator('.match').nth(0).locator('.match_answers .answer'),
      ).toHaveCount(4);
      await expect(
        page.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(4);

      await expect(
        page.locator('.match').nth(1).locator('.question'),
      ).toContainText(
        'Match the boolean expression to the English description.',
      );
      await expect(
        page.locator('.match').nth(1).locator('.match_answers .answer'),
      ).toHaveCount(5);
      await expect(
        page.locator('.match').nth(1).locator('.match_slots .emptyslot'),
      ).toHaveCount(5);

      // Drag one answer from each match level.
      await dragFirstUnplacedToFirstSlot(page, 0);
      await dragFirstUnplacedToFirstSlot(page, 1);

      // One slot and one answer consumed in each.
      await expect(
        page.locator('.match').nth(0).locator('.match_answers .answer'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(1).locator('.match_answers .answer'),
      ).toHaveCount(4);
      await expect(
        page.locator('.match').nth(1).locator('.match_slots .emptyslot'),
      ).toHaveCount(4);
      // Verify no xmark indicators are visible (multiple .xmark exist in DOM).
      await expect(page.locator('.xmark').filter({visible: true})).toHaveCount(
        0,
      );

      // Submit and confirm.
      await page.locator('.submitButton').first().click();
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await Promise.all([
        page.waitForNavigation(),
        page.locator('#ok-button').click(),
      ]);

      // Reload — server should restore the placed answers.
      await page.goto(LEVEL_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .locator('.match')
        .last()
        .locator('.match_slots .answer')
        .first()
        .waitFor({state: 'visible', timeout: 15_000});

      await expect(
        page.locator('.match').nth(0).locator('.match_answers .answer'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(1).locator('.match_answers .answer'),
      ).toHaveCount(4);
      await expect(
        page.locator('.match').nth(1).locator('.match_slots .emptyslot'),
      ).toHaveCount(4);
      // Verify no xmark indicators are visible (multiple .xmark exist in DOM).
      await expect(page.locator('.xmark').filter({visible: true})).toHaveCount(
        0,
      );

      // Sign in as teacher, open teacher panel, click student row.
      await signIn(page, teacherEmail, teacherPassword);
      await page.goto(LEVEL_URL.replace('?noautoplay=true', ''));
      // The show-handle chevron is position:fixed with no layout dimensions;
      // use a raw JS click (mirrors Cucumber's "click selector" which fires a
      // synthetic event that bypasses visibility requirements).
      await page
        .locator('.show-handle .fa-chevron-left')
        .evaluate((el: HTMLElement) => el.click());
      await page
        .locator('.student-table')
        .waitFor({state: 'visible', timeout: 15_000});
      await Promise.all([
        page.waitForNavigation(),
        page.locator('#teacher-panel-container tr').nth(1).click(),
      ]);

      // Teacher view shows student's placed answers — same counts.
      await expect(
        page.locator('.match').nth(0).locator('.match_answers .answer'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(3);
      await expect(
        page.locator('.match').nth(1).locator('.match_answers .answer'),
      ).toHaveCount(4);
      await expect(
        page.locator('.match').nth(1).locator('.match_slots .emptyslot'),
      ).toHaveCount(4);
      // Verify no xmark indicators are visible (multiple .xmark exist in DOM).
      await expect(page.locator('.xmark').filter({visible: true})).toHaveCount(
        0,
      );

      // In teacher view nothing is draggable.
      await expect(page.locator('.ui-draggable')).not.toBeVisible();
    },
  );
});

// ─── Scenario 3 — anonymous: submit all answers including match levels ────────

test.describe('Level group — submit all answers', () => {
  test(
    'submit all answers including match levels shows no incomplete warning',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Submit all answers, including match levels
      await page.goto(LEVEL_URL);
      await page
        .locator('.submitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('.level-group-content').nth(1).locator('.multi-question'),
      ).toContainText('The standard QWERTY keyboard has');

      // Select answers for the three multi sub-levels.
      await page
        .locator('.level-group-content')
        .nth(0)
        .locator('.answerbutton[index="0"]')
        .click();
      await page
        .locator('.level-group-content')
        .nth(1)
        .locator('.answerbutton[index="0"]')
        .click();
      await page
        .locator('.level-group-content')
        .nth(2)
        .locator('.answerbutton[index="0"]')
        .click();
      await page
        .locator('.level-group-content')
        .nth(2)
        .locator('.answerbutton[index="1"]')
        .click();

      // Scroll to match level 0 and fill all four of its slots.
      await page
        .locator('.level-group-content')
        .nth(3)
        .scrollIntoViewIfNeeded();
      for (let i = 0; i < 4; i++) {
        await dragFirstUnplacedToFirstSlot(page, 0);
      }
      await expect(
        page.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(0);

      // Scroll to match level 1 and fill all five of its slots.
      await page
        .locator('.level-group-content')
        .nth(4)
        .scrollIntoViewIfNeeded();
      for (let i = 0; i < 5; i++) {
        await dragFirstUnplacedToFirstSlot(page, 1);
      }
      await expect(
        page.locator('.match').nth(1).locator('.match_slots .emptyslot'),
      ).toHaveCount(0);

      // Submit — all questions answered, so no "incomplete" warning.
      await page.locator('.submitButton').first().click();
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.modal-body')).toContainText(
        'You cannot edit your assessment after submitting it.',
      );
      await expect(page.locator('.modal-body')).not.toContainText(
        'You left some questions incomplete.',
      );
    },
  );
});
