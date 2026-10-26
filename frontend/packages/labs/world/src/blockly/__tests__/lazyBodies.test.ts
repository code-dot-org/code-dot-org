// Bodies held unbuilt (`lazyBodies`, specs/LAZY_WORKSPACE_PLAN.md).
//
// The promise worth testing hardest is the one the learner never sees kept:
// THE FILE NEVER KNOWS. A body taken out on the way in is put back on the way
// out, so what a collapsed workspace saves is exactly what a built one would.

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {
  bodyWithoutVariable,
  collapseTop,
  countBlocks,
  documentSize,
  expandHolding,
  expandTop,
  idsIn,
  spliceBodies,
  statementInputsOf,
  stripBodies,
  type Document,
} from '../lazyBodies';
import {
  bindUnbuiltBodies,
  type SerializedBlock,
  type UnbuiltBodies,
} from '../workspaceIndex';

/** `define tween` is the one top block with a mouth; the rest chain on. */
const mouths = statementInputsOf([
  {type: 'world_define_tween', args0: [{type: 'input_statement', name: 'DO'}]},
  {type: 'world_world', args0: [{type: 'input_value', name: 'NOT_A_MOUTH'}]},
]);

const row = (id: string, next?: SerializedBlock): SerializedBlock => ({
  type: 'row',
  id,
  ...(next ? {next: {block: next}} : {}),
});

/** A world with a body, a handler with a body, a tween with a mouth. */
const DOCUMENT: Document = {
  variables: [{id: 'v1', name: 'count', type: 'Number'}],
  blocks: {
    languageVersion: 0,
    blocks: [
      {type: 'world_world', id: 'world', next: {block: row('a', row('b'))}},
      {type: 'hat', id: 'hat', next: {block: row('c')}},
      {
        type: 'world_define_tween',
        id: 'tween',
        inputs: {DO: {block: row('d')}},
      },
      {type: 'hat', id: 'empty'},
    ],
  },
};

describe('taking bodies out and putting them back', () => {
  it('puts back exactly what it took', () => {
    const {document, bodies} = stripBodies(DOCUMENT, () => true, mouths);
    expect([...bodies.keys()]).toEqual(['world', 'hat', 'tween']);
    // What is left is the headers, and the one with nothing under it.
    expect(JSON.stringify(document)).not.toContain('"a"');
    expect(document.blocks!.blocks![2].inputs).toBeUndefined();
    expect(spliceBodies(document, bodies)).toEqual(DOCUMENT);
  });

  it('takes only what it is asked to', () => {
    const {document, bodies} = stripBodies(
      DOCUMENT,
      top => top.id === 'hat',
      mouths,
    );
    expect([...bodies.keys()]).toEqual(['hat']);
    expect(document.blocks!.blocks![0]).toEqual(DOCUMENT.blocks!.blocks![0]);
  });

  it('gives a top block written without an id one, so it can be put back', () => {
    // Every stock file is generated without block ids.
    const bare: Document = {
      blocks: {blocks: [{type: 'hat', next: {block: row('a')}}]},
    };
    const {document, bodies} = stripBodies(bare, () => true, mouths);
    expect(document.blocks!.blocks![0]).toEqual({type: 'hat', id: 'top-0'});
    expect(spliceBodies(document, bodies).blocks!.blocks![0]).toEqual({
      type: 'hat',
      id: 'top-0',
      next: {block: row('a')},
    });
  });

  it('counts a document’s blocks, to decide what opens collapsed', () => {
    expect(countBlocks(row('a', row('b')))).toBe(2);
    expect(documentSize(DOCUMENT)).toBe(8);
  });

  it('knows the block ids a body holds', () => {
    const {bodies} = stripBodies(DOCUMENT, () => true, mouths);
    expect([...idsIn(bodies.get('world')!)]).toEqual(['a', 'b']);
  });
});

