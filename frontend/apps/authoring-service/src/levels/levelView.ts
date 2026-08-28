import type {ExistingLevelExperience} from '../authoring/model.js';

import {
  checkImportedMazeLevel,
  child,
  childBlock,
  extractGoalTotals,
  extractGrid,
  fieldText,
  LEAF_BLOCK_TYPES,
  parseXml,
  toMazeBlockChain,
  type ImportedLevelCheckResult,
  type XmlNode,
} from './importedLevelCheck.js';

/**
 * get_level's assembly (Author Mode WOW plan §3): the agent has never once
 * seen a level's real contents (grid, toolbox, start/solution programs) —
 * every "make THIS level X" request failed for exactly that reason. This
 * builds a compact, token-conscious view from the same served
 * LevelProperties the lab itself mounts from, reusing importedLevelCheck.ts's
 * decoders rather than a second parser — that module already covers both a
 * draft level (registered via buildMazeLevelWireProperties) and a real
 * imported one, so one view builder serves both.
 */

const GRID_LEGEND =
  '0=wall 1=open 2=start 3=finish 4=obstacle 5=start+finish; one string per row, one digit per cell';

export interface LevelView {
  experienceId: string;
  title?: string;
  levelKey: string;
  levelType: string;
  origin: 'draft' | 'levelbuilder';
  /** True only for a draft Maze level whose typed definition still
   * round-trips (update_level would accept an edit to it). */
  editable: boolean;
  skin?: string;
  /** One digit-string per row — see gridLegend. Omitted for a level type
   * this view doesn't decode a grid for (Fish, Music, video, ...). */
  grid?: string[];
  gridLegend?: string;
  startDirection?: number;
  /** Toolbox block types in the friendly names create_level/update_level
   * use (e.g. 'turnLeft', 'repeat'), not raw Blockly type strings. An
   * unrecognized real Blockly type (a predicate/compass block this view
   * doesn't decode) passes through as its raw type string. */
  toolbox?: string[];
  /** Decoded to the same MazeBlockNode[] JSON shape create_level accepts.
   * Missing (rather than empty) when the program uses a block type this
   * view can't decode — see `note` for why. */
  startProgram?: unknown[];
  solutionProgram?: unknown[];
  shortInstructions?: string;
  longInstructions?: string;
  idealBlockCount?: number;
  goals?: {
    nectarGoal?: number;
    honeyGoal?: number;
    minCollected?: number;
    /** The map's own item totals, from the painted grid — compare against
     * the declared goal(s) above to spot a map that can't satisfy them. */
    mapTotals?: {nectar: number; honey: number; total: number};
  };
  flowerType?: string;
  solutionVerified?: boolean;
  checkVerdict?: ImportedLevelCheckResult;
  note?: string;
}

function friendlyToolboxType(node: XmlNode): string {
  const leaf = LEAF_BLOCK_TYPES[node.attrs.type];
  if (leaf) {
    return leaf;
  }
  // maze_move/controls_repeat are real curriculum's second spelling of
  // maze_turn-shaped move / controls_repeat_dropdown — see
  // importedLevelCheck.ts's SIMULATABLE_REAL_TYPES comment for the file
  // counts backing this.
  if (node.attrs.type === 'maze_turn' || node.attrs.type === 'maze_move') {
    return fieldText(node, 'DIR') ?? node.attrs.type;
  }
  if (node.attrs.type === 'controls_repeat_dropdown' || node.attrs.type === 'controls_repeat') {
    return 'repeat';
  }
  return node.attrs.type;
}

function decodeToolbox(toolboxXml: string): string[] {
  const root = parseXml(toolboxXml);
  return root.children
    .filter(node => node.tag === 'block' && node.attrs.type)
    .map(friendlyToolboxType);
}

/** Unwraps the `when_run` program root real levels and mazeLevel.ts's own
 * serializer both emit, then decodes the chain — same logic
 * checkImportedMazeLevel uses on the solution. Returns undefined (distinct
 * from an empty program) when a block type in the chain isn't one this
 * module simulates, so the caller can say so rather than show a truncated
 * program as if it were complete. */
function decodeProgram(programXml: unknown): MazeChain | undefined {
  if (typeof programXml !== 'string' || !programXml.trim()) {
    return undefined;
  }
  const root = parseXml(programXml);
  const head = childBlock(root);
  if (!head) {
    return {program: [], unparsed: false};
  }
  const programRoot =
    head.attrs.type === 'when_run'
      ? (() => {
          const next = child(head, 'next');
          return next ? childBlock(next) : undefined;
        })()
      : head;
  if (!programRoot) {
    return {program: [], unparsed: false};
  }
  const chain = toMazeBlockChain(programRoot);
  return chain ? {program: chain, unparsed: false} : {program: [], unparsed: true};
}

