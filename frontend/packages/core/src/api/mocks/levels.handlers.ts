import {http, HttpResponse} from 'msw';

import type {LevelPropertiesMap} from '../dashboard/levels';

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

export const levelsHandlers = [
  // GET /levels/:levelId/level_properties
  http.get('*/levels/:levelId/level_properties', () =>
    HttpResponse.json(levelPropertiesPayload()),
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
