import {expect, test} from '../../shared/fixtures';

/**
 * CSP Instructions — Help & Tips tab, Instructions tab, collapse/expand,
 * and resizer visibility across App Lab levels.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
 *
 * Background: authenticated student session (studentPage fixture).
 * Original suite uses @single_session for performance; each scenario is
 * independent so separate Playwright contexts have no ordering constraints.
 *
 * All levels are in allthethingscourse / unit 1 / lesson 18.
 */

const BASE = '/courses/allthethingscourse/units/1/lessons/18/levels';

test.describe('CSP Instructions', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
   * Scenario: 'Help & Tips' and 'Instruction' tabs are visible if level has videos
   */
  test('help and tips tab visible when level has videos', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/1`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Turtle Programming',
      {timeout: 15_000},
    );

    await studentPage.locator('.uitest-instructionsTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Given only 4 turtle commands,',
      {timeout: 15_000},
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
   * Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
   */
  test('help and tips tab visible when level has map reference', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/18`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Circuit Playground',
      {timeout: 15_000},
    );

    await studentPage.locator('.uitest-instructionsTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Given only 4 turtle commands,',
      {timeout: 15_000},
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
   * Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has reference links
   */
  test('help and tips tab visible when level has reference links', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/19`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'The Circuit Playground is a simple single board computer',
      {timeout: 15_000},
    );

    await studentPage.locator('.uitest-instructionsTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Given only 4 turtle commands,',
      {timeout: 15_000},
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
   * Scenario: Do not display resources tab when there are no videos, map references, or reference links
   */
  test('resources tab absent when level has no videos, map references, or reference links', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/3`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await expect(studentPage.locator('.uitest-helpTab')).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/csp_instructions.feature
   * Scenario: Resources tab displays videos, map references, and reference links with correct text and link
   */
  test('resources tab shows all resource types with correct content', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/20`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'App Lab - Make It Interactive',
      {timeout: 15_000},
    );
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Welcome to the Circuit Playground',
      {timeout: 15_000},
    );

    await studentPage.locator('.uitest-instructionsTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Given only 4 turtle commands,',
      {timeout: 15_000},
    );
  });

  /**
   * Source: "Instructions can be collapsed and expanded"
   */
  test('instructions can be collapsed and expanded', async ({studentPage}) => {
    await studentPage.goto(`${BASE}/20`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('#ui-test-collapser').click();
    await expect(
      studentPage.locator('.instructions-markdown'),
    ).not.toBeVisible();

    await studentPage.locator('#ui-test-collapser').click();
    await expect(studentPage.locator('.instructions-markdown')).toBeVisible();
  });

  /**
   * Source: "Instructions have a resizer for non-embedded levels"
   */
  test('instructions have a resizer for non-embedded levels', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/20`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await expect(studentPage.locator('#ui-test-resizer')).toBeVisible();
  });

  /**
   * Source: "Instructions do not show a resizer on embedded levels"
   */
  test('instructions do not show a resizer on embedded levels', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/12`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await expect(studentPage.locator('#ui-test-resizer')).not.toBeVisible();
  });

  /**
   * Source: "Resources tab is clickable and displays correct text for
   * contained levels"
   */
  test('resources tab for contained levels shows correct content', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${BASE}/15`);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    await expect(studentPage.locator('.editor-column').first()).toContainText(
      'Welcome to the Circuit Playground',
      {timeout: 15_000},
    );

    await studentPage.locator('.uitest-instructionsTab').click();
    await expect(
      studentPage.locator('.editor-column').first(),
    ).not.toContainText('Welcome to the Circuit Playground', {
      timeout: 15_000,
    });
  });
});
