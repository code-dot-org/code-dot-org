// Which subject a block's `ACTOR` socket is about, by where the block sits.
//
// Seeding at creation was not enough. A block made in the palette and dragged
// INTO a `define camera` kept the `this actor` it was born with, so it read as
// being about an actor that is not there — and the learner had to know to swap
// in `this camera` by hand. These pin the decision; the shadow actually
// changing on connect is `reseedShadow`, checked in the browser.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {cameraShadow, inCameraBody, subjectShadow} from '../actorInput';
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

describe('the subject a block is about', () => {
  it('is the actor on its own', () => {
    expect(subjectShadow(within('world_get_Space_PositionProperty'))).toBe(
      'world_this_actor',
    );
  });

  it('is the camera inside a `define camera`', () => {
    // The bug. `this camera` outputs `Actor`, so it fits the same socket, and a
    // camera carries the foundation traits these blocks read.
    expect(
      subjectShadow(
        within('world_get_Space_PositionProperty', 'world_define_camera'),
      ),
    ).toBe('world_this_camera');
  });

  it('reads containment, not what it is merely chained below', () => {
    // `define camera` has a `do` mouth, so `getSurroundParent` is the question —
    // the reason `layerOf` gives for the same choice. A block sitting after the
    // camera in a stack is beside it, not in it, and a chain walk would sweep
    // the rest of the file into the camera.
    const beside = {
      type: 'world_get_Space_PositionProperty',
      getSurroundParent: () => null,
    } as never;

    expect(inCameraBody(beside)).toBe(false);
  });

  it('stops at a handler, which rebinds the subject', () => {
    // A handler inside a camera body is its own scope; a block in one is not
    // the camera's, however far up the camera is.
    expect(
      inCameraBody(
        within(
          'world_get_Space_PositionProperty',
          'world_on_Input_KeyPressedEvent',
          'world_define_camera',
        ),
      ),
    ).toBe(false);
  });

  it('sees a camera further out than the nearest wrapper', () => {
    expect(
      inCameraBody(
        within(
          'world_get_Space_PositionProperty',
          'controls_if',
          'world_define_camera',
        ),
      ),
    ).toBe(true);
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
    // The main camera, not `this camera`: outside a `define camera` body there
    // is no such thing, and `this camera` generates an identifier nothing binds.
    expect(
      naming('Camera Follow#FollowsTrait', 'world_add_trait'),
    ).toBeDefined();
    expect(
      subjectShadow(naming('Camera Follow#FollowsTrait', 'world_add_trait')),
    ).toBe('world_camera');
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

  it('prefers the surrounding camera over the trait', () => {
    // Inside `define camera` the answer is that camera, whatever is named.
    expect(
      subjectShadow(
        naming('Gravity#FallsTrait', 'world_add_trait', 'world_define_camera'),
      ),
    ).toBe('world_this_camera');
  });
});

describe('a member a camera elects', () => {
  it('is about the main camera in a world file', () => {
    // `define camera` is for the SECOND camera, so the common case is a world
    // adjusting the one every world already has.
    expect(cameraShadow(within('world_set_CameraFollow_TargetProperty'))).toBe(
      'world_camera',
    );
  });

  it('is about the camera being defined, inside one', () => {
    expect(
      cameraShadow(
        within('world_set_CameraFollow_TargetProperty', 'world_define_camera'),
      ),
    ).toBe('world_this_camera');
  });
});
