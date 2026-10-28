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
    ? {holdsCodeOf: 'world', getTopBlocks: () => []}
    : {getTopBlocks: () => [{type: root}]};

/** The fake block, in the game's code or an actor's file. */
const inFile = (block: never, root: string): never =>
  ({...(block as object), workspace: fileOf(root)}) as never;

/** The fake block in a FLYOUT, over the same. */
const inFlyoutOf = (block: never, root: string): never =>
  ({
    ...(block as object),
    workspace: {isFlyout: true, targetWorkspace: fileOf(root)},
  }) as never;

describe('the subject a block is about', () => {
  it('is the actor on its own', () => {
    expect(subjectShadow(within('world_get_Space_PositionProperty'))).toBe(
      'world_this_actor',
    );
  });
});

// `add trait ⟨…⟩ to ⟨…⟩` names a trait from anywhere, so what decides whose
// socket this is is the TRAIT, not the surroundings. A camera trait given to
// `this actor` reads fine and does nothing, and the fix was to drag the main
// camera in every single time.
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

  it('asks for the main camera when the trait is a camera’s', () => {
    // The main camera, not `this camera`, which generates an identifier
    // nothing binds.
    expect(
      naming('Camera Follow#FollowsTrait', 'world_add_trait'),
    ).toBeDefined();
    expect(
      subjectShadow(
        inFile(
          naming('Camera Follow#FollowsTrait', 'world_add_trait'),
          'world',
        ),
      ),
    ).toBe('world_camera');
    // …and the actor itself in an actor's file, where the only kind offered a
    // camera trait is one that shows a map and owns its camera's traits
    // (specs/SPACE_CAMERAS_PLAN.md, "simplifying").
    expect(
      subjectShadow(
        inFile(
          naming('Camera Follow#FollowsTrait', 'world_add_trait'),
          'world_actor',
        ),
      ),
    ).toBe('world_this_actor');
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
  it('is about the main camera in the game’s own code', () => {
    expect(
      cameraShadow(
        inFile(within('world_set_CameraFollow_TargetProperty'), 'world'),
      ),
    ).toBe('world_camera');
  });

  it('is about the actor itself in an actor’s or a placement’s file', () => {
    // A Viewport's camera traits are its own, so `set actor to follow of
    // ⟨this actor⟩` in its `on create` is the whole of how a minimap follows
    // the Pilot. Seeded with the world's main camera, the row read as a
    // sentence about the wrong camera and did nothing — and the first person
    // to write it had to know to drop `this actor` over the shadow.
    expect(
      cameraShadow(
        inFile(within('world_set_CameraFollow_TargetProperty'), 'world_actor'),
      ),
    ).toBe('world_this_actor');
  });

  it('looks through the flyout to the file the block will land in', () => {
    // A block in the palette belongs to the flyout's workspace, which defines
    // nothing; the question is about the file behind it.
    expect(
      cameraShadow(
        inFlyoutOf(within('world_set_CameraFollow_TargetProperty'), 'world'),
      ),
    ).toBe('world_camera');
    expect(
      cameraShadow(
        inFlyoutOf(
          within('world_set_CameraFollow_TargetProperty'),
          'world_actor',
        ),
      ),
    ).toBe('world_this_actor');
  });
});
