// Where `add actor` offers to name what it places.
//
// The choice is only meaningful where there is another actor to shadow, so the
// row is built by context rather than always shown. The failure modes are
// asymmetric and both bad: too shy and the option vanishes where it is needed,
// which reads as broken rather than absent; too loud and every world file
// carries a dropdown that can never mean anything.
//
// One case per site, because "is there an actor in scope here" is exactly the
// kind of question that is right in four places and wrong in the fifth.

import {describe, expect, it} from 'vitest';

import {hasEnclosingActor} from '../extensions/addActorName';

/**
 * A stand-in for the parent chain the predicate walks.
 *
 * `chained` is the distinction the real bug turned on: a block CHAINED below
 * another is still its child in Blockly, and `getInputWithBlock` is what tells
 * that apart from being CONTAINED in one of its inputs.
 */
interface FakeBlock {
  type: string;
  fields?: Record<string, string>;
  inputs?: string[];
  parent?: FakeBlock;
  /** True when this block sits BELOW its parent rather than inside it. */
  chained?: boolean;
}

const chain = (...types: Array<string | FakeBlock>): FakeBlock => {
  const blocks = types.map(t => (typeof t === 'string' ? {type: t} : t));
  blocks.forEach((block, index) => {
    block.parent = blocks[index + 1];
    if (blocks[index + 1]) {
      children.set(blocks[index + 1], block);
    }
  });
  return blocks[0];
};

// `hasEnclosingActor` reads only `getParent`, `type`, `getFieldValue` and
// `getInput`, so a plain object is a truthful stand-in — the same trick the
// generator tests use.
const asBlock = (block: FakeBlock): never =>
  ({
    type: block.type,
    getParent: () => (block.parent ? asBlock(block.parent) : null),
    getFieldValue: (name: string) => block.fields?.[name] ?? null,
    getInput: (name: string) => (block.inputs?.includes(name) ? {} : null),
    // Which of MY inputs holds `child` — null when it arrived through `next`.
    getInputWithBlock: (child: {type: string}) => {
      const held = children.get(block);
      return held && held.type === child.type && !held.chained ? {} : null;
    },
  }) as never;

/** Parent → the block directly under it in the fake chain. */
const children = new WeakMap<FakeBlock, FakeBlock>();

/** The block under test, CONTAINED in whatever is listed after it. */
const enclosed = (...types: Array<string | FakeBlock>): boolean =>
  hasEnclosingActor(asBlock(chain('world_add_actor', ...types)));

/** The same, but CHAINED below the first thing listed rather than inside it. */
const chainedAfter = (...types: Array<string | FakeBlock>): boolean =>
  hasEnclosingActor(
    asBlock(chain({type: 'world_add_actor', chained: true}, ...types)),
  );

describe('where naming the placed actor is offered', () => {
  it('is not, in a world describing its level', () => {
    // Nothing to shadow: `this actor` in the body can only mean the new actor,
    // so a choice would be a dropdown with one real answer.
    expect(enclosed('world_world')).toBe(false);
  });

  it('is not, with no parent at all — the flyout', () => {
    // The block as it is offered. Building the row here would put it on every
    // block a learner drags out, before it is anywhere.
    expect(enclosed()).toBe(false);
  });

  it('is, under a `define actor`', () => {
    // The case the whole thing exists for: `this actor` already means the actor
    // being defined, and shadowing it silently is what the option prevents.
    expect(enclosed('world_actor')).toBe(true);
  });

  it('is, inside an actor’s event handler', () => {
    // The `fires` handler — where a bullet is actually spawned. `inBuilderContext`
    // treats any handler as disqualifying, which is right for the question IT
    // asks and would be exactly wrong here.
    expect(
      enclosed({type: 'world_on_Shooting_FiresEvent', inputs: ['ACTOR']}),
    ).toBe(true);
  });

  it('is not, inside a world’s event handler', () => {
    // `when ⟨space⟩ pressed` on a world binds `world` and no actor. The hat
    // carries no ACTOR socket, which is what tells the two apart locally —
    // no registry of event kinds to keep in step.
    expect(enclosed({type: 'world_on_Input_KeyPressedEvent'})).toBe(false);
  });

  it('is, under a trait — its members belong to the subject', () => {
    expect(enclosed('world_rule_trait')).toBe(true);
  });

  it('is not, under a rule’s own body', () => {
    // A rule's members are the world's; there is no actor bound.
    expect(enclosed('world_rule')).toBe(false);
  });

  it('is, inside an unnamed spawn — a spawn within a spawn', () => {
    // An unnamed `add actor` binds `actor` for its BODY, so a nested one has
    // something to shadow in turn.
    expect(enclosed({type: 'world_add_actor'}, 'world_world')).toBe(true);
  });

  it('is not, merely chained after another spawn', () => {
    // The case that shipped wrong. Two `add actor`s in a row are siblings —
    // neither is in the other, and neither has anything to shadow — but in
    // Blockly the second's parent IS the first, so a walk that did not ask how
    // it got there offered a choice that could not mean anything.
    expect(chainedAfter({type: 'world_add_actor'}, {type: 'world_world'})).toBe(
      false,
    );
  });

  it('is not, chained after a spawn that is itself inside a world', () => {
    // Three in a row is the same answer, and the walk has to keep going past
    // the sibling rather than stopping at it.
    expect(
      chainedAfter(
        {type: 'world_add_actor', chained: true},
        {type: 'world_world'},
      ),
    ).toBe(false);
  });

  it('is, chained after a spawn but inside a define actor', () => {
    // Passing a sibling must not lose the context that IS there.
    expect(chainedAfter({type: 'world_add_actor'}, {type: 'world_actor'})).toBe(
      true,
    );
  });

  it('is not, inside a NAMED spawn in a world', () => {
    // A named one binds a variable and leaves `actor` alone, so the question
    // passes through to whatever encloses it — here, a world with no actor.
    expect(
      enclosed(
        {type: 'world_add_actor', fields: {NAMED: 'named'}},
        'world_world',
      ),
    ).toBe(false);
  });

  it('is, inside a NAMED spawn under a define actor', () => {
    // Same block, different surroundings: the walk continues past it and finds
    // the actor being defined.
    expect(
      enclosed(
        {type: 'world_add_actor', fields: {NAMED: 'named'}},
        'world_actor',
      ),
    ).toBe(true);
  });

  it('stops at the nearest handler, not the furthest root', () => {
    // A world hat inside a `define actor` — which `ROOT_HOMES` allows, since a
    // `.world` file may define actors inline. The handler rebinds, so nothing
    // above it is in scope, and answering from the `define actor` would offer a
    // name for an actor the body cannot reach.
    expect(
      enclosed({type: 'world_on_Input_KeyPressedEvent'}, 'world_actor'),
    ).toBe(false);
  });
});
