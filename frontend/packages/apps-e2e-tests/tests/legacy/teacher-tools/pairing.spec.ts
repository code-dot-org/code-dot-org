import {
  createSection,
  createStudent,
  createTeacher,
  joinSection,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {PairingPage} from './PairingPage';

/**
 * Student Pairing — pair-programming submits/attempts levels for both students
 * and the pairing group persists after a page reload.
 *
 * Source: dashboard/test/ui/features/teacher_tools/pairing.feature
 */

const LESSON_18_LEVEL_7 =
  '/courses/allthethingscourse/units/1/lessons/18/levels/7';
const LESSON_2_LEVEL_2 =
  '/courses/allthethingscourse/units/1/lessons/2/levels/2';
const STARWARS_LEVEL_5 = '/courses/starwars/units/1/lessons/1/levels/5';

test.describe('Student Pairing', {tag: '@no_mobile'}, () => {
  /**
   * Source: dashboard/test/ui/features/teacher_tools/pairing.feature
   * Scenario: Pair Programming submits levels for both students
   *
   * Thing_Two submits an assessment level while paired with Thing_One; both
   * students receive perfect_assessment progress on that level.
   */
  test('pair programming submission marks both students complete', async ({
    page,
  }) => {
    test.slow();

    const ts = Date.now();
    await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    const pairing = new PairingPage(page);
    await pairing.gotoLevel(LESSON_18_LEVEL_7, '#runButton');
    await pairing.initiatePairing(thingOne.displayName, thingTwo.displayName);
    await pairing.ensurePairingPersists(
      LESSON_18_LEVEL_7,
      '#runButton',
      thingOne.displayName,
      thingTwo.displayName,
    );
    await pairing.submitLevel();
    expect(page.url()).toContain(
      '/courses/allthethingscourse/units/1/lessons/18/levels/8',
    );
    await pairing.expectHeaderProgress(7, 'perfect_assessment');

    await signOut(page);
    await signIn(page, thingOne.email, thingOne.password);
    await pairing.gotoLevel(LESSON_18_LEVEL_7, '#runButton');
    await pairing.expectHeaderProgress(7, 'perfect_assessment');
  });

  /**
   * Source: dashboard/test/ui/features/teacher_tools/pairing.feature
   * Scenario: Pair Programming attempts levels for both students
   *
   * Thing_Two runs (without submitting) a level while paired with Thing_One;
   * both students receive attempted progress.
   */
  test('pair programming attempt marks both students attempted', async ({
    page,
  }) => {
    const ts = Date.now();
    await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    const pairing = new PairingPage(page);
    await pairing.gotoLevel(LESSON_2_LEVEL_2, '#runButton');
    await pairing.initiatePairing(thingOne.displayName, thingTwo.displayName);
    await pairing.runForAttempt();
    await pairing.expectHeaderProgress(2, 'attempted');

    await signOut(page);
    await signIn(page, thingOne.email, thingOne.password);
    await pairing.gotoLevel(LESSON_2_LEVEL_2, '#runButton');
    await pairing.expectHeaderProgress(2, 'attempted');
  });

  /**
   * Source: dashboard/test/ui/features/teacher_tools/pairing.feature
   * Scenario: Pairing group is correctly displayed in user menu on cached levels
   *
   * Pairing state survives a full page reload on a cached (Star Wars) level.
   */
  test('pairing group persists after page reload on cached level', async ({
    page,
  }) => {
    const ts = Date.now();
    await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    const pairing = new PairingPage(page);
    await pairing.gotoLevel(STARWARS_LEVEL_5, '.display_name');
    await pairing.initiatePairing(thingOne.displayName, thingTwo.displayName);

    await page.reload();
    await pairing.expectPairingGroup(
      thingOne.displayName,
      thingTwo.displayName,
    );
  });
});
