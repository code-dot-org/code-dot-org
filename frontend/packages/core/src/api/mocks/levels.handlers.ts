import {http, HttpResponse} from 'msw';

import type {LevelPropertiesMap} from '../dashboard/levels';
import {getActiveFixture} from './registry';

/**
 * Returns the active fixture's level_properties map, or an empty map. App
 * code reads entries by levelId; an empty map is a valid response and lets
 * the lab render without Rails when no fixture is registered.
 */
function levelPropertiesPayload(): LevelPropertiesMap {
  return getActiveFixture()?.levelProperties ?? {};
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
