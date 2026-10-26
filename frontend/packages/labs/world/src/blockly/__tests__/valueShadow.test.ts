// Seeding a block's sockets with the values it starts life holding.
//
// The property that matters is not that a shadow appears — it is that one
// socket cannot take another down with it. A shadow can be unmakeable: a block
// type this build does not define, a dropdown whose saved choice the project no
// longer offers. `setShadowState` throws when it is, and an extension that
// throws takes the whole BLOCK with it, because `newBlock` propagates.
//
// That stopped being a closed list the moment an author could build a default
// out of any blocks they liked (`blockDesigner.letShadow`), which is why it is
// caught per socket rather than trusted.

import * as Blockly from 'blockly/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {registerValueShadows, valueShadowExtension} from '../valueShadow';

const HOST = 'test_two_sockets';

const define = () => {
  if (!Blockly.Extensions.isRegistered(valueShadowExtension.name)) {
    Blockly.Extensions.register(
      valueShadowExtension.name,
      valueShadowExtension.extension as never,
    );
  }
  if (Blockly.Blocks[HOST]) {
    return;
  }
  Blockly.defineBlocksWithJsonArray([
    {type: 'test_here', message0: 'here', output: 'Actor'},
    {
      type: HOST,
      message0: 'a %1 b %2',
      args0: [
        {type: 'input_value', name: 'FIRST', check: 'Actor'},
        {type: 'input_value', name: 'SECOND', check: 'Actor'},
      ],
      output: 'Number',
      extensions: [valueShadowExtension.name],
    },
  ]);
};

describe('a block whose second shadow cannot be made', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    define();
    workspace = new Blockly.Workspace();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('keeps the first socket, and the block', () => {
    // What this was: the throw left the extension, `newBlock` propagated it,
    // and the block never arrived — so a socket that HAD been seeded was lost
    // with it. A default nobody can rebuild should cost its own socket.
    registerValueShadows(HOST, [
      {name: 'FIRST', shadow: {type: 'test_here'}},
      {name: 'SECOND', shadow: {type: 'test_no_such_block'}},
    ]);

    const block = workspace.newBlock(HOST);

    expect(block.getInputTargetBlock('FIRST')?.type).toBe('test_here');
    expect(block.getInputTargetBlock('SECOND')).toBeNull();
  });

  it('keeps the second when it is the FIRST that cannot be made', () => {
    // The order is not what saves it: each socket is its own attempt.
    registerValueShadows(HOST, [
      {name: 'FIRST', shadow: {type: 'test_no_such_block'}},
      {name: 'SECOND', shadow: {type: 'test_here'}},
    ]);

    const block = workspace.newBlock(HOST);

    expect(block.getInputTargetBlock('FIRST')).toBeNull();
    expect(block.getInputTargetBlock('SECOND')?.type).toBe('test_here');
  });

  it('says so, rather than leaving a hole to be reverse-engineered', () => {
    registerValueShadows(HOST, [
      {name: 'SECOND', shadow: {type: 'test_no_such_block'}},
    ]);

    workspace.newBlock(HOST);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('SECOND'),
      expect.anything(),
    );
  });
});
