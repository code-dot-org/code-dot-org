import {lazy} from 'react';
import type {ComponentType, LazyExoticComponent} from 'react';

import type {BlocklySerialization, Toolbox} from '@code-dot-org/blockly';

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

/**
 * Threads the properties panel's section-selection state into a lab that
 * self-displays its own instructions (maze, this pass — see
 * ExperienceStage's `hostRendersInstructions`) rather than duplicating a
 * host-rendered instructions block on top of it. Ignored by every
 * entrypoint that doesn't self-display (oceans, standalone_video) or that
 * still uses the host placeholder (music, for now).
 */
export interface LabEditingProps {
  authorMode: boolean;
  instructionsSelected: boolean;
  onInstructionsClick: () => void;
  /** True while the properties panel is pinned on the 'level' section —
   * offers map painting on the stage (maze only; other entrypoints ignore
   * it). The tool palette lives in the panel, not here — see
   * PropertiesPanel's LevelFields. */
  mapEditingActive: boolean;
  /** The panel's currently selected paint-tool id. */
  selectedPaintToolId?: string;
  /** Fires after a stage paint with the freshly updated wire-format patch
   * — the panel folds it into its Save draft. */
  onMapDraftChange: (patch: {serialized_maze: string; maze: string}) => void;
  /** The panel's toolbox-tray draft, live — supersedes the served toolbox
   * on maze so a chip add/remove is visible in the real flyout before Save
   * (maze only; other entrypoints ignore it). */
  toolboxOverride?: Toolbox;
  /** Which program the shared workspace currently represents — "Student
   * start" or "My solution" (maze only; see MazeLabEditingProps for the
   * full doc comment on why a mode replaces the earlier single boolean). */
  workspaceMode?: 'studentStart' | 'mySolution';
  /** Fresh JSON to load on a mode switch — see MazeLabEditingProps. */
  workspaceOverride?: BlocklySerialization;
  /** Fires on every workspace mutation while workspaceMode is set, carrying
   * the freshly captured legacy XML — the panel decides what to do with it
   * based on which mode is active, mirroring onMapDraftChange. */
  onWorkspaceChange: (xml: string) => void;
  /** Fires once per passing run recorded while workspaceMode is
   * 'mySolution' — the author-run solvability proof. */
  onSolutionRun: (detail: {
    solutionBlocksXml: string;
    blocksUsed: number;
  }) => void;
}

/** Props the course route passes to a lab entrypoint. */
export interface LabEntrypointProps {
  /** Advance to the next level (reports a milestone, then navigates). */
  onContinue?: () => void;
  /** Fires when a run finishes, carrying the pass/fail verdict. */
  onLevelResult?: (detail: LevelResultDetail) => void;
  /** Author-mode section selection — see LabEditingProps. Undefined outside
   * the authoring host (the live-course route never sets it). */
  editing?: LabEditingProps;
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
