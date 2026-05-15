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

import NeighborhoodPreview from './MiniAppPreview/NeighborhoodPreview';

/**
 * Props an orchestrator component accepts from MiniAppPreview. Each
 * orchestrator wraps the mini-app's `PreviewComponent` and runs the
 * codebridge-aware effects (level/skin loading, redux dispatch, etc.)
 * that the package's preview can't touch directly.
 */
export interface MiniAppOrchestratorProps {
  handleScaling?: boolean;
  children?: ReactNode;
}

interface MiniAppRegistryEntry {
  factory: MiniAppFactory;
  /**
   * Optional codebridge-side shell that owns React effects which need
   * apps-only access (codebridge context, redux, the maze skin loader).
   * Wraps the mini-app's `PreviewComponent` as `children`.
   */
  Orchestrator?: ComponentType<MiniAppOrchestratorProps>;
}

/**
 * The only place in apps/ that names each mini-app concretely. New
 * mini-apps register here; everything else in codebridge talks to the
 * `MiniApp` interface and dispatches by `labConfig.miniApp.name`.
 */
const MINI_APPS: Record<string, MiniAppRegistryEntry> = {
  [NEIGHBORHOOD_NAME]: {
    factory: deps => new NeighborhoodMiniApp(deps),
    Orchestrator: NeighborhoodPreview,
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
 * Return the codebridge-side orchestration component for a mini-app, or
 * undefined when the mini-app doesn't need one. MiniAppPreview wraps
 * `miniApp.PreviewComponent` with this when present.
 */
export function getMiniAppOrchestrator(
  name: string
): ComponentType<MiniAppOrchestratorProps> | undefined {
  return MINI_APPS[name]?.Orchestrator;
}
