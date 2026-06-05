import {http, HttpResponse} from 'msw';

import {resolveMockRoute} from './fixtures';
import {readResource, writeResource} from './scenarioStore';

/**
 * Generic fixture dispatcher. Sits first in the handler list and consults the
 * per-scenario route registry (`registerMockFixture`) on every request. A
 * matching route produces the response; otherwise — and when a responder
 * returns `undefined` — this resolver returns `undefined`, which MSW treats
 * as "not handled", so the request falls through to the default domain
 * handlers behind it.
 */
export const dispatchHandlers = [
  http.all('*', async ({request}) => {
    const url = new URL(request.url);
    const resolved = resolveMockRoute(request.method, url);
    if (!resolved) return undefined;

    const {route, params} = resolved;

    if (typeof route.respond === 'function') {
      const result = await route.respond({
        request,
        params,
        url,
        store: {read: readResource, write: writeResource},
      });
      if (result === undefined) return undefined;
      return result instanceof Response ? result : HttpResponse.json(result);
    }

    return HttpResponse.json(route.respond, {
      status: route.status,
      headers: route.headers,
    });
  }),
];
