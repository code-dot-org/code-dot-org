import type {RequestHandler} from 'msw';

import {channelsHandlers} from './channels.handlers';
import {dispatchHandlers} from './dispatch.handlers';
import {levelsHandlers} from './levels.handlers';
import {preferencesHandlers} from './preferences.handlers';
import {projectsHandlers} from './projects.handlers';
import {sectionsHandlers} from './sections.handlers';
import {sourcesHandlers} from './sources.handlers';

/**
 * Aggregate handler list consumed by the worker. Order matters only for
 * overlapping URL patterns; within a domain, list specific paths before
 * wildcard ones.
 *
 * `dispatchHandlers` runs first: it serves any route registered through
 * `registerMockFixture` for the active scenario, and falls through to the
 * default domain handlers below when nothing matches.
 */
export function getMockHandlers(): RequestHandler[] {
  return [
    ...dispatchHandlers,
    ...levelsHandlers,
    ...preferencesHandlers,
    ...channelsHandlers,
    ...sourcesHandlers,
    ...projectsHandlers,
    ...sectionsHandlers,
  ];
}
