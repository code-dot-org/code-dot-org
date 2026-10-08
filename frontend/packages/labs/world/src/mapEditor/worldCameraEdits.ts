// The world's cameras, edited from the map editor (specs/SPACE_CAMERAS_PLAN.md,
// step 9b and 9c).
//
// A camera is declared in blocks — a `define camera ⟨name⟩` row under `define
// world`, whose mouth elects its traits with `use trait` and sets their
// properties with `set ⟨…⟩ of ⟨this camera⟩` — and the world looks through
// one with a `look through camera` row. These are the edits the Cameras panel
// and a camera's inspector make, as surgery on the world file's JSON, the way
// `worldProperties` edits the rows the World inspector shows. What the blocks
// say and what the panel shows are one thing, read and written in one place.
//
// THE WORLD'S OWN CAMERAS ONLY: a `define camera` under `define world` with
// nothing in its owner socket. A Viewport's are declared in its placement's
// code and stay read-only here.

import {cameraBlockId, cameraValue} from '../blockly/cameras';
import {cameraValueInputs} from '../blockly/placementCameras';

import {vectorText} from './worldProperties';

/** A serialized block, as much of one as these edits touch. */
interface Block {
  type?: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Block; shadow?: Block} | undefined>;
  next?: {block?: Block};
}

interface Document {
  blocks?: {blocks?: Block[]};
}

export const DEFINE_CAMERA = 'world_define_camera';
const USE_CAMERA = 'world_use_camera';
const USE_TRAIT = 'world_use_trait';
const THIS_CAMERA = 'world_this_camera';

/** What the world starts looking through when no row says. */
export const MAIN_CAMERA = 'main';

const parse = (contents: string): Document | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return parsed && typeof parsed === 'object'
      ? (parsed as Document)
      : undefined;
  } catch {
    return undefined;
  }
};

const rootOf = (document: Document | undefined): Block | undefined =>
  document?.blocks?.blocks?.find(block => block?.type === 'world_world');

/** Each row of a chain, with the block whose `next` holds it. */
function* links(head: Block): Generator<{row: Block; previous: Block}> {
  let previous = head;
  for (let row = head.next?.block; row; row = row.next?.block) {
    yield {row, previous};
    previous = row;
  }
}

/** The rows under `define world`. */
const rowsOf = (root: Block): Block[] => [...links(root)].map(({row}) => row);

/** The world's own `define camera` rows: nothing in the owner socket. */
const camerasOf = (root: Block): Block[] =>
  rowsOf(root).filter(
    row => row.type === DEFINE_CAMERA && !row.inputs?.OWNER?.block,
  );

const cameraIn = (root: Block, id: string): Block | undefined =>
  camerasOf(root).find(row => row.id === id);

/** The rows in a camera's `do` mouth. */
function* mouthRows(camera: Block): Generator<Block> {
  for (let at = camera.inputs?.DO?.block; at; at = at.next?.block) {
    yield at;
  }
}

/**
 * Parse, hand the root to `change`, and write the whole document back — or
 * hand the contents back untouched when `change` found nothing to do.
 */
function rewrite(contents: string, change: (root: Block) => boolean): string {
  const document = parse(contents);
  const root = rootOf(document);
  if (!document || !root || !change(root)) {
    return contents;
  }
  return JSON.stringify(document, null, 2);
}

/** Append `row` to the end of the world's rows. */
const appendRow = (root: Block, row: Block) => {
  let last = root;
  while (last.next?.block) {
    last = last.next.block;
  }
  last.next = {block: row};
};

// ── Reading ───────────────────────────────────────────────────────────────

/** One property of a camera trait, as a camera's inspector edits it. */
export interface CameraProperty {
  /** The `set` block's type, which is how a row is found. */
  setter: string;
  name: string;
  /** `actor`, `number`, `boolean`, `point` or `vector`. */
  type: string;
}

/**
 * Which camera the world starts looking through: the block id of the camera
 * its first `look through camera` row names, or `MAIN_CAMERA`.
 */
