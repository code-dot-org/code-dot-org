// A property, and the one description of the getter and setter it makes
// (`propertyShape`). These pin the shape itself, and then pin the generated
// blocks against it.

import {describe, expect, it} from 'vitest';

import type {RuleProperty} from '../../rules/ruleData';
import {buildDomainPalette, propertyShape} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

const shapeOf = (over: Partial<Parameters<typeof propertyShape>[0]> = {}) =>
  propertyShape({
    name: 'health',
    type: 'number',
    default: 100,
    scope: 'world',
    ...over,
  });

/** A `.rule` declaring one property, at rule level or inside a trait. */
const ruleWith = (
  declared: Partial<RuleProperty> & {name: string},
  inTrait?: 'actor' | 'camera',
) => {
  const property: RuleProperty = {
    type: 'number',
    access: 'writable',
    value: '0',
    ...declared,
  };
  return parseRuleMeta(
    'rules/vitality',
    JSON.stringify({
      type: 'rule',
      name: 'Vitality',
      ability: 'Has Vitality',
      ...(inTrait
        ? {
            traits: [
              {
                name: 'Alive',
                ...(inTrait === 'camera' ? {subject: 'camera'} : {}),
                properties: [property],
              },
            ],
          }
        : {properties: [property]}),
    }),
  )!;
};

const paletteFor = (meta: ReturnType<typeof parseRuleMeta>) => {
  registerProjectRules(meta ? [meta] : []);
  return buildDomainPalette(meta ? [meta] : []);
};

/**
 * The rule's OWN block of a kind, by the export the property is keyed under.
 *
 * A prefix is not enough: the palette carries `world_set_background` and every
 * other engine setter alongside the generated ones, and the first `world_set_`
 * in it belongs to none of them.
 */
const blockNamed = (
  blocks: ReturnType<typeof buildDomainPalette>['blocks'],
  type: string,
) =>
  blocks.find(block => block.type === type) as
    | {message0?: string; args0?: unknown[]; output?: string; style?: string}
    | undefined;

describe('the shape a property makes', () => {
  it('gives a world property no subject to name', () => {
    // Nobody to ask it OF: the world is the only holder there is, so the
    // prefix a `set world … to` would carry answers a question never asked.
    const {get, set} = shapeOf();
    expect(set.message0).toBe('set health to %1');
    expect(get.message0).toBe('get health');
    expect(set.subject).toBeUndefined();
    expect(get.subject).toBeUndefined();
  });

  it('gives an actor property a subject socket, starting at `this actor`', () => {
    const {get, set} = shapeOf({scope: 'actor'});
    expect(set.message0).toBe('set health of %1 to %2');
    expect(get.message0).toBe('get health of %1');
    expect(set.subject).toEqual({name: 'ACTOR', type: 'world_this_actor'});
    expect(get.subject).toEqual({name: 'ACTOR', type: 'world_this_actor'});
  });

  it('starts a camera property at a Viewport’s camera, not at `this camera`', () => {
    // `this camera` outside a camera's own step generates a bare identifier
    // nothing binds, which is why the shadow at every camera call site is
    // `camera of ⟨this actor⟩` (`actorInput.cameraShadow`).
    expect(shapeOf({scope: 'camera'}).set.subject).toEqual({
      name: 'ACTOR',
      type: 'world_camera_of',
    });
  });

  it('seeds the setter’s socket with the declared default', () => {
    expect(shapeOf().set.shadows).toEqual([
      {name: 'VALUE', shadow: {type: 'math_number', fields: {NUM: 100}}},
    ]);
    expect(shapeOf({type: 'string', default: 'ok'}).set.shadows).toEqual([
      {name: 'VALUE', shadow: {type: 'text', fields: {TEXT: 'ok'}}},
    ]);
  });

  it('reads a point one axis at a time, and reports nothing from a setter', () => {
    const {get, set} = shapeOf({type: 'point', default: {x: 1, y: 2}});
    expect(get.message0).toBe('get health %1');
    expect(get.output).toBe('Number');
    expect(set.output).toBeUndefined();
  });

  it('takes the reporter’s colour from what it reports', () => {
    expect(shapeOf({type: 'boolean'}).get.style).toBe('logic_blocks');
    expect(shapeOf({type: 'vector'}).get.style).toBe('location_blocks');
    expect(shapeOf({type: 'number'}).get.style).toBe('math_blocks');
  });
});

