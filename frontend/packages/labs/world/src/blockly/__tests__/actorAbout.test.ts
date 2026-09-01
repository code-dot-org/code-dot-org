// Which kind `this actor` and `event actor` are about (blockly/actorAbout).
//
// The picture is the point, and the resolver is what decides whether there is
// one: a block that shows a picture SOMETIMES is only worth having if the rule
// for when is legible. So this pins the rule rather than the drawing — the four
// places an answer comes from, and the three where the honest answer is that
// nobody knows.

import {describe, expect, it} from 'vitest';

import {collisionsRule} from '../../rules/stock/collisions';
import {inputRule} from '../../rules/stock/input';
import {actorAbout, kindFilterField, registerKindFilter} from '../actorAbout';
import {buildDomainPalette} from '../domainBlocks';
import {localActorValue} from '../localActors';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

// Built for its side effects, once: defining a hat is what registers where its
// kind filter lives, and the two rules here are the two shapes — Collisions
// carries an actor, Input carries a key.
const RULES = [
  parseRuleMeta('rules/collisions', collisionsRule)!,
  parseRuleMeta('rules/input', inputRule)!,
];
registerProjectRules(RULES);
buildDomainPalette(RULES);

/** A stand-in block, with only what the walk reads. */
interface Stub {
  type?: string;
  id?: string;
  fields?: Record<string, string>;
  inputs?: Record<string, Stub>;
  parent?: Stub;
  workspace?: unknown;
}

/** Give a chain of stand-ins the shape the resolver walks. */
const asBlock = (stub: Stub): never =>
  ({
    ...stub,
    getParent: () => (stub.parent ? asBlock(stub.parent) : null),
    getFieldValue: (name: string) => stub.fields?.[name] ?? null,
    getInputTargetBlock: (name: string) =>
      stub.inputs?.[name] ? asBlock(stub.inputs[name]) : null,
    workspace: stub.workspace,
  }) as never;

/** A workspace holding one world-defined actor, by block id. */
const worldWith = (id: string, name: string) => {
  const blocks = [
    {id: 'w1', type: 'world_world', getFieldValue: () => 'My World'},
    {
      id,
      type: 'world_actor',
      getFieldValue: (field: string) => (field === 'NAME' ? name : undefined),
    },
  ];
  return {
    getTopBlocks: () => blocks,
    getBlockById: (wanted: string) =>
      blocks.find(block => block.id === wanted) ?? null,
  };
};

describe('what `this actor` is about', () => {
  it('is the kind a hat names as its subject', () => {
    const workspace = worldWith('crate1', 'Crate');
    const hat = {
      type: 'world_on_Collisions_StartsTouchingEvent',
      workspace,
      inputs: {
        ACTOR: {
          type: 'world_actor_kind',
          fields: {ACTOR: localActorValue('crate1')},
          workspace,
        },
      },
    };

    expect(actorAbout(asBlock({parent: hat, workspace}), 'this')).toEqual({
      type: 'Crate',
      name: 'Crate',
    });
  });

  it('is the actor whose definition it sits in', () => {
    const workspace = worldWith('crate1', 'Crate');
    const definition = {type: 'world_actor', id: 'crate1', workspace};

    expect(
      actorAbout(asBlock({parent: definition, workspace}), 'this'),
    ).toEqual({type: 'Crate', name: 'Crate'});
  });

  it('is nobody in a rule, because a trait says nothing about who elects it', () => {
    // The row that keeps the feature honest: `this actor` in a trait step is a
    // different kind per project, and a picture there would be a guess.
    const step = {type: 'world_trait_step', fields: {NAME: 'fall'}};

    expect(actorAbout(asBlock({parent: step}), 'this')).toBeUndefined();
  });

  it('is nobody with nothing above it, which is the toolbox', () => {
    expect(actorAbout(asBlock({}), 'this')).toBeUndefined();
  });
});

describe('what `event actor` is about', () => {
  it('is the kind the hat is filtered to', () => {
    const workspace = worldWith('mark1', 'Mark');
    const hat = {
      type: 'world_on_Collisions_StartsTouchingEvent',
      workspace,
      fields: {FILTER0: localActorValue('mark1')},
    };

    expect(actorAbout(asBlock({parent: hat, workspace}), 'event')).toEqual({
      type: 'Mark',
      name: 'Mark',
    });
  });

  it('is nobody when the hat is left on `(any)`', () => {
    // Which is the second reason to pick a kind on the hat: the block below it
    // starts saying what it is.
    const hat = {
      type: 'world_on_Collisions_StartsTouchingEvent',
      fields: {FILTER0: ''},
    };

    expect(actorAbout(asBlock({parent: hat}), 'event')).toBeUndefined();
  });

  it('is nobody under a hat whose filter is a KEY, not a kind', () => {
    // `FILTER0` is a key on `when ⟨space⟩ is pressed` and a kind on `when ⟨any
    // Crate⟩ starts touching ⟨Mark⟩`. Reading the value and guessing would be
    // right until somebody named an actor "space".
    const hat = {
      type: 'world_on_Input_PressesEvent',
      fields: {FILTER0: 'space'},
    };

    expect(actorAbout(asBlock({parent: hat}), 'event')).toBeUndefined();
  });
});

describe('which field a hat keeps its kind filter in', () => {
  it('is registered by the hat that has one, and by nobody else', () => {
    expect(kindFilterField('world_on_Collisions_StartsTouchingEvent')).toBe(
      'FILTER0',
    );
    expect(kindFilterField('world_on_Input_PressesEvent')).toBeUndefined();
  });

  it('takes a registration for a hat nothing has built yet', () => {
    registerKindFilter('world_on_Test_ThingEvent', 'FILTER1');
    expect(kindFilterField('world_on_Test_ThingEvent')).toBe('FILTER1');
  });
});