export function startingCamera(contents: string): string {
  const root = rootOf(parse(contents));
  const row = root && rowsOf(root).find(each => each.type === USE_CAMERA);
  const value = String(row?.fields?.CAMERA ?? '');
  return cameraBlockId(value) || MAIN_CAMERA;
}

/** The trait values a camera's mouth elects (`Camera Follow#FollowsTrait`). */
export function cameraTraitValues(contents: string, id: string): string[] {
  const root = rootOf(parse(contents));
  const camera = root && cameraIn(root, id);
  return camera
    ? [...mouthRows(camera)]
        .filter(row => row.type === USE_TRAIT)
        .map(row => String(row.fields?.TRAIT ?? ''))
        .filter(Boolean)
    : [];
}

/**
 * What a camera sets one property to, as text: a kind's module path for an
 * actor, `x,y` for a point or a vector, the digits or `true`/`false` for the
 * rest. Nothing when no row sets it, or a row sets it to something a field
 * cannot show.
 */
export function cameraPropertyValue(
  contents: string,
  id: string,
  property: CameraProperty,
): string | undefined {
  const root = rootOf(parse(contents));
  const camera = root && cameraIn(root, id);
  const row =
    camera &&
    [...mouthRows(camera)].find(each => each.type === property.setter);
  return row ? literalOf(row, property.type) : undefined;
}

const held = (row: Block, name: string): Block | undefined =>
  row.inputs?.[name]?.block ?? row.inputs?.[name]?.shadow;

const literalOf = (row: Block, type: string): string | undefined => {
  if (type === 'point') {
    const x = held(row, 'X');
    const y = held(row, 'Y');
    return x?.type === 'math_number' && y?.type === 'math_number'
      ? vectorText({x: Number(x.fields?.NUM), y: Number(y.fields?.NUM)})
      : undefined;
  }
  const value = held(row, 'VALUE');
  if (!value) {
    return undefined;
  }
  if (type === 'actor') {
    return value.type === 'world_actor_kind'
      ? String(value.fields?.ACTOR ?? '') || undefined
      : undefined;
  }
  if (value.type === 'math_number') {
    return String(value.fields?.NUM ?? '');
  }
  if (value.type === 'logic_boolean') {
    return String(value.fields?.BOOL).toUpperCase() === 'TRUE'
      ? 'true'
      : 'false';
  }
  if (value.type === 'world_vector') {
    const vector = value.fields?.VECTOR as {x?: unknown; y?: unknown};
    return vectorText({x: Number(vector?.x), y: Number(vector?.y)});
  }
  return undefined;
};

// ── Writing ───────────────────────────────────────────────────────────────

/** A block id no other block in the file has. */
const freshId = (contents: string): string => {
  for (;;) {
    const id = `camera-${Math.random().toString(36).slice(2, 10)}`;
    if (!contents.includes(id)) {
      return id;
    }
  }
};

/**
 * The file with a new camera at the end of the world's rows, and its id.
 *
 * At the END, because a camera is usually told to follow something, and
 * what it follows has to have been placed by the time the row runs.
 */
export function addWorldCamera(
  contents: string,
  name: string,
): {contents: string; id: string | undefined} {
  const id = freshId(contents);
  const written = rewrite(contents, root => {
    appendRow(root, {type: DEFINE_CAMERA, id, fields: {NAME: name}});
    return true;
  });
  return {contents: written, id: written === contents ? undefined : id};
}

/**
 * The file without a camera, and without any `look through camera` row that
 * named it: the world goes back to its main camera.
 */
export function removeWorldCamera(contents: string, id: string): string {
  return rewrite(contents, root => {
    let removed = false;
    for (const {row, previous} of [...links(root)].reverse()) {
      const names =
        (row.type === DEFINE_CAMERA && row.id === id) ||
        (row.type === USE_CAMERA &&
          cameraBlockId(String(row.fields?.CAMERA ?? '')) === id);
      if (names) {
        previous.next = row.next;
        removed = true;
      }
    }
    return removed;
  });
}

