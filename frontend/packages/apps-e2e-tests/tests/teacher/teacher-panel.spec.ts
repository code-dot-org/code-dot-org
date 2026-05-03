import {expect, test} from '@playwright/test';

import {Maze} from '../legacy/activities/maze/Maze';
import {createTeacher} from '../shared/auth';

test.describe('Teacher panel — Maze level 4', () => {
  test('authenticated teacher sees Teacher Panel heading', async ({page}) => {
    await createTeacher(page);
    const maze = new Maze(page);
    // reloadLevel: no session reset — teacher session just created by createTeacher.
    await maze.reloadLevel(4);
    // #teacher-panel-container is a zero-dimension wrapper around a position:fixed
    // child; assert on the h3 heading directly, which has real dimensions.
    await expect(
      page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
    ).toBeVisible();
  });

  test('anonymous user does not see Teacher Panel heading', async ({page}) => {
    const maze = new Maze(page);
    await maze.gotoLevel(4);
    // InstructorsOnly renders null for non-teachers; the heading is not in the DOM.
    await expect(
      page.getByRole('heading', {name: 'Teacher Panel', level: 3}),
    ).not.toBeAttached();
  });
});
