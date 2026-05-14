import {expect, test} from '../../shared/fixtures';

/**
 * Map levels — lesson 35 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/map_level.feature
 *
 * Map levels render reference guide content inside an iframe.
 * @no_mobile (propagated from the source feature).
 */

test.describe('Map level', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/map_level.feature
   * Scenario: Map level displays content
   */
  test(
    'map level displays content inside the iframe',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto(
        '/courses/allthethingscourse/units/1/lessons/35/levels/1?noautoplay=true',
      );
      await studentPage
        .locator('#curriculum-reference')
        .waitFor({state: 'visible', timeout: 30_000});

      // Switch into the first iframe and verify reference guide content.
      const frame = studentPage.frameLocator('iframe').first();
      await expect(frame.locator('#body')).toContainText(
        'Welcome to the Circuit Playground',
        {timeout: 30_000},
      );
      await expect(frame.locator('#body')).toContainText(
        'The Light Emitting Diode (LED)',
        {timeout: 30_000},
      );
    },
  );
});
