// A game written under `define world`, as a Main Screen whose Viewport shows
// `main.map`. Lessons are written as screens (`worlds.screenFile`); tapper,
// novel and the tests are still converted here until they are too
// (specs/COMPILE_FROM_DATA_PLAN.md, step 5f).
//
// Each row of `define world` goes where a screen keeps it. An `add actor`
// whose body says only literals is a placement, and its `set`s that
// placement's overrides; the world's state, a rule's
// setting and the background color are the screen's data; `set map size` is
// the map's, and so is a `define layer`, with what its body places with
// literals on it; a handler is the screen's. A row that says anything else is
// code a game runs once, so it stays code: under `when this screen loads`,
// which is always there, empty or not. A world block acts on the World from the
// screen's code as from any (specs/ONE_WORLD_PLAN.md), so the code acts on the
// level as it did on the world.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import type {BlockParam} from '../../actors/stock/workspace';
import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {slug} from '../../blockly/ruleMeta';
import {memberLocalName} from '../../blockly/ruleRegistry';
import type {ScreenEvent} from '../../blockly/screenData';
import {gameScreen} from '../../constants';
import {renameReferences} from '../../files/renameThing';
import {projectFiles} from '../../runtime/projectFiles';
import {TILE_SIZE} from '../../runtime/viewport';

type Block = Record<string, unknown> & {type?: string};

const GAME = 'Game';
const VIEWPORT = 'actors/viewport';
const SCREEN_LOADS = 'world_on_screen_loads';

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

function slotsOf(files: Record<string, string>): {
  actor: Slots;
  world: Map<string, string>;
} {
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
  layer?: string;
  properties?: Record<string, Record<string, unknown>>;
};

