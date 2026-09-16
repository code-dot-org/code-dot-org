// A paused world keeps sensing and stops moving (`World.pause`).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import {PositionProperty} from '../rules/spatial';

import {
  AffectedByGravityTrait,
  GravityRule,
  GroundTrait,
} from './fixtures/gravityRule';

/** A rule with one step per phase of interest, each recording that it ran. */
const listening = () => {
  const ran: string[] = [];
  const rule = new RuleBuilder({id: 'listener', name: 'Listens'});
  rule.addStepIn('hear', 'sense', world => {
    ran.push(`sense:${world.newlyPressedKeys().join(',')}`);
  });
  rule.addStepIn('think', 'decide', () => {
    ran.push('decide');
  });
  rule.addStepIn('act', 'react', () => {
    ran.push('react');
  });
  return {rule, ran};
};

const fallingWorld = () => {
  const {rule, ran} = listening();
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule, rule.build()])
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(100, 400))
      .instantiate(),
  );
  const faller = world.addActor(
    new ActorBuilder({id: 'coin', name: 'Coin'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(100, 20))
      .instantiate(),
  );
  return {world, faller, ran};
};

describe('a paused world', () => {
  it('stops everything moving until it is resumed', () => {
    const {world, faller} = fallingWorld();
    world.tick(1 / 60);
    const fell = faller.get(PositionProperty).y;
    expect(fell).toBeGreaterThan(20);
    world.pause();
    expect(world.isPaused()).toBe(true);
    for (let i = 0; i < 10; i++) {
      world.tick(1 / 60);
    }
    expect(faller.get(PositionProperty).y).toBe(fell);
    world.resume();
    world.tick(1 / 60);
    expect(faller.get(PositionProperty).y).toBeGreaterThan(fell);
  });

  it('runs the sense phase and nothing after it', () => {
    const {world, ran} = fallingWorld();
    world.pause();
    world.setInput(['enter']);
    world.tick(1 / 60);
    expect(ran).toEqual(['sense:enter']);
    world.resume();
    world.setInput([]);
    ran.length = 0;
    world.tick(1 / 60);
    expect(ran).toEqual(['sense:', 'decide', 'react']);
  });

  it('keeps its clock running', () => {
    const {world} = fallingWorld();
    world.pause();
    world.tick(1);
    expect(world.time()).toBeCloseTo(1, 5);
  });
});
