// A Viewport's own cameras, as the map stores them (specs/SPACE_CAMERAS_PLAN.md).
//
// MADE IN THE MAP EDITOR AND NOWHERE ELSE. A camera of a placed Viewport is
// data on that placement — a name, the camera traits it elects, and the
// starting value of each of their properties — and not blocks in the
// placement's code, which a learner reads and may change. One place to make
// a camera, the visual one, and nothing in the code editor to keep in step.
//
// WHAT THE ENGINE NEEDS is still a camera declared in that Viewport's `on
// create`, which is where its space exists. So the compiler makes one: it
// turns each stored camera into the `define camera … for ⟨this actor⟩` a
// learner would have written, under a `when this actor is created` hat, and
// generates THAT beside the placement's own code (`BlocklyGenerator`). The
// blocks exist only while the map is compiled; no editor ever loads them.
//
// Plain JSON in, plain JSON out, so the editor's writes and the compiler's
// reading are tested without a workspace.

/** One property a camera sets, as a camera's inspector edits it. */
export interface CameraValue {
  /** The `set` block's type: `world_set_CameraFollow_ActorToFollowProperty`. */
  setter: string;
  /** `actor`, `number`, `boolean`, `point` or `vector`. */
  type: string;
  /** As the inspector holds it: a kind's path, `x,y`, digits, `true`. */
  value: string;
}

/** A Viewport's camera, as its placement stores it. */
export interface PlacementCamera {
  /** Minted once and kept: what the engine's camera id is made from. */
  id: string;
  /** What the learner calls it, and what `shows through` names. */
  name: string;
  /** The trait values it elects (`Camera Follow#FollowsTrait`). */
  traits: string[];
  values: CameraValue[];
}

/** A serialized block, as much of one as this writes. */
interface Block {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Block; shadow?: Block}>;
  next?: {block?: Block};
}

const parseVector = (text: string): {x: number; y: number} | undefined => {
  const [x, y] = text.split(',').map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? {x, y} : undefined;
};

/** The inputs a property's `set` row holds `value` in, or nothing. */
export function cameraValueInputs(
  type: string,
  value: string,
): Block['inputs'] | undefined {
  if (type === 'actor') {
    return value
      ? {VALUE: {block: {type: 'world_actor_kind', fields: {ACTOR: value}}}}
      : undefined;
  }
  if (type === 'point' || type === 'vector') {
    const held = parseVector(value);
    if (!held) {
      return undefined;
    }
    return type === 'point'
      ? {
          X: {shadow: {type: 'math_number', fields: {NUM: held.x}}},
          Y: {shadow: {type: 'math_number', fields: {NUM: held.y}}},
        }
      : {VALUE: {shadow: {type: 'world_vector', fields: {VECTOR: held}}}};
  }
  if (type === 'boolean') {
    return {
      VALUE: {
        shadow: {
          type: 'logic_boolean',
          fields: {BOOL: value === 'true' ? 'TRUE' : 'FALSE'},
        },
      },
    };
  }
  if (type === 'number') {
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number)
      ? {VALUE: {shadow: {type: 'math_number', fields: {NUM: number}}}}
      : undefined;
  }
  return undefined;
}

/** A chain of blocks, each the next of the one before. */
const chain = (blocks: Block[]): Block | undefined =>
  blocks.reduceRight<Block | undefined>(
    (next, block) => (next ? {...block, next: {block: next}} : block),
    undefined,
  );

/** The `define camera … for ⟨this actor⟩` a stored camera stands for. */
const definitionOf = (camera: PlacementCamera): Block => {
  const mouth = chain([
    ...camera.traits.map(trait => ({
      type: 'world_use_trait',
      fields: {TRAIT: trait},
    })),
    ...camera.values.flatMap(({setter, type, value}) => {
      const inputs = cameraValueInputs(type, value);
      return inputs
        ? [
            {
              type: setter,
              inputs: {ACTOR: {block: {type: 'world_this_camera'}}, ...inputs},
            },
          ]
        : [];
    }),
  ]);
  return {
    type: 'world_define_camera',
    id: camera.id,
    fields: {NAME: camera.name},
    inputs: {
      OWNER: {block: {type: 'world_this_actor'}},
      ...(mouth ? {DO: {block: mouth}} : {}),
    },
  };
};

/**
 * Where the hidden handler sits: above anywhere a learner could put a block.
 *
 * FIRST, AND THAT IS THE POINT. A learner may write a `when this actor is
 * created` of their own that looks through one of these cameras, or aims it;
 * handlers for one event run in the order they were registered, and the
 * compiler registers a workspace's hats top to bottom (`getTopBlocks(true)`).
 * So the cameras are declared before any code of the learner's runs.
 */
const FIRST = {x: 0, y: -1_000_000};

/**
 * A placement's workspace with its stored cameras declared, for the compiler
 * only: one `when this actor is created` hat, before whatever the placement's
 * own code holds, whose rows are the cameras. Identity when it stores none.
 */
export function withCameraHandler(
  state: object | undefined,
  cameras: readonly PlacementCamera[] | undefined,
): object | undefined {
  if (!cameras?.length) {
    return state;
  }
  const document = (state ?? {}) as {
    blocks?: {languageVersion?: number; blocks?: Block[]};
  };
  const handler: Block & typeof FIRST = {
    type: 'world_on_Space_CreatedEvent',
    ...FIRST,
    next: {block: chain(cameras.map(definitionOf))},
  };
  return {
    ...document,
    blocks: {
      languageVersion: 0,
      ...document.blocks,
      blocks: [handler, ...(document.blocks?.blocks ?? [])],
    },
  };
}
