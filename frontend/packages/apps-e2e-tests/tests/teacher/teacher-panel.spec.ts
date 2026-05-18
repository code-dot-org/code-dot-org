import {Maze} from '../legacy/activities/maze/Maze';
import {expect, test} from '../shared/fixtures';

test.describe('Teacher panel — Maze level 4', () => {
  test('authenticated teacher sees Teacher Panel heading', async ({
    teacherPage,
  }) => {
    const maze = new Maze(teacherPage);
    await maze.reloadLevel(4);
    // #teacher-panel-container is a zero-dimension wrapper around a position:fixed
    // child; assert on the h3 heading directly, which has real dimensions.
    await expect(
      teacherPage.getByRole('heading', {name: 'Teacher Panel', level: 3}),
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
