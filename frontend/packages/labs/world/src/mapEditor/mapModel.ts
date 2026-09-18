// What a map is, as data.
//
// A map is a list of placements — an actor type, an instance id, and whatever
// per-instance property overrides that instance carries. The editors read and
// write this shape; the engine reads the same one (`WorldBuilder.loadMap`), and
// a `.map` file is it, serialized.
//
// Split out of `MapEditor` when the canvas grew a second caller: the `.map` file
// editor holds a document, and the `create actor in map` popup holds one
// synthesized from a block's own placements (MAPS.md §2). Both need these types
// and these accessors; neither should own them.

import type {BlocklySerialization} from '@code-dot-org/blockly';

import {TILE_SIZE, VIEWPORT_TILES} from '../runtime/viewport';

/** The grid a placement snaps to, in world pixels. */
export const DEFAULT_TILE = TILE_SIZE;

/**
 * How big a map is, in TILES — the region the editor draws and fits to.
 *
 * Distinct from {@link Tile}, which is how big ONE tile is in world pixels.
 * The two multiply to the map's extent ({@link extentOf}).
 *
 * A map used to be exactly the viewport, ten tiles each way, because that was
 * the only size anything had (runtime/viewport). A map may now be any size the
 * author says — but the GAME still runs at the fixed viewport, so a map bigger
 * than it has actors the player will not see. That is the editor's business to
 * make visible, not this file's.
 */
export interface MapSize {
  width: number;
  height: number;
}

/** What a map is when it does not say — the viewport, as every map was. */
export const DEFAULT_MAP_SIZE: MapSize = {
  width: VIEWPORT_TILES,
  height: VIEWPORT_TILES,
};

/**
 * Bounds on a map's dimensions, in tiles.
 *
 * One tile is the smallest thing that is still a map. The upper bound is not a
 * limit anyone should reach — it is there because the grid is drawn a line per
 * tile, and a map sized from a typo (a pasted `100000`) would hang the canvas
 * rather than look wrong.
 */
export const MIN_MAP_TILES = 1;
export const MAX_MAP_TILES = 200;

export interface Tile {
  width: number;
  height: number;
}
export interface Vec {
  x: number;
  y: number;
}
export interface Placement {
  type: string;
  id: string;
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
  /**
   * What this one placed instance does: a whole workspace serialization, the
   * shape an actor file holds, or nothing (specs/MAP_FIRST.md, "The file").
   */
  blocks?: WorkspaceState;
  /** The layer it is on, by id; absent, the default (specs/LAYERS_PLAN.md). */
  layer?: string;
}

/** The id of the layer every map has, and an unlayered placement is on. */
export const DEFAULT_LAYER = 'main';

/** One of a layer's two images: which, how it fills, where it sits. */
export interface MapSlotDoc {
  /** The image's file name in `backgrounds/` — `sky.png`. */
  sprite?: string;
  /** Tiled across the map rather than stretched over it. */
  repeat?: boolean;
  offset?: Vec;
}

/**
 * A layer as the map states it (specs/LAYERS_PLAN.md): back to front in the
 * document's list, which is draw order. The id is minted and never changes,
 * so a placement's `layer` survives a rename; the name is the learner's.
 */
export interface MapLayerDoc {
  id: string;
  name?: string;
  /** How much of the camera's motion it takes, per axis; `(1, 1)` unless said. */
  parallax?: Vec;
  /** Fixed to the screen: it does not consult the camera at all. */
  fit?: boolean;
  background?: MapSlotDoc;
  foreground?: MapSlotDoc;
}

/**
 * The map's layers, back to front, with the default among them — at the
 * back when the document did not place it, which is where the engine puts
 * it (`layersOfMap`).
 */
export const layersOf = (doc: MapDoc): MapLayerDoc[] => {
  const stated = doc.layers ?? [];
  return stated.some(layer => layer.id === DEFAULT_LAYER)
    ? stated
    : [{id: DEFAULT_LAYER}, ...stated];
};

/** What a layer is called: its name, or for the default, "Main". */
export const layerName = (layer: MapLayerDoc): string =>
  layer.name?.trim() || (layer.id === DEFAULT_LAYER ? 'Main' : layer.id);

