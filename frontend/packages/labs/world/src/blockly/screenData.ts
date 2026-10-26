// What a `.screen` holds besides the map it is (specs/SCREEN_MAP_PLAN.md,
// step 4, "The file").
//
// A screen's workspace holds events only, so what `define world` said in rows
// a screen says in data: the game's name, its game-wide values and events,
// the rule settings that differ from the rules' own, and the color behind
// the screen. Each is read back into the rows `define world` would have
// held, so the declarations they make and the code they compile to are a
// world's, minted by the same readers and generators.

import type {BlockParam} from '../actors/stock/workspace';
import {MAIN_SCREEN_PATH} from '../mainWorld';

export {MAIN_SCREEN_PATH};

/** The game's name when the Main Screen states none. */
export const DEFAULT_SCREEN_NAME = 'Main';

/** A game-wide value, as the inspector shows one. */
export interface ScreenProperty {
  name: string;
  /** `number`, `boolean`, `string`, `vector`, `point`, … */
  type: string;
  /** The starting value as text; a vector or point is `"x,y"`. */
  value: string;
}

/** A game-wide event: what a map raises by name. */
export interface ScreenEvent {
  name: string;
  /** Its one parameter, for an event that carries a value. */
  carries?: BlockParam;
}

/** A rule's world-scoped property set to something other than its default. */
export interface ScreenRuleSetting {
  /** The setter's block type: `world_set_Scoring_TargetScoreProperty`. */
  setter: string;
  type: string;
  value: string;
}

/** The keys a `.screen` has that a `.map` does not. */
export interface ScreenData {
  name?: string;
  properties?: ScreenProperty[];
  events?: ScreenEvent[];
  rules?: ScreenRuleSetting[];
  backgroundColor?: string;
  /** A map's own key, read here because a screen's theme is the game's. */
  theme?: string;
}

/** A Blockly block as JSON, as much of one as is built here. */
export interface BlockJson {
  type: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: BlockJson; shadow?: BlockJson}>;
  extraState?: object;
  next?: {block: BlockJson};
}

/** The screen's data, or nothing for a file that will not parse. */
export function parseScreenData(contents: string): ScreenData | undefined {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as ScreenData)
      : undefined;
  } catch {
    return undefined;
  }
}

const list = <T>(held: unknown): T[] =>
  Array.isArray(held) ? (held.filter(Boolean) as T[]) : [];

/** `x,y` as two numbers, or nothing for text that is not a pair. */
const pair = (text: string): {x: number; y: number} | undefined => {
  const parts = text.split(',');
  if (parts.length !== 2) {
    return undefined;
  }
  const [x, y] = parts.map(part => Number(part.trim()));
  return Number.isFinite(x) && Number.isFinite(y) ? {x, y} : undefined;
};

/**
 * The value block a literal of this type is written as, or nothing for a
 * type no field holds or text that is not one.
 */
export function literalBlock(
  type: string,
  value: string,
): BlockJson | undefined {
  if (type === 'number' || type === 'angle') {
    const held = Number(value);
    return value.trim() !== '' && Number.isFinite(held)
      ? {type: 'math_number', fields: {NUM: held}}
      : undefined;
  }
  if (type === 'string') {
    return {type: 'text', fields: {TEXT: value}};
  }
  if (type === 'boolean') {
    return {
      type: 'logic_boolean',
      fields: {BOOL: value === 'true' ? 'TRUE' : 'FALSE'},
    };
  }
  if (type === 'vector') {
    const held = pair(value);
    return held ? {type: 'world_vector', fields: {VECTOR: held}} : undefined;
  }
  return undefined;
}

/**
 * `define property` for a game-wide value, with its starting value in the
 * fields the block keeps it in: a vector's both axes in one, a point's in
 * `DEFAULT` and `DEFAULT_Y` (`domainBlocks.shapeDefaultField`).
 */
const propertyRow = (property: ScreenProperty): BlockJson => {
  const fields: Record<string, unknown> = {
    NAME: property.name,
    TYPE: property.type,
  };
  const held = pair(property.value);
  if (property.type === 'vector') {
    fields.DEFAULT = held ?? {x: 0, y: 0};
  } else if (property.type === 'point') {
    fields.DEFAULT = held?.x ?? 0;
    fields.DEFAULT_Y = held?.y ?? 0;
  } else {
    fields.DEFAULT = property.value;
  }
  return {type: 'world_rule_property', fields};
};

/** `define event ⟨name ⟨param⟩⟩`, as a world's body holds one. */
export const eventDeclaration = (event: ScreenEvent): BlockJson => ({
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
});

/** Rows chained in order under `root`, which is returned. */
const chained = (root: BlockJson, rows: readonly BlockJson[]): BlockJson => {
  let tail = root;
  for (const row of rows) {
    tail.next = {block: row};
    tail = row;
  }
  return root;
};

/**
 * The screen's declarations as the workspace `define world` would have been:
 * a root with a `define property` row per value and a `define event` row per
 * event, and the variables an event's parameter names.
 *
 * Read by `parseScreenOwnMeta` through the same walk a world's file goes
 * through, so a screen's `score` is minted, named and imported exactly as a
 * world's is.
 */
export function screenDeclarationDocument(data: ScreenData): object {
  const properties = list<ScreenProperty>(data.properties).filter(
    property => typeof property.name === 'string' && property.name.trim(),
  );
  const events = list<ScreenEvent>(data.events).filter(
    event => typeof event.name === 'string' && event.name.trim(),
  );
  const root = chained(
    {
      type: 'world_world',
      fields: {NAME: data.name || DEFAULT_SCREEN_NAME},
    },
    [...properties.map(propertyRow), ...events.map(eventDeclaration)],
  );
  const variables = events.flatMap(event =>
    event.carries
      ? [
          {
            id: event.carries.id,
            name: event.carries.name,
            type: event.carries.binds,
          },
        ]
      : [],
  );
  return {blocks: {languageVersion: 0, blocks: [root]}, variables};
}

/**
 * The rows that set the screen up once it is placed: its theme, the color
 * behind it, and each rule setting, chained in that order — the rows the
 * inspector writes at the top of `define world`. Nothing when there are
 * none. A rule setting whose text is no literal of its type is left out.
 */
export function screenSetupRows(data: ScreenData): BlockJson | undefined {
  const rows: BlockJson[] = [];
  if (typeof data.theme === 'string' && data.theme) {
    rows.push({type: 'world_use_theme', fields: {THEME: data.theme}});
  }
  if (typeof data.backgroundColor === 'string' && data.backgroundColor) {
    rows.push({
      type: 'world_set_background_color',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
            fields: {COLOUR: data.backgroundColor},
          },
        },
      },
    });
  }
  for (const setting of list<ScreenRuleSetting>(data.rules)) {
    const held =
      typeof setting.setter === 'string' &&
      literalBlock(setting.type, String(setting.value ?? ''));
    if (held) {
      rows.push({type: setting.setter, inputs: {VALUE: {shadow: held}}});
    }
  }
  const [first, ...rest] = rows;
  return first ? chained(first, rest) : undefined;
}
