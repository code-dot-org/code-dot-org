// `define tween` and `play tween`, generated and run.
//
// A definition root and a reference to it, which is the pattern `define actor`
// → `add actor ⟨Coin⟩` already sets: the definition says what the movement IS,
// and playing it says when and to whom. One block that did both could not be
// reused, and a game fades a dozen things the same way.

import {describe, expect, it} from 'vitest';

// Imported for its side effect: the shadows are registered as the module
// loads, so a test that never loads it sees an empty registry.
import '../domainBlocks';
import {DEFINE_TWEEN, tweenOptions, tweensIn, tweenVar} from '../tweens';
import {shadowsFor} from '../valueShadow';

/** A workspace stand-in: the top blocks a file holds. */
const workspace = (
  blocks: Array<{id: string; type: string; name?: string}>,
): never =>
  ({
    getTopBlocks: () =>
      blocks.map(block => ({
        id: block.id,
        type: block.type,
        getFieldValue: (field: string) =>
          field === 'NAME' ? (block.name ?? '') : null,
      })),
  }) as never;

const field = (ws: unknown): never =>
  ({getSourceBlock: () => ({workspace: ws})}) as never;

describe('the tweens a file defines', () => {
  it('finds each definition root, in the order they sit in', () => {
    const found = tweensIn(
      workspace([
        {id: 'b1', type: 'world_define_tween', name: 'fade out'},
        {id: 'b2', type: 'world_actor', name: 'Player'},
        {id: 'b3', type: 'world_define_tween', name: 'slide in'},
      ]),
    );

    expect(found).toEqual([
      {blockId: 'b1', name: 'fade out'},
      {blockId: 'b3', name: 'slide in'},
    ]);
  });

  it('offers them by NAME and stores the block id', () => {
    // The value outlives the thing it names: renaming a tween keeps every
    // `play tween` pointing at it, and two both called "fade" — which happens,
    // the default text being the same every time — stay told apart.
    const options = tweenOptions(
      field(
        workspace([
          {id: 'b1', type: 'world_define_tween', name: 'fade'},
          {id: 'b2', type: 'world_define_tween', name: 'fade'},
        ]),
      ),
    );

    expect(options).toEqual([
      ['fade', 'b1'],
      ['fade', 'b2'],
    ]);
  });

  it('says so in words when a file defines none', () => {
    // A dropdown with no options cannot be built, and `play tween` then
    // generates nothing — the bargain `use trait` makes with "(none)".
    expect(tweenOptions(field(workspace([])))).toEqual([
      ['(no tweens yet)', ''],
    ]);
  });
});

describe('the variable a definition becomes', () => {
  it('is named after the tween, so the module reads', () => {
    expect(tweenVar('fade out', 'abc')).toBe('fadeOut_abc');
  });

  it('carries the id, because two may share a name', () => {
    expect(tweenVar('fade', 'x1')).not.toBe(tweenVar('fade', 'x2'));
  });

  it('survives a name that is punctuation, or nothing at all', () => {
    // The field is free text and a learner may leave it empty or type an
    // emoji; the output still has to be an identifier.
    expect(tweenVar('', 'abc')).toBe('tween_abc');
    expect(tweenVar('!!!', 'abc')).toBe('tween_abc');
  });

  it('strips what an identifier cannot hold from the id too', () => {
    // Blockly ids contain characters like `[`, `~` and `$`.
    expect(tweenVar('fade', 'a[b~c')).toBe('fade_abc');
  });
});

// What a freshly dragged-out `define tween` already says.
describe('the seconds a new tween starts with', () => {
  it('is one, and not an empty socket', () => {
    // An empty socket generates `0`, and a tween of no length lands on its
    // destinations the frame it starts — indistinguishable from a tween that
    // did not run, and the first thing anybody dragging the block out sees.
    const seconds = shadowsFor(DEFINE_TWEEN)?.find(
      entry => entry.name === 'SECONDS',
    );

    expect(seconds?.shadow).toEqual({
      type: 'math_number',
      fields: {NUM: 1},
    });
  });
});