/** The file with a camera renamed. */
export function renameWorldCamera(
  contents: string,
  id: string,
  name: string,
): string {
  return rewrite(contents, root => {
    const camera = cameraIn(root, id);
    if (!camera) {
      return false;
    }
    camera.fields = {...camera.fields, NAME: name};
    return true;
  });
}

/**
 * The file with the world starting through `id`, or its main camera.
 *
 * Every `look through camera` row under `define world` goes, and for a
 * camera other than the main one a single row is added at the end, after
 * the camera it names is defined.
 */
export function setStartingCamera(contents: string, id: string): string {
  return rewrite(contents, root => {
    for (const {row, previous} of [...links(root)].reverse()) {
      if (row.type === USE_CAMERA) {
        previous.next = row.next;
      }
    }
    if (id !== MAIN_CAMERA && cameraIn(root, id)) {
      appendRow(root, {type: USE_CAMERA, fields: {CAMERA: cameraValue(id)}});
    }
    return true;
  });
}

/**
 * The file with a camera electing a trait, or no longer electing it.
 *
 * Elected at the TOP of the mouth, before the rows that set the trait's
 * properties, as a camera written in blocks reads.
 */
export function setCameraTrait(
  contents: string,
  id: string,
  trait: string,
  elected: boolean,
): string {
  return rewrite(contents, root => {
    const camera = cameraIn(root, id);
    if (!camera) {
      return false;
    }
    const has = [...mouthRows(camera)].some(
      row => row.type === USE_TRAIT && row.fields?.TRAIT === trait,
    );
    if (has === elected) {
      return false;
    }
    if (elected) {
      const first = camera.inputs?.DO?.block;
      camera.inputs = {
        ...camera.inputs,
        DO: {
          block: {
            type: USE_TRAIT,
            fields: {TRAIT: trait},
            ...(first ? {next: {block: first}} : {}),
          },
        },
      };
      return true;
    }
    const head: Block = {next: {block: camera.inputs?.DO?.block}};
    for (const {row, previous} of [...links(head)].reverse()) {
      if (row.type === USE_TRAIT && row.fields?.TRAIT === trait) {
        previous.next = row.next;
      }
    }
    const rest = head.next?.block;
    const inputs = {...camera.inputs};
    if (rest) {
      inputs.DO = {block: rest};
    } else {
      delete inputs.DO;
    }
    camera.inputs = inputs;
    return true;
  });
}

/**
 * The file with a camera setting one property to `value`, in the text
 * `cameraPropertyValue` reads. The row that sets it is rewritten, or added
 * at the end of the camera's mouth; an empty value for an actor takes the
 * row away, which leaves the camera following nobody.
 */
export function setCameraProperty(
  contents: string,
  id: string,
  property: CameraProperty,
  value: string,
): string {
  return rewrite(contents, root => {
    const camera = cameraIn(root, id);
    if (!camera) {
      return false;
    }
    const inputs = cameraValueInputs(property.type, value);
    const head: Block = {next: {block: camera.inputs?.DO?.block}};
    const found = [...links(head)].find(
      ({row}) => row.type === property.setter,
    );
    if (!inputs) {
      if (property.type !== 'actor' || value || !found) {
        return false;
      }
      found.previous.next = found.row.next;
      camera.inputs = {...camera.inputs, DO: {block: head.next?.block}};
      if (!head.next?.block) {
        const rest = {...camera.inputs};
        delete rest.DO;
        camera.inputs = rest;
      }
      return true;
    }
    const subject = {ACTOR: {block: {type: THIS_CAMERA}}};
    if (found) {
      found.row.inputs = {...found.row.inputs, ...subject, ...inputs};
      return true;
    }
    let last = head;
    while (last.next?.block) {
      last = last.next.block;
    }
    last.next = {
      block: {type: property.setter, inputs: {...subject, ...inputs}},
    };
    camera.inputs = {...camera.inputs, DO: {block: head.next?.block}};
    return true;
  });
}
