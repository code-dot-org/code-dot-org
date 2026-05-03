import {expect, test} from '@playwright/test';

import {createTeacher} from '../shared/auth';
import {labLevelUrl} from '../shared/urls';

/** Maze lesson 2 level 4 — confirmed stable; teacher panel renders on Blockly levels. */
const MAZE_LEVEL_4_URL = labLevelUrl(2, 4);

test.describe('Teacher panel — Maze level 4', () => {
  test('authenticated teacher sees Teacher Panel heading', async ({page}) => {
    await createTeacher(page);
    await page.goto(MAZE_LEVEL_4_URL);
    // #teacher-panel-container is a zero-dimension wrapper around a position:fixed
    // child; assert on the h3 heading directly, which has real dimensions.
    await expect(
      page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
    ).toBeVisible();
  });

  test('anonymous user does not see Teacher Panel heading', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(MAZE_LEVEL_4_URL);
    // Wait for the level to be ready before making the negative assertion.
    await page.locator('#runButton').waitFor({state: 'visible'});
    // InstructorsOnly renders null for non-teachers; the heading is not in the DOM.
    await expect(
      page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
    ).not.toBeAttached();
  });
});
