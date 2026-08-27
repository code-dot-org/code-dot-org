import {
  simulateMazeProgram,
  type MazeBlockNode,
  type MazeBlockType,
} from './mazeLevel.js';

/**
 * "Check level" for an attached (`lb:`) maze-family level: an
 * authoring-time LINT, not a blocker. It catches the same class of bug
 * `verifyMazeLevelSolvable` catches for AI-generated levels — a toolbox
 * missing a block the solution needs, or a solution that no longer solves
 * the map — but against a real, human-authored `.level` file's Blockly XML
 * instead of mazeLevel.ts's typed `MazeBlockNode[]`.
 *
 * Two independent checks, run in order:
 *   1. Palette: every block type used anywhere in the solution must be
 *      offered by the toolbox OR already pre-placed on the workspace via
 *      start_blocks (a `deletable="false"` block glued to the canvas needs
 *      no toolbox entry — real levels do this, e.g. a Bee level that starts
 *      with a pinned `maze_nectar` block). This is pure string comparison
 *      over block `type` attributes — it doesn't need to understand what a
 *      block does, so it works for any Blockly-family level regardless of
 *      complexity.
 *   2. Full solvability: only attempted once (1) passes AND every block
 *      type in the solution is one `simulateMazeProgram` actually models
 *      (mazeLevel.ts's plain move/turn/repeat plus the Farmer/Bee/Collector
 *      action blocks — see that module's header for the full list and why
 *      Harvester/Planter aren't in it). A level using conditionals, compass
 *      moves, or a Bee/Harvester/Planter predicate stops at the palette
 *      check — reported as a pass, but honestly labeled as palette-only.
 */

// --- minimal Blockly-XML parsing -------------------------------------------
//
// Mirrors packages/authoring/src/importer/levelXml.ts's own reasoning: the
// dialect used by real .level files (and by mazeLevel.ts's own XML
// serializers) is fixed and small — <block type="..."> elements chained by
// <next>, with <title name="...">value</title> fields and
// <statement name="...">...</statement> nested bodies — so a small
// hand-rolled parser is enough; this module runs server-side (no browser
// DOMParser), so pulling in a DOM/XML dependency for this alone would be
// overkill.

interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
}

function parseXml(source: string): XmlNode {
  let i = 0;

  function skipWs() {
    while (i < source.length && /\s/.test(source[i])) i++;
  }

  function parseElement(): XmlNode {
    skipWs();
    if (source[i] !== '<') {
      throw new Error(`parseXml: expected '<' at offset ${i}`);
    }
    i++;
    const nameMatch = /^[\w:-]+/.exec(source.slice(i));
    if (!nameMatch) {
      throw new Error(`parseXml: expected a tag name at offset ${i}`);
    }
    const tag = nameMatch[0];
    i += tag.length;

    const attrs: Record<string, string> = {};
    for (;;) {
      skipWs();
      if (source.startsWith('/>', i)) {
        i += 2;
        return {tag, attrs, children: [], text: ''};
      }
      if (source[i] === '>') {
        i++;
        break;
      }
      const attrMatch = /^([\w:-]+)\s*=\s*"([^"]*)"/.exec(source.slice(i));
      if (!attrMatch) {
        throw new Error(`parseXml: expected an attribute at offset ${i}`);
      }
      attrs[attrMatch[1]] = attrMatch[2];
      i += attrMatch[0].length;
    }

    const children: XmlNode[] = [];
    let text = '';
    for (;;) {
      if (i >= source.length) {
        throw new Error('parseXml: unexpected end of input inside a tag');
      }
      if (source.startsWith('</', i)) {
        i += 2;
        const closeMatch = /^[\w:-]+/.exec(source.slice(i));
        i += closeMatch ? closeMatch[0].length : 0;
        skipWs();
        if (source[i] === '>') i++;
        break;
      }
      if (source[i] === '<') {
        children.push(parseElement());
        continue;
      }
      text += source[i];
      i++;
    }
    return {tag, attrs, children, text};
  }

  return parseElement();
}

function child(node: XmlNode, tag: string): XmlNode | undefined {
  return node.children.find(c => c.tag === tag);
}

