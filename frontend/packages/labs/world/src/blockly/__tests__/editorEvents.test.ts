// Which change events the file editor saves, and which it lets go.
//
// A save is not cheap: it marks the project dirty, which copies every file,
// recompiles and RESTARTS the running world. So an event that means nobody
// edited anything has to be recognised as such, or the game a reader is
// looking at is thrown away for a layout Blockly chose by itself.

import {describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {movedItself} from '../editorEvents';

/** A move event carrying `reason`, which is all this reads. */
const moved = (reason?: string[]) =>
  ({type: Blockly.Events.BLOCK_MOVE, reason}) as Blockly.Events.Abstract;

describe('a move the editor made', () => {
  it('is a bump, a snap or a tidy', () => {
    expect(movedItself(moved(['bump']))).toBe(true);
    expect(movedItself(moved(['snap']))).toBe(true);
    expect(movedItself(moved(['cleanup']))).toBe(true);
    expect(movedItself(moved(['bump', 'snap']))).toBe(true);
  });

  it('is NOT a drag, however much tidying the drag caused', () => {
    // Blockly's own note: merging can produce `['drag', 'bump', 'snap']`. A
    // drag that bumped its neighbours is still a drag, and still an edit — so
    // the test is that none of the reasons is a person's, not that one of them
    // is the editor's.
    expect(movedItself(moved(['drag']))).toBe(false);
    expect(movedItself(moved(['drag', 'bump']))).toBe(false);
    expect(movedItself(moved(['drag', 'bump', 'snap']))).toBe(false);
  });

  it('is a person’s when no reason is given at all', () => {
    // The safe way round, and deliberately so: a save missed is work lost and
    // a save made needlessly is only slow. An event that does not say why it
    // happened is treated as though somebody did it.
    expect(movedItself(moved())).toBe(false);
    expect(movedItself(moved([]))).toBe(false);
  });

  it('says nothing about any other kind of event', () => {
    // A field typed into, a block created, a stack deleted: all edits, none of
    // them a move, and none of this function's business.
    for (const type of [
      Blockly.Events.BLOCK_CHANGE,
      Blockly.Events.BLOCK_CREATE,
      Blockly.Events.BLOCK_DELETE,
    ]) {
      expect(
        movedItself({type, reason: ['bump']} as Blockly.Events.Abstract),
      ).toBe(false);
    }
  });
});
