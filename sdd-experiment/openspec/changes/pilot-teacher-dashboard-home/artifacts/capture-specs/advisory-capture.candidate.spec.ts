/**
 * ADVISORY candidate capture (Phase 4, Opus-owned; visual-artifacts.md).
 * Ephemeral — not committed; saves the candidate region PNGs next to the
 * legacy captures for the human side-by-side. Gated so the normal gate run
 * skips it.
 */
import {expect, test} from '@playwright/test';

import {settle} from './helpers/settle';

const ARTIFACTS_DIR =
  '/var/home/sliang/git-workspaces/code-dot-org-full/.claude/worktrees/teacher-fable/sdd-experiment/openspec/changes/pilot-teacher-dashboard-home/artifacts/visual';

test.skip(!process.env.ADVISORY_CAPTURE, 'advisory capture only');

test('candidate empty region capture', async ({page}) => {
  await page.goto('/?tag=empty');
  const region = page.locator('#teacher-dashboard-home[data-state="empty"]');
  await expect(region).toBeVisible();
  await settle(page);
  await region.screenshot({
    path: `${ARTIFACTS_DIR}/td-home-empty.candidate.png`,
    animations: 'disabled',
  });
});

test('candidate section-list region capture', async ({page}) => {
  await page.goto('/?tag=list');
  const region = page.locator('ol#teacher-dashboard-home-section-list');
  await expect(region).toBeVisible();
  await settle(page);
  await region.screenshot({
    path: `${ARTIFACTS_DIR}/td-home-section-list.candidate.png`,
    animations: 'disabled',
  });
});
