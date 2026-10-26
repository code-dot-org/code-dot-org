// A Viewport's own cameras, as the map stores them (specs/SPACE_CAMERAS_PLAN.md).
//
// MADE IN THE MAP EDITOR AND NOWHERE ELSE. A camera of a placed Viewport is
// data on that placement — a name, the camera traits it elects, and the
// starting value of each of their properties — and not blocks in the
// placement's code, which a learner reads and may change. One place to make
// a camera, the visual one, and nothing in the code editor to keep in step.
//
// WHAT THE ENGINE NEEDS is still a camera declared for that Viewport. So the
// compiler makes one: it turns each stored camera into the `define camera …
// for ⟨this actor⟩` a learner would have written, and generates THAT at the
// head of the placement's own code (`BlocklyGenerator`), which runs as the
// map loads — after the Viewport's own map is in it, and before the first
// tick (`World.loadMap`). The blocks exist only while the map is compiled; no
// editor ever loads them.
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

/** A `set` row for each value, about `subject`: `this camera`, or the main one. */
const settingRows = (values: readonly CameraValue[], subject: Block): Block[] =>
  values.flatMap(({setter, type, value}) => {
    const inputs = cameraValueInputs(type, value);
    return inputs
      ? [{type: setter, inputs: {ACTOR: {block: subject}, ...inputs}}]
      : [];
  });

/**
 * The `define camera` a stored camera stands for: `for ⟨this actor⟩` for a
 * Viewport's, and for nobody — the world — for the world's own.
 */
const definitionOf = (
  camera: PlacementCamera,
  owner: 'this actor' | 'world' = 'this actor',
): Block => {
  const mouth = chain([
    ...camera.traits.map(trait => ({
      type: 'world_use_trait',
      fields: {TRAIT: trait},
    })),
    ...settingRows(camera.values, {type: 'world_this_camera'}),
  ]);
  return {
    type: 'world_define_camera',
    id: camera.id,
    fields: {NAME: camera.name},
    inputs: {
      ...(owner === 'this actor'
        ? {OWNER: {block: {type: 'world_this_actor'}}}
        : {}),
      ...(mouth ? {DO: {block: mouth}} : {}),
    },
  };
};

/**
 * Where the declarations sit: above anywhere a learner could put a block.
 *
 * FIRST, so they are generated first (`getTopBlocks(true)` goes top to
 * bottom). They run as the map loads, before any handler of the learner's
 * could — a `when this actor is created` that looks through one of these
 * cameras finds it there.
 */
const FIRST = {x: 0, y: -1_000_000};

/**
 * A placement's workspace with its stored cameras declared, for the compiler
 * only: one stack of `define camera` rows, before whatever the placement's own
 * code holds, run where the placement's code runs. Identity when it stores
 * none.
 *
 * NOT UNDER A HAT. Under `when this actor is created` the cameras did not
 * exist until the first tick's handlers ran, so a Viewport looked through its
 * main camera for that tick and its chosen one followed nothing until the
 * next (specs/SCREEN_MAP_PLAN.md, step three).
 */
export function withCameraDeclarations(
  state: object | undefined,
  cameras: readonly PlacementCamera[] | undefined,
): object | undefined {
  if (!cameras?.length) {
    return state;
  }
  const document = (state ?? {}) as {
    blocks?: {languageVersion?: number; blocks?: Block[]};
  };
  const declarations: Block & typeof FIRST = {
    ...chain(cameras.map(camera => definitionOf(camera)))!,
    ...FIRST,
  };
  return {
    ...document,
    blocks: {
      languageVersion: 0,
      ...document.blocks,
      blocks: [declarations, ...(document.blocks?.blocks ?? [])],
    },
  };
}

/** What the world's MAIN camera is given: traits, and their values. */
export interface MainCameraSettings {
  traits: string[];
  values: CameraValue[];
}

/** A world's main map, as far as its cameras are stored on it. */
interface StoredWorldCameras {
  /**
   * The camera every world has, which no `define camera` declares: given
   * its traits with `add trait ⟨…⟩ to ⟨camera main⟩` once the world exists.
   */
  mainCamera?: MainCameraSettings;
  cameras?: PlacementCamera[];
  /** `main` or `camera:<block id>`, as `look through camera` names one. */
  startingCamera?: string;
}

/**
 * A world's file with its stored cameras declared, for the compiler only:
 * the world's own cameras live on its main map (`mapModel`), and become rows
 * at the END of `define world`'s rows here — the main camera's traits and
 * values first, then a `define camera` for each other one, then a `look
 * through camera` for the one it starts with.
 *
 * AT THE END, because a camera is usually told to follow something, and
 * `any ⟨Bird⟩` is read when its row runs: after a `load map` row, the birds
 * are there. The main map is placed before any row runs, so its placements
 * are there either way. Identity when the map stores nothing.
 */
export function withWorldCameras(state: object): object {
  const document = state as {
    blocks?: {blocks?: Block[]};
    map?: StoredWorldCameras;
  };
  const cameras = document.map?.cameras ?? [];
  const starting = document.map?.startingCamera;
  const main = document.map?.mainCamera;
  const root = document.blocks?.blocks?.find(
    block => block.type === 'world_world',
  );
  if (
    !root ||
    (!cameras.length &&
      !starting &&
      !main?.traits.length &&
      !main?.values.length)
  ) {
    return state;
  }
  // The main camera as `camera ⟨main⟩` names it.
  const mainCamera = (): Block => ({
    type: 'world_camera',
    fields: {CAMERA: 'main'},
  });
  const rows = chain([
    ...(main?.traits ?? []).map(trait => ({
      type: 'world_add_camera_trait',
      fields: {TRAIT: trait},
      inputs: {ACTOR: {block: mainCamera()}},
    })),
    ...settingRows(main?.values ?? [], mainCamera()),
    ...cameras.map(camera => definitionOf(camera, 'world')),
    ...(starting
      ? [{type: 'world_use_camera', fields: {CAMERA: starting}}]
      : []),
  ]);
  const appended = (block: Block): Block =>
    block.next?.block
      ? {...block, next: {block: appended(block.next.block)}}
      : {...block, next: {block: rows!}};
  return {
    ...document,
    blocks: {
      ...document.blocks,
      blocks: document.blocks!.blocks!.map(block =>
        block === root ? appended(root) : block,
      ),
    },
  };
}
