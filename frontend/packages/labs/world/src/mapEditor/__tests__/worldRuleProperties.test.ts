// The world's window, over the rules a real project holds
// (specs/WORLD_RULE_FIELDS_PLAN.md).
//
// The pure surgery is tested with a world written by hand
// (`worldProperties.test`); this is the other half — that the properties
// offered are the ones the rules actually declare, and that a value typed
// into one lands in the world's file as the row the engine reads.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {readWorldHeader, writeWorldRuleValue} from '../worldProperties';
import {worldRuleProperties} from '../worldRuleProperties';

const files = projectFiles(DEFAULT_PROJECT.source);
const offered = worldRuleProperties(files);
const world = files['worlds/main.world'];
const header = (contents: string) => readWorldHeader(contents, offered)!;
const named = (contents: string, name: string) =>
  header(contents).properties.find(property => property.name === name);

describe('what the world’s window offers', () => {
  it('is every world-scoped property of every rule the project holds', () => {
    expect(
      offered.map(property => `${property.rule}: ${property.name}`),
    ).toEqual([
      'Gravity: direction of gravity',
      'Gravity: amount of gravity',
      'Solid Bodies: grip strength',
      'Scoring: score',
      'Scoring: target score',
    ]);
  });

  it('leaves out the ones a rule works out for itself', () => {
    // Scoring's `won` is the score against the target, and Collisions works
    // out its own biggest reach from what is in the world: a starting value
    // for either would be a number nothing reads.
    for (const name of ['won', 'biggest reach']) {
      expect(
        offered.some(property => property.name === name),
        name,
      ).toBe(false);
    }
  });

  it('names each by the block that sets it', () => {
    expect(
      offered.find(property => property.name === 'target score')!.setter,
    ).toBe('world_set_Scoring_TargetScoreProperty');
  });
});

describe('the starter’s world, through the window', () => {
  it('shows the target score the starter sets in a block', () => {
    // `constants.ts` sets it to 30 under `define world`, which is the row
    // the field reads.
    expect(named(world, 'target score')).toMatchObject({
      value: '30',
      rule: 'Scoring',
    });
  });

  it('shows a rule’s own value where the world says nothing', () => {
    expect(named(world, 'amount of gravity')).toMatchObject({value: '9'});
  });

  it('shows a vector as two numbers and a comma, and writes one back', () => {
    // Gravity's direction is `{x: 0, y: 1}` in the rule; `String` of that
    // is "[object Object]", which is what the window showed once.
    const direction = named(world, 'direction of gravity')!;
    expect(direction).toMatchObject({
      type: 'vector',
      rule: 'Gravity',
      value: '0,1',
    });
    const turned = writeWorldRuleValue(
      world,
      offered.find(each => each.setter === direction.setter)!,
      '0,-1',
    );
    expect(named(turned, 'direction of gravity')!.value).toBe('0,-1');
    expect(turned).toContain('"type": "world_vector"');
  });

  it('shows the world’s own properties first, then the rules’', () => {
    const {properties} = header(world);
    const first = properties.findIndex(property => property.setter);
    expect(first).toBeGreaterThan(-1);
    expect(properties.slice(0, first).every(p => !p.setter)).toBe(true);
    expect(properties.slice(first).every(p => p.setter)).toBe(true);
  });

  it('writes a typed value into the row the starter already has', () => {
    const target = offered.find(property => property.name === 'target score')!;
    const written = writeWorldRuleValue(world, target, '45');
    expect(named(written, 'target score')!.value).toBe('45');
    expect(written.split(target.setter)).toHaveLength(2);
  });

  it('adds a row for a rule value the world had said nothing about', () => {
    const gravity = offered.find(
      property => property.name === 'amount of gravity',
    )!;
    expect(world).not.toContain(gravity.setter);
    const written = writeWorldRuleValue(world, gravity, '3');
    expect(written).toContain(gravity.setter);
    expect(named(written, 'amount of gravity')!.value).toBe('3');
  });
});
