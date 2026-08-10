// An actor's own properties, as read off its workspace.
//
// The shorthand that lets a kind of actor remember something without a rule
// existing to hold it. What these pin is that it really is shorthand: the
// `PropertyMeta` it produces is the same shape a trait's property produces, so
// everything downstream stays the machinery that was already there.

import {describe, expect, it} from 'vitest';

import {ownPropertyDeclarations, parseActorOwnMeta} from '../actorMeta';

/** An `.actor` workspace: `define actor` with a chain of blocks below it. */
const actorFile = (name: string, chain: unknown[] = []): string => {
  const link = (rest: unknown[]): unknown =>
    rest.length === 0
      ? undefined
      : {...(rest[0] as object), next: {block: link(rest.slice(1))}};
  return JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: name},
          ...(chain.length ? {next: {block: link(chain)}} : {}),
        },
      ],
    },
  });
};

const property = (fields: Record<string, string>) => ({
  type: 'world_rule_property',
  fields: {TYPE: 'number', ACCESS: 'writable', DEFAULT: '0', ...fields},
});

describe('an actor’s own properties', () => {
  it('reads a declaration out of the actor’s chain', () => {
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'last fired'})]),
    );

    expect(meta?.properties).toHaveLength(1);
    expect(meta?.properties[0].name).toBe('last fired');
    expect(meta?.properties[0].id).toBe('last_fired');
  });

  it('scopes them to the actor, not the world', () => {
    // The whole point: one slot per instance. World scope would give every
    // Player one shared `last fired`, which is the bug this exists to avoid.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'last fired'})]),
    );

    expect(meta?.properties[0].scope).toBe('actor');
    // And owned by no trait: nothing elects these, so inventing one to hold
    // them would put a trait the learner never wrote into `traits()`.
    expect(meta?.properties[0].ownerTraitId).toBeUndefined();
  });

  it('keeps two kinds’ same-named properties apart', () => {
    // A Player's `last fired` and a Coin's are different properties. They are
    // distinct objects — `Traited` keys its slots by the property itself — and
    // their refs name different files, so neither can resolve to the other.
    const player = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'last fired'})]),
    );
    const coin = parseActorOwnMeta(
      'actors/coin',
      actorFile('Coin', [property({NAME: 'last fired'})]),
    );

    expect(player?.properties[0].ref).not.toEqual(coin?.properties[0].ref);
    expect(player?.properties[0].ref.modulePath).toBe('actors/player');
    expect(coin?.properties[0].ref.modulePath).toBe('actors/coin');
  });

  it('keeps the declared type and default', () => {
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        property({NAME: 'max health', TYPE: 'number', DEFAULT: '100'}),
      ]),
    );

    expect(meta?.properties[0].type).toBe('number');
    expect(meta?.properties[0].default).toBe(100);
  });

  it('honours read-only as a per-kind constant', () => {
    // Not the no-op it would be if these were visible elsewhere. An actor's
    // declaring scope is a declaration, not a body, so there is nowhere to set
    // it — read-only means no setter is offered at all.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        property({NAME: 'max health', ACCESS: 'readonly', DEFAULT: '100'}),
      ]),
    );

    expect(meta?.properties[0].readonly).toBe(true);
  });

  it('reads a workspace saved before the access field existed as writable', () => {
    // The behaviour those files already had; a missing field must not silently
    // turn an existing property into a constant.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        {type: 'world_rule_property', fields: {NAME: 'ammo', TYPE: 'number'}},
      ]),
    );

    expect(meta?.properties[0].readonly).toBe(false);
  });

  it('points its ref at the file that declares it', () => {
    // Visibility is the declaring file, so the ref never has to resolve
    // anywhere else — which is what makes renaming or deleting the actor
    // unable to dangle a reference somewhere it cannot see.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'last fired'})]),
    );

    expect(meta?.properties[0].ref).toEqual({
      source: 'project',
      exportName: 'LastFiredProperty',
      ruleName: 'Player',
      modulePath: 'actors/player',
    });
  });

  it('ignores everything in the chain that is not a declaration', () => {
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        {type: 'world_use_trait', fields: {TRAIT: 'Physics#CanMoveTrait'}},
        property({NAME: 'last fired'}),
        {type: 'world_play_animation', fields: {ANIM: 'game'}},
      ]),
    );

    expect(meta?.properties.map(p => p.id)).toEqual(['last_fired']);
  });

  it('takes the first of two declarations sharing a name', () => {
    // One name must mean one slot. Letting both through would make which one a
    // get block reads depend on generation order.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        property({NAME: 'ammo', DEFAULT: '6'}),
        property({NAME: 'ammo', DEFAULT: '99'}),
      ]),
    );

    expect(meta?.properties).toHaveLength(1);
    expect(meta?.properties[0].default).toBe(6);
  });

  it('declares nothing for an unnamed declaration', () => {
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: ''})]),
    );

    expect(meta?.properties).toEqual([]);
  });

  it('distinguishes "no properties" from "cannot read this"', () => {
    // A caller has to tell an actor that declares nothing from a file being
    // typed into, because the first should clear stale blocks and the second
    // must leave them alone.
    expect(
      parseActorOwnMeta('actors/player', actorFile('Player'))?.properties,
    ).toEqual([]);
    expect(parseActorOwnMeta('actors/player', 'not json{')).toBeUndefined();
    expect(
      parseActorOwnMeta(
        'actors/player',
        JSON.stringify({blocks: {blocks: []}}),
      ),
    ).toBeUndefined();
  });

  it('declares them on the actor, after it exists', () => {
    // `actor.defineProperty(…)` and not a free-standing object, because the
    // actor is what seeds the slot on every instance — and putting them after
    // `const actor` is what keeps this clear of the ordering hazard that made
    // hoisted world hats emit `world.on(…)` above `const world`.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'last fired'})]),
    )!;

    expect(ownPropertyDeclarations(meta)).toBe(
      'const LastFiredProperty = actor.defineProperty("last_fired", "number", 0, {"name":"last fired"});\n',
    );
  });

  it('carries read-only through to the declaration', () => {
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [
        property({NAME: 'max health', ACCESS: 'readonly', DEFAULT: '100'}),
      ]),
    )!;

    expect(ownPropertyDeclarations(meta)).toContain('"readonly":true');
  });

  it('exports nothing', () => {
    // Their scope is this file, so an export would offer a name no other module
    // is allowed to ask for.
    const meta = parseActorOwnMeta(
      'actors/player',
      actorFile('Player', [property({NAME: 'ammo'})]),
    )!;

    expect(ownPropertyDeclarations(meta)).not.toContain('export');
  });

  it('declares nothing when the actor declares nothing', () => {
    const meta = parseActorOwnMeta('actors/player', actorFile('Player'))!;

    expect(ownPropertyDeclarations(meta)).toBe('');
  });
});
