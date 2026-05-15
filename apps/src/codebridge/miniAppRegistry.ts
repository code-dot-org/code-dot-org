import {DEMO_NAME, DemoMiniApp} from '@code-dot-org/demo-mini-app';
import type {
  MiniApp,
  MiniAppDeps,
  MiniAppFactory,
} from '@code-dot-org/mini-app-base';
import {
  NEIGHBORHOOD_NAME,
  NeighborhoodMiniApp,
} from '@code-dot-org/neighborhood-mini-app';
import type {ComponentType, ReactNode} from 'react';

import NeighborhoodAdapter from './miniAppAdapters/NeighborhoodAdapter';

/**
 * Props codebridge passes to a mini-app's adapter component.
 */
export interface MiniAppAdapterProps {
  miniApp: MiniApp;
  children: ReactNode;
}

interface MiniAppRegistryEntry {
  factory: MiniAppFactory;
  /**
   * Optional apps-side wrapper that supplies codebridge-only inputs
   * (level properties, redux state, apps-only loaders like the maze
   * skin loader) to the mini-app's `PreviewComponent`. Mini-apps that
   * need nothing from codebridge beyond what `MiniAppDeps` provides
   * leave this unset.
   */
  Adapter?: ComponentType<MiniAppAdapterProps>;
}

/**
 * The only place in apps/ that names each mini-app concretely. New
 * mini-apps register here; everything else in codebridge talks to the
 * `MiniApp` interface and dispatches by `labConfig.miniApp.name`.
 */
const MINI_APPS: Record<string, MiniAppRegistryEntry> = {
  [NEIGHBORHOOD_NAME]: {
    factory: deps => new NeighborhoodMiniApp(deps),
    Adapter: NeighborhoodAdapter,
  },
  [DEMO_NAME]: {
    factory: deps => new DemoMiniApp(deps),
  },
};

/**
 * Look up a mini-app implementation by name and instantiate it with the
 * supplied codebridge dependencies. Returns null when no implementation
 * is registered for the name — callers should treat that as "this level
 * doesn't use a mini-app" rather than an error.
 */
export function createMiniApp(name: string, deps: MiniAppDeps): MiniApp | null {
  return MINI_APPS[name]?.factory(deps) ?? null;
}

/**
 * Return the codebridge-side adapter for a mini-app, or undefined when
 * the mini-app needs no apps-only wiring. `MiniAppPreview` wraps the
 * rendered `PreviewComponent` with this when present.
 */
export function getMiniAppAdapter(
  name: string
): ComponentType<MiniAppAdapterProps> | undefined {
  return MINI_APPS[name]?.Adapter;
}
