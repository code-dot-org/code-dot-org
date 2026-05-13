import type {RequestHandler} from 'msw';

import {channelsHandlers} from './channels.handlers';
import {levelsHandlers} from './levels.handlers';
import {preferencesHandlers} from './preferences.handlers';
import {projectsHandlers} from './projects.handlers';
import {sourcesHandlers} from './sources.handlers';

/**
 * Aggregate handler list consumed by the worker. Order matters only for
 * overlapping URL patterns; within a domain, list specific paths before
 * wildcard ones.
 */
export function getMockHandlers(): RequestHandler[] {
  return [
    ...levelsHandlers,
    ...preferencesHandlers,
    ...channelsHandlers,
    ...sourcesHandlers,
    ...projectsHandlers,
  ];
}