/** The layer a placement is on. */
export const layerOfPlacement = (placement: Placement): string =>
  placement.layer ?? DEFAULT_LAYER;

/** A new layer in front of the rest, and its id: the lowest `layerN` free. */
export function addLayer(doc: MapDoc): {doc: MapDoc; id: string} {
  const layers = layersOf(doc);
  const taken = new Set(layers.map(layer => layer.id));
  let n = 1;
  while (taken.has(`layer${n}`)) {
    n++;
  }
  const id = `layer${n}`;
  return {doc: {...doc, layers: [...layers, {id, name: `Layer ${n}`}]}, id};
}

/**
 * The map without a layer; what was on it falls back to the default, which
 * is the one layer that cannot be removed.
 */
export function removeLayer(doc: MapDoc, id: string): MapDoc {
  if (id === DEFAULT_LAYER) {
    return doc;
  }
  return {
    ...doc,
    layers: layersOf(doc).filter(layer => layer.id !== id),
    actors: doc.actors.map(actor =>
      actor.layer === id ? withPlacementLayer(actor, DEFAULT_LAYER) : actor,
    ),
  };
}

/** The map with a layer one place nearer the front (+1) or the back (−1). */
export function moveLayer(doc: MapDoc, id: string, by: 1 | -1): MapDoc {
  const layers = [...layersOf(doc)];
  const at = layers.findIndex(layer => layer.id === id);
  const to = at + by;
  if (at < 0 || to < 0 || to >= layers.length) {
    return doc;
  }
  [layers[at], layers[to]] = [layers[to], layers[at]];
  return {...doc, layers};
}

/** The map with one layer's own values changed. */
export function withLayer(
  doc: MapDoc,
  id: string,
  change: Partial<Omit<MapLayerDoc, 'id'>>,
): MapDoc {
  return {
    ...doc,
    layers: layersOf(doc).map(layer =>
      layer.id === id ? {...layer, ...change} : layer,
    ),
  };
}

/** The map with one slot of one layer changed; an empty slot is dropped. */
export function withSlot(
  doc: MapDoc,
  id: string,
  which: 'background' | 'foreground',
  change: Partial<MapSlotDoc>,
): MapDoc {
  const layer = layersOf(doc).find(held => held.id === id);
  const next: MapSlotDoc = {...layer?.[which], ...change};
  if (!next.sprite) {
    delete next.sprite;
  }
  const empty =
    !next.sprite && !next.repeat && !(next.offset?.x || next.offset?.y);
  return withLayer(doc, id, {[which]: empty ? undefined : next});
}

/** A placement on a layer; the default is said by saying nothing. */
export function withPlacementLayer(
  placement: Placement,
  id: string,
): Placement {
  const rest: Placement = {...placement};
  delete rest.layer;
  return id === DEFAULT_LAYER ? rest : {...rest, layer: id};
}

/**
 * The placements in the order they are drawn: by their layer's depth, then
 * as the document lists them — what the engine does, since a layer is a
 * container and placement order is draw order within one.
 */
export function drawOrder(doc: MapDoc): Placement[] {
  const depth = new Map(layersOf(doc).map((layer, index) => [layer.id, index]));
  return doc.actors
    .map((actor, index) => ({actor, index}))
    .sort(
      (a, b) =>
        (depth.get(layerOfPlacement(a.actor)) ?? 0) -
          (depth.get(layerOfPlacement(b.actor)) ?? 0) || a.index - b.index,
    )
    .map(({actor}) => actor);
}

/** A Blockly workspace as serialized — `{blocks: {blocks: […]}, …}`. */
export type WorkspaceState = BlocklySerialization;

/** Whether a stored workspace holds anything at all. */
export const hasScript = (state: WorkspaceState | undefined): boolean =>
  Boolean(state?.blocks?.blocks?.length);

