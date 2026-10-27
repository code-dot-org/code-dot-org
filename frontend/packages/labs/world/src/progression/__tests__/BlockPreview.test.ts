// Which block a lesson's unlock is drawn as.
//
// The drawing itself needs a real browser — an inline Blockly workspace is a
// real injected workspace, and jsdom cannot parse the stylesheet Blockly
// writes. What CAN be tested here is the part that decides: given a rule, what
// is the one block worth showing, and does it exist at all.

import {describe, expect, it} from 'vitest';

import {blockForRule} from '../BlockPreview';
import {TILES} from '../catalogue';

describe('the block a rule is drawn as', () => {
  it('is the thing the rule lets you DO', () => {
    // A rule mints a dozen blocks — a getter and a setter per property, a hat
    // per event — and a list of twelve is not a picture of anything. What a
    // rule IS, to somebody deciding whether to do the lesson, is its verb.
    expect(blockForRule('jump')).toEqual({
      type: 'world_do_Jumping_MakeJumpAction',
    });
    expect(blockForRule('jetpack')).toEqual({
      type: 'world_do_Jetpack_StartFlyingAction',
    });
  });

  it('falls back to what a rule with no verb lets you hear, or read', () => {
    // Sixteen of the stock rules have none — what they give you is a way for
    // an actor to BE something, chosen in the Actor Editor rather than
    // written. What a learner writes for one of those is a handler for its
    // event, or a read of its property.
    expect(blockForRule('arrows')?.type).toMatch(/^world_(on|get)_ArrowKeys_/);
  });

  it('says nothing rather than guessing for a rule it cannot find', () => {
    expect(blockForRule('not-a-rule')).toBeUndefined();
  });

  it('finds a block for every rule the catalogue gives away', () => {
    // The check that keeps this honest as the library grows: a tile whose
    // unlock draws nothing is a tile that quietly went back to being a list.
    const granted = TILES.flatMap(tile =>
      tile.unlocks
        .filter(unlock => unlock.kind === 'rule' && !unlock.proposed)
        .map(unlock => (unlock as {id: string}).id),
    );

    expect(granted.length).toBeGreaterThan(10);
    // …but for a rule that mints no block at all: Camera Confined is a trait
    // ticked in the camera inspector, and nothing a learner writes.
    expect(granted.filter(id => !blockForRule(id))).toEqual(['cameraConfined']);
  });
});
