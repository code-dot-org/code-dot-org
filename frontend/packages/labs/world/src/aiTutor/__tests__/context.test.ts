// What World Lab tells the tutor.
//
// The substance is what a world project IS: a `.actor` on disk is a serialized
// Blockly workspace — ids, coordinates, field values — and sending that would
// spend the whole context window describing where blocks sit. The tutor is
// shown what those blocks GENERATE instead.

import {describe, expect, it} from 'vitest';

import {MAX_CONTEXT_CHARS, worldContext, worldSourceCode} from '../context';

const generated = (files: Record<string, string>) => files;

describe('worldSourceCode', () => {
  it('shows a Blockly file as the code it generates, named by the file', () => {
    // Named by what the STUDENT knows. When the tutor says "in your Player
    // actor" they have to be able to find it.
    const out = worldSourceCode(
      generated({'actors/player.actor': 'actor.useTraits([Jumps]);'}),
    );

    expect(out).toContain('actors/player.actor');
    expect(out).toContain('actor.useTraits([Jumps]);');
  });

  it('says that a Blockly file is blocks, not a file they can edit', () => {
    // The single most important thing the model can know about this lab.
    expect(worldSourceCode(generated({'actors/player.actor': 'x'}))).toContain(
      'shown as the code they generate',
    );
  });

  it('shows a hand-written file plainly, with no such note', () => {
    const out = worldSourceCode(
      generated({'helpers.js': 'export const x = 1;'}),
    );

    expect(out).toContain('filename: helpers.js\n');
    expect(out).not.toContain('shown as the code');
  });

  it('leaves out the kinds that generate nothing worth reading', () => {
    // A map is placements, an anim is frames, an effect is a shader graph.
    // None of them explains why a game misbehaves.
    const out = worldSourceCode(
      generated({
        'actors/player.actor': 'real code',
        'maps/level1.map': '{"actors":[]}',
        'anims/run.anim': '{"frames":[]}',
        'effects/ripple.effect': '{"nodes":[]}',
        'sprites/hero.png': 'binary',
      }),
    );

    expect(out).toContain('player.actor');
    for (const left of [
      'level1.map',
      'run.anim',
      'ripple.effect',
      'hero.png',
    ]) {
      expect(out).not.toContain(left);
    }
  });

  it('is undefined when there is nothing readable', () => {
    expect(worldSourceCode(generated({}))).toBeUndefined();
    expect(worldSourceCode(generated({'maps/a.map': '{}'}))).toBeUndefined();
    expect(
      worldSourceCode(generated({'actors/a.actor': '   '})),
    ).toBeUndefined();
  });

  it('orders files predictably, so two identical projects read the same', () => {
    const out = worldSourceCode(generated({'b.js': 'second', 'a.js': 'first'}));

    expect(out!.indexOf('a.js')).toBeLessThan(out!.indexOf('b.js'));
  });

  it('says what it dropped rather than truncating a program mid-function', () => {
    // A program that stops mid-function reads as a bug the student did not
    // write, and the model will helpfully try to fix it.
    // Two thirds of the budget each: the first fits, the second cannot.
    const big = 'x'.repeat(Math.floor((MAX_CONTEXT_CHARS * 2) / 3));
    const out = worldSourceCode(generated({'a.js': big, 'zz-dropped.js': big}));

    expect(out).toContain('a.js');
    expect(out).toContain('left out because the whole project did not fit');
    expect(out).toContain('zz-dropped.js');
    // The one that did fit is whole.
    expect(out).toContain(big);
  });
});

describe('worldContext', () => {
  it('carries the console, which is where a running game says what went wrong', () => {
    expect(
      worldContext({
        generated: {'a.actor': 'code'},
        consoleOutput: 'TypeError: cannot read health of undefined',
        hasRun: true,
        hasEdited: true,
        longInstructions: 'Make the player jump.',
      }),
    ).toMatchObject({
      consoleOutput: 'TypeError: cannot read health of undefined',
      longInstructions: 'Make the player jump.',
      hasRun: true,
    });
  });
});
