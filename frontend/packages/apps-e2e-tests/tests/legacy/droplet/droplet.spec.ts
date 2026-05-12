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

/**
 * Wait until a Tooltipster tooltip containing the given text is visible.
 *
 * @param applab - App Lab page object for the current level.
 * @param text - Text expected inside the visible tooltip.
 */
async function waitForTooltip(applab: AppLab, text: string): Promise<void> {
  await expect(
    applab.page.locator('.tooltipster-content', {hasText: text}),
  ).toBeVisible({timeout: 10_000});
}

/**
 * Wait until no Tooltipster tooltip is visible.
 *
 * @param applab - App Lab page object for the current level.
 */
async function waitForNoTooltip(applab: AppLab): Promise<void> {
  await expect(applab.page.locator('.tooltipster-base')).not.toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Poll until __TestInterface.getDropletContents() equals expected.
 * ACE processes key events asynchronously; direct eval can see stale state.
 *
 * @param applab - App Lab page object for the current level.
 * @param expected - Exact Droplet editor text expected by the scenario.
 */
async function expectDropletText(
  applab: AppLab,
  expected: string,
): Promise<void> {
  await expect
    .poll(() => applab.getDropletContents(), {timeout: 5_000})
    .toBe(expected);
}

/**
 * Put the level into Droplet text mode and focus the ACE text input.
 *
 * Readiness signal: Agent Browser verified that after text mode is active the
 * visible ACE editor surface is present and ACE's text input can receive real
 * key events. This replaces Cucumber's fixed 5-second wait for completers to
 * register.
 *
 * @param applab - App Lab page object for the current level.
 */
async function prepareDropletTextEditor(applab: AppLab): Promise<void> {
  await applab.ensureTextMode();
  await expect(applab.showCodeHeader).toContainText('Show Blocks');

  const textInput = applab.page.locator('.ace_text-input');
  const editor = applab.page.locator('.ace_editor');
  await expect(textInput).toBeAttached({timeout: 15_000});
  await expect(editor).toBeVisible({timeout: 15_000});
  await textInput.focus();
  await expect(textInput).toBeFocused();
}

/**
 * Type into ACE with real key events at a human pace.
 *
 * ACE recomputes completion ranges as key events arrive; zero-delay synthetic
 * typing can leave the popup anchored to an earlier prefix.
 *
 * @param applab - App Lab page object for the current level.
 * @param text - Text to type into the focused ACE editor.
 */
async function typeAceText(applab: AppLab, text: string): Promise<void> {
  await applab.page.keyboard.type(text, {delay: 25});
}

test.describe('Droplet — ACE autocomplete', () => {
  /**
   * Migration status: COMPLETED
   *
   * Source: dashboard/test/ui/features/star_labs/droplet.feature
   * Scenario: Open editcode level and write some autocompleted, tooltipped code
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
      await prepareDropletTextEditor(applab);

      await typeAceText(applab, 'b');
      await expectDropletText(applab, 'b');

      await typeAceText(applab, 'utto');
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
      await studentPage.keyboard.press('ArrowDown'); // row 0 -> "button"
      await studentPage.keyboard.press('ArrowDown'); // row 1 -> "radioButton"
      await studentPage.keyboard.press('Enter'); // insert completion

      // Verify the correct function was selected and the param tooltip appears.
      await expectDropletText(applab, 'radioButton()');
      await waitForTooltip(applab, 'unique identifier');
    },
  );

  /**
   * Migration status: COMPLETED
   *
   * Source: dashboard/test/ui/features/star_labs/droplet.feature
   * Scenario: Open editcode level and verify parameter autocomplete replaces quoted text
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
      await prepareDropletTextEditor(applab);

      // Type the function call opening — tooltip for the first param appears.
      await typeAceText(applab, 'setProperty(');
      await expectDropletText(applab, 'setProperty()');
      await waitForTooltip(applab, 'the specified element');

      // Type a double-quote — ACE autocomplete inserts the closing quote.
      await typeAceText(applab, '"');
      await expectDropletText(applab, 'setProperty("")');
      await waitForNoTooltip(applab);

      // Enter inside the string argument completes to "screen1".
      await studentPage.keyboard.press('Enter');
      await expectDropletText(applab, 'setProperty("screen1")');
      await waitForNoTooltip(applab);
    },
  );
});
