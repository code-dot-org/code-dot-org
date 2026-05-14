import {test} from '../../shared/fixtures';

import {StarWars} from './StarWars';

const STARTER_CODE = 'moveRight();\n';

/**
 * Star Wars Hour of Code tutorial.
 *
 * Source:
 *   dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
 */

test.describe('Star Wars Hour of Code', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 1 in block mode
   */
  test('solves puzzle 1 in block mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(1);
    await starWars.appendProgram('moveRight();\n');
    await starWars.runAndExpectCompletion();
    await starWars.continueToLevel(2);
    await starWars.expectHeaderProgress(1, 'perfect');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 1 in text mode
   */
  test('solves puzzle 1 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(1);
    await starWars.appendProgram('moveRight();\n');
    await starWars.runAndExpectCompletion();
    await starWars.continueToLevel(2);
    await starWars.expectHeaderProgress(1, 'perfect');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 2 in text mode
   */
  test('solves puzzle 2 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(2);
    await starWars.appendProgram('moveRight();\nmoveDown();\nmoveDown();\n');
    await starWars.runAndExpectCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 3 in text mode
   */
  test('solves puzzle 3 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(3);
    await starWars.appendProgram('moveUp();\nmoveDown();\nmoveRight();\n');
    await starWars.runAndExpectCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 4 in text mode
   */
  test('solves puzzle 4 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(4);
    await starWars.appendProgram(
      'moveLeft();\nmoveLeft();\nmoveDown();\nmoveDown();\nmoveLeft();\n',
    );
    await starWars.runAndExpectCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 5 in text mode
   */
  test('solves puzzle 5 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(5);
    await starWars.appendProgram(
      'moveRight();\nmoveDown();\nmoveDown();\nmoveDown();\nmoveLeft();\n',
    );
    await starWars.runAndExpectCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Solving puzzle 6 in text mode
   */
  test('solves puzzle 6 in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(6);
    await starWars.appendProgram(
      'moveDown();\nmoveUp();\nmoveRight();\nmoveRight();\nmoveUp();\nmoveDown();\nmoveRight();\n',
    );
    await starWars.runAndExpectCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Failing puzzle 5 by touching hazard
   */
  test('failing puzzle 5 by touching hazard does not complete', async ({
    page,
  }) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(5);
    await starWars.appendProgram(
      'moveLeft();\nmoveLeft();\nmoveDown();\nmoveDown();\nmoveDown();\nmoveRight();\nmoveRight();\nmoveRight();\nmoveUp();\nmoveUp();\nmoveUp();\n',
    );
    await starWars.runAndExpectNoCompletion();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Using the "Start Over" button in block mode
   */
  test('start over restores starter code in block mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(1);
    await starWars.setProgram(
      `${STARTER_CODE}moveUp();\nmoveLeft();\nmoveDown();\n`,
    );
    await starWars.startOver();
    await starWars.expectProgram(STARTER_CODE);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/hour_of_code/starwars.feature
   * Scenario: Using the "Start Over" button in text mode
   */
  test('start over restores starter code in text mode', async ({page}) => {
    const starWars = new StarWars(page);
    await starWars.resetAndGotoLevel(1);
    await starWars.setProgram(
      `${STARTER_CODE}moveUp();\nmoveLeft();\nmoveDown();\n`,
    );
    await starWars.startOver();
    await starWars.expectProgram(STARTER_CODE);
  });
});
