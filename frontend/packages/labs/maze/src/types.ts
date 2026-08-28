import {z} from 'zod';

import type {
  BlocklySerialization,
  Environment,
  Toolbox,
} from '@code-dot-org/blockly';
import type {LevelProperties} from '@code-dot-org/core/api';

import type {MazeData} from './MazeController';
import {LevelKindSchema, AuthoredHintSchema} from './schema';
import type {SkinData} from './skin';
import type {Status} from './TestResults';

/**
 * Represents a set of skins for a particular level set.
 */
export interface SkinsData {
  /** Each possible skin in our level collection */
  [key: string]: SkinData;
}

/**
 * Describes the API for the maze commands.
 */
export interface API {
  /** An api call handles getting a block id as an argument */
  [key: string]: (id: string) => void;
}

export type MazeLevelSubProperties = z.infer<typeof LevelKindSchema>;

export type MazeLevelProperties = LevelProperties<MazeLevelSubProperties>;

/**
 * Specific environmental information for our blockly environment.
 */
export interface MazeEnvironment extends Environment {
  /** The current block count, if known. */
  usedBlockCount?: number;
  /** The ideal block count, if provided. */
  idealBlockCount?: number;
}

export type AuthoredHint = z.infer<typeof AuthoredHintSchema>;

/**
 * Author-mode section selection, threaded in from the host (studio's
 * ExperienceStage — see its `editing` object and
 * `LabEditingProps`/`getLabEntrypointByAppName.ts`). Declared independently
 * here rather than imported: this package can't depend on apps/studio, and
 * the two types only need to stay structurally compatible, the same way
 * `MazeDoneEventDetail` and the host's `LevelResultDetail` already do for
 * `onLevelResult`.
 */
export interface MazeLabEditingProps {
  authorMode: boolean;
  /** True while the properties panel is pinned open on the 'instructions'
   * section — drives the selected outline on the instructions bubble. */
  instructionsSelected: boolean;
  /** Opens (pins) the panel on the 'instructions' section. */
  onInstructionsClick: () => void;
  /** True while the properties panel is pinned open on the 'visualization'
   * section (the FINAL IA REVISION's four-component decomposition — grid +
   * character) — drives the selected outline on the play-area region AND
   * offers the map painter on the stage; the tool palette itself lives in
   * the panel (see editing.ts's getPaintTools, exported from App.tsx), so
   * this is only "is the surface open", not a tool selection. */
  visualizationSelected: boolean;
  /** Opens (pins) the panel on the 'visualization' section. */
  onVisualizationClick: () => void;
  /** The palette entry id (from getPaintTools) the panel currently has
   * selected — undefined means no tool, so a stage click is a no-op. */
  selectedPaintToolId?: string;
  /** Fires after every paint with the freshly updated wire-format patch —
   * the panel accumulates these into its Save draft. Never called except
   * as a direct result of a stage click. */
  onMapDraftChange: (patch: {serialized_maze: string; maze: string; initial_dirt: string}) => void;
  /** True while the properties panel is pinned open on the 'toolbox'
   * section — drives the selected outline on the Blocks header. */
  toolboxSelected: boolean;
  /** Opens (pins) the panel on the 'toolbox' section. */
  onToolboxClick: () => void;
  /** The tray's live toolbox, whenever the panel's toolbox tray has an
   * in-progress edit — supersedes levelProperties.toolboxBlocks so the real
   * flyout reflects a chip add/remove immediately, before Save. undefined
   * outside toolbox-tray editing (the served toolbox applies as normal). */
  toolboxOverride?: Toolbox;
  /** True while the properties panel is pinned open on the 'workspace'
   * section — drives the selected outline on the Workspace header. Distinct
   * from `workspaceMode` below: this is "is the panel showing the
   * workspace's controls", that is "which program the canvas holds". */
  workspaceSelected: boolean;
  /** Opens (pins) the panel on the 'workspace' section. */
  onWorkspaceClick: () => void;
  /**
   * Which program the shared workspace currently represents, or undefined
   * outside workspace editing entirely (Author Mode Pass D — before this,
   * the panel only ever edited the student's starting blocks; now the
   * SAME canvas edits either that or the author's own solution, one at a
   * time, never both — see workspaceOverride below for how a mode switch
   * swaps the canvas without losing either draft).
   */
  workspaceMode?: 'studentStart' | 'mySolution';
  /** Fresh JSON to load into the workspace whenever workspaceMode changes —
   * a new object identity is what makes BlocklyWorkspace's startBlocks
   * effect actually reload (see packages/blockly's BlocklyWorkspace).
   * undefined means "no content for this mode yet", so MazeLab's own
   * when_run-hat default applies, same as an absent
   * levelProperties.startBlocks. The host (LevelRail) computes this from
   * whichever mode's draft/served XML is current — MazeLab never guesses
   * at draft precedence itself. */
  workspaceOverride?: BlocklySerialization;
  /** Fires on every workspace mutation while workspaceMode is set — the
   * host decides, based on which mode is active, whether that's this
   * session's Save draft (student start: whatever's on the canvas at Save
   * time IS startBlocksXml) or just an in-session scratch capture (my
   * solution: only a passing run's output is ever proposed as
   * solutionBlocksXml — see onSolutionRun). */
  onWorkspaceChange: (xml: string) => void;
  /** Fires once per passing run recorded while workspaceMode is
   * 'mySolution' — the author-run proof LevelRail's "save as solution?"
   * offer is built from. Never fires on a failing run or outside that
   * mode; a run in 'studentStart' mode (or no editing mode at all) is
   * ordinary play, not a solution capture. */
  onSolutionRun: (detail: {
    solutionBlocksXml: string;
    blocksUsed: number;
  }) => void;
}

export type {MazeData};

/**
 * Enumeration of user program execution outcomes. Mirrors
 * apps/src/constants.js's `ResultType` — kept as a standalone copy here
 * rather than a shared import, since porting constants.js wholesale is out
 * of scope for this lab.
 */
export const ResultType = {
  UNSET: 0, // The result has not yet been computed.
  SUCCESS: 1, // The program completed successfully, achieving the goal.
  FAILURE: -1, // The program ran without error but did not achieve goal.
  TIMEOUT: 2, // The program did not complete (likely infinite loop).
  ERROR: -2, // The program generated an error.
} as const;

export type ResultTypeValue = (typeof ResultType)[keyof typeof ResultType];

/** Detail payload of Maze's `'done'` CustomEvent — the run's verdict. */
export interface MazeDoneEventDetail {
  result: ResultTypeValue;
  testStatus?: Status;
  /** Blocks the learner used, when the workspace has been tracking it. */
  blocksUsed?: number;
  /** The level's ideal block count, when authored. */
  idealBlocks?: number;
}