/**
 * The document with every `the ⟨from⟩` renamed to `the ⟨to⟩`, in every
 * placement's workspace and the map's own.
 *
 * A rename in the inspector would otherwise leave the blocks that name the
 * placement pointing at a name no entry has (specs/MAP_FIRST.md, "Two
 * edges"). The walk is over the serialization as data — a `world_placement`
 * block is `{type, fields: {NAME}}` wherever it sits — so it needs no
 * workspace. Untouched objects are returned as they were, so a map with no
 * such block is the same map.
 */
export function renamePlacementReferences(
  doc: MapDoc,
  from: string,
  to: string,
): MapDoc {
  const rename = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(rename);
    }
    if (!value || typeof value !== 'object') {
      return value;
    }
    const record = value as Record<string, unknown>;
    const fields = record.fields as Record<string, unknown> | undefined;
    const renamed: Record<string, unknown> = {};
    for (const [key, held] of Object.entries(record)) {
      renamed[key] = rename(held);
    }
    if (record.type === 'world_placement' && fields?.NAME === from) {
      renamed.fields = {...fields, NAME: to};
    }
    return renamed;
  };
  return {
    ...doc,
    ...(doc.blocks ? {blocks: rename(doc.blocks) as WorkspaceState} : {}),
    actors: doc.actors.map(actor =>
      actor.blocks
        ? {...actor, blocks: rename(actor.blocks) as WorkspaceState}
        : actor,
    ),
  };
}
/** An actor's resolved transform, with engine defaults (scale 1, rotation 0). */
export interface Transform {
  pos: Vec;
  scale: Vec;
  rotation: number;
  /** Vertical skew in degrees — a shear about the actor's center (0 = none). */
  skew: number;
}
export interface MapDoc {
  type: 'map';
  /** How many tiles across and down (see {@link MapSize}). */
  size: MapSize;
  tile: Tile;
  actors: Placement[];
  /** The map's own workspace: its events and the map hats, or nothing. */
  blocks?: WorkspaceState;
  /** The map's layers, back to front; absent, the one default. */
  layers?: MapLayerDoc[];
}
/** The camera: screen_px = world * scale + offset (offset in CSS pixels). */
export interface View {
  scale: number;
  x: number;
  y: number;
}
export interface Size {
  w: number;
  h: number;
}

/**
 * A tile count that can be drawn: a whole number within the bounds.
 *
 * Applied on the way IN rather than trusted, because the value has been through
 * a text file — a hand-edited `.map`, a half-typed number in the editor's own
 * field. `NaN` reaches this from `Number('')`, and `NaN` tiles is a grid loop
 * that never terminates.
 */
export const clampTiles = (value: unknown): number | undefined => {
  // Ahead of `Number`, which answers 0 for all three of these — so a field the
  // author has just cleared to type into would read as a size, and the map
  // would collapse to one tile between two keystrokes.
  if (value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) {
    return undefined;
  }
  return Math.max(MIN_MAP_TILES, Math.min(MAX_MAP_TILES, n));
};

export function parseMap(contents: string): MapDoc {
  if (!contents.trim()) {
    return mapFromRaw({});
  }
  try {
    return mapFromRaw(JSON.parse(contents) as Partial<MapDoc>);
  } catch {
    return mapFromRaw({});
  }
}

/** A map from whatever was stored, with defaults for what was not. */
export function mapFromRaw(raw: Partial<MapDoc>): MapDoc {
  return {
    type: 'map',
    // A map written before maps had a size is the size every map was.
    size: {
      width: clampTiles(raw.size?.width) ?? DEFAULT_MAP_SIZE.width,
      height: clampTiles(raw.size?.height) ?? DEFAULT_MAP_SIZE.height,
    },
    tile: {
      width: raw.tile?.width ?? DEFAULT_TILE,
      height: raw.tile?.height ?? DEFAULT_TILE,
    },
    actors: Array.isArray(raw.actors) ? raw.actors : [],
    ...(raw.blocks ? {blocks: raw.blocks} : {}),
    ...(Array.isArray(raw.layers) && raw.layers.length
      ? {
          layers: raw.layers.filter(
            layer => layer && typeof layer.id === 'string',
          ),
        }
      : {}),
  };
}

