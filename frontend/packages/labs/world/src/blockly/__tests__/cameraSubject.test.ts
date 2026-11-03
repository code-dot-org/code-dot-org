// Which subject a block's `ACTOR` socket is about, by where the block sits.
//
// These pin the decision; the shadow actually changing on connect is
// `reseedShadow`, checked in the browser.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {cameraShadow, subjectShadow} from '../actorInput';
import {registerProjectRules} from '../ruleRegistry';
import {setProjectRuleMeta, setProjectRules} from '../traitOptions';

/** A stand-in for the containment chain the predicate walks. */
interface FakeBlock {
  type: string;
  around?: FakeBlock;
}

/** The same, with a TRAIT field on the innermost block. */
const naming = (trait: string, ...types: string[]): never => {
  const block = within(...types) as unknown as Record<string, unknown>;
  return {
    ...block,
    getFieldValue: (name: string) => (name === 'TRAIT' ? trait : null),
  } as never;
};

const within = (...types: string[]): never => {
  const blocks: FakeBlock[] = types.map(type => ({type}));
  blocks.forEach((block, index) => {
    block.around = blocks[index + 1];
  });
  const wrap = (block: FakeBlock): never =>
    ({
      type: block.type,
      getSurroundParent: () => (block.around ? wrap(block.around) : null),
    }) as never;
  return wrap(blocks[0]);
};

/** A file's workspace: the game's own code, or one whose root is `root`. */
const fileOf = (root: string) =>
  root === 'world'
    ? {holdsCodeOf: 'game', getTopBlocks: () => []}
    : {getTopBlocks: () => [{type: root}]};

/** The fake block, in the game's code or an actor's file. */
const inFile = (block: never, root: string): never =>
  ({...(block as object), workspace: fileOf(root)}) as never;

describe('the subject a block is about', () => {
  it('is the actor on its own', () => {
    expect(subjectShadow(within('world_get_Space_PositionProperty'))).toBe(
      'world_this_actor',
    );
  });
});

// `add trait ⟨…⟩ to ⟨…⟩` names a trait from anywhere, so what decides whose
// socket this is is the TRAIT, not the surroundings. A camera trait given to
// `this actor` reads fine and does nothing.
describe('a block that names a trait', () => {
  const rules = [
    {
      name: 'Camera Follow',
      module: 'rules/cameraFollow',
      traits: [
        {
          name: 'Follows',
          subject: 'camera',
          ref: {
            source: 'project',
            exportName: 'FollowsTrait',
            ruleName: 'Camera Follow',
            modulePath: 'rules/cameraFollow',
          },
        },
      ],
      properties: [],
      actions: [],
      queries: [],
      events: [],
      steps: [],
      requires: [],
    },
  ] as never;

  beforeEach(() => {
    registerProjectRules(rules);
    setProjectRuleMeta(rules);
    // The dropdown offers the traits of the rules IN PLAY, and this asks the
    // same source, so the two cannot disagree about what a value means.
    setProjectRules(['Camera Follow']);
  });

  afterEach(() => {
    registerProjectRules([]);
    setProjectRuleMeta([]);
    setProjectRules([]);
  });

  it('asks for a Viewport’s camera when the trait is a camera’s', () => {
    // `camera of ⟨this actor⟩`, not `this camera`, which generates an
    // identifier nothing binds; the same wherever the block is.
    for (const root of ['world', 'world_actor']) {
      expect(
        subjectShadow(
          inFile(naming('Camera Follow#FollowsTrait', 'world_add_trait'), root),
        ),
      ).toBe('world_camera_of');
    }
  });

  it('still asks for the actor when the trait is an actor’s', () => {
    expect(subjectShadow(naming('Gravity#FallsTrait', 'world_add_trait'))).toBe(
      'world_this_actor',
    );
  });

  it('leaves a trait nothing declares alone', () => {
    // A rule deleted, or a file that outlived one. Guessing would be worse.
    expect(subjectShadow(naming('Nonesuch#GoneTrait', 'world_add_trait'))).toBe(
      'world_this_actor',
    );
  });
});

describe('a member a camera elects', () => {
  it('is about a Viewport’s camera, wherever the block is', () => {
    // `camera of ⟨this actor⟩`: in a Viewport's own placement code that is
    // the Viewport's camera, and elsewhere the learner names one
    // (specs/ONE_WORLD_PLAN.md).
    expect(cameraShadow()).toBe('world_camera_of');
  });
});
