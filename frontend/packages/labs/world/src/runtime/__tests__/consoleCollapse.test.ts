// Folding a flood of console lines.
//
// A game says things sixty times a second — a `log` in a step, an event firing
// every frame — and two things went wrong when it did. Five hundred copies of
// one sentence pushed everything worth reading off the top, and a state update
// PER LINE re-rendered everything under the runtime provider per line, which
// shut a Blockly flyout the moment the console got busy. The buffering is in
// the provider; this is the folding.

import {describe, expect, it} from 'vitest';

import {collapseConsole} from '../consoleCollapse';

const say = (text: string, level = 'log') => ({level, text});

describe('collapseConsole', () => {
  it('leaves different lines alone', () => {
    expect(collapseConsole([say('a'), say('b')])).toEqual([say('a'), say('b')]);
  });

  it('folds a run of the same line into a count', () => {
    expect(collapseConsole([say('tick'), say('tick'), say('tick')])).toEqual([
      {level: 'log', text: 'tick', repeats: 3},
    ]);
  });

  it('folds only CONSECUTIVE ones', () => {
    // Two identical lines with something between them are two things that
    // happened, and merging them would rewrite the order of events — which is
    // most of what a console is for.
    expect(collapseConsole([say('a'), say('b'), say('a')])).toEqual([
      say('a'),
      say('b'),
      say('a'),
    ]);
  });

  it('keeps a warning apart from a log that reads the same', () => {
    expect(collapseConsole([say('x'), say('x', 'error')])).toHaveLength(2);
  });

  it('carries counts through a second fold', () => {
    // The provider folds each flush against what is already there, so a run
    // spanning two frames is one line and not two.
    const first = collapseConsole([say('tick'), say('tick')]);

    expect(collapseConsole([...first, say('tick')])).toEqual([
      {level: 'log', text: 'tick', repeats: 3},
    ]);
  });

  it('keeps the last five hundred lines', () => {
    const many = Array.from({length: 700}, (_, n) => say(`line ${n}`));

    const folded = collapseConsole(many);

    expect(folded).toHaveLength(500);
    expect(folded[folded.length - 1]).toEqual(say('line 699'));
  });

  it('counts a flood without spending five hundred lines on it', () => {
    // The point. Four hundred of one sentence and one of another leaves both
    // readable, where before the second was the only survivor.
    const flood = Array.from({length: 4000}, () => say('every frame'));

    const folded = collapseConsole([
      say('the thing I wanted to read'),
      ...flood,
    ]);

    expect(folded).toEqual([
      say('the thing I wanted to read'),
      {level: 'log', text: 'every frame', repeats: 4000},
    ]);
  });
});