/** A map's extent in world pixels — its tile counts times its tile size. */
export const extentOf = (map: MapDoc): Size => ({
  w: map.size.width * map.tile.width,
  h: map.size.height * map.tile.height,
});

// Overrides arrive as `unknown` (the generic property bag); coerce to what the
// canvas needs, falling back when a value is absent or malformed.
export const asVec = (v: unknown): Vec | undefined =>
  v && typeof (v as Vec).x === 'number' && typeof (v as Vec).y === 'number'
    ? {x: (v as Vec).x, y: (v as Vec).y}
    : undefined;
export const asNum = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined;

/** Read a placement's override for `owner.prop` (undefined if unset). */
export const propValue = (
  actor: Placement,
  ownerId: string,
  propId: string,
): unknown => actor.properties?.[ownerId]?.[propId];

export const positionOf = (actor: Placement): Vec | undefined =>
  asVec(propValue(actor, 'positional', 'position'));

/**
 * Resolve an actor's transform, filling the defaults.
 *
 * THE KIND'S SCALE IS A DEFAULT, not one. A placement stores only what it
 * OVERRIDES, so an actor whose file says `set scale of this to x 1 y 2` has
 * nothing under `positional.scale` here — and filling in one, which is what
 * this did, drew every such actor as though it had never been scaled. It is
 * the engine's default for an actor that sets none, not for one that sets its
 * own (`engine/core/World.scaleOf`).
 *
 * An override still wins outright, because that is what it does in the game:
 * setting the property replaces the value rather than multiplying it.
 */
export const transformOf = (actor: Placement, kindScale?: Vec): Transform => ({
  pos: asVec(propValue(actor, 'positional', 'position')) ?? {x: 0, y: 0},
  scale: asVec(propValue(actor, 'positional', 'scale')) ??
    kindScale ?? {x: 1, y: 1},
  rotation: asNum(propValue(actor, 'positional', 'rotation')) ?? 0,
  skew: asNum(propValue(actor, 'positional', 'skew')) ?? 0,
});

// ── Parenting (specs/PARENTING.md) ──────────────────────────────────────────
//
// A placement's stored `position`, `rotation` and `scale` are in its PARENT'S
// frame when it has one — the same slot the engine keeps local values in —
// and its place on the canvas is worked out through the chain of parents,
// exactly as the engine works out the world position. So dragging a parent
// moves its children, because nothing about the children changed; and a child
// dragged is stored back in its parent's frame.

/** The id of the placement this one is carried by, if any. */
export const parentIdOf = (actor: Placement): string | undefined => {
  const value = propValue(actor, 'positional', 'parent');
  return typeof value === 'string' && value !== '' ? value : undefined;
};

const DEG = Math.PI / 180;

/** A component-wise division that answers 0 where the parent's scale is 0. */
const unscale = (v: Vec, by: Vec): Vec => ({
  x: by.x === 0 ? 0 : v.x / by.x,
  y: by.y === 0 ? 0 : v.y / by.y,
});

/**
 * A child's world transform from its parent's and its local one — the
 * engine's `compose` (`core/parenting`), over the editor's own shapes.
 * Skew is the child's own and is not composed.
 */
export const composeTransforms = (
  parent: Transform,
  local: Transform,
): Transform => {
  const scaled = {
    x: local.pos.x * parent.scale.x,
    y: local.pos.y * parent.scale.y,
  };
  const cos = Math.cos(parent.rotation * DEG);
  const sin = Math.sin(parent.rotation * DEG);
  return {
    pos: {
      x: parent.pos.x + scaled.x * cos - scaled.y * sin,
      y: parent.pos.y + scaled.x * sin + scaled.y * cos,
    },
    scale: {
      x: parent.scale.x * local.scale.x,
      y: parent.scale.y * local.scale.y,
    },
    rotation: parent.rotation + local.rotation,
    skew: local.skew,
  };
};

/** The local position that puts a child at `world` under `parent`. */
export const toLocalPosition = (world: Vec, parent: Transform): Vec => {
  const dx = world.x - parent.pos.x;
  const dy = world.y - parent.pos.y;
  const cos = Math.cos(-parent.rotation * DEG);
  const sin = Math.sin(-parent.rotation * DEG);
  return unscale(
    {x: dx * cos - dy * sin, y: dx * sin + dy * cos},
    parent.scale,
  );
};

