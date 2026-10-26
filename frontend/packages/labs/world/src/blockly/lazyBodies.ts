// Top blocks whose bodies are built on demand (specs/LAZY_WORKSPACE_PLAN.md).
//
// A collapsed top block is its header and nothing more: what hangs off its
// `next` and what sits in its statement mouths is held as the JSON it was
// saved as, in the store the workspace index reads (`workspaceIndex`), and
// becomes blocks only when it is expanded. A large file opens collapsed, so
// what is built is its top blocks.
//
// THE FILE NEVER KNOWS. What is taken out on the way in is put back on the
// way out: every save splices the held bodies into the top blocks they were
// taken from, so a file written by a collapsed workspace is byte for byte the
// file a fully built one would write. Collapsing and expanding are views of
// the file, not edits to it — silent, and no undo step.
//
// The JSON half is here as plain functions, testable without a renderer; the
// live half moves a body between the store and the workspace.

import {Blockly} from '@code-dot-org/blockly';

import {
  rootsOf,
  setUnbuiltBody,
  unbuiltBodyOf,
  type SerializedBlock,
  type UnbuiltBodies,
  type UnbuiltBody,
} from './workspaceIndex';

/** A workspace serialization, as far as these functions read it. */
export interface Document {
  blocks?: {languageVersion?: number; blocks?: SerializedBlock[]};
  [key: string]: unknown;
}

/** Which of a block type's inputs are statement mouths. */
export type StatementInputs = (type: string) => readonly string[];

/**
 * A file opens collapsed when it holds more blocks than this.
 *
 * Around a screenful: below it the whole file can be read at once and
 * collapsing it only hides things; above it, what is legible first is the
 * list of what the file defines and what it answers.
 */
export const COLLAPSE_ABOVE = 40;

/** Every block under `json`, itself included, shadows a socket shows too. */
export function countBlocks(json: SerializedBlock | undefined): number {
  if (!json) {
    return 0;
  }
  let count = 1;
  for (const held of Object.values(json.inputs ?? {})) {
    count += countBlocks(held?.block ?? held?.shadow);
  }
  return count + countBlocks(json.next?.block);
}

/** How many blocks a whole document holds. */
export const documentSize = (document: Document): number =>
  (document.blocks?.blocks ?? []).reduce(
    (sum, top) => sum + countBlocks(top),
    0,
  );

/** The body of one top block, and the block without it. */
export function takeBody(
  top: SerializedBlock,
  statementInputs: StatementInputs,
): {header: SerializedBlock; body: UnbuiltBody | undefined} {
  const mouths = statementInputs(top.type);
  const statements: Record<string, SerializedBlock> = {};
  const inputs = {...(top.inputs ?? {})};
  for (const name of mouths) {
    const held = inputs[name]?.block;
    if (held) {
      statements[name] = held;
      delete inputs[name];
    }
  }
  const next = top.next?.block;
  if (!next && Object.keys(statements).length === 0) {
    return {header: top, body: undefined};
  }
  const header: SerializedBlock = {...top, inputs};
  if (Object.keys(inputs).length === 0) {
    delete header.inputs;
  }
  delete header.next;
  return {header, body: {...(next ? {next} : {}), statements}};
}

/** A top block with its body put back. */
export function putBody(
  header: SerializedBlock,
  body: UnbuiltBody,
): SerializedBlock {
  const inputs = {...(header.inputs ?? {})};
  for (const [name, block] of Object.entries(body.statements)) {
    inputs[name] = {...(inputs[name] ?? {}), block};
  }
  return {
    ...header,
    ...(Object.keys(inputs).length ? {inputs} : {}),
    ...(body.next ? {next: {block: body.next}} : {}),
  };
}

/**
 * The document with the bodies of the top blocks `collapse` picks taken out,
 * and the bodies, by top block id.
 *
 * A body is put back by its top block's id, so a top block the file wrote
 * without one — every stock file, which is generated without block ids — is
 * given one here. Blockly keeps an id it is given, so the block loads with it
 * and the save finds it again; what the file says is otherwise unchanged.
 *
 * BY POSITION, not at random: the file is read again on a reload and when it
 * is opened again this session, and an id minted afresh each time would lose
 * which top block was collapsed. `top-0` names the same block every time the
 * same file is read, until a save writes it in.
 */
