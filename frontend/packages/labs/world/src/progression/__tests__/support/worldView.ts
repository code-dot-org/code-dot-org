// A lesson's screen and map, seen as the `main.world` they were made from.
//
// The check tests write a solved lesson as an edit to that world, and were
// written before lessons were screens (specs/LESSONS_AS_SCREENS_PLAN.md). So
// an edit is made to this view and the result written back through the
// converter a lesson is built with (`lessons/asScreen`), which is the shape
// a learner's project has.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {renameReferences} from '../../../files/renameThing';
import {screenOfWorld} from '../../lessons/asScreen';

type Block = Record<string, unknown> & {type?: string};

const SCREEN_LOADS = 'world_on_screen_loads';
const IN_SHOWN_MAP = 'world_in_shown_map';
const VIEWPORT = 'actors/viewport';
/** What a screen holds that a map does not (`screenData`). */
const SCREEN_KEYS = [
  'name',
  'properties',
  'events',
  'rules',
  'backgroundColor',
  'blocks',
  'worldMap',
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function rowsOf(first: unknown): Block[] {
  const rows: Block[] = [];
  for (let at = first; isObject(at); ) {
    const {next, ...row} = at;
    rows.push(row as Block);
    at = isObject(next) ? next.block : undefined;
  }
  return rows;
}

const chain = (rows: readonly Block[]): Block | undefined =>
  rows.reduceRight<Block | undefined>(
    (below, row) => (below ? {...row, next: {block: below}} : row),
    undefined,
  );

/** The rows a converter's `in the map ⟨Game⟩ shows` holds, or nothing. */
const unwrapped = (rows: readonly Block[]): Block[] | undefined => {
  const [only] = rows;
  if (rows.length !== 1 || only.type !== IN_SHOWN_MAP) {
    return undefined;
  }
  const inputs = isObject(only.inputs) ? only.inputs : {};
  return rowsOf(isObject(inputs.DO) ? inputs.DO.block : undefined);
};

const shadow = (block: Block) => ({shadow: block});

/** A screen's value as the literal a `set` row holds. */
function literal(type: string, value: string): Block {
  if (type === 'number') {
    return {type: 'math_number', fields: {NUM: Number(value)}};
  }
  if (type === 'boolean') {
    return {
      type: 'logic_boolean',
      fields: {BOOL: value === 'true' ? 'TRUE' : 'FALSE'},
    };
  }
  if (type === 'vector' || type === 'point') {
    const [x, y] = value.split(',').map(Number);
    return {type: 'world_vector', fields: {VECTOR: {x, y}}};
  }
  return {type: 'text', fields: {TEXT: value}};
}

/**
 * A screen that is its own level, with the map the World starts with put back
 * on its first Viewport, where a world said it (`asScreen`).
 */
const withViewportMap = (
  level: Record<string, unknown>,
  worldMap: string | undefined,
): Record<string, unknown> => {
  const actors = level.actors as Array<Record<string, unknown>> | undefined;
  const at = actors?.findIndex(one => one.type === VIEWPORT) ?? -1;
  if (!worldMap || !actors || at < 0) {
    return level;
  }
  const viewport = actors[at];
  const properties = (viewport.properties ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  const next = [...actors];
  next[at] = {
    ...viewport,
    properties: {
      ...properties,
      showsMap: {map: worldMap, ...properties.showsMap},
    },
  };
  return {...level, actors: next};
};

/** The `main.world` a screen and its map stand for. */
export function worldOfScreen(screen: string, map: string | undefined): string {
  const held = JSON.parse(screen) as Record<string, unknown> & {
    properties?: Array<{name: string; type: string; value: string}>;
    rules?: Array<{setter: string; type: string; value: string}>;
    backgroundColor?: string;
    events?: Array<{
      name: string;
      carries?: {id: string; name: string; type: string};
    }>;
    theme?: string;
    worldMap?: string;
    actors?: Array<Record<string, unknown>>;
    blocks?: {blocks?: {blocks?: Block[]}; variables?: unknown[]};
  };
  const rows: Block[] = [
    ...(held.properties ?? []).map(property => {
      const [x, y] = property.value.split(',');
      return {
        type: 'world_rule_property',
        fields: {
          TYPE: property.type,
          ACCESS: 'writable',
          NAME: property.name,
          ...(property.type === 'point'
            ? {DEFAULT: x, DEFAULT_Y: y}
            : property.type === 'vector'
              ? {DEFAULT: {x: Number(x), y: Number(y)}}
              : {DEFAULT: property.value}),
        },
      };
    }),
    ...(held.events ?? []).map(event => ({
      type: 'world_rule_event',
      extraState: {
        parts: [
          {kind: 'label', text: event.name},
          ...(event.carries
            ? [
                {
                  kind: 'param',
                  name: event.carries.name,
                  type: event.carries.type,
                  var: event.carries.id,
                },
              ]
            : []),
        ],
      },
    })),
    ...(held.theme
      ? [{type: 'world_use_theme', fields: {THEME: held.theme}}]
      : []),
    ...(held.rules ?? []).map(rule => ({
      type: rule.setter,
      inputs: {VALUE: shadow(literal(rule.type, rule.value))},
    })),
    ...(held.backgroundColor
      ? [
          {
            type: 'world_set_background_color',
            inputs: {
              COLOR: shadow({
                type: 'colour_picker',
                fields: {COLOUR: held.backgroundColor},
              }),
            },
          },
        ]
      : []),
  ];
  const handlers: Block[] = [];
  for (const root of held.blocks?.blocks?.blocks ?? []) {
    const body = rowsOf(isObject(root.next) ? root.next.block : undefined);
    if (root.type === SCREEN_LOADS) {
      rows.push(...(unwrapped(body) ?? body));
      continue;
    }
    const inner = unwrapped(body);
    const hat = Object.fromEntries(
      Object.entries(root).filter(([key]) => !['x', 'y', 'next'].includes(key)),
    );
    handlers.push(inner ? {...hat, next: {block: chain(inner)}} : root);
  }
  const placements = held.actors ?? [];
  const game = placements.find(
    one => one.id === 'Game' && one.type === VIEWPORT,
  );
  const cameras = game?.cameras as
    | Array<{traits: unknown; values: unknown}>
    | undefined;
  const level = map
    ? (JSON.parse(map) as Record<string, unknown>)
    : withViewportMap(
        Object.fromEntries(
          Object.entries(held).filter(([key]) => !SCREEN_KEYS.includes(key)),
        ),
        held.worldMap,
      );
  const first = chain(rows);
  return JSON.stringify(
    {
      blocks: {
        blocks: [
          {
            type: 'world_world',
            x: 20,
            y: 20,
            fields: {NAME: held.name ?? 'My World'},
            ...(first ? {next: {block: first}} : {}),
          },
          ...handlers,
        ],
      },
      ...(held.blocks?.variables ? {variables: held.blocks.variables} : {}),
      // An `add actor` the screen runs was code in the world, and stays so
      // (`asScreen`, `rowsAsCode`).
      ...(rows.some(row => row.type === 'world_add_actor')
        ? {rowsAsCode: true}
        : {}),
      map: {
        ...level,
        ...(map && cameras?.[0]
          ? {mainCamera: {traits: cameras[0].traits, values: cameras[0].values}}
          : {}),
      },
    },
    null,
    2,
  );
}

/** The project's `main.screen` and `main.map`, rewritten from `world`. */
export function withWorld(
  source: MultiFileSource,
  world: string,
): MultiFileSource {
  const files = Object.entries(source.files);
  const screen = files.find(([, file]) => file.name === 'main.screen');
  const map = files.find(([, file]) => file.name === 'main.map');
  if (!screen) {
    throw new Error('no file called main.screen');
  }
  const made = screenOfWorld(world, source);
  // …and what an edit names by the world's file, named by the screen's, as
  // the lesson's own conversion names it (`asScreenProject`).
  return renameReferences(
    {
      ...source,
      files: {
        ...source.files,
        [screen[0]]: {...screen[1], contents: made.screen},
        ...(map && made.map ? {[map[0]]: {...map[1], contents: made.map}} : {}),
      },
    },
    {from: 'worlds/main', to: 'screens/main'},
  );
}

/** The project's `main.world`, as these tests write one. */
export function worldOf(source: MultiFileSource): string {
  const files = Object.values(source.files);
  const screen = files.find(file => file.name === 'main.screen');
  const map = files.find(file => file.name === 'main.map');
  if (!screen) {
    throw new Error('no file called main.screen');
  }
  return worldOfScreen(screen.contents ?? '', map?.contents);
}
