// What a workspace holds, built or not (specs/LAZY_WORKSPACE_PLAN.md).
//
// A collapsed top block's body is not built: it is kept as the JSON it was
// saved as, and becomes blocks only when it is expanded. The editor still has
// to answer questions about the whole file — which layers it declares, which
// variables it writes — and most of those declarations are rows INSIDE a body.
// A dropdown drops a stored value its options do not hold, so a layer declared
// in an unbuilt body that the layer dropdown could not see would be rewritten
// out of every block that names it.
//
// So those questions are asked here, of the live blocks AND the unbuilt
// bodies. A body's JSON is answered through a small view with the same few
// methods the questions call on a live block — a field's value, a socket's
// block, the extra state, the variables it names — so a question written
// against a live block reads the same against one that has not been built.
//
// WHAT IS NOT ASKED HERE: the generator's questions, which run against a
// workspace it builds whole from the saved file; and the passes that redraw
// what is on screen, which have nothing to redraw in a body nobody has built.

import type {Blockly} from '@code-dot-org/blockly';

/** A block as the saved JSON has it — only the parts the index reads. */
export interface SerializedBlock {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<
    string,
    {block?: SerializedBlock; shadow?: SerializedBlock} | undefined
  >;
  next?: {block?: SerializedBlock; shadow?: SerializedBlock};
  extraState?: unknown;
}

/**
 * The few things the editor's questions ask of a block.
 *
 * A live `Blockly.Block` has all of them; an unbuilt one is answered from its
 * JSON. Typed as the narrow shape both share, so a question cannot reach for
 * something only a live block has without the compiler saying so.
 */
export interface IndexedBlock {
  readonly id: string;
  readonly type: string;
  readonly workspace: Blockly.Workspace;
  getFieldValue(name: string): unknown;
  getInputTargetBlock(name: string): IndexedBlock | null;
  getVarModels(): Array<{getId(): string}>;
  saveExtraState?(): unknown;
  isInsertionMarker?(): boolean;
}

/**
 * A top block's body, held as JSON: what hangs off its `next`, and what sits
 * in each of its statement mouths. Its value sockets are its header and are
 * always built.
 */
export interface UnbuiltBody {
  next?: SerializedBlock;
  statements: Record<string, SerializedBlock>;
}

/** The bodies a workspace holds unbuilt, by the id of their top block. */
export type UnbuiltBodies = Map<string, UnbuiltBody>;

/** The store each workspace's unbuilt bodies are in. */
const unbuilt = new WeakMap<Blockly.Workspace, UnbuiltBodies>();

/**
 * Give a workspace the store its unbuilt bodies are kept in.
 *
 * The editor owns the store and binds it as the workspace is injected —
 * BEFORE the file is loaded, because loading builds blocks whose dropdowns
 * ask this index what the file declares, and a body taken out of the file
 * before loading is already in the store (`lazyBodies`).
 */
export function bindUnbuiltBodies(
  workspace: Blockly.Workspace,
  bodies: UnbuiltBodies,
): void {
  unbuilt.set(workspace, bodies);
}

/** Hold `body` as the unbuilt body of the top block `topId`, or let go of it. */
export function setUnbuiltBody(
  workspace: Blockly.Workspace,
  topId: string,
  body: UnbuiltBody | undefined,
): void {
  let held = unbuilt.get(workspace);
  if (!body) {
    held?.delete(topId);
    return;
  }
  if (!held) {
    held = new Map();
    unbuilt.set(workspace, held);
  }
  held.set(topId, body);
}

/** The unbuilt body of one top block, if it is held unbuilt. */
export const unbuiltBodyOf = (
  workspace: Blockly.Workspace,
  topId: string,
): UnbuiltBody | undefined => unbuilt.get(workspace)?.get(topId);

/** A body's roots: its `next` chain's first block, then each mouth's. */
export const rootsOf = (body: UnbuiltBody): SerializedBlock[] => [
  ...(body.next ? [body.next] : []),
  ...Object.values(body.statements),
];

/** Every top block whose body is held unbuilt. */
export const unbuiltTopIds = (workspace: Blockly.Workspace): string[] => [
  ...(unbuilt.get(workspace)?.keys() ?? []),
];

/**
 * A field's value as `getFieldValue` gives it.
 *
 * The one difference between the two shapes is a variable field: the JSON
 * holds `{id, name, type}` and a live block answers with the id.
 */
const fieldValue = (raw: unknown): unknown =>
  raw && typeof raw === 'object' && 'id' in raw
    ? (raw as {id: unknown}).id
    : raw;

/** A view of one serialized block, answering as a live one would. */
function viewOf(
  json: SerializedBlock,
  workspace: Blockly.Workspace,
): IndexedBlock {
  return {
    id: json.id ?? '',
    type: json.type,
    workspace,
    getFieldValue: name => fieldValue(json.fields?.[name]),
    getInputTargetBlock: name => {
      const held = json.inputs?.[name];
      const target = held?.block ?? held?.shadow;
      return target ? viewOf(target, workspace) : null;
    },
    getVarModels: () =>
      Object.values(json.fields ?? {})
        .filter(
          (raw): raw is {id: string} =>
            Boolean(raw) &&
            typeof raw === 'object' &&
            typeof (raw as {id?: unknown}).id === 'string',
        )
        .map(raw => ({getId: () => raw.id})),
    saveExtraState: () => json.extraState,
    isInsertionMarker: () => false,
  };
}

/**
 * Every block under `json`, itself first, in the order the file has them.
 *
 * A socket's block before its shadow, since a shadow a block covers is not
 * what the file says; a shadow with nothing covering it is.
 */
function* walk(json: SerializedBlock): Generator<SerializedBlock> {
  yield json;
  for (const held of Object.values(json.inputs ?? {})) {
    const target = held?.block ?? held?.shadow;
    if (target) {
      yield* walk(target);
    }
  }
  const next = json.next?.block ?? json.next?.shadow;
  if (next) {
    yield* walk(next);
  }
}

/** Every block in the unbuilt bodies of `workspace`, as views. */
function unbuiltBlocks(workspace: Blockly.Workspace): IndexedBlock[] {
  const views: IndexedBlock[] = [];
  for (const body of unbuilt.get(workspace)?.values() ?? []) {
    for (const root of rootsOf(body)) {
      for (const json of walk(root)) {
        views.push(viewOf(json, workspace));
      }
    }
  }
  return views;
}

/**
 * Every block in the file: the built ones, then the unbuilt.
 *
 * `ordered` orders the built ones as `getAllBlocks(true)` does; the unbuilt
 * follow in the file's order.
 */
export function indexedBlocks(
  workspace: Blockly.Workspace | null | undefined,
  ordered = false,
): IndexedBlock[] {
  if (!workspace) {
    return [];
  }
  return [
    ...(workspace.getAllBlocks(ordered) as unknown as IndexedBlock[]),
    ...unbuiltBlocks(workspace),
  ];
}

/** Every block of one type in the file, built or not. */
export const indexedBlocksOfType = (
  workspace: Blockly.Workspace | null | undefined,
  type: string,
  ordered = false,
): IndexedBlock[] =>
  indexedBlocks(workspace, ordered).filter(block => block.type === type);

/** Whether the file holds a block with this id, built or not. */
export function hasIndexedBlock(
  workspace: Blockly.Workspace | null | undefined,
  id: string,
): boolean {
  if (!workspace || !id) {
    return false;
  }
  if (workspace.getBlockById(id)) {
    return true;
  }
  return unbuiltBlocks(workspace).some(block => block.id === id);
}