/** A map's layer, as `define layer` said one (`mapModel.MapLayerDoc`). */
type Layer = {
  id: string;
  name: string;
  parallax?: {x: number; y: number};
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

/** The variable type a value of this type is carried in (`BlockParam`). */
const BINDS: Record<string, BlockParam['binds']> = {
  number: 'Number',
  string: 'String',
  boolean: 'Boolean',
  actor: 'Actor',
  vector: 'Vector',
};

/**
 * A world's `define event` as the screen's data: a name and at most one value
 * it carries, which is all a screen's event says (`screenData`).
 */
function eventOf(row: Block): ScreenEvent {
  const parts = isObject(row.extraState)
    ? ((row.extraState.parts ?? []) as Array<Record<string, unknown>>)
    : [];
  const labels = parts.filter(part => part.kind === 'label');
  const params = parts.filter(part => part.kind === 'param');
  if (labels.length !== 1 || params.length > 1) {
    throw new Error('a world event a screen cannot say: one name, one value');
  }
  const [param] = params;
  const type = String(param?.type ?? '');
  return {
    name: String(labels[0].text),
    ...(param
      ? {
          carries: {
            id: String(param.var),
            name: String(param.name ?? type),
            type,
            binds: BINDS[type] ?? 'String',
          },
        }
      : {}),
  };
}

/** What a `main.world` is as a screen and a map. */
export interface WorldScreen {
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
  /** The project, or its files by path, for where a setter's value is kept. */
  source: MultiFileSource | Record<string, string>,
  {
    screenIsLevel = false,
  }: {
    /**
     * Put the level on the Main Screen itself, with no map and no Viewport:
     * one space, as the world was, which is what a test written as a world
     * expects of it (`worldAsScreen`). Not for a world with a camera.
     */
    screenIsLevel?: boolean;
  } = {},
): WorldScreen {
  const doc = JSON.parse(contents) as {
    blocks?: {blocks?: Block[]};
    variables?: unknown[];
    map?: Record<string, unknown> & {actors?: Placement[]};
    /** Every `add actor` stays code: the lesson is about the rows. */
    rowsAsCode?: boolean;
  };
  const roots = doc.blocks?.blocks ?? [];
  const world = roots.find(root => root.type === 'world_world');
  if (!world) {
    throw new Error('a lesson world with no define world');
  }
  const slots = slotsOf(
    'files' in source && 'folders' in source
      ? projectFiles(source as MultiFileSource)
      : (source as Record<string, string>),
  );
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
  const events: ScreenEvent[] = [];
  let theme: string | undefined;
  const rules: Array<{setter: string; type: string; value: string}> = [];
  let backgroundColor: string | undefined;
  let size: {width: number; height: number} | undefined;
  const code: Block[] = [];
  const layers: Layer[] = [];
  for (const row of rowsOf(
    isObject(world.next) ? world.next.block : undefined,
  )) {
    const fields = fieldsOf(row);
    if (row.type === 'world_define_layer') {
      // A layer is the map's. What its body places with literals is placed
      // on it; the rest is code, which places into the default layer.
      const name = String(fields.NAME ?? 'Layer');
      const layer: Layer = {id: slug(name), name};
      for (const inner of rowsOf(inputOf(row, 'DO'))) {
        if (inner.type === 'world_layer_parallax') {
          const {x, y} = (fieldsOf(inner).PARALLAX ?? {}) as {
            x?: number;
            y?: number;
          };
          layer.parallax = {x: Number(x ?? 1), y: Number(y ?? 1)};
          continue;
        }
        const kind = String(fieldsOf(inner).ACTOR ?? '');
        const placement =
          inner.type === 'world_add_actor' && !doc.rowsAsCode
            ? placementOf(inner, slots.actor, kind ? nextId(kind) : '')
            : undefined;
        if (placement) {
          placements.push({...placement, layer: layer.id});
        } else {
          code.push(inner);
        }
      }
      layers.push(layer);
      continue;
    }
    if (row.type === 'world_add_actor' && !doc.rowsAsCode) {
      const kind = String(fields.ACTOR ?? '');
      const placement = placementOf(row, slots.actor, kind ? nextId(kind) : '');
      if (placement) {
        placements.push(placement);
        continue;
      }
    } else if (row.type === 'world_use_theme' && fields.THEME) {
      theme = String(fields.THEME);
      continue;
    } else if (row.type === 'world_rule_event') {
      events.push(eventOf(row));
      continue;
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
  // The map's own layers, then the ones `define layer` rows said.
  const stated = (level as {layers?: unknown}).layers;
  const allLayers = [...(Array.isArray(stated) ? stated : []), ...layers];
  const mapLayers = allLayers.length ? {layers: allLayers} : {};
  // A level with a theme of its own beside the game's needs a map to hold it.
  const asLevel =
    screenIsLevel && !mainCamera && !(theme && typeof level.theme === 'string');
  // Every world block acts on the World, from the screen's code as from any
  // (specs/ONE_WORLD_PLAN.md), so nothing has to be told it is the level.
  const handlers = roots.filter(root => root !== world);
  // There whether or not the world had code of its own: it is where
  // once-only code is written, as `define world`'s body was.
  const first = chain(code);
  const loads: Block[] =
    first || !asLevel
      ? [{type: SCREEN_LOADS, ...(first ? {next: {block: first}} : {})}]
      : [];
  const data = {
    ...(properties.length ? {properties} : {}),
    ...(events.length ? {events} : {}),
    ...(theme ? {theme} : {}),
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
  if (asLevel || placements.some(one => one.type === VIEWPORT)) {
    if (mainCamera) {
      throw new Error('a world whose own map has a Viewport and a camera');
    }
    // A screen is flat (specs/ONE_WORLD_PLAN.md).
    if (allLayers.length) {
      throw new Error('a world whose own map is a screen, with layers');
    }
    // The map a Viewport was given is the one the World starts with, said
    // on the screen rather than on the Viewport (specs/ONE_WORLD_PLAN.md).
    const worldMap = withoutViewportMaps(placements);
    return {
      screen: JSON.stringify(
        {
          ...level,
          type: 'map',
          name,
          ...sized,
          ...(worldMap ? {worldMap} : {}),
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
  // The world's main camera is the Game Viewport's one camera.
  if (mainCamera) {
    const game = screen.actors.find(one => one.id === GAME)!;
    game.camera = {...mainCamera};
  }
  return {
    screen: JSON.stringify({...screen, ...workspace}, null, 2),
    map: JSON.stringify(
      {
        ...level,
        type: 'map',
        ...sized,
        ...mapLayers,
        actors: placements,
      },
      null,
      2,
    ),
  };
}

/**
 * Take the `map` off every Viewport placement in `placements`, in place, and
 * say the first one found: the map the World starts with.
 */
const withoutViewportMaps = (placements: Placement[]): string | undefined => {
  let first: string | undefined;
  for (const placement of placements) {
    const properties = placement.properties;
    const shows = properties?.showsMap;
    if (
      placement.type !== VIEWPORT ||
      !properties ||
      !shows ||
      !('map' in shows)
    ) {
      continue;
    }
    const {map, ...rest} = shows;
    if (typeof map === 'string' && map && first === undefined) {
      first = map;
    }
    if (Object.keys(rest).length) {
      properties.showsMap = rest;
    } else {
      delete properties.showsMap;
    }
  }
  return first;
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
    // The level a tab beside the screen: the screen draws it, but only as a
    // picture (`MapStage`).
    openFiles: map ? [...(next.openFiles ?? []), mapId] : next.openFiles,
  };
  // What the world declared for itself is the screen's now, and its blocks
  // are named by the file that declares them.
  return renameReferences(next, {from: 'worlds/main', to: 'screens/main'});
}
