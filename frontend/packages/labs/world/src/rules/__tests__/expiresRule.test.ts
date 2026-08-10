// "Expires" — the other half of spawning.
//
// `add actor` puts something in the world and nothing took it out, so a game
// that fires six shots a second got slower the longer it was played — a bug
// that presents as bad performance rather than as a missing block. What these
// pin is mostly the ORDERING, because the tempting phase is the wrong one.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {expiresRule} from '../stock/expires';

const meta = parseRuleMeta('rules/expires', expiresRule)!;

describe('rules/expires.rule', () => {
  it('is one trait an actor elects', () => {
    // Electing it is how an actor says it is temporary at all. Most are not,
    // and a lifetime nobody asked for would quietly delete the player.
    expect(meta.traits.map(trait => trait.id)).toEqual(['Expires']);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('carries a lifetime per actor', () => {
    // How long a thing lasts is a fact about the kind of thing: a bullet two
    // seconds, a spark a quarter of one.
    const lifetime = meta.properties.find(p => p.id === 'lifetime');

    expect(lifetime?.scope).toBe('actor');
    expect(lifetime?.default).toBe(2);
  });

  it('removes in `react`, after collisions are known', () => {
    // The ordering IS the feature. `touch` works out what is against what and
    // `settle` pushes bodies apart; expiring before either would delete a
    // bullet on the frame it hit something, and the shot that killed the
    // asteroid would miss for no visible reason.
    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].order).toEqual({kind: 'phase', phase: 'react'});
  });

  it('reads the age the world already keeps', () => {
    // Rather than counting down a number of its own: no state, one comparison
    // per actor, and an actor spawned mid-game is measured from when it
    // appeared rather than from when the game began.
    expect(expiresRule).toContain('world_actor_age');
    expect(meta.properties).toHaveLength(1);
  });

  it('is strictly older than, so a zero lifetime is not instant death', () => {
    // `age` is 0 on the frame an actor is placed. "At least" would delete
    // anything with a lifetime of 0 before it was ever drawn.
    expect(expiresRule).toContain('"OP": "GT"');
    expect(expiresRule).not.toContain('"OP": "GTE"');
  });

  it('takes the actor out rather than hiding it', () => {
    expect(expiresRule).toContain('world_remove_actor');
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'expires')?.provides).toEqual(
      ['Expires'],
    );
  });
});
