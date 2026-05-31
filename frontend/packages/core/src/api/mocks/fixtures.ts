// Generic, path-keyed MSW fixtures.
//
// A *mock fixture* is one or more routes, each mapping an HTTP method + path
// pattern to a responder. Routes are scoped to a `{labKey, tag}` scenario —
// the same scoping the lab fixtures use — so switching scenarios in the URL
// swaps the active route set. The dispatch handler (`dispatch.handlers.ts`)
// consults this registry first, on every request, and falls through to the
// default domain handlers when no route matches.
//
// `registerLabFixtures` is sugar on top of this: the read-only slices of a
// `LabFixture` (level properties, theme) desugar into routes here, while the
// stateful slices (channel, sources) stay as seed data the behavioral
// handlers consult via `getActiveFixture()`.

import {matchRequestUrl, type PathParams} from 'msw';

import {getActiveScenario, type Scenario} from './scenario';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all';

/** A static JSON body. The dispatcher wraps it in `HttpResponse.json`. */
export type MockJsonBody =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

/** Context handed to a responder function. */
export type MockResponderContext = {
  request: Request;
  /** Path params parsed from the matched pattern, e.g. `:channelId`. */
  params: PathParams;
  url: URL;
  /** Scenario-scoped sessionStorage, for write-through responders. */
  store: {
    read<T>(resource: string): T | undefined;
    write<T>(resource: string, value: T): void;
  };
};

/**
 * What a responder produces. Returning `undefined` declines the request, so
 * the dispatcher falls through to the next matching handler — the same
 * semantics MSW gives an `undefined` resolver result.
 */
export type MockResult = Response | MockJsonBody | undefined;

/** A static body, or a function computing the response from the request. */
export type MockResponder =
  | MockJsonBody
  | ((ctx: MockResponderContext) => MockResult | Promise<MockResult>);

export type MockRoute = {
  /** Defaults to `get`. `all` matches any method. */
  method?: HttpMethod;
  /** MSW path pattern. Wildcard-prefix it so it matches regardless of host. */
  path: string;
  respond: MockResponder;
  /** Status for a static `respond` body. Ignored when `respond` is a function. */
  status?: number;
  /** Headers for a static `respond` body. Ignored when `respond` is a function. */
  headers?: Record<string, string>;
};

/** A mock fixture: a single route or a list of them. */
export type MockFixture = MockRoute | MockRoute[];

export type ResolvedMockRoute = {route: MockRoute; params: PathParams};

// Keyed by `<labKey>\0<tag>`. NUL can't appear in a lab key or channel id, so
// it's an unambiguous separator.
const SCOPE_SEP = '\u0000';
const routes = new Map<string, MockRoute[]>();

function scopeKey(labKey: string, tag: string): string {
  return `${labKey}${SCOPE_SEP}${tag}`;
}

/**
 * Register routes for a scenario. Appends — call repeatedly to layer more
 * endpoints onto the same `{labKey, tag}`. Later registrations match after
 * earlier ones (first match wins), so register specific paths before
 * wildcard ones. Use `clearMockFixtures` to replace rather than extend.
 */
export function registerMockFixture(
  scope: Scenario,
  fixture: MockFixture,
): void {
  const key = scopeKey(scope.labKey, scope.tag);
  const incoming = Array.isArray(fixture) ? fixture : [fixture];
  const existing = routes.get(key);
  routes.set(key, existing ? [...existing, ...incoming] : [...incoming]);
}

/**
 * Drop registered routes. With no argument, clears every scenario; with a
 * `{labKey, tag}` clears just that scenario; with `{labKey}` clears every
 * scenario under that lab.
 */
export function clearMockFixtures(scope?: {
  labKey?: string;
  tag?: string;
}): void {
  if (!scope?.labKey) {
    routes.clear();
    return;
  }
  if (scope.tag !== undefined) {
    routes.delete(scopeKey(scope.labKey, scope.tag));
    return;
  }
  const prefix = `${scope.labKey}${SCOPE_SEP}`;
  for (const key of [...routes.keys()]) {
    if (key.startsWith(prefix)) routes.delete(key);
  }
}

/**
 * First route in the active scenario whose method and path match the request,
 * or `undefined`. The dispatch handler turns the result into a response (or a
 * fall-through when `undefined`).
 */
export function resolveMockRoute(
  method: string,
  url: URL,
): ResolvedMockRoute | undefined {
  const scenario = getActiveScenario();
  if (!scenario) return undefined;

  const list = routes.get(scopeKey(scenario.labKey, scenario.tag));
  if (!list) return undefined;

  const wanted = method.toLowerCase();
  for (const route of list) {
    const routeMethod = (route.method ?? 'get').toLowerCase();
    if (routeMethod !== 'all' && routeMethod !== wanted) continue;
    const match = matchRequestUrl(url, route.path);
    if (match.matches) return {route, params: match.params ?? {}};
  }
  return undefined;
}
