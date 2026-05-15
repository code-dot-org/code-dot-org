import {createContext} from 'react';

import type {NeighborhoodMiniApp} from './NeighborhoodMiniApp';

/**
 * Inputs codebridge supplies to the package's `NeighborhoodPreview` at
 * render time. Carries the `NeighborhoodMiniApp` instance plus the
 * three pieces of orchestration data codebridge alone can resolve —
 * level properties (from codebridge context), the loaded maze skin
 * (apps-only loader), and the serialized maze JSON (from redux).
 */
export interface NeighborhoodInputs {
  /**
   * The registered mini-app. The preview calls `afterInject` on it once
   * all three orchestration inputs are present.
   */
  miniApp: NeighborhoodMiniApp | null;

  /**
   * Codebridge's `levelProperties` for the current level. Typed as
   * `unknown` here — the package doesn't introspect this object, it
   * forwards it into `afterInject` where the inner Neighborhood (and
   * the MazeController it constructs) consume it.
   */
  levelProperties: unknown | null;

  /**
   * Loaded maze skin assets. Resolved by `apps/src/maze/skins`, opaque
   * to the package.
   */
  skin: Record<string, unknown> | null;

  /**
   * The level's serialized maze contents (JSON string). The preview
   * parses it before passing into `afterInject`. Undefined when no
   * project file is loaded yet.
   */
  serializedMaze: string | undefined;
}

/**
 * Context that codebridge provides around the package's
 * `NeighborhoodPreview`. A null value means the preview is rendered
 * outside a provider (e.g. the package's standalone dev server) — the
 * preview renders the visualization but skips the `afterInject` boot.
 */
export const NeighborhoodInputsContext =
  createContext<NeighborhoodInputs | null>(null);
