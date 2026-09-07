// "Has Special Floors" — what it declares, and the shape of the split.
//
// `stockRulesRun` covers what the three floors do. What this pins is the
// arrangement, because the two decisions in it look like taste and are not:
// which moment the floors get their say in, and which side of the tile/walker
// line each thing lives on.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {surfacesRule} from '../stock/surfaces';

const meta = parseRuleMeta('rules/surfaces', surfacesRule)!;

describe('rules/surfaces.rule', () => {
  it('is three floors and one walker', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Conveys',
      'Slippery',
      'Slows',
      'Stands_on_Surfaces',
    ]);
  });

  it('speaks after the player has, which is the whole rule', () => {
    // `push` is one moment after `decide`, and Arrow Keys SETS the sideways
    // speed in `decide` rather than adding to it — so a floor that spoke first
    // would be overwritten and lost every frame, in silence.
    const step = meta.steps.find(one => one.id === 'read_the_floor');

    expect(step?.order).toEqual({kind: 'phase', phase: 'push'});
    expect(step?.ownerTraitId).toBe('Stands_on_Surfaces');
  });

  it('gives ice nothing to carry', () => {
    // How fast you go on ice is a fact about YOU — it is the speed you arrived
    // with. A `slipperiness` on the tile would be a dial with no behavior
    // behind it.
    const ice = meta.properties.filter(
      property => property.ownerTraitId === 'Slippery',
    );

    expect(ice).toEqual([]);
  });

  it('puts each floor’s one number on the floor', () => {
    // A belt's speed and sludge's drag belong to the TILE, so one level can
    // hold a fast belt and a slow one without the walker knowing either.
    const byTrait = (id: string) =>
      meta.properties
        .filter(property => property.ownerTraitId === id)
        .map(property => property.id);

    expect(byTrait('Conveys')).toEqual(['belt_speed']);
    expect(byTrait('Slows')).toEqual(['slowed_to']);
  });

  it('keeps the walker’s memory of the ice to itself', () => {
    // Both are the rule's account of a slide in progress; a project setting
    // `slide speed` would be steering a player who is supposed to have lost
    // the steering.
    const own = meta.properties
      .filter(property => property.ownerTraitId === 'Stands_on_Surfaces')
      .map(property => [property.id, property.readonly]);

    expect(own).toEqual([
      ['sliding', true],
      ['slide_speed', true],
    ]);
  });

  it('says when a slide starts and stops, and draws nothing', () => {
    // The same seam every other rule here draws: what ice LOOKS like is the
    // project's, and these two are how it hears about it.
    expect(meta.events.map(event => event.name).sort()).toEqual([
      'starts sliding',
      'stops sliding',
    ]);
    expect(surfacesRule).not.toContain('world_play_animation');
  });

  it('never touches the vertical speed, so a jump still works', () => {
    // Not a concession — it is what makes ice playable at all. Every write in
    // the rule goes through one helper that reads y back unchanged, so the
    // check is that nothing else writes a velocity.
    const writes =
      surfacesRule.split('world_set_Physics_VelocityProperty').length - 1;
    const reads =
      surfacesRule.split('world_get_Physics_VelocityProperty').length - 1;

    expect(writes).toBeGreaterThan(0);
    // Every write reads y back to put it in the vector it is building, so
    // there is at least one read per write. A write with no read beside it
    // would be a write that dropped the vertical speed.
    expect(reads).toBeGreaterThanOrEqual(writes);
  });

  it('is offered in the library', () => {
    expect(
      STOCK_RULES.find(stock => stock.id === 'surfaces')?.provides,
    ).toEqual(['Conveys', 'Slippery', 'Slows', 'Stands on Surfaces']);
  });
});
