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

// Routes that apply across every scenario — for general endpoints (current
// user, locale, feature flags, …) that don't depend on the rendered lab.
let globalRoutes: MockRoute[] = [];

function scopeKey(labKey: string, tag: string): string {
  return `${labKey}${SCOPE_SEP}${tag}`;
}

/**
 * Register mock routes. Omit `scope` for routes that apply across every
 * scenario; pass a `{labKey, tag}` to bind them to one. Appends — call
 * repeatedly to layer more endpoints. Later registrations match after earlier
 * ones (first match wins), so register specific paths before wildcard ones.
 * Use `clearMockFixtures` to replace rather than extend.
 *
 * A scenario route shadows a global one for the same request, so a scenario
 * can override a general endpoint (e.g. simulate signed-out in an `error`
 * scenario) without disturbing the global default.
 */
export function registerMockFixture(fixture: MockFixture): void;
export function registerMockFixture(
  scope: Scenario,
  fixture: MockFixture,
): void;
export function registerMockFixture(
  scopeOrFixture: Scenario | MockFixture,
  maybeFixture?: MockFixture,
): void {
  const scoped = maybeFixture !== undefined;
  const fixture = (scoped ? maybeFixture : scopeOrFixture) as MockFixture;
  const incoming = Array.isArray(fixture) ? fixture : [fixture];

  if (!scoped) {
    globalRoutes = [...globalRoutes, ...incoming];
    return;
  }

  const {labKey, tag} = scopeOrFixture as Scenario;
  const key = scopeKey(labKey, tag);
  const existing = routes.get(key);
  routes.set(key, existing ? [...existing, ...incoming] : [...incoming]);
}

/**
 * Drop registered routes. With no argument, clears everything — every
 * scenario and the global routes. With `{labKey, tag}` clears just that
 * scenario; with `{labKey}` clears every scenario under that lab. Scenario
 * clears leave the global routes untouched.
 */
export function clearMockFixtures(scope?: {
  labKey?: string;
  tag?: string;
}): void {
  if (!scope?.labKey) {
    routes.clear();
    globalRoutes = [];
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

function matchInList(
  list: MockRoute[] | undefined,
  method: string,
  url: URL,
): ResolvedMockRoute | undefined {
  if (!list) return undefined;
  for (const route of list) {
    const routeMethod = (route.method ?? 'get').toLowerCase();
    if (routeMethod !== 'all' && routeMethod !== method) continue;
    const match = matchRequestUrl(url, route.path);
    if (match.matches) return {route, params: match.params ?? {}};
  }
  return undefined;
}

/**
 * First matching route for the request: the active scenario's routes are tried
 * first, then the global routes. Returns `undefined` when nothing matches; the
 * dispatch handler turns that into a fall-through to the default handlers.
 */
export function resolveMockRoute(
  method: string,
  url: URL,
): ResolvedMockRoute | undefined {
  const wanted = method.toLowerCase();
  const scenario = getActiveScenario();
  const scenarioRoutes = scenario
    ? routes.get(scopeKey(scenario.labKey, scenario.tag))
    : undefined;

  return (
    matchInList(scenarioRoutes, wanted, url) ??
    matchInList(globalRoutes, wanted, url)
  );
}
