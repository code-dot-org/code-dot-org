// "Collects Things" — the two sides of picking something up.
//
// What these pin is the part that is easy to get wrong and invisible when it
// is: WHICH contact list the step reads, and WHEN a thing is claimed. Both are
// about the same tick, both look fine in a game with one player and one coin,
// and both come apart in the game a learner actually builds.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../../blockly/domainBlocks';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {collectRule} from '../stock/collect';

const meta = parseRuleMeta('rules/collect', collectRule)!;

describe('rules/collect.rule', () => {
  it('names both sides of collecting', () => {
    // Two traits, because a game says which actors pick things up AND which
    // things can be picked up. One trait could only say one of those, and the
    // other would have to be "everything", which is a coin you cannot walk past.
    expect(meta.traits.map(trait => trait.name)).toEqual([
      'Collects',
      'Can Be Collected',
    ]);
  });

  it('makes both sides able to touch', () => {
    // Collecting happens on contact, so an actor with neither side's trait can
    // never be part of one. Left to the learner, electing "Can Be Collected" on
    // a coin with no collision trait would be a rule that silently does nothing
    // — the worst failure a block language can have.
    for (const trait of meta.traits) {
      expect(trait.requires).toEqual(['Collisions#CanCollideTrait']);
    }
    expect(meta.requires).toEqual(['Collisions']);
  });

  it('reads the contacts, not what arrived this frame', () => {
    // The race that would work until it did not. `newly touching` is written in
    // `react` and this step runs in `react`, and steps in one phase are
    // unordered and must commute — so reading it would depend on load order,
    // which is not stable. `contacts` is written in `touch`, a phase earlier.
    expect(meta.steps.map(step => step.order)).toEqual([
      {kind: 'phase', phase: 'react'},
    ]);
    expect(collectRule).toContain('Collisions_ContactsProperty');
    expect(collectRule).not.toContain('NewlyTouchingProperty');
  });

  it('claims a thing before anything else can take it', () => {
    // What `newly touching` would otherwise have been for: not taking the same
    // coin sixty times while standing on it. `taken` does that AND the thing
    // one contact-edge cannot — `remove actor` lands at the END of the tick, so
    // without a claim a second collector touching the same coin in the same
    // frame takes it too, and one coin becomes two.
    const taken = meta.properties.find(p => p.name === 'taken');

    expect(taken?.type).toBe('boolean');
    expect(taken?.ownerTraitId).toBe('Can_Be_Collected');
    expect(taken?.readonly).toBe(true);
  });

  it('keeps what was collected, not how many', () => {
    // A count answers "how many coins" and needs a second count for the second
    // kind, and a third for the third. A list answers it for every kind at once
    // — `how many ⟨Coin⟩ in ⟨collected⟩` — and answers questions a count cannot
    // (was THIS one of them).
    const collected = meta.properties.find(p => p.name === 'collected');

    expect(collected?.type).toBe('actors');
    expect(collected?.ownerTraitId).toBe('Collects');
    expect(collected?.readonly).toBe(true);
  });

  it('tells both sides, each carrying the other', () => {
    // `when ⟨Player⟩ collects ⟨Coin⟩` and `when ⟨Coin⟩ is collected by
    // ⟨Player⟩`. Two events rather than one, because the handlers belong in
    // different files: scoring is the player's business and the sparkle is the
    // coin's, and neither should have to filter the other's event to find
    // itself in it.
    expect(meta.events.map(event => [event.name, event.scope])).toEqual([
      ['collects', 'actor'],
      ['is collected by', 'actor'],
    ]);
    for (const event of meta.events) {
      expect(event.parts?.some(part => part.kind === 'param')).toBe(true);
    }
  });

  it('raises both events before the thing leaves the world', () => {
    // `remove actor` is deferred to the end of the tick, which is what lets a
    // handler read the coin it was just handed — its position, to put a sparkle
    // there. Removing first would hand both handlers an actor with no world.
    const removeAt = collectRule.indexOf('world_remove_actor');
    const collectsAt = collectRule.indexOf('Collection_CollectsEvent');

    expect(removeAt).toBeGreaterThan(-1);
    expect(collectsAt).toBeGreaterThan(-1);
    expect(collectsAt).toBeLessThan(removeAt);
  });

  it('offers add and remove for the list it keeps', () => {
    // What the `actors` type buys over `actor`. Before these existed the step
    // read the whole list out, appended, and wrote it back every frame; a
    // camera's `actor to follow` is `actor` and gets neither, because a second
    // actor to follow is a block that works and means nothing.
    const types = buildDomainPalette([meta], {
      ownRuleModule: 'rules/collect',
    }).blocks.map(block => block.type);

    expect(types).toContain('world_push_Collection_CollectedProperty');
    expect(types).toContain('world_drop_Collection_CollectedProperty');
    // `taken` is a boolean and gets no list blocks at all.
    expect(types).not.toContain('world_push_Collection_TakenProperty');
  });

  it('keeps them out of the hands of everyone but its own rule', () => {
    // A push is a write, and `collected` is read-only — which means the rule
    // that declares it owns the value. A `.world` that could add to somebody's
    // inventory would make the rule's own account of it a guess.
    const types = buildDomainPalette([meta]).blocks.map(block => block.type);

    expect(types).not.toContain('world_push_Collection_CollectedProperty');
    expect(types).not.toContain('world_drop_Collection_CollectedProperty');
    // The read stays, everywhere: asking is not changing.
    expect(types).toContain('world_get_Collection_CollectedProperty');
  });

  it('is offered beside the rule it is built on', () => {
    const ids = STOCK_RULES.map(stock => stock.id);

    expect(ids.indexOf('collect')).toBe(ids.indexOf('solid') + 1);
    expect(STOCK_RULES.find(stock => stock.id === 'collect')?.provides).toEqual(
      ['Collects', 'Can Be Collected'],
    );
  });
});
