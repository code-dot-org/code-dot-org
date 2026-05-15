import type {
  MiniApp,
  MiniAppDeps,
  MiniAppFactory,
} from '@code-dot-org/mini-app-base';
import {
  NEIGHBORHOOD_NAME,
  NeighborhoodMiniApp,
} from '@code-dot-org/neighborhood-mini-app';

/**
 * The only place in apps/ that names each mini-app concretely. New
 * mini-apps register here; everything else in codebridge talks to the
 * `MiniApp` interface and dispatches by `labConfig.miniApp.name`.
 */
const MINI_APPS: Record<string, MiniAppFactory> = {
  [NEIGHBORHOOD_NAME]: deps => new NeighborhoodMiniApp(deps),
};

/**
 * Look up a mini-app implementation by name and instantiate it with the
 * supplied codebridge dependencies. Returns null when no implementation
 * is registered for the name — callers should treat that as "this level
 * doesn't use a mini-app" rather than an error.
 */
export function createMiniApp(name: string, deps: MiniAppDeps): MiniApp | null {
  const factory = MINI_APPS[name];
  return factory ? factory(deps) : null;
}
