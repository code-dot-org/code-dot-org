// A lesson's world, written as a game is: a Main Screen whose Viewport
// shows `main.map` (specs/LESSONS_AS_SCREENS_PLAN.md, step 1).
//
// Each row of `define world` goes where a screen keeps it. An `add actor`
// whose body says only literals is a placement, and its `set`s that
// placement's overrides; the world's state, a rule's
// setting and the background color are the screen's data; `set map size` is
// the map's; a handler is the screen's. A row that says anything else is
// code a game runs once, so it stays code: under `when this screen loads`,
// inside `in the map ⟨Game⟩ shows`, where it acts on the level as it did on
// the world. A handler that adds to or loads into the world is wrapped the
// same way, since the screen is now the root it runs in.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {slug} from '../../blockly/ruleMeta';
import {memberLocalName} from '../../blockly/ruleRegistry';
import {gameScreen} from '../../constants';
import {renameReferences} from '../../files/renameThing';
import {projectFiles} from '../../runtime/projectFiles';
import {TILE_SIZE} from '../../runtime/viewport';

type Block = Record<string, unknown> & {type?: string};

const GAME = 'Game';
const VIEWPORT = 'actors/viewport';
const IN_SHOWN_MAP = 'world_in_shown_map';
const SCREEN_LOADS = 'world_on_screen_loads';

