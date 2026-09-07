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

  it('is the kind an `add actor` body places', () => {
    // The most common `this actor` in the whole progression: a world's opening
    // lines are `add actor ⟨Coin⟩ do: set position of ⟨this actor⟩ …`, and
    // that block was showing the bare word while the identical one under
    // `define actor` showed a picture.
    const workspace = worldWith('coin1', 'Coin');
    const body: Stub = {type: 'world_set_position', id: 'body1', workspace};
    const add = {
      type: 'world_add_actor',
      id: 'add1',
      fields: {ACTOR: localActorValue('coin1')},
      inputs: {DO: body},
      workspace,
    };
    body.parent = add;

    expect(actorAbout(asBlock(body), 'this')).toEqual({
      type: 'Coin',
      name: 'Coin',
    });
  });

  it('is not the placed kind for a block merely chained after the `add`', () => {
    // Two `add actor`s in a row: the second is a `getParent` child of the
    // first and is in nobody's scope. Its own body is its own kind, which is
    // the case above; what it is not is a Coin.
    const workspace = worldWith('coin1', 'Coin');
    const first = {
      type: 'world_add_actor',
      id: 'add1',
      fields: {ACTOR: localActorValue('coin1')},
      inputs: {DO: {type: 'world_set_position', id: 'body1', workspace}},
      workspace,
    };
    const after = {type: 'world_print', id: 'after1', parent: first, workspace};

    expect(actorAbout(asBlock(after), 'this')).toBeUndefined();
  });

  it('is nobody in the body of an `add actor` that took a name', () => {
    // `as ⟨placed⟩` exists so a body can still say `this actor` and mean the
    // actor whose file it is — a picture of the Bullet there would be a lie.
    const workspace = worldWith('bullet1', 'Bullet');
    const body: Stub = {type: 'world_set_position', id: 'body1', workspace};
    const add = {
      type: 'world_add_actor',
      id: 'add1',
      fields: {ACTOR: localActorValue('bullet1'), NAMED: 'named'},
      inputs: {DO: body},
      workspace,
    };
    body.parent = add;

    expect(actorAbout(asBlock(body), 'this')).toBeUndefined();
  });

  it('is nobody in a rule, because a trait says nothing about who elects it', () => {
    // The row that keeps the feature honest: `this actor` in a trait step is a
    // different kind per project, and a picture there would be a guess.
    const step = {type: 'world_trait_step', fields: {NAME: 'fall'}};

    expect(actorAbout(asBlock({parent: step}), 'this')).toBeUndefined();
  });

  it('is nobody inside a tween, whose actor is whoever plays it', () => {
    // THE PAD IS WHY. Its tweens fade whatever steps on it — they are played
    // on `event actor` from the pad's own handlers — and every `this actor`
    // inside them wore a picture of the pad, which is a picture of the wrong
    // actor. A tween is a function of the actor it is played on
    // (`domainBlocks`, the `define tween` generator says so outright), so at
    // edit time there is nobody to draw.
    //
    // THE DEFINITION IS PUT ABOVE IT ON PURPOSE. Without it the walk would run
    // out of ancestors and answer "nobody" for having found nothing, which is
    // the right answer for the wrong reason and would go on passing with this
    // rule deleted.
    const workspace = worldWith('pad1', 'Pad');
    const definition = {type: 'world_actor', id: 'pad1', workspace};
    const tween = {type: 'world_define_tween', parent: definition, workspace};

    // The control: the same chain without the tween in it IS the pad.
    expect(
      actorAbout(asBlock({parent: definition, workspace}), 'this'),
    ).toEqual({type: 'Pad', name: 'Pad'});
    expect(
      actorAbout(asBlock({parent: tween, workspace}), 'this'),
    ).toBeUndefined();
  });

  it('is nobody inside an unnamed tween either', () => {
    // `play tween here` rebinds the actor around its destinations exactly as a
    // named tween's definition does, and says so in its generator — so the two
    // blocks cannot disagree about what `this actor` means inside them.
    const workspace = worldWith('pad1', 'Pad');
    const definition = {type: 'world_actor', id: 'pad1', workspace};
    const here = {
      type: 'world_play_tween_here',
      parent: definition,
      workspace,
    };

    expect(
      actorAbout(asBlock({parent: here, workspace}), 'this'),
    ).toBeUndefined();
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

  it("is still the hat's, inside an `add actor` body under it", () => {
    // `add actor` binds a subject, not an event: what the hat heard is the
    // same block-for-block wherever in the handler you stand.
    const workspace = worldWith('mark1', 'Mark');
    const hat = {
      type: 'world_on_Collisions_StartsTouchingEvent',
      id: 'hat1',
      workspace,
      fields: {FILTER0: localActorValue('mark1')},
    };
    const body: Stub = {type: 'world_print', id: 'body1', workspace};
    const add = {
      type: 'world_add_actor',
      id: 'add1',
      fields: {ACTOR: ''},
      inputs: {DO: body},
      parent: hat,
      workspace,
    };
    body.parent = add;

    expect(actorAbout(asBlock(body), 'event')).toEqual({
      type: 'Mark',
      name: 'Mark',
    });
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
