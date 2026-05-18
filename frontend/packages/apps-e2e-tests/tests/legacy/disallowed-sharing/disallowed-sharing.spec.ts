import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

/**
 * Disallowed sharing — content validation in PlayLab (Studio).
 *
 * Source: dashboard/test/ui/features/teacher_tools/disallowedsharing.feature
 *
 * Scenarios 2+3 (phone number and email address) verify that pressing the
 * Studio finish/share button after running a program whose sprite says a
 * phone number or email address results in `#share-fail-explanation` being
 * shown. Scenario 1 (`@webpurify`) uses the same visible failure dialog; the
 * test-studio environment provides the content filter endpoint.
 *
 * The Studio `.share` button (`#finishButton`) becomes visible on free-play
 * levels once the program runs.  Clicking it sends the puzzle report to the
 * server; the server validates sprite-say text for phone/email patterns and
 * returns `share_failure` when it finds them.
 */

/**
 * XML block string for a PlayLab (Studio) "when_run → studio_saySprite"
 * program.  Mirrors the `I've initialized the workspace with a studio say
 * block saying "<phrase>"` step definition.
 *
 * @param phrase - text the sprite will say; must not contain single quotes
 */
function studioSayXml(phrase: string): string {
  return (
    '<xml>' +
    '<block type="when_run" deletable="false">' +
    '<next><block type="studio_saySprite">' +
    '<title name="SPRITE">0</title>' +
    `<title name="TEXT">${phrase}</title>` +
    '</block></next>' +
    '</block>' +
    '</xml>'
  );
}

/** PlayLab free-play level used in the original feature. */
const LEVEL_URL =
  '/courses/playlab/units/1/lessons/1/levels/10?noautoplay=true';

class DisallowedSharingPage {
  private readonly finishButton;
  private readonly page;
  private readonly runButton;
  private readonly shareFailure;

  /**
   * @param page - Playwright page for the anonymous PlayLab session.
   */
  constructor(page: Page) {
    this.page = page;
    this.finishButton = page.locator('.share');
    this.runButton = page.locator('#runButton');
    this.shareFailure = page.locator('#share-fail-explanation');
  }

  /**
   * Opens the PlayLab free-play level and waits for the visible run control.
   */
  async gotoLevel(): Promise<void> {
    await this.page.goto(LEVEL_URL, {waitUntil: 'domcontentloaded'});
    await expect(this.runButton).toBeVisible({timeout: 30_000});
    await this.dismissOverlay();
  }

  /**
   * Loads a PlayLab sprite-say program with the supplied phrase.
   *
   * @param phrase - text the sprite says when the program runs.
   */
  async loadStudioSayProgram(phrase: string): Promise<void> {
    await this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      xml => (window as any).__TestInterface.loadBlocks(xml),
      studioSayXml(phrase),
    );
  }

  /**
   * Runs the program and waits for the Finish button to become visible.
   */
  async runUntilFinishVisible(): Promise<void> {
    await this.runButton.click();
    await expect(this.finishButton).toBeVisible({timeout: 15_000});
    await expect(this.finishButton).toBeEnabled();
  }

  /**
   * Activates the Finish button.  This mirrors the source Cucumber
   * `using jQuery` click without depending on jQuery being present.
   */
  async finish(): Promise<void> {
    await this.finishButton.evaluate(button =>
      (button as HTMLButtonElement).click(),
    );
  }

  /**
   * Asserts the content-filter failure message is visible to the user.
   */
  async expectShareFailure(): Promise<void> {
    await expect(this.shareFailure).toBeVisible({timeout: 30_000});
  }

  /**
   * Dismisses the full-screen instructions callout that intercepts pointer
   * events on legacy Blockly labs.
   */
  private async dismissOverlay(): Promise<void> {
    await this.page.evaluate(() => {
      const el = document.getElementById('overlay');
      if (el) el.click();
    });
  }
}

test.describe('Disallowed Sharing', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/disallowedsharing.feature
   * Scenario: Sharing a profane studio game
   */
  test('sharing a profane studio game shows share-fail-explanation', async ({
    page,
  }) => {
    const playLab = new DisallowedSharingPage(page);
    await playLab.gotoLevel();
    await playLab.loadStudioSayProgram('shit');
    await playLab.runUntilFinishVisible();
    await playLab.finish();
    await playLab.expectShareFailure();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/disallowedsharing.feature
   * Scenario: Sharing a phone number studio game
   */
  test('sharing a game with a phone number shows share-fail-explanation', async ({
    page,
  }) => {
    const playLab = new DisallowedSharingPage(page);
    await playLab.gotoLevel();
    await playLab.loadStudioSayProgram('800.555.5555');
    await playLab.runUntilFinishVisible();
    await playLab.finish();
    await playLab.expectShareFailure();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/disallowedsharing.feature
   * Scenario: Sharing an email studio game
   */
  test('sharing a game with an email address shows share-fail-explanation', async ({
    page,
  }) => {
    const playLab = new DisallowedSharingPage(page);
    await playLab.gotoLevel();
    await playLab.loadStudioSayProgram('brian@code.org');
    await playLab.runUntilFinishVisible();
    await playLab.finish();
    await playLab.expectShareFailure();
  });
});