/** Rows that act on the place they run, and so must be told it is the level. */
const PLACE_ACTING = new Set([
  'world_add_actor',
  'world_load_map',
  'world_load_map_named',
  'world_unload_newest_map',
  'world_set_background',
  'world_set_background_color',
  'world_set_map_size',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const fieldsOf = (block: Block): Record<string, unknown> =>
  isObject(block.fields) ? block.fields : {};

const inputOf = (block: Block, name: string): Block | undefined => {
  const inputs = isObject(block.inputs) ? block.inputs : {};
  const input = inputs[name];
  if (!isObject(input)) {
    return undefined;
  }
  const held = input.block ?? input.shadow;
  return isObject(held) ? (held as Block) : undefined;
};

/** The rows of a chain, each without its `next`. */
function rowsOf(first: unknown): Block[] {
  const rows: Block[] = [];
  for (let at = first; isObject(at); ) {
    const {next, ...row} = at;
    rows.push(row as Block);
    at = isObject(next) ? next.block : undefined;
  }
  return rows;
}

function chain(rows: readonly Block[]): Block | undefined {
  return rows.reduceRight<Block | undefined>(
    (below, row) => (below ? {...row, next: {block: below}} : row),
    undefined,
  );
}

/** Whether any block in `node` is one of these types. */
function holds(node: unknown, types: ReadonlySet<string>): boolean {
  if (Array.isArray(node)) {
    return node.some(one => holds(one, types));
  }
  if (!isObject(node)) {
    return false;
  }
  if (typeof node.type === 'string' && types.has(node.type)) {
    return true;
  }
  return Object.values(node).some(value => holds(value, types));
}

/** A literal as the data a placement or a screen holds, or nothing. */
function literalOf(block: Block | undefined): unknown {
  if (!block || block.next || block.inputs) {
    return undefined;
  }
  const fields = fieldsOf(block);
  switch (block.type) {
    case 'math_number':
      return typeof fields.NUM === 'number' ? fields.NUM : undefined;
    case 'text':
      return typeof fields.TEXT === 'string' ? fields.TEXT : undefined;
    case 'logic_boolean':
      return fields.BOOL === 'TRUE';
    case 'world_vector':
      return isObject(fields.VECTOR) ? fields.VECTOR : undefined;
    case 'colour_picker':
    case 'world_color':
      return typeof fields.COLOUR === 'string'
        ? fields.COLOUR
        : typeof fields.COLOR === 'string'
          ? fields.COLOR
          : undefined;
    default:
      return undefined;
  }
}

/** …and as the text the screen's inspector keeps one in. */
const asText = (value: unknown): string =>
  isObject(value) ? `${value.x},${value.y}` : String(value);

/** Whether a row is about the actor it is under: `⟨this actor⟩`. */
const onThisActor = (row: Block): boolean =>
  inputOf(row, 'ACTOR')?.type === 'world_this_actor';

/** Where each property a setter names is kept on a placement. */
type Slots = Map<string, {owner: string; id: string; type: string}>;

function slotsOf(source: MultiFileSource): {
  actor: Slots;
  world: Map<string, string>;
} {
  const files = projectFiles(source);
  const actor: Slots = new Map();
  const world = new Map<string, string>();
  for (const meta of [...BUILTIN_RULE_META, ...projectRuleMetas(files)]) {
    for (const property of meta.properties) {
      const setter = `world_set_${memberLocalName(property.ref)}`;
      if (property.scope === 'world') {
        world.set(setter, property.type);
      } else if (property.ownerTraitId) {
        actor.set(setter, {
          owner: property.ownerTraitId,
          id: property.id,
          type: property.type,
        });
      }
    }
  }
  for (const own of projectOwnMetas(files)) {
    for (const property of own.properties) {
      actor.set(`world_set_${memberLocalName(property.ref)}`, {
        owner: slug(own.name),
        id: property.id,
        type: property.type,
      });
    }
  }
  return {actor, world};
}

type Placement = {
  type: string;
  id: string;
  properties?: Record<string, Record<string, unknown>>;
};

/** An `add actor` as a placement, or nothing for one that is code. */
function placementOf(
  row: Block,
  slots: Slots,
  id: string,
): Placement | undefined {
  const kind = fieldsOf(row).ACTOR;
  if (
    typeof kind !== 'string' ||
    row.extraState ||
    Object.keys(fieldsOf(row)).length > 1
  ) {
    return undefined;
  }
  const properties: Record<string, Record<string, unknown>> = {};
  for (const line of rowsOf(inputOf(row, 'DO'))) {
    if (!onThisActor(line)) {
      return undefined;
    }
    if (line.type === 'world_set_position') {
      const x = literalOf(inputOf(line, 'X'));
      const y = literalOf(inputOf(line, 'Y'));
      if (typeof x !== 'number' || typeof y !== 'number') {
        return undefined;
      }
      properties.positional = {...properties.positional, position: {x, y}};
    } else {
      const slot = slots.get(line.type ?? '');
      const value = literalOf(inputOf(line, 'VALUE'));
      if (!slot || value === undefined) {
        return undefined;
      }
      properties[slot.owner] = {...properties[slot.owner], [slot.id]: value};
    }
  }
  return {
    type: kind,
    id,
    ...(Object.keys(properties).length ? {properties} : {}),
  };
}

/** `in the map ⟨Game⟩ shows do ⟨rows⟩`. */
const inTheLevel = (rows: readonly Block[]): Block => ({
  type: IN_SHOWN_MAP,
  inputs: {
    ACTOR: {block: {type: 'world_actor_kind', fields: {ACTOR: VIEWPORT}}},
    DO: {block: chain(rows)},
  },
});

/** A handler with its body in the level, when the body acts on a place. */
function handlerOf(root: Block): Block {
  const body = isObject(root.next) ? root.next.block : undefined;
  // An actor's hat runs with its actor in hand, in the level already.
  if (fieldsOf(root).SUBJECT !== undefined || !holds(body, PLACE_ACTING)) {
    return root;
  }
  return {...root, next: {block: inTheLevel(rowsOf(body))}};
}

/** What a lesson's `main.world` is as a screen and a map. */
export interface LessonScreen {
  screen: string;
  /** Absent when the world's map was a screen already: it placed a Viewport. */
  map?: string;
}

/**
 * The screen and map a `main.world` is, read against the project it is in
 * (for where each property a setter names is kept). Throws on a world it
 * cannot say.
 */
export function screenOfWorld(
  contents: string,
  source: MultiFileSource,
): LessonScreen {
  const doc = JSON.parse(contents) as {
    blocks?: {blocks?: Block[]};
    variables?: unknown[];
    map?: Record<string, unknown> & {actors?: Placement[]};
  };
  const roots = doc.blocks?.blocks ?? [];
  const world = roots.find(root => root.type === 'world_world');
  if (!world) {
    throw new Error('a lesson world with no define world');
  }
  const slots = slotsOf(source);
  // A world's own cameras: its main one becomes the Game Viewport's, and the
  // rest no lesson has.
  const {mainCamera, ...rest} = doc.map ?? {};
  const level = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) => key !== 'cameras' && key !== 'startingCamera',
    ),
  ) as typeof rest;
  const placements: Placement[] = [...(level.actors ?? [])];
  const taken = new Set(placements.map(one => one.id));
  const nextId = (kind: string) => {
    const stem = kind.split('/').pop() ?? 'actor';
    let id = stem;
    for (let n = 2; taken.has(id); n++) {
      id = `${stem}${n}`;
    }
    taken.add(id);
    return id;
  };
  const properties: Array<{name: string; type: string; value: string}> = [];
  const rules: Array<{setter: string; type: string; value: string}> = [];
  let backgroundColor: string | undefined;
  let size: {width: number; height: number} | undefined;
  const code: Block[] = [];
  for (const row of rowsOf(
    isObject(world.next) ? world.next.block : undefined,
  )) {
    const fields = fieldsOf(row);
    if (row.type === 'world_add_actor') {
      const kind = String(fields.ACTOR ?? '');
      const placement = placementOf(row, slots.actor, kind ? nextId(kind) : '');
      if (placement) {
        placements.push(placement);
        continue;
      }
    } else if (row.type === 'world_rule_property') {
      properties.push({
        name: String(fields.NAME),
        type: String(fields.TYPE),
        value:
          fields.DEFAULT_Y === undefined
            ? asText(fields.DEFAULT ?? '')
            : `${fields.DEFAULT},${fields.DEFAULT_Y}`,
      });
      continue;
    } else if (row.type === 'world_set_map_size') {
      const width = literalOf(inputOf(row, 'X'));
      const height = literalOf(inputOf(row, 'Y'));
      if (typeof width === 'number' && typeof height === 'number') {
        size = {width, height};
        continue;
      }
    } else if (row.type === 'world_set_background_color') {
      const color = literalOf(inputOf(row, 'COLOR'));
      if (typeof color === 'string') {
        backgroundColor = color;
        continue;
      }
    } else if (slots.world.has(row.type ?? '')) {
      const value = literalOf(inputOf(row, 'VALUE'));
      if (value !== undefined) {
        rules.push({
          setter: row.type!,
          type: slots.world.get(row.type!)!,
          value: asText(value),
        });
        continue;
      }
    }
    code.push(row);
  }
  const handlers = roots
    .filter(root => root !== world)
    .map(root => handlerOf(root));
  const loads: Block[] = code.length
    ? [{type: SCREEN_LOADS, next: {block: inTheLevel(code)}}]
    : [];
  const data = {
    ...(properties.length ? {properties} : {}),
    ...(rules.length ? {rules} : {}),
    ...(backgroundColor ? {backgroundColor} : {}),
  };
  const blocks = [...handlers, ...loads].map((root, at) => ({
    ...root,
    x: 20,
    y: 20 + at * 200,
  }));
  const workspace = blocks.length
    ? {
        blocks: {
          blocks: {languageVersion: 0, blocks},
          ...(doc.variables ? {variables: doc.variables} : {}),
        },
      }
    : {};
  const name = String(fieldsOf(world).NAME ?? 'My World');
  const sized = size ? {size, tile: {width: TILE_SIZE, height: TILE_SIZE}} : {};
  // A map that places a Viewport is a screen already: a window onto a room
  // (adventure/rooms). It is the screen, and there is no level of its own.
  if (placements.some(one => one.type === VIEWPORT)) {
    if (mainCamera) {
      throw new Error('a world whose own map has a Viewport and a camera');
    }
    return {
      screen: JSON.stringify(
        {
          ...level,
          type: 'map',
          name,
          ...sized,
          ...data,
          actors: placements,
          ...workspace,
        },
        null,
        2,
      ),
    };
  }
  const screen = JSON.parse(gameScreen(name, data)) as {
    actors: Array<Placement & Record<string, unknown>>;
  };
  // The world's main camera is the Game Viewport's, which looks through it.
  if (mainCamera) {
    const game = screen.actors.find(one => one.id === GAME)!;
    game.cameras = [{id: 'camera1', name: 'Camera 1', ...mainCamera}];
    game.properties = {
      ...game.properties,
      showsMap: {...game.properties?.showsMap, showsThrough: 'Camera 1'},
    };
  }
  return {
    screen: JSON.stringify({...screen, ...workspace}, null, 2),
    map: JSON.stringify(
      {...level, type: 'map', ...sized, actors: placements},
      null,
      2,
    ),
  };
}

