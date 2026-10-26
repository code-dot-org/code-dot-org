// The stock `Steering` rule — an actor that goes after another one.
//
// Nothing else in the library makes an actor BEHAVE: every other rule is about
// what happens TO a thing. What these pin is the shape that makes it composable
// rather than clever — it sets velocity so walls and gravity still apply, it
// can be told to leave the vertical alone, and it brings the distance block the
// rest of the language was missing.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../../blockly/domainBlocks';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {registerProjectRules} from '../../blockly/ruleRegistry';
import {steeringRule, stockRule} from '../stock';

const meta = parseRuleMeta('rules/steering', steeringRule)!;

const trait = (name: string) => meta.traits.find(one => one.name === name);
const propertyOf = (traitName: string, property: string) => {
  const owner = trait(traitName);
  const found = meta.properties.find(one => one.name === property);
  expect(found?.ownerTraitId).toBe(owner?.id);
  return found;
};

describe('rules/steering.rule', () => {
  it('parses as a rule the editor can offer', () => {
    expect(meta.name).toBe('Steering');
    expect(meta.ability).toBe('Chases and Flees');
  });

  it('names chasing and fleeing separately', () => {
    // They want different numbers: a chaser stops when close enough, a fleer
    // only runs when the thing is too near.
    expect(trait('Chases')).toBeDefined();
    expect(trait('Flees')).toBeDefined();
  });

  it('needs Physics, because steering is done with velocity', () => {
    expect(meta.requires).toContain('Physics');
  });

  it('can turn an actor to face another', () => {
    // Writing this rule is what found the maths gap: the language had no
    // arctangent of any kind, so aiming was unsayable. `direction of ⟨…⟩` is
    // the block that fixed it, and this is what asked for it.
    const said = meta.actions.map(one => one.name);
    expect(said.some(name => name.includes('turn to face'))).toBe(true);
  });

  it('brings the distance block the language was missing', () => {
    // `the actor ⟨e⟩ in ⟨any Enemy⟩ with the least ⟨…⟩` shipped with no way to
    // say the something a game actually sorts by: there is no length-of-vector
    // or distance block anywhere else (specs/ACTOR_LISTS.md).
    const asked = meta.queries.map(one => one.name);
    expect(asked.some(name => name.includes('distance from'))).toBe(true);
  });

  it('lets a chaser stop before it arrives', () => {
    // Zero is a homing missile. Anything with a body wants a gap, or it
    // overshoots and turns round every frame.
    expect(propertyOf('Chases', 'keep distance')?.default).toBe(0);
  });

  it('lets a fleer ignore a threat that is far away', () => {
    // A fleer that always ran would leave the level.
    expect(propertyOf('Flees', 'safe distance')?.default).toBe(200);
  });

  it('can leave the vertical to gravity', () => {
    // What lets one rule serve two genres: on for top-down, off for a
    // platformer, where a ground enemy that set its own vertical would fly.
    // Arrow Keys makes the same choice and says so in the same words.
    expect(propertyOf('Chases', 'chases up and down')?.default).toBe(true);
  });

  it('steers in `push`, before Physics moves anything', () => {
    // The phase Gravity adds its acceleration in. Setting velocity after the
    // integration would be a frame late every frame.
    expect(meta.steps).toHaveLength(2);
    for (const step of meta.steps) {
      expect(step.order).toMatchObject({phase: 'push'});
      expect(step.scope).toBe('actor');
    }
  });

  it('moves nothing itself', () => {
    // It sets velocity and stops there, so solid bodies still stop a chaser at
    // a wall and drag still slows it.
    expect(steeringRule).not.toContain('world_set_position');
  });

  it('is on the shelf, with both abilities named', () => {
    const shelved = stockRule('steering');

    expect(shelved?.provides).toEqual(['Chases', 'Flees']);
    expect(shelved?.description).toContain('distance');
  });
});

describe('passing an actor into one of its own queries', () => {
  // The bug the demo spike found, and it had shipped. A parameter typed `actor`
  // takes ONE, and what is plugged into it may hold several: `any ⟨Coin⟩` does,
  // and so does any `actor`-typed PROPERTY, which `Traited.coerce` stores as a
  // list whatever it was handed.
  //
  // Read raw, the query's body then called `.get` on an array — so Steering's
  // own chase step, passing `actor to chase` into `distance from ⟨a⟩ to ⟨b⟩`,
  // crashed the instant a chaser had something to chase. Every test passed:
  // nothing here runs a rule, and the reimplementations the engine tests use
  // are not the rules that ship.
  /**
   * Emit the `distance from ⟨a⟩ to ⟨b⟩` call.
   *
   * `many` names the sockets holding a value that could be several. That is a
   * question about the BLOCK plugged in rather than about its code
   * (`manyActors`), so the stub has to answer it — `any ⟨kind⟩` is the
   * shortest thing that does.
   */
  const call = (values: Record<string, string>, many: string[] = []) => {
    registerProjectRules([meta]);
    const palette = buildDomainPalette([meta], {
      ownRuleModule: 'rules/steering',
    });
    const block = palette.blocks.find(one =>
      one.type.includes('DistanceFromToQuery'),
    );
    const [code] = block!.generator.javascript(
      {
        getFieldValue: () => '',
        getInputTargetBlock: (name: string) =>
          many.includes(name) ? {type: 'world_actor_kind'} : null,
      } as never,
      {
        valueToCode: (_b: unknown, name: string) => values[name] ?? '',
        definitions_: {},
      } as never,
      {} as never,
    ) as [string, number];
    return code;
  };

  it('reads a many-valued argument as one actor', () => {
    // `WorldLab.one` is the language's own rule for a value read of several
    // (specs/ACTOR_LISTS.md) — the same thing every built-in getter beside
    // these already did, which is why Camera Follow escaped by reading its
    // target through `x position of`.
    const code = call({A: 'actor', B: 'actor.get(ActorToChaseProperty)'}, [
      'B',
    ]);

    expect(code).toContain('WorldLab.one(actor.get(ActorToChaseProperty))');
  });

  it('leaves a single actor alone', () => {
    // The wrapper is for values that could hold several. A loop variable or
    // `this actor` is one already, and wrapping it would be noise in code a
    // learner can open.
    expect(call({A: 'actor', B: 'other'})).toContain('other');
    expect(call({A: 'actor', B: 'other'})).not.toContain('WorldLab.one(other)');
  });

  it('still defaults an empty socket to the subject', () => {
    expect(call({})).toContain('actor');
  });
});