describe('a variable deleted while a body is held', () => {
  const uses = (id: string): SerializedBlock => ({
    type: 'variables_set_Number',
    id,
    fields: {VAR: {id: 'v1'}},
  });

  it('takes its rows out of the stack, and the rows below move up', () => {
    const body = {
      next: {
        ...row('a'),
        next: {block: {...uses('u'), next: {block: row('b')}}},
      },
      statements: {},
    };
    expect(bodyWithoutVariable(body, 'v1')).toEqual({
      next: {...row('a'), next: {block: row('b')}},
      statements: {},
    });
  });

  it('takes a value out of its socket and leaves the shadow', () => {
    const body = {
      next: {
        type: 'row',
        id: 'r',
        inputs: {
          VALUE: {
            block: {type: 'variables_get_Number', fields: {VAR: {id: 'v1'}}},
            shadow: {type: 'math_number', fields: {NUM: 0}},
          },
        },
      },
      statements: {},
    };
    expect(bodyWithoutVariable(body, 'v1').next!.inputs!.VALUE).toEqual({
      shadow: {type: 'math_number', fields: {NUM: 0}},
    });
  });
});

describe('collapsing and expanding a live workspace', () => {
  beforeAll(() => {
    Blockly.defineBlocksWithJsonArray([
      {type: 'world_world', message0: 'define world', nextStatement: null},
      {type: 'hat', message0: 'when', nextStatement: null},
      {
        type: 'row',
        message0: 'row',
        previousStatement: null,
        nextStatement: null,
      },
      {
        type: 'world_define_tween',
        message0: 'tween %1',
        args0: [{type: 'input_statement', name: 'DO'}],
      },
    ]);
  });

  const workspaceOf = (store: UnbuiltBodies) => {
    const workspace = new Blockly.Workspace();
    bindUnbuiltBodies(workspace, store);
    Blockly.serialization.workspaces.load(DOCUMENT as never, workspace);
    return workspace;
  };
  const saved = (workspace: Blockly.Workspace, store: UnbuiltBodies) =>
    spliceBodies(
      Blockly.serialization.workspaces.save(workspace) as Document,
      store,
    );

  it('saves the same file collapsed as built, and builds it back', () => {
    const store: UnbuiltBodies = new Map();
    const workspace = workspaceOf(store);
    const built = saved(workspace, store);

    for (const id of ['world', 'hat', 'tween']) {
      collapseTop(workspace, workspace.getBlockById(id)!);
    }
    // Only the top blocks are built now.
    expect(
      workspace
        .getAllBlocks(false)
        .map(block => block.id)
        .sort(),
    ).toEqual(['empty', 'hat', 'tween', 'world']);
    expect(saved(workspace, store)).toEqual(built);

    for (const id of ['world', 'hat', 'tween']) {
      expandTop(workspace, workspace.getBlockById(id)!);
    }
    expect(store.size).toBe(0);
    expect(Blockly.serialization.workspaces.save(workspace)).toEqual(built);
  });

  it('is silent: a collapse is not an edit and not an undo step', () => {
    const store: UnbuiltBodies = new Map();
    const workspace = workspaceOf(store);
    const heard: string[] = [];
    workspace.addChangeListener(event => heard.push(event.type));
    collapseTop(workspace, workspace.getBlockById('world')!);
    expandTop(workspace, workspace.getBlockById('world')!);
    expect(heard).toEqual([]);
    expect(workspace.getUndoStack()).toEqual([]);
  });

  it('expands the body holding a block, for an undo about to touch it', () => {
    const store: UnbuiltBodies = new Map();
    const workspace = workspaceOf(store);
    collapseTop(workspace, workspace.getBlockById('world')!);
    collapseTop(workspace, workspace.getBlockById('hat')!);
    expect(expandHolding(workspace, store, new Set(['b']))).toBe(true);
    expect(workspace.getBlockById('b')).not.toBeNull();
    // …and only that one.
    expect(workspace.getBlockById('c')).toBeNull();
    expect([...store.keys()]).toEqual(['hat']);
  });
});
