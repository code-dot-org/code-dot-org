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
 * shown.  Scenario 1 (`@webpurify`) requires the WebPurify external API and
 * is marked fixme.
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

/**
 * Dismiss the full-screen `#overlay` instructions callout that intercepts
 * pointer events on legacy Blockly labs.  JS click dispatches `hideOverlay()`
 * from within the browser, same mechanism as LegacyBlocklyLab.dismissOptionalOverlays().
 *
 * @param page - Playwright page with a legacy lab loaded
 */
async function dismissOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    const el = document.getElementById('overlay');
    if (el) el.click();
  });
  await page.locator('#overlay').waitFor({state: 'hidden'});
}

test.describe('Disallowed Sharing', {tag: '@no_mobile'}, () => {
  /**
   * Source: "Sharing a profane studio game"
   * Skipped — requires @webpurify external API key (not configured in test env).
   */
  test.fixme(
    'sharing a profane studio game shows share-fail-explanation',
    async ({studentPage}) => {
      await studentPage.goto(LEVEL_URL);
      await expect(studentPage.locator('#runButton')).toBeVisible({
        timeout: 30_000,
      });
      await dismissOverlay(studentPage);
      await studentPage.evaluate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        xml => (window as any).__TestInterface.loadBlocks(xml),
        studioSayXml('shit'),
      );
      await studentPage.locator('#runButton').click();
      await studentPage.locator('.share').click();
      await expect(studentPage.locator('#share-fail-explanation')).toBeVisible({
        timeout: 15_000,
      });
    },
  );

  /**
   * Source: "Sharing a phone number studio game"
   */
  test('sharing a game with a phone number shows share-fail-explanation', async ({
    studentPage,
  }) => {
    await studentPage.goto(LEVEL_URL);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 30_000,
    });
    await dismissOverlay(studentPage);
    await studentPage.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      xml => (window as any).__TestInterface.loadBlocks(xml),
      studioSayXml('800.555.5555'),
    );
    await studentPage.locator('#runButton').click();
    // .share is #finishButton — visible once the free-play level runs.
    await expect(studentPage.locator('.share')).toBeVisible({timeout: 15_000});
    await studentPage.locator('.share').click();
    await expect(studentPage.locator('#share-fail-explanation')).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Source: "Sharing an email studio game"
   */
  test('sharing a game with an email address shows share-fail-explanation', async ({
    studentPage,
  }) => {
    await studentPage.goto(LEVEL_URL);
    await expect(studentPage.locator('#runButton')).toBeVisible({
      timeout: 30_000,
    });
    await dismissOverlay(studentPage);
    await studentPage.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      xml => (window as any).__TestInterface.loadBlocks(xml),
      studioSayXml('brian@code.org'),
    );
    await studentPage.locator('#runButton').click();
    await expect(studentPage.locator('.share')).toBeVisible({timeout: 15_000});
    await studentPage.locator('.share').click();
    await expect(studentPage.locator('#share-fail-explanation')).toBeVisible({
      timeout: 15_000,
    });
  });
});
