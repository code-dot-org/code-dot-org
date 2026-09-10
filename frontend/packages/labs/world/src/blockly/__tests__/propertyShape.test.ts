// `define property`, and the one description of what it makes.
//
// A property makes two blocks — a getter and a setter — and three things now
// build from the same account of them: the real `set …` block, the real `get …`
// block, and the two drawings on the face of the `define property` that
// declared it (`FieldPropertyPreview`). If they can drift, the definition shows
// a learner a block they will not get, which is the failure the drawing was
// added to prevent.
//
// So these pin the shape itself, and then pin the generated blocks AGAINST it.

import {describe, expect, it} from 'vitest';

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
  fields: Record<string, string>,
  inTrait?: 'actor' | 'camera',
) => {
  const property = {
    type: 'world_rule_property',
    fields: {TYPE: 'number', ACCESS: 'writable', DEFAULT: '0', ...fields},
  };
  return parseRuleMeta(
    'rules/vitality',
    JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Vitality', ABILITY: 'Has Vitality'},
            ...(inTrait ? {} : {next: {block: property}}),
          },
          ...(inTrait
            ? [
                {
                  type: 'world_rule_trait',
                  fields: {NAME: 'Alive', SUBJECT: inTrait},
                  next: {block: property},
                },
              ]
            : []),
        ],
      },
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

  it('starts a camera property at the main camera, not at `this camera`', () => {
    // `this camera` outside a `define camera` body generates a bare identifier
    // nothing binds, which is why the shadow at every camera call site is the
    // main camera (`actorInput.cameraShadow`).
    expect(shapeOf({scope: 'camera'}).set.subject).toEqual({
      name: 'ACTOR',
      type: 'world_camera',
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
    const {blocks} = paletteFor(ruleWith({NAME: 'score', DEFAULT: '5'}));
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
      ruleWith({NAME: 'health', DEFAULT: '100'}, 'actor'),
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

  it('still hears "read-only" from the eye’s field', () => {
    // The dropdown that said it became a button, and kept the field name and
    // both of its values so that every rule already written still loads.
    expect(
      ruleWith({NAME: 'falling', ACCESS: 'readonly'}).properties[0],
    ).toMatchObject({name: 'falling', readonly: true});
    expect(ruleWith({NAME: 'falling'}).properties[0]).toMatchObject({
      readonly: false,
    });
  });
});