export function stripBodies(
  document: Document,
  collapse: (top: SerializedBlock) => boolean,
  statementInputs: StatementInputs,
  mint: (index: number) => string = index => `top-${index}`,
): {document: Document; bodies: Map<string, UnbuiltBody>} {
  const bodies = new Map<string, UnbuiltBody>();
  const tops = (document.blocks?.blocks ?? []).map((given, index) => {
    const top = given.id ? given : {...given, id: mint(index)};
    if (!collapse(top)) {
      return top;
    }
    const {header, body} = takeBody(top, statementInputs);
    if (body) {
      bodies.set(top.id!, body);
    }
    return header;
  });
  return {
    document: {...document, blocks: {...document.blocks, blocks: tops}},
    bodies,
  };
}

/** The document with every held body put back into its top block. */
export function spliceBodies(
  document: Document,
  bodies: ReadonlyMap<string, UnbuiltBody>,
): Document {
  if (bodies.size === 0 || !document.blocks?.blocks) {
    return document;
  }
  return {
    ...document,
    blocks: {
      ...document.blocks,
      blocks: document.blocks.blocks.map(top => {
        const body = top.id ? bodies.get(top.id) : undefined;
        return body ? putBody(top, body) : top;
      }),
    },
  };
}

/**
 * `json` with every block that names the variable `id` taken out, as Blockly
 * takes them out of a built workspace when a variable is deleted.
 *
 * A row is spliced out of its stack, the rows below it moving up; a value is
 * taken out of its socket, leaving the socket's shadow. Undefined when the
 * block itself names it and nothing follows to take its place.
 */
export function withoutVariable(
  json: SerializedBlock | undefined,
  id: string,
): SerializedBlock | undefined {
  if (!json) {
    return undefined;
  }
  const names = Object.values(json.fields ?? {}).some(
    raw =>
      Boolean(raw) &&
      typeof raw === 'object' &&
      (raw as {id?: unknown}).id === id,
  );
  const next = withoutVariable(json.next?.block, id);
  if (names) {
    return next;
  }
  const inputs: SerializedBlock['inputs'] = {};
  for (const [name, held] of Object.entries(json.inputs ?? {})) {
    const block = withoutVariable(held?.block, id);
    const kept = {
      ...(block ? {block} : {}),
      ...(held?.shadow ? {shadow: held.shadow} : {}),
    };
    if (Object.keys(kept).length) {
      inputs[name] = kept;
    }
  }
  const out: SerializedBlock = {...json};
  if (json.inputs) {
    out.inputs = inputs;
  }
  if (next) {
    out.next = {block: next};
  } else {
    delete out.next;
  }
  return out;
}

/** A body with every use of the variable `id` taken out. */
export function bodyWithoutVariable(
  body: UnbuiltBody,
  id: string,
): UnbuiltBody {
  const statements: Record<string, SerializedBlock> = {};
  for (const [name, block] of Object.entries(body.statements)) {
    const kept = withoutVariable(block, id);
    if (kept) {
      statements[name] = kept;
    }
  }
  const next = withoutVariable(body.next, id);
  return {...(next ? {next} : {}), statements};
}

/** Every block id a body holds. */
export function idsIn(body: UnbuiltBody): Set<string> {
  const ids = new Set<string>();
  const walk = (json: SerializedBlock | undefined) => {
    if (!json) {
      return;
    }
    if (json.id) {
      ids.add(json.id);
    }
    for (const held of Object.values(json.inputs ?? {})) {
      walk(held?.block);
      walk(held?.shadow);
    }
    walk(json.next?.block);
  };
  rootsOf(body).forEach(walk);
  return ids;
}

// ── The live half ───────────────────────────────────────────────────────────

