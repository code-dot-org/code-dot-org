// The general get/set blocks, and what they may reach.
//
// The library mints a get and a set for every property every rule declares —
// 168 blocks for two verbs, which is most of the palette. Each is discoverable
// in its rule's category, and that is the good half. The bad half is that an
// actor's OWN property has no category to be discoverable in, and giving it
// one would mean a category per actor.
//
// So there is a general pair per KIND, whose dropdown is every actor-scoped
// property in play. Six kinds, twelve blocks, and an actor's own property is
// reachable from anywhere without a new category anywhere.

import {describe, expect, it} from 'vitest';

import {healthBarActor} from '../../actors/stock/healthBar';
import {STOCK_RULES} from '../../rules/stock';
import {buildDomainPalette} from '../domainBlocks';
import {projectOwnMetas} from '../projectModules';
import {
  kindOf,
  propertyOptions,
  propertyByKey,
  writablePropertyOptions,
} from '../propertyOptions';
import {parseRuleMeta} from '../ruleMeta';

/** The shelf, plus one actor that keeps a property of its own. */
const build = () =>
  buildDomainPalette(
    STOCK_RULES.map(rule => parseRuleMeta(`rules/${rule.id}`, rule.contents)!),
    {
      allRuleModules: true,
      ownProperties: projectOwnMetas({
        'actors/healthBar.actor': healthBarActor,
      }),
    },
  );

const labels = (kind: Parameters<typeof propertyOptions>[0]) =>
  propertyOptions(kind).map(([label]) => label);

describe('what the general property blocks offer', () => {
  it('reaches a property a rule declares', () => {
    build();

    expect(labels('number')).toContain('Health ▸ health');
  });

  it('reaches one an actor declares for itself, which nothing else could', () => {
    // THE REASON THESE EXIST. An own property's block is minted from the
    // actor's module path, so it belongs to no rule and no rule's category —
    // and a category per actor is the thing this avoids.
    build();

    expect(labels('actor')).toContain('Health Bar ▸ subject');
  });

  it('says where a property came from, because names repeat', () => {
    // Two rules may both call something `fraction`, and a bare name would
    // offer one word twice with no way to tell which is which.
    build();

    for (const label of labels('number')) {
      expect(label).toContain(' ▸ ');
    }
  });

  it('leaves world-scoped properties to their own blocks', () => {
    // `get score` takes no subject and reads `world`; a block with an actor
    // socket cannot say it.
    build();
    const every = (
      ['number', 'text', 'boolean', 'color', 'vector', 'actor'] as const
    )
      .flatMap(kind => propertyOptions(kind))
      .map(([, key]) => key);

    expect(every).not.toContain('Scoring_ScoreProperty');
    expect(every).not.toContain('Gravity_AmountOfGravityProperty');
  });

  it('offers a read-only property to read and not to write', () => {
    // `jumps used`, `unhurt until`, `falling` — a rule's own bookkeeping. A
    // setter for one is a way to lie to a rule about its own state.
    build();

    expect(labels('number')).toContain('Jumping ▸ jumps used');
    expect(
      writablePropertyOptions('number').map(([label]) => label),
    ).not.toContain('Jumping ▸ jumps used');
  });

  it('files each property under the kind that can report it', () => {
    // Fewer kinds than there are types, because two pairs report the same
    // thing and a learner would be choosing between identical blocks.
    expect(kindOf('point')).toBe('vector');
    expect(kindOf('vector')).toBe('vector');
    expect(kindOf('actor')).toBe('actor');
    expect(kindOf('actors')).toBe('actor');
    expect(kindOf('string')).toBe('text');
    expect(kindOf('number')).toBe('number');
  });

  it('keeps the key the per-property block is already minted from', () => {
    // One name for one property, so a rename has one place to reach and the
    // two ways of naming a property cannot drift.
    build();
    const known = propertyByKey('Health_HealthProperty');

    expect(known?.property.name).toBe('health');
    expect(known?.property.scope).toBe('actor');
  });
});

describe('what the general property blocks generate', () => {
  /** Run a block's generator with a chosen property and a plugged subject. */
  const emit = (type: string, prop: string, values: Record<string, string>) => {
    const palette = build();
    const definition = palette.blocks.find(block => block.type === type)!;
    return definition.generator.javascript(
      {
        getFieldValue: (name: string) => (name === 'PROP' ? prop : null),
        getInputTargetBlock: (name: string) =>
          name === 'ACTOR' ? {type: 'world_this_actor'} : null,
      } as never,
      {
        definitions_: {},
        valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      } as never,
      {} as never,
    );
  };

  it('reads exactly what the per-property getter reads', () => {
    // Two ways of naming one property, and they had better agree: the general
    // one is a convenience, not a second semantics.
    const [code] = emit('world_get_number_property', 'Health_HealthProperty', {
      ACTOR: 'actor',
    }) as [string, number];

    expect(code).toBe('actor.get(HealthProperty)');
  });

  it('broadcasts a write over an actor value that holds several', () => {
    // `set ⟨…⟩ of ⟨any ⟨Coin⟩⟩` is a broadcast, exactly as the per-property
    // setter is — the shared `forEachActor` is what makes that true by
    // construction rather than by remembering.
    const palette = build();
    const definition = palette.blocks.find(
      block => block.type === 'world_set_number_property',
    )!;
    const code = definition.generator.javascript(
      {
        getFieldValue: (name: string) =>
          name === 'PROP' ? 'Health_HealthProperty' : null,
        getInputTargetBlock: (name: string) =>
          name === 'ACTOR' ? {type: 'world_actor_kind'} : null,
      } as never,
      {
        definitions_: {},
        valueToCode: (_b: unknown, name: string) =>
          name === 'ACTOR' ? 'world.actors.ofType("actors/coin")' : '3',
      } as never,
      {} as never,
    ) as string;

    expect(code).toContain('WorldLab.each(');
    expect(code).toContain('subject.set(HealthProperty, 3)');
  });

  it('reports an empty value for a property the project has dropped', () => {
    // A value block has to report SOMETHING of the shape its socket expects,
    // which is what every other dead reference here does.
    const [code] = emit('world_get_number_property', 'Gone_AwayProperty', {
      ACTOR: 'actor',
    }) as [string, number];

    expect(code).toBe('0');
  });

  it('writes nothing at all for one, rather than a broken assignment', () => {
    const code = emit('world_set_number_property', 'Gone_AwayProperty', {
      ACTOR: 'actor',
      VALUE: '3',
    });

    expect(code).toBe('');
  });
});
