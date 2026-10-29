// A Viewport's camera, as the map stores it (specs/SPACE_CAMERAS_PLAN.md,
// specs/ONE_WORLD_PLAN.md).
//
// MADE IN THE MAP EDITOR AND NOWHERE ELSE. A Viewport has one camera, and what
// it elects is data on the Viewport's placement — the camera traits, the
// starting value of each of their properties, and its zoom — and not blocks in
// the placement's code, which a learner reads and may change. One place to set
// a camera up, the visual one, and nothing in the code editor to keep in step.
//
// WHAT THE ENGINE NEEDS is still a call. So the compiler writes a
// `setViewportCamera` at the head of the placement's own code
// (`BlocklyGenerator`), which runs as the screen loads — after the World has
// its map, and before the first tick. The values the camera starts with are
// `set` rows on `this camera`, made here and generated inside that call; no
// editor loads them.
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
  /** The trait values it elects (`Camera Follow#FollowsTrait`). */
  traits: string[];
  values: CameraValue[];
  /** How much it magnifies; absent is 1 (`Camera.zoom`). */
  zoom?: number;
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

/** The id of the stack that holds the camera's `set` rows while it compiles. */
export const CAMERA_SETTINGS_ID = 'camera_settings';

/** A `set` row for each value, about `this camera`, or nothing for none. */
const settingsOf = (camera: PlacementCamera): Block | undefined =>
  chain(
    camera.values.flatMap(({setter, type, value}) => {
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
  );

/**
 * A placement's workspace with its camera's `set` rows beside it, for the
 * compiler only: one stack under no hat, which the compiler generates inside
 * the `setViewportCamera` it writes (`BlocklyGenerator`) rather than as code
 * of the placement's own. Identity when the camera sets nothing.
 */
export function withCameraSettings(
  state: object | undefined,
  camera: PlacementCamera | undefined,
): object | undefined {
  const settings = camera ? settingsOf(camera) : undefined;
  const stacks = settings
    ? [{...settings, id: CAMERA_SETTINGS_ID, x: 0, y: 0}]
    : [];
  if (!stacks.length) {
    return state;
  }
  const document = (state ?? {}) as {
    blocks?: {languageVersion?: number; blocks?: Block[]};
  };
  return {
    ...document,
    blocks: {
      languageVersion: 0,
      ...document.blocks,
      blocks: [...stacks, ...(document.blocks?.blocks ?? [])],
    },
  };
}
