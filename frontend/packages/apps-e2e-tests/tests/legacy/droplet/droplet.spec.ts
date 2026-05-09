import {AppLab} from '../../applab/AppLab';
import {expect, test} from '../../shared/fixtures';

/**
 * Droplet ACE editor — autocomplete and parameter-completion.
 *
 * Source: dashboard/test/ui/features/star_labs/droplet.feature
 *
 * Level: allthethingscourse unit 1 lesson 18 level 5 (App Lab, edit-code).
 */

const LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/18/levels/5?noautoplay=true';

/** Wait until a Tooltipster tooltip containing the given text is visible. */
async function waitForTooltip(applab: AppLab, text: string): Promise<void> {
  await expect(
    applab.page.locator('.tooltipster-content', {hasText: text}),
  ).toBeVisible({timeout: 10_000});
}

/** Wait until no Tooltipster tooltip is visible. */
async function waitForNoTooltip(applab: AppLab): Promise<void> {
  await expect(applab.page.locator('.tooltipster-base')).not.toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Poll until __TestInterface.getDropletContents() equals expected.
 * ACE processes key events asynchronously; direct eval can see stale state.
 */
async function expectDropletText(
  applab: AppLab,
  expected: string,
): Promise<void> {
  await expect
    .poll(() => applab.getDropletContents(), {timeout: 5_000})
    .toBe(expected);
}

test.describe('Droplet — ACE autocomplete', () => {
  /**
   * Source: droplet.feature — "Open editcode level and write some
   * autocompleted, tooltipped code"
   *
   * Types "butto" to open the autocomplete popup, then uses ArrowDown
   * twice to navigate to "radioButton" and Enter to insert it.  The
   * two ArrowDowns are pressed back-to-back (no assertions in between)
   * to stay ahead of ACE's 150 ms completer debounce which would
   * otherwise reset the popup to row 0 between key presses.
   */
  test(
    'autocomplete navigation selects function and shows param tooltip',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await studentPage.goto(LEVEL_URL);
      await applab.waitForReady();
      await applab.ensureTextMode();

      await expect(studentPage.locator('.ace_text-input')).toBeAttached({
        timeout: 15_000,
      });
      // Mirror the 5 s wait in the upstream Cucumber step so ACE completers
      // are registered before we start typing.
      await studentPage.waitForTimeout(5_000);

      await studentPage.locator('.ace_editor').click();

      await studentPage.keyboard.type('b');
      await expectDropletText(applab, 'b');

      await studentPage.keyboard.type('utto');
      await expectDropletText(applab, 'butto');
      await waitForNoTooltip(applab);

      // Wait for the popup to appear (ACE debounce fires after ~150 ms).
      await expect(studentPage.locator('.ace_autocomplete')).toBeVisible({
        timeout: 5_000,
      });

      // Navigate and select without any assertions in between.
      // Any Playwright DOM query between key presses (tooltip checks, evaluate
      // calls) can cause a brief focus disruption in headless Chromium that
      // closes the ACE autocomplete popup before Enter is pressed.
      await studentPage.keyboard.press('ArrowDown'); // row 0 → "button"
      await studentPage.keyboard.press('ArrowDown'); // row 1 → "radioButton"
      await studentPage.keyboard.press('Enter'); // insert completion

      // Verify the correct function was selected and the param tooltip appears.
      await expectDropletText(applab, 'radioButton()');
      await waitForTooltip(applab, 'unique identifier');
    },
  );

  /**
   * Source: droplet.feature — "Open editcode level and verify parameter
   * autocomplete replaces quoted text"
   *
   * Types `setProperty(` then a double-quote; ACE autocomplete fills in
   * `"screen1"` when Enter is pressed inside the string argument.
   */
  test(
    'parameter autocomplete replaces quoted text with first screen id',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await studentPage.goto(LEVEL_URL);
      await applab.waitForReady();
      await applab.ensureTextMode();

      await expect(studentPage.locator('.ace_text-input')).toBeAttached({
        timeout: 15_000,
      });
      await studentPage.waitForTimeout(5_000);

      await studentPage.locator('.ace_editor').click();

      // Type the function call opening — tooltip for the first param appears.
      await studentPage.keyboard.type('setProperty(');
      await expectDropletText(applab, 'setProperty()');
      await waitForTooltip(applab, 'the specified element');

      // Type a double-quote — ACE autocomplete inserts the closing quote.
      await studentPage.keyboard.type('"');
      await expectDropletText(applab, 'setProperty("")');
      await waitForNoTooltip(applab);

      // Enter inside the string argument completes to "screen1".
      await studentPage.keyboard.press('Enter');
      await expectDropletText(applab, 'setProperty("screen1")');
      await waitForNoTooltip(applab);
    },
  );
});
