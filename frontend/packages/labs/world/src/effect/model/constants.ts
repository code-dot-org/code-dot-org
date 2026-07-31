import type {EffectDocument} from './types';

/** Current `.effect` file version. */
export const EFFECT_DOCUMENT_VERSION = 1;

/**
 * Node types of the form `fn:<functionId>` are calls to one of the document's
 * functions. They are not in the static registry — their definitions derive
 * from the document, like parameter ghosts do.
 */
const FUNCTION_NODE_PREFIX = 'fn:';

export function functionNodeType(functionId: string): string {
  return `${FUNCTION_NODE_PREFIX}${functionId}`;
}

/** Inverse of `functionNodeType`; null for ordinary node types. */
export function functionIdFromNodeType(nodeType: string): string | null {
  return nodeType.startsWith(FUNCTION_NODE_PREFIX)
    ? nodeType.slice(FUNCTION_NODE_PREFIX.length)
    : null;
}

/**
 * Ghost nodes — the fixed input and output row.
 *
 * The spec pins the effect's input and output to rows above and below the
 * pannable workspace. Those row items are *ghost nodes*: wires connect to them
 * like any other node, but they are not stored in `document.nodes`. They are
 * derived — from this fixed list, plus one per declared parameter — so there
 * is no way for a document to be missing its output, or to carry a stale
 * position for a node the editor pins anyway.
 *
 * Every ghost carries exactly one port, which is what lets the editor pin each
 * one under its own knob in the row.
 */

/** The single port id every ghost node uses. */
export const GHOST_PORT = 'value';

/** All ids reserved for ghosts start with this, so user nodes never collide. */
const GHOST_PREFIX = '@';
const PARAMETER_PREFIX = '@param:';

export const INPUT_TEXTURE_NODE_ID = '@in:texture';
export const INPUT_UV_NODE_ID = '@in:uv';
export const INPUT_TIME_NODE_ID = '@in:time';
export const INPUT_EFFECT_TIME_NODE_ID = '@in:effectTime';
export const OUTPUT_NODE_ID = '@out';

/** The stock input knobs, in the order the input row lays them out. */
export const INPUT_NODE_IDS = [
  INPUT_TEXTURE_NODE_ID,
  INPUT_UV_NODE_ID,
  INPUT_TIME_NODE_ID,
  INPUT_EFFECT_TIME_NODE_ID,
] as const;

export function parameterNodeId(parameterId: string): string {
  return `${PARAMETER_PREFIX}${parameterId}`;
}

/** Inverse of `parameterNodeId`; null for any other node id. */
export function parameterIdFromNodeId(nodeId: string): string | null {
  return nodeId.startsWith(PARAMETER_PREFIX)
    ? nodeId.slice(PARAMETER_PREFIX.length)
    : null;
}

/**
 * The free-standing annotation node: a node whose whole content is its
 * `note`. It has no ports, so the compiler's walk never reaches it and it
 * costs nothing in the shader.
 */
export const COMMENT_NODE_TYPE = 'comment';

/** True for ids the editor pins to the input or output row. */
export function isGhostNodeId(nodeId: string): boolean {
  return nodeId.startsWith(GHOST_PREFIX);
}

/** An effect with nothing in it: the rows exist, the workspace is empty. */
export function emptyEffectDocument(name = 'Untitled Effect'): EffectDocument {
  return {
    version: EFFECT_DOCUMENT_VERSION,
    name,
    parameters: [],
    functions: [],
    nodes: [],
    edges: [],
  };
}