/**
 * Where a placement is on the canvas: its own transform composed onto its
 * parent's, all the way up. A root's is its own; a parent the map does not
 * hold, or a cycle, ends the chain where it is rather than nowhere.
 */
export function worldTransformOf(
  actor: Placement,
  actors: readonly Placement[],
  scales?: Record<string, Vec>,
  seen: ReadonlySet<string> = new Set(),
): Transform {
  const local = transformOf(actor, scales?.[actor.type]);
  const parentId = parentIdOf(actor);
  if (!parentId || seen.has(actor.id)) {
    return local;
  }
  const parent = actors.find(other => other.id === parentId);
  if (!parent) {
    return local;
  }
  return composeTransforms(
    worldTransformOf(parent, actors, scales, new Set([...seen, actor.id])),
    local,
  );
}

/** Whether `candidate` is `actor` or is carried, at any depth, by it. */
export const isCarriedBy = (
  candidate: Placement,
  actor: Placement,
  actors: readonly Placement[],
): boolean => {
  const seen = new Set<string>();
  for (
    let at: Placement | undefined = candidate;
    at && !seen.has(at.id);
    at = actors.find(other => other.id === parentIdOf(at!))
  ) {
    if (at.id === actor.id) {
      return true;
    }
    seen.add(at.id);
  }
  return false;
};

/**
 * A copy of `actor` carried by `parentId` (or by nobody), KEEPING ITS PLACE
 * ON THE CANVAS: the stored position, rotation and scale are rewritten in
 * the new parent's frame from where the actor already is, which is what the
 * engine's `set parent` does and what somebody dragging a button onto a
 * panel meant. A cycle changes nothing.
 */
export function withParent(
  actor: Placement,
  parentId: string | undefined,
  actors: readonly Placement[],
  scales?: Record<string, Vec>,
): Placement {
  const parent = parentId
    ? actors.find(other => other.id === parentId)
    : undefined;
  if (parentId && (!parent || isCarriedBy(parent, actor, actors))) {
    return actor;
  }
  const world = worldTransformOf(actor, actors, scales);
  const frame = parent
    ? worldTransformOf(parent, actors, scales)
    : {pos: {x: 0, y: 0}, scale: {x: 1, y: 1}, rotation: 0, skew: 0};
  const local: Transform = {
    pos: toLocalPosition(world.pos, frame),
    rotation: world.rotation - frame.rotation,
    scale: unscale(world.scale, frame.scale),
    skew: world.skew,
  };
  let next = withProperty(actor, 'positional', 'parent', parent?.id ?? '');
  next = withProperty(next, 'positional', 'position', local.pos);
  // Rotation and scale are written only where they say something: a
  // placement stores what it overrides, and a child of an unturned,
  // unscaled parent overrides neither more than it did.
  const stored = (id: string) =>
    propValue(actor, 'positional', id) !== undefined;
  if (stored('rotation') || local.rotation !== 0) {
    next = withProperty(next, 'positional', 'rotation', local.rotation);
  }
  if (stored('scale') || local.scale.x !== 1 || local.scale.y !== 1) {
    next = withProperty(next, 'positional', 'scale', local.scale);
  }
  return next;
}

/** A copy of `actor` with `owner.prop` set to `value`. */
export const withProperty = (
  actor: Placement,
  ownerId: string,
  propId: string,
  value: unknown,
): Placement => ({
  ...actor,
  properties: {
    ...actor.properties,
    [ownerId]: {...actor.properties?.[ownerId], [propId]: value},
  },
});

/**
 * The placements an actor-typed property may be pointed at.
 *
 * A map is JSON and JSON holds no actors, so what a placement stores is
 * another placement's ID, resolved by `WorldBuilder.loadMap` once every entry
 * exists. This is the list the inspector offers, and it is the one thing the
 * sandbox cannot supply: it introspects actor KINDS, and which of them a
 * particular map holds is the editor's to know.
 *
 * ITSELF EXCLUDED. An actor pointed at itself is a thing a learner could pick
 * and nothing sensible would come of it — a health bar showing its own health,
 * a rider attached to where it already is.
 *
 * An entry with no id is left out because there would be nothing to store: a
 * reference is a name, and an anonymous placement has none.
 */
