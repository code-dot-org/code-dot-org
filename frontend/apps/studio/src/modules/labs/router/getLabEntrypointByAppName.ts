import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

/**
 * A lab run's pass/fail verdict, reported via `LabEntrypointProps.onLevelResult`.
 * `result`/`testStatus` mirror a lab's own result codes (e.g. maze-lab's
 * `ResultType`/`TestResults.Status`) widened to `number` so this router stays
 * lab-agnostic; a passing result is `result === 1` (`ResultType.SUCCESS`).
 */
export interface LevelResultDetail {
  result: number;
  testStatus?: number;
  /** Blocks the learner used, when the lab tracks it. */
  blocksUsed?: number;
  /** The level's ideal block count, when authored. */
  idealBlocks?: number;
}

/** Props the course route passes to a lab entrypoint. */
export interface LabEntrypointProps {
  /** Advance to the next level (reports a milestone, then navigates). */
  onContinue?: () => void;
  /** Fires when a run finishes, carrying the pass/fail verdict. */
  onLevelResult?: (detail: LevelResultDetail) => void;
}

type LazyLabComponent = LazyExoticComponent<ComponentType<LabEntrypointProps>>;

const appNameEntrypoints: Record<string, LazyLabComponent> = {
  fish: lazy(() => import('@/modules/labs/oceans')),
  standalone_video: lazy(() => import('@/modules/labs/standaloneVideo')),
  // Fat-lab mounts (@code-dot-org/lab-classic via LabProviders) — see
  // modules/labs/music/index.tsx. Every other entry here is staging's slim
  // @code-dot-org/lab contract; these two are the exception.
  music: lazy(() => import('@/modules/labs/music')),
  maze: lazy(() => import('@/modules/labs/maze')),
};

export function getLabEntrypointByAppName(
  appName: string,
): LazyLabComponent | undefined {
  return appNameEntrypoints[appName];
}
