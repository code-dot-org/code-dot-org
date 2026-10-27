// A test project written as a world, compiled as the game it stands for.
//
// No `.world` is compiled any more: a game is a Main Screen whose Viewport
// shows `main.map` (specs/LESSONS_AS_SCREENS_PLAN.md). A test about an actor
// or an enhancement still writes the few rows it needs as a `define world`,
// as a lesson does, and this turns them into the screen and the map the way
// a lesson's are turned (`lessons/asScreen`).

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {screenOfWorld} from '../../progression/lessons/asScreen';
import {projectFiles} from '../../runtime/projectFiles';

const WORLD = 'worlds/main.world';
const SCREEN = 'screens/main.screen';
const MAP = 'maps/main.map';

/** The files the stock Viewport brings: itself, what it acts like and needs. */
const viewportFiles = (): Record<string, string> =>
  projectFiles(WORLD_SCENARIOS.empty.source);

/** Whether these files are a game written as a world. */
export const isWorldShaped = (files: Record<string, string>): boolean =>
  WORLD in files && !(SCREEN in files);

/**
 * The files with their `main.world` a Main Screen holding the level, as the
 * world held it, and what the world declared for itself named by the screen.
 * A world with a camera, or a theme for its map apart from its own, needs a
 * Viewport to hold one, and gets a `main.map` and the Viewport that shows it. Files that are not a world are returned as they are.
 */
export function worldAsScreen(
  files: Record<string, string>,
): Record<string, string> {
  if (!isWorldShaped(files)) {
    return files;
  }
  const {screen, map} = screenOfWorld(files[WORLD], files, {
    screenIsLevel: true,
  });
  const rest = Object.fromEntries(
    Object.entries(files).filter(([path]) => path !== WORLD),
  );
  // …only when the screen places one: a level on the screen itself has none,
  // and its files would be kinds a hat with no subject could start on.
  const brought = map
    ? Object.fromEntries(
        Object.entries(viewportFiles()).filter(
          ([path]) => path.startsWith('actors/') || path.startsWith('rules/'),
        ),
      )
    : {};
  const made: Record<string, string> = {
    ...brought,
    ...rest,
    [SCREEN]: screen,
    ...(map ? {[MAP]: map} : {}),
  };
  // Named by the file that declares them now (`renameReferences` does this
  // for a project; a test's files are text).
  return Object.fromEntries(
    Object.entries(made).map(([path, contents]) => [
      path,
      contents
        .replaceAll('WorldsMain_', 'ScreensMain_')
        .replaceAll('"worlds/main"', '"screens/main"'),
    ]),
  );
}