export const placementChoices = (
  actors: readonly Placement[],
  selfId: string | undefined,
): Array<{value: string; text: string}> =>
  actors
    .filter(actor => actor.id && actor.id !== selfId)
    .map(actor => ({value: actor.id as string, text: actor.id as string}));

/** One placement pointing at another, and the property that says so. */
export interface PlacementLink {
  /** The property's label, drawn beside the line. */
  name: string;
  /** The entry id it names. */
  targetId: string;
}

/**
 * Which placements the selected one points at, and what it calls each.
 *
 * A reference is invisible in a map: the value is a string in a panel, and the
 * actor it names is somewhere else on a canvas that may be scrolled away from
 * it. So the canvas draws them — and this is the part with a decision in it,
 * kept out of the drawing so it can be checked.
 *
 * The SCHEMA is what says which properties are references, because the map
 * itself cannot: a placement's value is a string either way, and `"Hero"` is a
 * name to resolve or a word to display depending on a type the map does not
 * record.
 *
 * A reference to nothing is left out rather than drawn as a stub. The map
 * keeps it — a placement may name one that has since been deleted, and
 * `loadMap` leaves such a property unset rather than failing — but there is
 * nothing on the canvas to draw a line to.
 */
/**
 * The ids a set-valued reference names, in the order the map lists them.
 *
 * A placement's value is whatever JSON held, so this is also the guard: a
 * property that has never been set holds nothing, and a set that holds nothing
 * is empty rather than broken.
 */
export const chosenActors = (
  actor: Placement,
  ownerId: string,
  propId: string,
): string[] => {
  const value = propValue(actor, ownerId, propId);
  return Array.isArray(value) ? (value as string[]) : [];
};

/**
 * What a reference becomes when a placement is picked for it.
 *
 * THE ONE DECISION IN PICKING, and the only place the difference between the
 * two shapes lives: a set is added to, a single reference is replaced. Kept
 * out of the click handler for the reason `linksFrom` is kept out of the
 * drawing — it is a rule, and a rule can be checked.
 *
 * Naming the same actor twice adds nothing. A set holds a thing or it does
 * not, and a list with it in twice would draw two outlines on one actor and
 * offer two Removes that do different things.
 */
export const withPicked = (
  current: unknown,
  pickedId: string,
  isSet: boolean,
): string | string[] => {
  if (!isSet) {
    return pickedId;
  }
  const already = Array.isArray(current) ? (current as string[]) : [];
  return already.includes(pickedId) ? already : [...already, pickedId];
};

export const linksFrom = (
  actor: Placement,
  schema: ReadonlyArray<{
    props: ReadonlyArray<{
      ownerId: string;
      propId: string;
      name: string;
      type: string;
    }>;
  }>,
  actors: readonly Placement[],
): PlacementLink[] =>
  schema
    .flatMap(group => group.props)
    .filter(prop => prop.type === 'actor' || prop.type === 'actors')
    // A child's parent is shown by where the child sits — drawn through the
    // parent, moved with it — and a line to it on top of that says the same
    // thing twice (specs/PARENTING.md). Every other reference is invisible
    // without its line.
    .filter(
      prop => !(prop.ownerId === 'positional' && prop.propId === 'parent'),
    )
    .flatMap(prop => {
      const value = propValue(actor, prop.ownerId, prop.propId);
      // A SET is the same thing several times over, and drawing every one of
      // them is what makes such a property readable at all: "going to" holding
      // three names says nothing until the three are outlined on the canvas.
      const ids = Array.isArray(value) ? value : [value];
      return ids.flatMap(targetId =>
        typeof targetId === 'string' &&
        targetId !== '' &&
        actors.some(other => other.id === targetId)
          ? [{name: prop.name, targetId}]
          : [],
      );
    });