function childBlock(node: XmlNode): XmlNode | undefined {
  return child(node, 'block');
}

function fieldText(node: XmlNode, name: string): string | undefined {
  const field = node.children.find(
    c => (c.tag === 'title' || c.tag === 'field') && c.attrs.name === name,
  );
  return field?.text.trim();
}

/**
 * Every `<block type="...">` anywhere under `node` (including nested
 * statement/next bodies), excluding `when_run` — the implicit program root
 * every solution has, never itself a toolbox entry.
 */
function collectAllBlockTypes(
  node: XmlNode,
  out: Set<string> = new Set(),
): Set<string> {
  if (
    node.tag === 'block' &&
    node.attrs.type &&
    node.attrs.type !== 'when_run'
  ) {
    out.add(node.attrs.type);
  }
  for (const c of node.children) {
    collectAllBlockTypes(c, out);
  }
  return out;
}

/** Top-level block types offered in a toolbox `<xml>` payload — a flat
 * palette listing, not a program chain. */
function collectToolboxTypes(toolboxXml: string): Set<string> {
  const root = parseXml(toolboxXml);
  return new Set(
    root.children
      .filter(c => c.tag === 'block' && c.attrs.type)
      .map(c => c.attrs.type),
  );
}

// Real Blockly block type -> mazeLevel.ts's MazeBlockType, for the leaf
// blocks with no argument fields (mirrors TOOLBOX_BLOCK_XML/blockXml there).
const LEAF_BLOCK_TYPES: Partial<Record<string, MazeBlockType>> = {
  maze_moveForward: 'moveForward',
  maze_fill: 'fill',
  maze_dig: 'dig',
  maze_nectar: 'getNectar',
  maze_honey: 'makeHoney',
  collector_collect: 'collect',
};

/** Every block type simulateMazeProgram (via mazeLevel.ts's runProgram) can
 * execute — mirrors LEAF_BLOCK_TYPES plus the two blocks with fields. */
const SIMULATABLE_REAL_TYPES = new Set<string>([
  ...Object.keys(LEAF_BLOCK_TYPES),
  'maze_turn',
  'controls_repeat_dropdown',
]);

/**
 * Converts one real Blockly `<block>` element into a MazeBlockNode, or
 * undefined if it uses a block type/field the simulator doesn't model. The
 * caller only attempts this once every used type has passed
 * SIMULATABLE_REAL_TYPES, so undefined here is a defensive fallback, not
 * the primary gate.
 */
function toMazeBlockNode(xml: XmlNode): MazeBlockNode | undefined {
  const leaf = LEAF_BLOCK_TYPES[xml.attrs.type];
  if (leaf) {
    return {type: leaf} as MazeBlockNode;
  }
  if (xml.attrs.type === 'maze_turn') {
    const dir = fieldText(xml, 'DIR');
    return dir === 'turnLeft' || dir === 'turnRight'
      ? {type: dir}
      : undefined;
  }
  if (xml.attrs.type === 'controls_repeat_dropdown') {
    const times = parseInt(fieldText(xml, 'TIMES') ?? '', 10);
    const doStatement = child(xml, 'statement');
    if (!Number.isFinite(times) || !doStatement) return undefined;
    const doBlock = childBlock(doStatement);
    const children = doBlock ? toMazeBlockChain(doBlock) : [];
    return children && children.length > 0
      ? {type: 'repeat', times, children}
      : undefined;
  }
  return undefined;
}

function toMazeBlockChain(first: XmlNode): MazeBlockNode[] | undefined {
  const nodes: MazeBlockNode[] = [];
  let current: XmlNode | undefined = first;
  while (current) {
    const node = toMazeBlockNode(current);
    if (!node) return undefined;
    nodes.push(node);
    const nextEl = child(current, 'next');
    current = nextEl ? childBlock(nextEl) : undefined;
  }
  return nodes;
}

export interface ImportedLevelCheckInput {
  /** The level's served LevelProperties — the same shape the
   * level_properties route returns (buildMazeLevelProperties' output). */
  properties: Record<string, unknown>;
}

