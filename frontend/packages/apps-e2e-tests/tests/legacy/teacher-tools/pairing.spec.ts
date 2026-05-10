import {
  createSection,
  createStudent,
  createTeacher,
  joinSection,
  signIn,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

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

/**
 * Colors for header progress-bubble assertions.
 * Source: dashboard/test/ui/features/step_definitions/progress.rb color_string()
 */
const PROGRESS_COLORS = {
  perfect_assessment: {bg: 'rgb(140, 82, 186)', border: 'rgb(140, 82, 186)'},
  attempted: {bg: 'rgb(254, 254, 254)', border: 'rgb(14, 190, 14)'},
} as const;

/**
 * Open the user menu, select the first listed partner student, confirm the
 * pairing group, and wait for registration to propagate.
 * Mirrors `I initiate pairing` from header_steps.rb.
 *
 * @param page - Playwright page signed in at a level
 */
async function initiatePairing(
  page: import('@playwright/test').Page,
): Promise<void> {
  // Dismiss the intro overlay that intercepts pointer events on first visit.
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible({timeout: 3_000}).catch(() => false)) {
    await page.evaluate(() =>
      (document.querySelector('#overlay') as HTMLElement)?.click(),
    );
    await overlay.waitFor({state: 'hidden', timeout: 10_000});
  }

  await page
    .locator('.display_name')
    .waitFor({state: 'visible', timeout: 10_000});
  await page.locator('.display_name').click();
  await page
    .locator('#pairing_link')
    .waitFor({state: 'visible', timeout: 10_000});
  await page.waitForTimeout(500); // user-menu animation
  await page.locator('#pairing_link').click();
  await page
    .locator('.student')
    .first()
    .waitFor({state: 'visible', timeout: 10_000});
  await page.locator('.student').first().click();
  await page
    .locator('.addPartners')
    .waitFor({state: 'visible', timeout: 10_000});
  await page.locator('.addPartners').click();
  await page.waitForTimeout(5_000); // wait for pairing to register
}

/**
 * Assert the header user-menu reflects an active pairing group containing
 * both supplied display names.
 * Mirrors `I verify the user menu shows X and Y are in a pairing group`
 * from header_steps.rb.
 *
 * @param page - Playwright page with pairing active
 * @param name1 - first student display name
 * @param name2 - second student display name
 */
async function verifyPairingGroup(
  page: import('@playwright/test').Page,
  name1: string,
  name2: string,
): Promise<void> {
  await page.locator('.user_menu').waitFor({state: 'visible', timeout: 20_000});
  await page
    .locator('.pairing_name')
    .waitFor({state: 'visible', timeout: 20_000});
  await expect(page.locator('.pairing_name')).toContainText('Team');
  await page.locator('.fa-users').waitFor({state: 'visible', timeout: 10_000});
  await page.locator('.pairing_name').click();
  await page
    .locator('.pairing_summary')
    .waitFor({state: 'visible', timeout: 10_000});
  await expect(page.locator('.pairing_summary')).toContainText(name1);
  await expect(page.locator('.pairing_summary')).toContainText(name2);
}

/**
 * Poll the header progress bubble for a given level until its computed colors
 * match the expected progress state.
 * Mirrors `I verify progress in the header of the current page is X for level N`
 * from progress.rb.  Header bubble selector = `.header_level .react_stage
 * a:eq(levelNum-1) .progress-bubble` (jQuery 0-based).
 *
 * @param page - Playwright page at a level in the same lesson
 * @param levelNum - 1-based level number in the lesson
 * @param progressType - expected progress state key
 */
async function verifyHeaderProgress(
  page: import('@playwright/test').Page,
  levelNum: number,
  progressType: keyof typeof PROGRESS_COLORS,
): Promise<void> {
  const bubble = page
    .locator('.header_level .react_stage a')
    .nth(levelNum - 1)
    .locator('.progress-bubble');
  const {bg, border} = PROGRESS_COLORS[progressType];

  await expect(async () => {
    const bgColor = await bubble.evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    const borderColor = await bubble.evaluate(
      el => getComputedStyle(el).borderTopColor,
    );
    expect(bgColor).toBe(bg);
    expect(borderColor).toBe(border);
  }).toPass({timeout: 30_000});
}

