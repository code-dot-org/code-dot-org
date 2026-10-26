// "Wraps at the Edges" — walk off one side, come back on the other.
//
// What this pins is the shape the rule was asked for and the two properties the
// phase design depends on: that the directions are separately electable, and
// that both steps sit in `adjust`, which they may only do if they commute.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {wrapRule} from '../stock/wrap';

const meta = parseRuleMeta('rules/wrap', wrapRule)!;
const stepFor = (traitId: string) =>
  meta.steps.find(step => step.ownerTraitId === traitId);

describe('rules/wrap.rule', () => {
  it('offers the two directions as separate traits', () => {
    // The whole point of two rather than one. A side-scroller wraps across and
    // would be broken by wrapping down — walk off a ledge, reappear in the sky.
    // Ids are slugged from the names the learner sees.
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Wraps_Across',
      'Wraps_Down',
    ]);
  });

  it('elects them onto an actor, not a camera', () => {
    for (const trait of meta.traits) {
      expect(trait.subject, trait.id).toBe('actor');
    }
  });

  it('corrects the position in `adjust`', () => {
    // After `move` has turned velocity into a position and before `touch` works
    // out what is against what — wrapping after collisions would leave an actor
    // solid for a frame at the far edge of the map from where it appears.
    for (const trait of meta.traits) {
      expect(stepFor(trait.id)?.order, trait.id).toEqual({
        kind: 'phase',
        phase: 'adjust',
      });
    }
  });

  it('has one step per direction, so electing one wraps one way', () => {
    expect(meta.steps).toHaveLength(2);
    expect(stepFor('Wraps_Across')).toBeDefined();
    expect(stepFor('Wraps_Down')).toBeDefined();
  });

  it('shares one wrapping block between them', () => {
    // On the rule rather than on either trait: it is the same arithmetic both
    // ways round, and a copy per trait is a place for the two to disagree.
    const blocks = [...meta.queries, ...meta.actions];
    expect(blocks.map(block => block.scope)).toContain('world');
    expect(wrapRule).toContain('wrap');
  });

  it('reads the map, so the edge is the level and not the window', () => {
    // `view size` would wrap at the edge of what is on screen, which is a
    // different and almost always wrong thing on a map bigger than the view.
    expect(wrapRule).toContain('world_map_size');
    expect(wrapRule).not.toContain('world_view_size');
  });

  it('writes only its own axis, which is why both may share a moment', () => {
    // Two steps in one phase are unordered, so they have to commute. Each reads
    // the axis it writes and passes the other through untouched: an actor
    // leaving through a corner arrives at the opposite corner either way round.
    //
    // Counted on the serialized workspace, because the property is about what
    // the blocks DO and there is no cheaper place to see it: each step has one
    // `set position` fed by exactly one wrap call, the other axis going in
    // plain.
    const wraps =
      wrapRule.split('world_query_ScreenWrap_WrapWithinQuery').length - 1;
    const sets = wrapRule.split('world_set_position').length - 1;

    expect(sets).toBe(2);
    expect(wraps).toBeGreaterThanOrEqual(2);
  });
});