/**
 * The `main.world` a converted project was written as, for the check tests,
 * which write a solved lesson as an edit to it (`lessonChecks.test`). Kept
 * by its Main Screen's file, which a project made from a lesson by changing
 * some other file still holds.
 */
const madeFrom = new WeakMap<object, string>();

const screenOf = (source: MultiFileSource): object | undefined =>
  Object.values(source.files).find(file => file.name === 'main.screen');

export const worldMadeInto = (source: MultiFileSource): string | undefined => {
  const screen = screenOf(source);
  return screen ? madeFrom.get(screen) : undefined;
};

/** Remember that `source` was made from `world`. */
export const rememberWorld = (
  source: MultiFileSource,
  world: string,
): MultiFileSource => {
  const screen = screenOf(source);
  if (screen) {
    madeFrom.set(screen, world);
  }
  return source;
};

/**
 * The project with its `main.world` a `main.screen` and a `main.map`, the
 * screen active where the world was, and the Viewport the screen places.
 */
export function asScreenProject(source: MultiFileSource): MultiFileSource {
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  );
  if (!world) {
    return source;
  }
  const folderOf = (name: string) => {
    const folder = Object.values(source.folders).find(one => one.name === name);
    if (!folder) {
      throw new Error(`a lesson with no ${name} folder`);
    }
    return folder.id;
  };
  const viewport = stockActorById('viewport');
  let next = viewport ? importStockActor(source, viewport).source : source;
  const {screen, map} = screenOfWorld(world.contents ?? '', next);
  const mapId = String(
    Math.max(...Object.keys(next.files).map(Number).filter(Number.isFinite)) +
      1,
  );
  next = {
    ...next,
    files: {
      ...next.files,
      [world.id]: {
        ...next.files[world.id],
        name: 'main.screen',
        language: 'screen',
        folderId: folderOf('screens'),
        contents: screen,
      },
      ...(map
        ? {
            [mapId]: {
              id: mapId,
              name: 'main.map',
              language: 'map',
              folderId: folderOf('maps'),
              contents: map,
            },
          }
        : {}),
    },
  };
  // What the world declared for itself is the screen's now, and its blocks
  // are named by the file that declares them.
  return renameReferences(next, {from: 'worlds/main', to: 'screens/main'});
}
