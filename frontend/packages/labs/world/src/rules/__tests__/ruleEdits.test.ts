// What the Rule Editor changes in a rule's data (specs/RULE_EDITOR_PLAN.md,
// step 2).

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import type {RuleData} from '../ruleData';
import {
  addProperty,
  addTrait,
  addUse,
  deleteProperty,
  memberUses,
  propertyProblem,
  removeUse,
  renameProperty,
  ruleDataOf,
  setPropertyDefault,
  setPropertyReadOnly,
  setPropertyType,
  setTraitSubject,
  traitProblem,
} from '../ruleEdits';
import {resolveRuleContents} from '../ruleReference';

const keys = (): RuleData => ({
  type: 'rule',
  name: 'Keys',
  ability: 'Has Keys',
  properties: [{name: 'count', type: 'number', access: 'writable', value: '0'}],
  traits: [{name: 'Holds Keys', description: 'Can carry keys.'}],
});

describe('a property', () => {
  it('is added to the rule or a trait, starting where its kind starts', () => {
    const data = addProperty(keys(), 'Holds Keys', 'where', 'vector');
    expect(data.traits![0].properties).toEqual([
      {name: 'where', type: 'vector', access: 'writable', value: {x: 0, y: 0}},
    ]);
    expect(addProperty(keys(), null, 'ring', 'actors').properties![1]).toEqual(
      {name: 'ring', type: 'actors', access: 'writable'},
    );
  });

  it('may not share a name with another anywhere in the rule', () => {
    expect(propertyProblem(keys(), 'Count')).toMatch(/already has/);
    expect(addProperty(keys(), 'Holds Keys', 'count', 'number')).toEqual(
      keys(),
    );
  });

  it('starts where its field says, as its kind holds it', () => {
    let data = setPropertyDefault(keys(), null, 'count', '3');
    expect(data.properties![0].value).toBe('3');
    expect(setPropertyDefault(data, null, 'count', 'many')).toBe(data);

    data = addProperty(keys(), null, 'at', 'point');
    data = setPropertyDefault(data, null, 'at', '4, 5');
    expect(data.properties![1]).toMatchObject({value: 4, valueY: 5});
  });

  it('is made read-only, retyped from its new default, and deleted', () => {
    let data = setPropertyReadOnly(keys(), null, 'count', true);
    expect(data.properties![0].access).toBe('readonly');
    data = setPropertyType(data, null, 'count', 'boolean');
    expect(data.properties![0]).toEqual({
      name: 'count',
      type: 'boolean',
      access: 'readonly',
      value: 'false',
    });
    expect(deleteProperty(data, null, 'count').properties).toBeUndefined();
  });
});

describe('a property renamed', () => {
  const STARTER = WORLD_SCENARIOS.simple.source;
  const fileOf = (name: string) =>
    Object.values(STARTER.files).find(file => file.name === name)!;
  const gravity = fileOf('gravity.rule');
  const jump = fileOf('jump.rule');

  it('is found where another file uses it', () => {
    expect(
      memberUses(STARTER, gravity.id, 'Gravity', 'FallingProperty'),
    ).toContain(jump.id);
  });

  it('takes its declaration and every use with it, the rules kept as data', () => {
    const source = renameProperty(
      STARTER,
      gravity.id,
      'Affected by Gravity',
      'falling',
      'in the air',
    );

    const own = ruleDataOf(source.files[gravity.id].contents)!;
    expect(
      own.traits!.find(trait => trait.name === 'Affected by Gravity')!
        .properties!.map(property => property.name),
    ).toContain('in the air');
    expect(JSON.parse(source.files[gravity.id].contents).type).toBe('rule');

    const used = source.files[jump.id].contents;
    expect(JSON.parse(used).type).toBe('rule');
    const view = resolveRuleContents(used);
    expect(view).toContain('world_get_Gravity_InTheAirProperty');
    expect(view).not.toContain('world_get_Gravity_FallingProperty');
    expect(parseRuleMeta('rules/jump', used)).toBeDefined();
  });

  it('is the same project when the name is taken', () => {
    expect(
      renameProperty(
        STARTER,
        gravity.id,
        'Affected by Gravity',
        'falling',
        'gravity scale',
      ),
    ).toBe(STARTER);
  });
});

describe('a trait', () => {
  it('is added under a name no other trait of the rule has', () => {
    expect(traitProblem(keys(), 'Opens Doors')).toBeUndefined();
    // Its name is a key with the spaces and the case gone, so these clash.
    expect(traitProblem(keys(), 'holds keys')).toMatch(/already has/);
    expect(addTrait(keys(), 'Opens Doors').traits!.at(-1)).toEqual({
      name: 'Opens Doors',
    });
  });

  it('is taken by an actor unless it says a camera', () => {
    const data = setTraitSubject(keys(), 'Holds Keys', 'camera');
    expect(data.traits![0].subject).toBe('camera');
    expect(
      setTraitSubject(data, 'Holds Keys', 'actor').traits![0],
    ).not.toHaveProperty('subject');
  });
});

describe('what a definition uses', () => {
  it('is added once and taken away, the list going with the last', () => {
    let data = addUse(keys(), null, 'Physics');
    expect(addUse(data, null, 'Physics')).toBe(data);
    data = addUse(data, 'Holds Keys', 'Physics#CanMoveTrait');
    expect(data.traits![0].uses).toEqual(['Physics#CanMoveTrait']);
    expect(removeUse(data, null, 'Physics').uses).toBeUndefined();
  });
});