/** Whether a built top block has a body to collapse. */
export function hasBuiltBody(top: Blockly.Block): boolean {
  if (top.getNextBlock()) {
    return true;
  }
  return top.inputList.some(
    input =>
      input.type === Blockly.inputs.inputTypes.STATEMENT &&
      Boolean(input.connection?.targetBlock()),
  );
}

/**
 * Take a built top block's body out of the workspace and hold it as JSON.
 *
 * SILENT: a view of the file, not an edit, so no event reaches the editor's
 * save or the undo stack.
 */
export function collapseTop(workspace: Blockly.Workspace, top: Blockly.Block) {
  const body: UnbuiltBody = {statements: {}};
  Blockly.Events.disable();
  try {
    for (const input of top.inputList) {
      const held = input.connection?.targetBlock();
      if (input.type === Blockly.inputs.inputTypes.STATEMENT && held) {
        body.statements[input.name] = Blockly.serialization.blocks.save(held, {
          addCoordinates: false,
        }) as unknown as SerializedBlock;
        held.dispose(false);
      }
    }
    const next = top.getNextBlock();
    if (next) {
      body.next = Blockly.serialization.blocks.save(next, {
        addCoordinates: false,
      }) as unknown as SerializedBlock;
      next.dispose(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (body.next || Object.keys(body.statements).length) {
    setUnbuiltBody(workspace, top.id, body);
  }
}

/** Build a held body back into the workspace, under its top block. Silent. */
export function expandTop(workspace: Blockly.Workspace, top: Blockly.Block) {
  const body = unbuiltBodyOf(workspace, top.id);
  if (!body) {
    return;
  }
  setUnbuiltBody(workspace, top.id, undefined);
  Blockly.Events.disable();
  try {
    for (const [name, json] of Object.entries(body.statements)) {
      const built = Blockly.serialization.blocks.append(
        json as unknown as Blockly.serialization.blocks.State,
        workspace,
        {recordUndo: false},
      );
      const connection = top.getInput(name)?.connection;
      if (connection && built.previousConnection) {
        connection.connect(built.previousConnection);
      }
    }
    if (body.next && top.nextConnection) {
      const built = Blockly.serialization.blocks.append(
        body.next as unknown as Blockly.serialization.blocks.State,
        workspace,
        {recordUndo: false},
      );
      if (built.previousConnection) {
        top.nextConnection.connect(built.previousConnection);
      }
    }
  } finally {
    Blockly.Events.enable();
  }
}

/** Expand every collapsed top block holding one of these block ids. */
export function expandHolding(
  workspace: Blockly.Workspace,
  bodies: UnbuiltBodies,
  blockIds: ReadonlySet<string>,
): boolean {
  let expanded = false;
  for (const [topId, body] of [...bodies]) {
    if ([...idsIn(body)].some(id => blockIds.has(id))) {
      const top = workspace.getBlockById(topId);
      if (top) {
        expandTop(workspace, top);
        expanded = true;
      }
    }
  }
  return expanded;
}

/**
 * Which inputs of each block type are statement mouths, read off the
 * definitions the palette registers — the only place a JSON block's inputs
 * can be told apart, since the file says only a name and what is in it.
 */
export function statementInputsOf(
  definitions: ReadonlyArray<object>,
): StatementInputs {
  const mouths = new Map<string, string[]>();
  for (const definition of definitions as ReadonlyArray<
    Record<string, unknown>
  >) {
    const names: string[] = [];
    for (const [key, args] of Object.entries(definition)) {
      if (!/^args\d+$/.test(key) || !Array.isArray(args)) {
        continue;
      }
      for (const arg of args as Array<{type?: unknown; name?: unknown}>) {
        if (arg?.type === 'input_statement' && typeof arg.name === 'string') {
          names.push(arg.name);
        }
      }
    }
    if (names.length && typeof definition.type === 'string') {
      mouths.set(definition.type, names);
    }
  }
  return type => mouths.get(type) ?? [];
}

/**
 * Which top blocks each file had collapsed, for the session.
 *
 * Opening a file again shows it as it was left rather than by the size rule,
 * which only decides for a file not yet opened.
 */
export const collapsedByFile = new Map<string, Set<string>>();
