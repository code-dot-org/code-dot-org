import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Text-to-speech player — allthettsthings and allthethingscourse.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/text_to_speech.feature
 *
 * The @chrome scenarios exercise actual audio codec support and are annotated
 * as such. The non-chrome scenario only verifies the .inline-audio element is
 * rendered; audio playback is not asserted (requires Chromium audio codecs).
 */

test.describe('Text-to-speech', () => {
  test(
    'TTS player is displayed on a CSF contained level',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/courses/allthettsthings/units/1/lessons/1/levels/1');
      await page
        .locator('.uitest-lab-container, #visualization')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('.inline-audio').first()).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('.inline-audio')).toHaveCount(1);
    },
  );

  // @chrome: audio codec availability needed to play TTS audio.
  // These tests verify .inline-audio elements are rendered at the expected
  // counts; actual audio playback requires a Chromium browser with audio.

  test(
    'CSF level shows inline-audio for feedback and hint after run',
    {tag: '@chrome'},
    async ({page}) => {
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/6/levels/3?noautoplay=true',
      );
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // No inline-audio in instructions before running (not course1 level).
      await expect(
        page.locator('.csf-top-instructions .inline-audio'),
      ).not.toBeAttached();

      // #overlay covers the run button; dispatch the click event directly
      // (mirrors Cucumber's `I press "runButton"` which uses jQuery click).
      await page.locator('#runButton').dispatchEvent('click');
      await page
        .locator('.uitest-topInstructions-inline-feedback')
        .waitFor({state: 'visible'});

      // Feedback audio + block-hint audio → 2 elements.
      await expect(
        page.locator('.csf-top-instructions .inline-audio'),
      ).toHaveCount(2, {
        timeout: 15_000,
      });
    },
  );

  test(
    'CSF contained level shows one inline-audio element',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/courses/allthettsthings/units/1/lessons/1/levels/1');
      await page
        .locator('.inline-audio')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.inline-audio')).toHaveCount(1);
    },
  );

  test(
    'CSD level shows one inline-audio element',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);
      await page.goto('/courses/allthettsthings/units/1/lessons/1/levels/2');
      await page
        .locator('.inline-audio')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.inline-audio')).toHaveCount(1);
    },
  );

  test(
    'CSP levels show one inline-audio element each',
    {tag: '@chrome'},
    async ({page}) => {
      await createStudent(page);

      await page.goto('/courses/allthettsthings/units/1/lessons/1/levels/4');
      await page
        .locator('.inline-audio')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.inline-audio')).toHaveCount(1);

      await page.goto('/courses/allthettsthings/units/1/lessons/1/levels/3');
      await page
        .locator('.inline-audio')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.inline-audio')).toHaveCount(1);
    },
  );
});
