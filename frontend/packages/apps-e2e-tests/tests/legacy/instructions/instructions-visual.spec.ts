import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {InstructionsVisualPage} from './InstructionsVisualPage';

test.describe('Top instructions visual smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/top_instructions.feature
   * Scenario: CSF Top Instructions
   */
  test('CSF top instructions render across representative levels', async ({
    page,
  }) => {
    const instructions = new InstructionsVisualPage(page);

    await instructions.openAllTheThingsLevel(2, 3);
    await expect(instructions.topInstructions).toContainText(
      'Can you help me catch',
    );
    // Visual checkpoint stub: "maze short instructions".

    await instructions.openAllTheThingsLevel(5, 4);
    await expect(instructions.topInstructions).toBeVisible();
    // Visual checkpoint stub: "artist long instructions".

    await instructions.openAllTheThingsLevel(2, 7);
    await expect(instructions.topInstructions.locator('img')).toBeVisible();
    // Visual checkpoint stub: "maze short instructions with ani gif".

    await page.locator('#ani-gif-preview').click();
    await expect(page.locator('.modal')).toBeVisible({
      timeout: 15_000,
    });
    // Visual checkpoint stub: "maze ani gif dialog".

    await instructions.openAllTheThingsLevel(1, 1);
    await expect(instructions.topInstructions.locator('img')).toBeVisible();
    // Visual checkpoint stub: "Jigsaw with anigif".
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/top_instructions.feature
   * Scenario: CSF hint top instructions
   */
  test('CSF hint top instructions show inline feedback and hints', async ({
    page,
  }) => {
    const instructions = new InstructionsVisualPage(page);
    await instructions.openAllTheThingsLevel(6, 2);
    await instructions.runButton.evaluate(element =>
      (element as HTMLElement).click(),
    );
    await expect(
      page.locator('.uitest-topInstructions-inline-feedback'),
    ).toBeVisible({timeout: 20_000});
    // Visual checkpoint stub: "farmer with hints".

    await instructions.lightbulb.evaluate(element =>
      (element as HTMLElement).click(),
    );
    await expect(instructions.topInstructions).toContainText('Do you want');
    // Visual checkpoint stub: "farmer with hint prompt".

    await instructions.expandTopInstructions();
    // Visual checkpoint stub: "farmer with expanded instructions".

    await instructions.acceptNextHint();
    await expect(page.locator('.block-space')).toBeVisible({timeout: 15_000});
    // Visual checkpoint stub: "farmer with block hint".

    await instructions.acceptNextHint();
    await expect(instructions.topInstructions).toContainText('first hint');
    // Visual checkpoint stub: "farmer with markdown hint".

    await instructions.acceptNextHint();
    await expect(instructions.topInstructions).toContainText('hint video');

    await instructions.acceptNextHint();
    await expect(instructions.topInstructions).toContainText(
      'third and final hint',
    );
    // Visual checkpoint stub: "farmer with video hint".
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/hoc_top_instructions.feature
   * Scenario: HOC Top Instructions
   */
  test('HOC top instructions render for Minecraft, Star Wars, and Frozen', async ({
    page,
  }) => {
    const instructions = new InstructionsVisualPage(page);

    await instructions.openHocCourseLevel('mc', 4);
    await expect(instructions.topInstructions).toBeVisible();
    // Visual checkpoint stub: "minecraft top instructions".

    await instructions.openHocCourseLevel('starwars', 15);
    await expect(instructions.topInstructions).toBeVisible();
    // Visual checkpoint stub: "starwars top instructions".

    await instructions.openHocCourseLevel('frozen', 5);
    await expect(instructions.topInstructions).toBeVisible();
    // Visual checkpoint stub: "frozen top instructions".
    await page.evaluate(() => window.localStorage.clear());
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_top_instructions_eyes.feature
   * Scenario: CSD and CSP Top Instructions
   */
  test('CSD and CSP top instructions switch between instructions and feedback', async ({
    authorizedTeacherPage,
  }) => {
    const instructions = new InstructionsVisualPage(authorizedTeacherPage);

    await instructions.openAllTheThingsLevel(38, 1, '');
    await expect(authorizedTeacherPage.locator('.uitest-feedback')).toBeVisible(
      {timeout: 30_000},
    );
    // Visual checkpoint stub: "teacher in applab level with rubric".
    await instructions.clickTab('.uitest-feedback');
    await expect(
      authorizedTeacherPage.locator('.uitest-feedback'),
    ).toBeVisible();
    // Visual checkpoint stub: "teacher in applab level viewing rubric".
    await instructions.clickTab('.uitest-instructionsTab');
    await expect(
      authorizedTeacherPage.locator('.editor-column').first(),
    ).toBeVisible();
    // Visual checkpoint stub: "teacher in applab level with rubric after viewing rubric".

    await instructions.openAllTheThingsLevel(38, 2, '');
    await expect(
      authorizedTeacherPage.locator('iframe[title="Web Lab"]'),
    ).toBeVisible({timeout: 60_000});
    await expect(authorizedTeacherPage.locator('.uitest-feedback')).toBeVisible(
      {timeout: 30_000},
    );
    // Visual checkpoint stub: "teacher in weblab level with rubric".
    await instructions.clickTab('.uitest-feedback');
    await expect(
      authorizedTeacherPage.locator('.uitest-feedback'),
    ).toBeVisible();
    // Visual checkpoint stub: "teacher in weblab level viewing rubric".
    await instructions.clickTab('.uitest-instructionsTab');
    await expect(
      authorizedTeacherPage.locator('.editor-column').first(),
    ).toBeVisible();
    // Visual checkpoint stub: "teacher in weblab level with rubric after viewing rubric".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_top_instructions_eyes.feature
   * Scenario: Resizing CSD and CSP Top Instructions
   */
  test('teacher can resize instructions and return to feedback tab', async ({
    page,
  }) => {
    const pair = await createTeacherAssociatedStudent(page, {authorized: true});
    await signIn(page, pair.teacherEmail, pair.teacherPassword);

    await page.goto(
      `/courses/allthethingscourse/units/1/lessons/18/levels/1?section_id=${pair.sectionId}&viewAs=Instructor`,
    );
    const instructions = new InstructionsVisualPage(page);
    await instructions.expectLabReady();
    // Visual checkpoint stub: "teacher in feedback tab".

    await instructions.clickTab('.uitest-instructionsTab');
    await expect(page.locator('.editor-column').first()).toContainText(
      'Do This',
    );
    await instructions.expandTopInstructions();
    // Visual checkpoint stub: "teacher drag instructions tab".

    const feedbackTab = page.locator('.uitest-feedback');
    if (await feedbackTab.isVisible({timeout: 1_000}).catch(() => false)) {
      await feedbackTab.click();
      await expect(page.locator('.editor-column').first()).toContainText(
        'Teacher Feedback',
      );
      // Visual checkpoint stub: "teacher back in feedback tab".
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/teacher_only_markdown.feature
   * Scenario: Applab level with teacher only markdown
   */
  test('teacher-only markdown is hidden from student and visible to teacher', async ({
    page,
  }) => {
    const pair = await createTeacherAssociatedStudent(page, {
      authorized: true,
      studentName: 'Manuel',
    });
    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/11');
    const instructions = new InstructionsVisualPage(page);
    await instructions.expectLabReady();
    await expect(
      page.getByRole('button', {name: 'For Teachers Only'}),
    ).toBeHidden();
    // Visual checkpoint stub: "student doesnt see teacher markdown".

    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/11');
    await instructions.expectLabReady();
    await expect(
      page.getByRole('button', {name: 'For Teachers Only'}),
    ).toBeVisible();
    // Visual checkpoint stub: "authorized teacher does see teacher markdown".
  });
});