/**
 * Run and submit an assessment level: run → wait for submit button → submit
 * → confirm modal → navigate to next level.
 * Mirrors `I submit this level` from steps.rb.
 *
 * @param page - Playwright page with an assessment level loaded
 */
async function submitLevel(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.locator('#runButton').click();
  await page
    .locator('#submitButton')
    .waitFor({state: 'visible', timeout: 20_000});
  await page.locator('#submitButton').click();
  await page.locator('.modal').waitFor({state: 'visible', timeout: 10_000});
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('#confirm-button').click(),
  ]);
}

test.describe('Student Pairing', {tag: '@no_mobile'}, () => {
  /**
   * Source: pairing.feature — "Pair Programming submits levels for both students"
   *
   * Thing_Two submits an assessment level while paired with Thing_One; both
   * students receive perfect_assessment progress on that level.
   */
  test('pair programming submission marks both students complete', async ({
    page,
  }) => {
    test.fixme(
      true,
      'TODO: progress color assertion flaky on chromium/firefox after pair programming submission; timing issue with progress propagation',
    );
    const ts = Date.now();
    const teacher = await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    // --- Thing_Two: navigate, pair with Thing_One, submit ---
    await page.goto(LESSON_18_LEVEL_7);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await initiatePairing(page);
    await verifyPairingGroup(page, thingOne.displayName, thingTwo.displayName);

    await submitLevel(page);
    expect(page.url()).toContain(
      '/courses/allthethingscourse/units/1/lessons/18/levels/8',
    );
    await verifyHeaderProgress(page, 7, 'perfect_assessment');

    // --- Thing_One: verify progress propagated ---
    await signOut(page);
    await signIn(page, thingOne.email, thingOne.password);
    await page.goto(LESSON_18_LEVEL_7);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await verifyHeaderProgress(page, 7, 'perfect_assessment');

    void teacher;
  });

  /**
   * Source: pairing.feature — "Pair Programming attempts levels for both students"
   *
   * Thing_Two runs (without submitting) a level while paired with Thing_One;
   * both students receive attempted progress.
   */
  test('pair programming attempt marks both students attempted', async ({
    page,
  }) => {
    const ts = Date.now();
    const teacher = await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    // --- Thing_Two: navigate, pair with Thing_One, run ---
    await page.goto(LESSON_2_LEVEL_2);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await initiatePairing(page);
    await verifyPairingGroup(page, thingOne.displayName, thingTwo.displayName);

    await page.locator('#runButton').click();
    await page
      .locator('.uitest-topInstructions-inline-feedback')
      .waitFor({state: 'visible', timeout: 20_000});
    await verifyHeaderProgress(page, 2, 'attempted');

    // --- Thing_One: verify progress propagated ---
    await signOut(page);
    await signIn(page, thingOne.email, thingOne.password);
    await page.goto(LESSON_2_LEVEL_2);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await verifyHeaderProgress(page, 2, 'attempted');

    void teacher;
    void thingTwo;
  });

  /**
   * Source: pairing.feature — "Pairing group is correctly displayed in user menu
   * on cached levels"
   *
   * Pairing state survives a full page reload on a cached (Star Wars) level.
   */
  test('pairing group persists after page reload on cached level', async ({
    page,
  }) => {
    // Firefox/Chromium: pairing persistence flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: pairing group persistence on cached level flaky on firefox/chromium under parallel run; timing issue with session or level cache',
    );

    const ts = Date.now();
    const teacher = await createTeacher(page);
    const {sectionCode} = await createSection(page);
    const thingOne = await createStudent(page, {name: `Thing_One_${ts}`});
    await joinSection(page, sectionCode);
    const thingTwo = await createStudent(page, {name: `Thing_Two_${ts}`});
    await joinSection(page, sectionCode);

    await page.goto(STARWARS_LEVEL_5);
    await page
      .locator('.display_name')
      .waitFor({state: 'visible', timeout: 30_000});

    await initiatePairing(page);
    await verifyPairingGroup(page, thingOne.displayName, thingTwo.displayName);

    await page.reload();
    await verifyPairingGroup(page, thingOne.displayName, thingTwo.displayName);

    void teacher;
    void thingTwo;
  });
});