describe('the blocks a property really makes', () => {
  it('reads exactly as the shape says a world property will', () => {
    const {blocks} = paletteFor(ruleWith({name: 'score', value: '5'}));
    const shape = propertyShape({
      name: 'score',
      type: 'number',
      default: 5,
      scope: 'world',
    });
    const set = blockNamed(blocks, 'world_set_Vitality_ScoreProperty');
    const get = blockNamed(blocks, 'world_get_Vitality_ScoreProperty');
    expect(set?.message0).toBe(shape.set.message0);
    expect(get?.message0).toBe(shape.get.message0);
    expect(get?.output).toBe(shape.get.output);
  });

  it('reads exactly as the shape says an actor property will', () => {
    const {blocks} = paletteFor(
      ruleWith({name: 'health', value: '100'}, 'actor'),
    );
    const shape = propertyShape({
      name: 'health',
      type: 'number',
      default: 100,
      scope: 'actor',
    });
    expect(
      blockNamed(blocks, 'world_set_Vitality_HealthProperty')?.message0,
    ).toBe(shape.set.message0);
    expect(
      blockNamed(blocks, 'world_get_Vitality_HealthProperty')?.message0,
    ).toBe(shape.get.message0);
  });

  it('hears "read-only" from its access', () => {
    expect(
      ruleWith({name: 'falling', access: 'readonly'}).properties[0],
    ).toMatchObject({name: 'falling', readonly: true});
    expect(ruleWith({name: 'falling'}).properties[0]).toMatchObject({
      readonly: false,
    });
  });
});

describe('the default a declaration holds', () => {
  // It used to be a string for these two — `"0,1"` — split on the comma when it
  // was read. The value arrives in the shape the editor holds it in.
  it('reads a vector out of the one value that holds both axes', () => {
    expect(
      ruleWith({name: 'gust', type: 'vector', value: {x: 3, y: -4}})
        .properties[0].default,
    ).toEqual({x: 3, y: -4});
  });

  it('reads a point out of the two numbers that hold it', () => {
    expect(
      ruleWith({name: 'slack', type: 'point', value: 48, valueY: 32})
        .properties[0].default,
    ).toEqual({x: 48, y: 32});
  });

  it('seeds both of a point setter’s sockets from them', () => {
    const {set} = propertyShape({
      name: 'slack',
      type: 'point',
      default: {x: 48, y: 32},
      scope: 'world',
    });
    expect(set.message0).toBe('set slack to x %1  y %2');
    expect(set.shadows).toEqual([
      {name: 'X', shadow: {type: 'math_number', fields: {NUM: 48}}},
      {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 32}}},
    ]);
  });

  it('has none at all for an actor or a list, whatever is written down', () => {
    // These start empty and there is no other sensible starting value for a
    // set a rule works out each tick, so the editor does not ask, and a stale
    // answer in an older file is ignored rather than believed.
    for (const type of ['actor', 'actors', 'numbers', 'words', 'vectors']) {
      expect(
        ruleWith({name: 'contacts', type, value: '7'}).properties[0].default,
      ).toEqual([]);
    }
  });

  it('seeds a vector setter with the arrow-grid literal it is edited by', () => {
    expect(
      propertyShape({
        name: 'gust',
        type: 'vector',
        default: {x: 3, y: -4},
        scope: 'world',
      }).set.shadows,
    ).toEqual([
      {
        name: 'VALUE',
        shadow: {type: 'world_vector', fields: {VECTOR: {x: 3, y: -4}}},
      },
    ]);
  });
});