interface MazeChain {
  program: unknown[];
  unparsed: boolean;
}

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function stringField(properties: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

export interface BuildLevelViewParams {
  experience: ExistingLevelExperience;
  properties: Record<string, unknown>;
  /** True when a draft Maze level's typed definition has been touched by
   * the visual level editor and no longer round-trips (see
   * AuthoringState.ts's markDraftLevelVisuallyEdited). Always false for an
   * imported level, which has no typed definition to begin with. */
  visuallyEdited: boolean;
}

/** Does this served LevelProperties entry look like a Maze/Karel-family
 * level at all (as opposed to Fish, Music, a video, ...)? Shared with the
 * runner's auto-narrate (checkNarration): checkImportedMazeLevel's own
 * "no solution_blocks" rejection is correct on a real maze-family level
 * missing its solution, but is just noise appended to every instructions
 * edit on an unrelated Fish/Music level, which has no solution_blocks by
 * nature and no such check to run. */
export function isMazeFamilyLevel(properties: Record<string, unknown>): boolean {
  return (
    typeof properties.toolboxBlocksXml === 'string' ||
    typeof properties.solutionBlocksXml === 'string' ||
    typeof properties.maze === 'string' ||
    typeof properties.serialized_maze === 'string'
  );
}

export function buildLevelView(params: BuildLevelViewParams): LevelView {
  const {experience, properties, visuallyEdited} = params;
  const toolboxXml = properties.toolboxBlocksXml;
  const isMazeFamily = isMazeFamilyLevel(properties);

  const base: LevelView = {
    experienceId: experience.id,
    title: experience.title,
    levelKey: experience.levelKey,
    levelType: experience.levelType,
    origin: experience.origin === 'draft' ? 'draft' : 'levelbuilder',
    editable: experience.origin === 'draft' && !visuallyEdited,
    shortInstructions: stringField(properties, 'short_instructions', 'shortInstructions'),
    longInstructions: stringField(properties, 'long_instructions', 'longInstructions'),
  };

  if (!isMazeFamily) {
    return {
      ...base,
      note:
        `this is a ${experience.levelType} level; get_level's decoded view ` +
        '(grid/toolbox/blocks) only applies to Maze-family levels. ' +
        'Instructions above are still accurate.',
    };
  }

  const grid = extractGrid(properties);
  const start = decodeProgram(properties.startBlocksXml);
  const solution = decodeProgram(properties.solutionBlocksXml);
  const mapTotals = extractGoalTotals(properties);
  const nectarGoal = toNumber(properties.nectar_goal);
  const honeyGoal = toNumber(properties.honey_goal);
  const minCollected = toNumber(properties.min_collected);
  const hasGoals =
    nectarGoal !== undefined ||
    honeyGoal !== undefined ||
    minCollected !== undefined ||
    mapTotals !== undefined;

  const notes: string[] = [];
  if (start?.unparsed) {
    notes.push(
      "the start program uses a block type this view can't decode to " +
        'structured JSON (a conditional, compass move, or skin predicate) — ' +
        'startProgram is omitted.',
    );
  }
  if (solution?.unparsed) {
    notes.push(
      "the solution program uses a block type this view can't decode to " +
        'structured JSON — solutionProgram is omitted.',
    );
  }

  return {
    ...base,
    skin: stringField(properties, 'skin'),
    grid: grid?.map(row => row.join('')),
    gridLegend: grid ? GRID_LEGEND : undefined,
    startDirection: toNumber(properties.startDirection ?? properties.start_direction),
    toolbox: typeof toolboxXml === 'string' ? decodeToolbox(toolboxXml) : undefined,
    startProgram: start && !start.unparsed ? start.program : undefined,
    solutionProgram: solution && !solution.unparsed ? solution.program : undefined,
    idealBlockCount: toNumber(properties.ideal),
    goals: hasGoals ? {nectarGoal, honeyGoal, minCollected, mapTotals} : undefined,
    flowerType: stringField(properties, 'flower_type', 'flowerType'),
    solutionVerified: toBoolean(properties.solutionVerified),
    checkVerdict: checkImportedMazeLevel({properties}),
    note: notes.length > 0 ? notes.join(' ') : undefined,
  };
}
