// What the `+` and the `−` do to an `if`.
//
// The buttons themselves are a click on a field and are not reachable from a
// headless workspace, so what is exercised here is the mutator underneath them
// — `plus`, `minus`, and the load that undo replays. That is where the whole
// of the behaviour is; the fields only call it.
//
// The load case is the one that is easy to get wrong and impossible to see:
// undo hands the block its OLD state, so a mutator that can only ever add
// rows leaves a branch behind after the `+` that made it has been taken back.

import {describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {installColorMessages} from '../../colorMessages';
import {installIfPlusMinus} from '../ifPlusMinus';

installColorMessages();
installIfPlusMinus();

/** The mutator's face, which is mixed onto the block rather than declared. */
interface IfBlock extends Blockly.Block {
  plus(): void;
  minus(index?: number): void;
}

/** A fresh `if` on a workspace of its own. */
function anIf(): {workspace: Blockly.Workspace; block: IfBlock} {
  const workspace = new Blockly.Workspace();
  return {workspace, block: workspace.newBlock('controls_if') as IfBlock};
}

/** The input names, in the order the block draws them. */
const inputs = (block: Blockly.Block): string[] =>
  block.inputList.map(input => input.name);

describe('the + on an if block', () => {
  it('puts the button on the `if` row, ahead of the word', () => {
    const {block} = anIf();
    expect(block.getField('PLUS')).not.toBeNull();
    expect(block.getInput('IF0')?.fieldRow[0]).toBe(block.getField('PLUS'));
  });

  it('saves nothing at all until a branch is added', () => {
    // The commonest block in any project, carrying no `extraState` — which is
    // also what Blockly's own mutator does, so a file written by either opens
    // under the other.
    const {block} = anIf();
    expect(block.saveExtraState?.()).toBeNull();
  });

  it('gives an else first, and an else if after that', () => {
    const {block} = anIf();
    block.plus();
    expect(inputs(block)).toEqual(['IF0', 'DO0', 'ELSE']);
    expect(block.saveExtraState?.()).toEqual({hasElse: true});

    block.plus();
    // The else stays at the bottom, which is the one thing about this block's
    // shape that is not negotiable.
    expect(inputs(block)).toEqual(['IF0', 'DO0', 'IF1', 'DO1', 'ELSE']);
    expect(block.saveExtraState?.()).toEqual({elseIfCount: 1, hasElse: true});
  });

  it('gives every branch a − of its own', () => {
    const {block} = anIf();
    block.plus();
    block.plus();
    expect(block.getField('MINUS_ELSE')).not.toBeNull();
    expect(block.getField('MINUS1')).not.toBeNull();
  });
});

describe('the − on a branch', () => {
  it('takes the else away and leaves the else ifs', () => {
    const {block} = anIf();
    block.plus();
    block.plus();
    block.minus();
    expect(inputs(block)).toEqual(['IF0', 'DO0', 'IF1', 'DO1']);
    expect(block.saveExtraState?.()).toEqual({elseIfCount: 1});
  });

  it('renumbers by shifting contents up, not by renaming sockets', () => {
    // Removing the middle of three branches: what the learner sees is the row
    // they pointed at going away, and what the block is left with is
    // IF1…IF{n-1} with no gap in it.
    const {workspace, block} = anIf();
    block.plus(); // else
    block.plus(); // else if 1
    block.plus(); // else if 2
    block.plus(); // else if 3
    const conditions = [1, 2, 3].map(index => {
      const value = workspace.newBlock('logic_boolean');
      value.setFieldValue(index === 2 ? 'FALSE' : 'TRUE', 'BOOL');
      block
        .getInput(`IF${index}`)
        ?.connection?.connect(value.outputConnection!);
      return value;
    });

    block.minus(2);

    expect(inputs(block)).toEqual([
      'IF0',
      'DO0',
      'IF1',
      'DO1',
      'IF2',
      'DO2',
      'ELSE',
    ]);
    // The third branch's condition moved up into the second's socket; the
    // removed one's is disconnected rather than deleted.
    expect(block.getInputTargetBlock('IF1')).toBe(conditions[0]);
    expect(block.getInputTargetBlock('IF2')).toBe(conditions[2]);
    expect(conditions[1].getParent()).toBeNull();
    expect(conditions[1].isDisposed()).toBe(false);
  });

  it('ignores a press on a branch that is already gone', () => {
    const {block} = anIf();
    block.minus();
    block.minus(1);
    expect(inputs(block)).toEqual(['IF0', 'DO0']);
    expect(block.saveExtraState?.()).toBeNull();
  });
});

describe('loading a state onto a block that already has one', () => {
  it('adds the branches the state has', () => {
    const {block} = anIf();
    block.loadExtraState?.({elseIfCount: 2, hasElse: true});
    expect(inputs(block)).toEqual([
      'IF0',
      'DO0',
      'IF1',
      'DO1',
      'IF2',
      'DO2',
      'ELSE',
    ]);
  });

  it('removes the branches it does not, which is how undo works', () => {
    // Undo replays a `mutation` event by handing the block the state from
    // BEFORE the change. A load that could only add would leave the row the
    // `+` made standing, with the counter disagreeing with the block.
    const {block} = anIf();
    block.plus();
    block.plus();
    block.plus();
    block.loadExtraState?.({});
    expect(inputs(block)).toEqual(['IF0', 'DO0']);
    expect(block.saveExtraState?.()).toBeNull();
  });
});