export interface ImportedLevelCheckResult {
  ok: boolean;
  /** 'simulated': ran the full grid+program walk. 'palette': only checked
   * that every solution block type is offered by the toolbox. */
  mode: 'simulated' | 'palette';
  reasons: string[];
  /** Present even when ok — explains why full simulation wasn't attempted. */
  note?: string;
}

function extractGrid(
  properties: Record<string, unknown>,
): number[][] | undefined {
  if (typeof properties.maze === 'string') {
    try {
      const grid: unknown = JSON.parse(properties.maze);
      if (Array.isArray(grid)) return grid as number[][];
    } catch {
      // fall through to serialized_maze
    }
  }
  if (typeof properties.serialized_maze === 'string') {
    try {
      const cells: unknown = JSON.parse(properties.serialized_maze);
      if (Array.isArray(cells)) {
        return (cells as {tileType: number}[][]).map(row =>
          row.map(cell => cell.tileType),
        );
      }
    } catch {
      // fall through
    }
  }
  return undefined;
}

export function checkImportedMazeLevel(
  input: ImportedLevelCheckInput,
): ImportedLevelCheckResult {
  const {properties} = input;
  const toolboxBlocksXml = properties.toolboxBlocksXml;
  const solutionBlocksXml = properties.solutionBlocksXml;
  const startBlocksXml = properties.startBlocksXml;

  if (typeof solutionBlocksXml !== 'string' || !solutionBlocksXml.trim()) {
    return {
      ok: false,
      mode: 'palette',
      reasons: ['level has no solution_blocks to check against.'],
    };
  }

  const solutionRoot = parseXml(solutionBlocksXml);
  const solutionHead = childBlock(solutionRoot);
  if (!solutionHead) {
    return {
      ok: false,
      mode: 'palette',
      reasons: ['solution_blocks has no blocks.'],
    };
  }

  const toolboxTypes =
    typeof toolboxBlocksXml === 'string'
      ? collectToolboxTypes(toolboxBlocksXml)
      : new Set<string>();
  const startTypes =
    typeof startBlocksXml === 'string' && startBlocksXml.trim()
      ? collectAllBlockTypes(parseXml(startBlocksXml))
      : new Set<string>();
  const availableTypes = new Set([...toolboxTypes, ...startTypes]);

  const usedTypes = collectAllBlockTypes(solutionHead);
  const missing = [...usedTypes].filter(type => !availableTypes.has(type));
  if (missing.length > 0) {
    return {
      ok: false,
      mode: 'palette',
      reasons: [
        `solution uses block type(s) ${missing.join(', ')} not offered by ` +
          `the toolbox.`,
      ],
    };
  }

  const unsupported = [...usedTypes].filter(
    type => !SIMULATABLE_REAL_TYPES.has(type),
  );
  if (unsupported.length > 0) {
    return {
      ok: true,
      mode: 'palette',
      reasons: [],
      note:
        `palette check passed; full solvability not attempted (uses block ` +
        `type(s) not simulated: ${unsupported.join(', ')}).`,
    };
  }

  const grid = extractGrid(properties);
  if (!grid) {
    return {
      ok: true,
      mode: 'palette',
      reasons: [],
      note:
        'palette check passed; full solvability not attempted (no maze or ' +
        'serialized_maze grid on this level).',
    };
  }

  const programRoot =
    solutionHead.attrs.type === 'when_run'
      ? (() => {
          const next = child(solutionHead, 'next');
          return next ? childBlock(next) : undefined;
        })()
      : solutionHead;
  const program = programRoot ? toMazeBlockChain(programRoot) : [];
  if (!program) {
    return {
      ok: true,
      mode: 'palette',
      reasons: [],
      note:
        'palette check passed; full solvability not attempted (solution ' +
        'block tree could not be parsed).',
    };
  }

  const startDirection =
    parseInt(String(properties.startDirection ?? properties.start_direction ?? '0'), 10) ||
    0;
  const result = simulateMazeProgram(grid, startDirection, program);
  if (!result.ok) {
    return {ok: false, mode: 'simulated', reasons: [result.reason]};
  }
  return {ok: true, mode: 'simulated', reasons: []};
}
