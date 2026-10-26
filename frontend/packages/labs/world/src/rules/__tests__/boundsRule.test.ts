// "Stays in the Map" — Screen Wrap's opposite, and deliberately its mirror.
//
// The same two edges split into the same two axes at the same moment; only the
// answer at the edge differs. These pin the mirroring, because the two rules
// drifting apart would be the failure nobody notices: each would still work,
// and a learner swapping one for the other would find the axes behaved
// differently for no reason they could see.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {boundsRule} from '../stock/bounds';
import {wrapRule} from '../stock/wrap';

const meta = parseRuleMeta('rules/bounds', boundsRule)!;
const wrap = parseRuleMeta('rules/wrap', wrapRule)!;

describe('rules/bounds.rule', () => {
  it('splits the axes the way wrapping does', () => {
    // A paddle stays across and must NOT stay down — it would hover at the top
    // edge rather than fall. One trait would make that unsayable.
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Stays_Across',
      'Stays_Down',
    ]);
    expect(wrap.traits).toHaveLength(2);
  });

  it('runs in the same moment wrapping does', () => {
    // After `move` has turned velocity into a position and before `touch` works
    // out what is against what. Correcting earlier would clamp a position
    // nothing had changed; later, an actor spends a frame solid outside the map.
    const phases = meta.steps.map(step => step.order);

    expect(phases).toEqual([
      {kind: 'phase', phase: 'adjust'},
      {kind: 'phase', phase: 'adjust'},
    ]);
    expect(wrap.steps[0].order).toEqual({kind: 'phase', phase: 'adjust'});
  });

  it('names its two steps apart', () => {
    // Not a style point: a step's name becomes an exported identifier, so two
    // steps called the same thing in one rule is a module with two exports of
    // one name and a project that stops compiling. Wrapping learned this.
    const ids = meta.steps.map(step => step.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('holds the whole actor back, not its middle', () => {
    // The difference from wrapping that is not cosmetic. A paddle whose middle
    // stops at the edge is a paddle half off the screen, which is the one thing
    // this rule exists to prevent.
    expect(boundsRule).toContain('IntrinsicSizeProperty');
    expect(boundsRule).toContain('ScaleProperty');
  });

  it('assumes a square when the picture was never measured', () => {
    // The bug this shipped with, since narrowed. `intrinsic size` was only ever
    // written for a SPRITESHEET, whose cells state their own size, and left at
    // zero for a single image — most actors. Taken at face value that is a
    // half-width of zero: the middle stopping at the edge, half the actor
    // outside, which is the one thing this rule exists to prevent.
    //
    // Single images are measured now (the project states every size it holds),
    // so what is left is a picture not measured YET or one from outside the
    // project. Still a case, so still a fallback.
    //
    // `collision size of` fills the same gap the same way, deliberately: one
    // notion of how big an actor is, so a better answer later improves both.
    expect(boundsRule).toContain('"NUM": 32');
    expect(boundsRule).toContain('logic_ternary');
  });

  it('takes that size from Space, not Collisions', () => {
    // Every actor has a drawing; only a colliding one has a box. Requiring
    // Collisions would make every bounded world a colliding one.
    expect(meta.requires).toEqual(['Space']);
    expect(boundsRule).not.toContain('Collisions');
  });

  it('measures a flipped sprite the right way round', () => {
    // A scale of -1 is how a sprite faces the other way. Left signed, a flipped
    // actor gets a negative half-width and is held half a body OUTSIDE the map
    // — this rule's own bug, inverted.
    expect(boundsRule).toContain('"OP": "ABS"');
  });

  it('names the clamp on the rule, for anything else that needs one', () => {
    // Same reason wrapping exposes its one axis: a score, a volume and a health
    // bar are the same arithmetic, and a copy is somewhere to drift.
    expect(meta.queries).toHaveLength(1);
    expect(meta.queries[0].name).toMatch(/keep/i);
  });

  it('is offered beside wrapping, which is its opposite', () => {
    const ids = STOCK_RULES.map(stock => stock.id);

    expect(ids.indexOf('bounds')).toBe(ids.indexOf('wrap') - 1);
    expect(STOCK_RULES.find(stock => stock.id === 'bounds')?.provides).toEqual([
      'Stays Across',
      'Stays Down',
    ]);
  });
});
