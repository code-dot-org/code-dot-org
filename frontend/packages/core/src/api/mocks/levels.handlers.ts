import {http, HttpResponse} from 'msw';

import type {AppOptions, LevelPropertiesMap} from '../dashboard/levels';

/**
 * Default level_properties response: an empty map. A lab fixture's
 * `levelProperties` is served ahead of this by the generic dispatcher (see
 * `registerLabFixtures`); this handler is the fall-through that lets a lab
 * render without Rails when no fixture is registered. App code reads entries
 * by levelId, so an empty map is a valid response.
 */
function levelPropertiesPayload(): LevelPropertiesMap {
  return {};
}

/**
 * Default app_options response: a minimal signed-out payload for the requested
 * level. A lab fixture's `appOptions` is served ahead of this by the
 * dispatcher; this fall-through lets a lab load (via `loadLab`) without Rails
 * when no fixture is registered.
 */
function appOptionsPayload(levelId: number): AppOptions {
  return {
    levelId,
    channel: null,
    publicCaching: null,
    displayTheme: null,
    isSignedIn: false,
  };
}

export const levelsHandlers = [
  // GET /levels/:levelId/level_properties
  http.get('*/levels/:levelId/level_properties', () =>
    HttpResponse.json(levelPropertiesPayload()),
  ),
  // GET /levels/:levelId/app_options
  http.get('*/levels/:levelId/app_options', ({params}) =>
    HttpResponse.json(appOptionsPayload(Number(params.levelId))),
  ),
  // GET /projects/:standaloneProjectType/level_properties
  http.get('*/projects/:standaloneProjectType/level_properties', () =>
    HttpResponse.json(levelPropertiesPayload()),
  ),
  // GET /s/:scriptName/lessons/:lessonPosition/level_properties
  http.get('*/s/:scriptName/lessons/:lessonPosition/level_properties', () =>
    HttpResponse.json(levelPropertiesPayload()),
  ),
];
