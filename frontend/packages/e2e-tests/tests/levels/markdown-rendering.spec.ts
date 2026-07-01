import {expect, test} from '@playwright/test';

import {MarkdownLevel} from '../pages/markdown-level';

/**
 * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
 *
 * The feature's second scenario ("Viewing a level with blockly embedded in
 * instructions", @eyes) asserts visual parity against Applitools-approved
 * baselines via "I see no difference for ...". This Playwright suite has no
 * visual-regression harness (playwright.config.ts's screenshot: 'only-on-failure'
 * is a failure artifact, not a baseline-diff mechanism) — porting only the
 * navigate + LegacyBlocklyLab.waitForReady() shell would silently drop the
 * scenario's actual assertion. Documented gap; not ported.
 */
test.describe('Markdown rendering across the website', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/foundations/markdown_rendering.feature
   * "Visiting an external markdown level with details tag"
   */
  test('Visiting an external markdown level with details tag', async ({
    page,
  }) => {
    const level = new MarkdownLevel(page);

    await level.gotoLevel({lesson: 21, level: 1});

    await expect(level.extraDetailsTag).toBeAttached();
    await expect(level.detailsList).not.toHaveAttribute('open');

    await level.openDetailsList();
    await expect(level.detailsList).toHaveAttribute('open', '');
  });
});
