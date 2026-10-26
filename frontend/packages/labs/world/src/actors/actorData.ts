// An actor as data and events (specs/ACTOR_EDITOR_PLAN.md; SIMPLE_INTERFACE.md,
// "An actor is data and events").
//
// A data-shaped actor file is a document, as a map is: what the actor IS —
// its traits, its own properties, the values set on it, its look, its icon,
// what it acts like — as keys, and what it DOES as an event workspace, whose
// roots are its handlers and its code (its drawing, its own blocks and
// events, its every-frame work).
//
// The rest of the lab reads actors as `define actor` workspaces, and goes on
// doing so: `actorView` turns the data back into the workspace it stands for,
// and `foldActor` turns any such workspace into data. Neither is ever saved
// as the other's shape; the view is what the compiler and the readers see,
// and a writer edits the view and folds it back. Both are pure, and a fold
// loses nothing: a row it cannot say as data is kept as code.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORKSPACE_KEYS} from '../blockly/documentExtras';
import type {Timeline} from '../engine/core/keyframes';

import type {ActorPurpose} from './actorPurpose';

/** What marks a file as data-shaped: `type: 'actor'`, as a map says `map`. */
export const ACTOR_DOCUMENT = 'actor';

/** One of the actor's own properties: `define ⟨type⟩ ⟨name⟩`. */
export interface ActorProperty {
  name: string;
  type: string;
  access: 'writable' | 'readonly';
  /** Its default, as the block's field holds it; absent for one that starts empty. */
  value?: string;
  /** …and a vector's second half, which the block holds in a field of its own. */
  valueY?: string;
}

/** A literal, as a `set` row's socket holds one. */
export type ActorLiteral =
  | {type: 'number'; value: number}
  | {type: 'string'; value: string}
  | {type: 'color'; value: string}
  | {type: 'boolean'; value: boolean}
  | {type: 'list'; value: string[]}
  | {type: 'vector'; value: {x: number; y: number}};

/** `set ⟨member⟩ of this actor to ⟨literal⟩`, by the setter's block type. */
export type ActorValue = {setter: string} & ActorLiteral;

/**
 * An effect on the actor (SIMPLE_INTERFACE.md, "Effects are data on the
 * actor"): the effect file, whether the actor starts with it on, and the
 * `add effect` row that says its settings, kept as the block holds them.
 * Code and animations turn it on and off while the game runs.
 */
export interface ActorEffect {
  /** The effect's module path: `effects/ripple`. */
  effect: string;
  on: boolean;
  /** Its `add effect` row, settings and all; absent for one set to nothing. */
  row?: Block;
}

/**
 * The picture it looks like, as the Actor Editor's Looks like says it.
 *
 * As DATA a picture is the actor's Main animation, one sprite key at 0
 * (`animations`, specs/ANIMATION_PLAN.md); this is read through `lookOf` and
 * written through `withLookOf`.
 */
export type ActorLook = {sprite: string};

/** The animation an actor plays when it is made (SIMPLE_INTERFACE.md). */
export const MAIN_ANIMATION = 'Main';

/** A Main that is one still picture: a sprite key at 0, looping. */
export const stillAnimation = (sprite: string): Timeline => ({
  loop: true,
  tracks: {sprite: [{at: 0, value: sprite}]},
});

/** The picture a timeline is, when it is only one still picture. */
export function stillSpriteOf(
  timeline: Timeline | undefined,
): string | undefined {
  const tracks = Object.entries(timeline?.tracks ?? {});
  const [name, track] = tracks[0] ?? [];
  return tracks.length === 1 &&
    name === 'sprite' &&
    track!.length === 1 &&
    track![0].at === 0 &&
    typeof track![0].value === 'string'
    ? (track![0].value as string)
    : undefined;
}

/** A Blockly workspace as it is saved: its blocks, and its variables beside them. */
export interface SavedWorkspace {
  blocks?: {languageVersion?: number; blocks?: Block[]};
  variables?: unknown[];
  [key: string]: unknown;
}

export interface ActorData {
  type: typeof ACTOR_DOCUMENT;
  name: string;
  for?: ActorPurpose;
  actsLike?: string;
  isData?: true;
  icon?: string;
  /**
   * Its animations, by name, as timelines of keyframes (`engine/core/
   * keyframes`); `Main` plays when it is made (specs/ANIMATION_PLAN.md).
   */
  animations?: Record<string, Timeline>;
  traits?: string[];
  properties?: ActorProperty[];
  values?: ActorValue[];
  effects?: ActorEffect[];
  /** The handlers and the code, as roots of the workspace. */
  blocks?: SavedWorkspace;
  [key: string]: unknown;
}

export type Block = Record<string, unknown> & {type?: string};

/**
 * Rows that are code: what the actor does, rather than what it is. In the
 * data shape each is a root of the workspace, where the "+" offers it.
 */
export const CODE_ROWS: ReadonlySet<string> = new Set([
  'world_define_drawing',
  'world_rule_block',
  'world_rule_event',
  'world_trait_step',
]);

const ROOT = 'world_actor';

/**
 * `when ⟨this actor⟩ is created`: where a row that is neither data nor code
 * goes (specs/ACTORS_AS_DATA_PLAN.md, step 2). It runs once the actor exists
 * and before it is first drawn (`World.settleCreations`).
 */
export const CREATED_HAT = 'world_on_Space_CreatedEvent';

/**
 * Rows that DECLARE something about the kind, which the data says once. One
 * the fold could not take — a second `acts like`, a property it cannot read
 * — says nothing the data does not, and means nothing in a handler, so it
 * is dropped rather than moved there.
 */
const DECLARATION_ROWS: ReadonlySet<string> = new Set([
  'world_use_trait',
  'world_acts_like',
  'world_actor_is_data',
  'world_show_as',
  'world_rule_property',
  'world_actor_animations',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const isActorData = (value: unknown): value is ActorData =>
  isObject(value) && value.type === ACTOR_DOCUMENT;

// ── Rows, read and written ──────────────────────────────────────────────

const THIS_ACTOR = 'world_this_actor';

/** The block in a socket, shadow or not. */
const inSocket = (input: unknown): Block | undefined => {
  if (!isObject(input)) {
    return undefined;
  }
  const held = (input.block ?? input.shadow) as Block | undefined;
  return isObject(held) ? held : undefined;
};

/** Whether a block holds only these keys, ignoring its id. */
const only = (block: Block, keys: readonly string[]): boolean =>
  Object.keys(block).every(key => key === 'id' || keys.includes(key));

const isThisActor = (input: unknown): boolean => {
  const held = inSocket(input);
  return Boolean(held) && held!.type === THIS_ACTOR && only(held!, ['type']);
};

const fieldsOf = (block: Block): Record<string, unknown> =>
  isObject(block.fields) ? block.fields : {};

/** The literal a socket holds, or nothing for anything else. */
function readLiteral(input: unknown): ActorLiteral | undefined {
  const held = inSocket(input);
  if (!held) {
    return undefined;
  }
  const fields = fieldsOf(held);
  const plain = only(held, ['type', 'fields']);
  switch (held.type) {
    case 'math_number':
      return plain && typeof fields.NUM === 'number'
        ? {type: 'number', value: fields.NUM}
        : plain && typeof fields.NUM === 'string' && fields.NUM.trim() !== ''
          ? {type: 'number', value: Number(fields.NUM)}
          : undefined;
    case 'text':
      return plain && typeof fields.TEXT === 'string'
        ? {type: 'string', value: fields.TEXT}
        : undefined;
    case 'colour_picker':
      return plain && typeof fields.COLOUR === 'string'
        ? {type: 'color', value: fields.COLOUR}
        : undefined;
    case 'logic_boolean':
      return plain && (fields.BOOL === 'TRUE' || fields.BOOL === 'FALSE')
        ? {type: 'boolean', value: fields.BOOL === 'TRUE'}
        : undefined;
    case 'lists_create_with': {
      if (!only(held, ['type', 'extraState', 'inputs'])) {
        return undefined;
      }
      const count = (held.extraState as {itemCount?: unknown})?.itemCount;
      const inputs = isObject(held.inputs) ? held.inputs : {};
      if (typeof count !== 'number') {
        return undefined;
      }
      const words: string[] = [];
      for (let at = 0; at < count; at++) {
        const word = readLiteral(inputs[`ADD${at}`]);
        if (word?.type !== 'string') {
          return undefined;
        }
        words.push(word.value);
      }
      return Object.keys(inputs).length === count
        ? {type: 'list', value: words}
        : undefined;
    }
    default:
      return undefined;
  }
}

/** A literal, as a socket holds it. */
function writeLiteral(literal: ActorLiteral): Record<string, unknown> {
  switch (literal.type) {
    case 'number':
      return {shadow: {type: 'math_number', fields: {NUM: literal.value}}};
    case 'string':
      return {shadow: {type: 'text', fields: {TEXT: literal.value}}};
    case 'color':
      return {shadow: {type: 'colour_picker', fields: {COLOUR: literal.value}}};
    case 'boolean':
      return {
        block: {
          type: 'logic_boolean',
          fields: {BOOL: literal.value ? 'TRUE' : 'FALSE'},
        },
      };
    case 'list':
      return {
        block: {
          type: 'lists_create_with',
          extraState: {itemCount: literal.value.length},
          inputs: Object.fromEntries(
            literal.value.map((word, at) => [
              `ADD${at}`,
              {block: {type: 'text', fields: {TEXT: word}}},
            ]),
          ),
        },
      };
    case 'vector':
      return {};
  }
}

/** `set ⟨member⟩ of this actor to ⟨literal⟩`, as data, or nothing. */
function readValue(row: Block): ActorValue | undefined {
  if (
    typeof row.type !== 'string' ||
    !/^world_set_[A-Za-z0-9]+_.+$/.test(row.type) ||
    !only(row, ['type', 'inputs', 'next'])
  ) {
    return undefined;
  }
  const inputs = isObject(row.inputs) ? row.inputs : {};
  if (!isThisActor(inputs.ACTOR)) {
    return undefined;
  }
  const keys = Object.keys(inputs).sort().join(',');
  if (keys === 'ACTOR,VALUE') {
    const literal = readLiteral(inputs.VALUE);
    return literal && {setter: row.type, ...literal};
  }
  if (keys === 'ACTOR,X,Y') {
    const x = readLiteral(inputs.X);
    const y = readLiteral(inputs.Y);
    return x?.type === 'number' && y?.type === 'number'
      ? {setter: row.type, type: 'vector', value: {x: x.value, y: y.value}}
      : undefined;
  }
  return undefined;
}

function writeValue(value: ActorValue): Block {
  const actor = {block: {type: THIS_ACTOR}};
  const inputs =
    value.type === 'vector'
      ? {
          ACTOR: actor,
          X: writeLiteral({type: 'number', value: value.value.x}),
          Y: writeLiteral({type: 'number', value: value.value.y}),
        }
      : {ACTOR: actor, VALUE: writeLiteral(value)};
  return {type: value.setter, inputs};
}

const PROPERTY_FIELDS = ['TYPE', 'ACCESS', 'NAME', 'DEFAULT', 'DEFAULT_Y'];

function readProperty(row: Block): ActorProperty | undefined {
  const fields = fieldsOf(row);
  if (
    row.type !== 'world_rule_property' ||
    !only(row, ['type', 'fields', 'next']) ||
    !Object.keys(fields).every(key => PROPERTY_FIELDS.includes(key)) ||
    typeof fields.TYPE !== 'string' ||
    typeof fields.NAME !== 'string' ||
    (fields.ACCESS !== 'writable' && fields.ACCESS !== 'readonly') ||
    (fields.DEFAULT !== undefined && typeof fields.DEFAULT !== 'string') ||
    (fields.DEFAULT_Y !== undefined && typeof fields.DEFAULT_Y !== 'string')
  ) {
    return undefined;
  }
  return {
    name: fields.NAME,
    type: fields.TYPE,
    access: fields.ACCESS,
    ...(fields.DEFAULT === undefined ? {} : {value: fields.DEFAULT}),
    ...(fields.DEFAULT_Y === undefined ? {} : {valueY: fields.DEFAULT_Y}),
  };
}

const writeProperty = (property: ActorProperty): Block => ({
  type: 'world_rule_property',
  fields: {
    TYPE: property.type,
    ACCESS: property.access,
    NAME: property.name,
    ...(property.value === undefined ? {} : {DEFAULT: property.value}),
    ...(property.valueY === undefined ? {} : {DEFAULT_Y: property.valueY}),
  },
});

/** A row of one string field and nothing else, read as that string. */
const oneField = (row: Block, type: string, field: string) => {
  const fields = fieldsOf(row);
  return row.type === type &&
    only(row, ['type', 'fields', 'next']) &&
    Object.keys(fields).length === 1 &&
    typeof fields[field] === 'string'
    ? (fields[field] as string)
    : undefined;
};

/**
 * A look row: `set sprite`, on this actor or on nothing, which is this actor
 * too. (`play animation` is code: it plays one of the actor's own.)
 */
function readLook(row: Block): ActorLook | undefined {
  if (row.type !== 'world_set_sprite') {
    return undefined;
  }
  const inputs = isObject(row.inputs) ? row.inputs : {};
  const onThis =
    Object.keys(inputs).length === 0 ||
    (Object.keys(inputs).join() === 'ACTOR' && isThisActor(inputs.ACTOR));
  if (!onThis || !only(row, ['type', 'fields', 'inputs', 'next'])) {
    return undefined;
  }
  const bare = {type: row.type, fields: row.fields};
  const sprite = oneField(bare, 'world_set_sprite', 'SPRITE');
  return sprite === undefined ? undefined : {sprite};
}

const ADD_EFFECT = 'world_add_effect';

/** `add effect ⟨effect⟩` on this actor, as data, or nothing. */
function readEffect(row: Block): ActorEffect | undefined {
  const fields = fieldsOf(row);
  if (
    row.type !== ADD_EFFECT ||
    !only(row, ['type', 'fields', 'inputs', 'extraState', 'next']) ||
    Object.keys(fields).join() !== 'EFFECT' ||
    typeof fields.EFFECT !== 'string'
  ) {
    return undefined;
  }
  const inputs = {...(isObject(row.inputs) ? row.inputs : {})};
  if ('ACTOR' in inputs) {
    if (!isThisActor(inputs.ACTOR)) {
      return undefined;
    }
    delete inputs.ACTOR;
  }
  const kept: Block = {type: ADD_EFFECT, fields: {EFFECT: fields.EFFECT}};
  if (row.extraState !== undefined) {
    kept.extraState = row.extraState;
  }
  if (Object.keys(inputs).length) {
    kept.inputs = inputs;
  }
  return {
    effect: fields.EFFECT,
    on: true,
    ...(Object.keys(kept).length > 2 ? {row: kept} : {}),
  };
}

const writeEffect = (effect: ActorEffect): Block =>
  effect.row ?? {type: ADD_EFFECT, fields: {EFFECT: effect.effect}};

/** The row that declares an actor's animations and plays its Main. */
export const ANIMATIONS_ROW = 'world_actor_animations';

/**
 * The rows its animations are as code: a still Main is the `set sprite` it
 * always was, so that everything reading a view for a picture still finds
 * one; anything more is the animations row, whose state is the timelines.
 */
function writeAnimations(
  animations: Record<string, Timeline> | undefined,
): Block[] {
  const names = Object.keys(animations ?? {});
  if (!names.length) {
    return [];
  }
  // A still Main is its `set sprite`, beside the row for the others if
  // there are any; the fold reads the two back as one set of animations.
  const still = stillSpriteOf(animations![MAIN_ANIMATION]);
  const rest = {...animations};
  if (still !== undefined) {
    delete rest[MAIN_ANIMATION];
  }
  return [
    ...(Object.keys(rest).length
      ? [{type: ANIMATIONS_ROW, extraState: {animations: rest}}]
      : []),
    ...(still !== undefined
      ? [{type: 'world_set_sprite', fields: {SPRITE: still}}]
      : []),
  ];
}

/** The animations an animations row declares, or nothing. */
function readAnimations(row: Block): Record<string, Timeline> | undefined {
  if (row.type !== ANIMATIONS_ROW || !isObject(row.extraState)) {
    return undefined;
  }
  const animations = row.extraState.animations;
  return isObject(animations)
    ? (animations as Record<string, Timeline>)
    : undefined;
}

/** The data with `timeline` as its Main animation. */
export function withMainAnimation(
  data: ActorData,
  timeline: Timeline,
): ActorData {
  return {
    ...data,
    animations: {...(data.animations ?? {}), [MAIN_ANIMATION]: timeline},
  };
}

/** Whether the actor's Main moves: more than one still picture. */
export const isAnimated = (data: ActorData): boolean => {
  const main = data.animations?.[MAIN_ANIMATION];
  return Boolean(main) && stillSpriteOf(main) === undefined;
};

/** What the actor looks like, as Looks like says it. */
export function lookOf(data: ActorData): ActorLook | undefined {
  const main = data.animations?.[MAIN_ANIMATION];
  const still = stillSpriteOf(main);
  if (still !== undefined) {
    return {sprite: still};
  }
  // An animated Main: what it shows first, which is what a still of it is.
  const first = main?.tracks.sprite?.[0]?.value;
  const file =
    typeof first === 'string'
      ? first
      : (first as {sprite?: unknown} | undefined)?.sprite;
  return typeof file === 'string' ? {sprite: file} : undefined;
}

/**
 * The data looking like `look`: a picture is a still Main, replacing the
 * one it had; nothing is no Main.
 */
export function withLookOf(
  data: ActorData,
  look: ActorLook | undefined,
): ActorData {
  const next: ActorData = {...data};
  const animations = {...(data.animations ?? {})};
  delete animations[MAIN_ANIMATION];
  if (look) {
    animations[MAIN_ANIMATION] = stillAnimation(look.sprite);
  }
  if (Object.keys(animations).length) {
    next.animations = animations;
  } else {
    delete next.animations;
  }
  return next;
}

// ── The fold and the view ───────────────────────────────────────────────

/** A row without the next one, as a root or one of a list holds it. */
const alone = (row: Block): Block =>
  Object.fromEntries(
    Object.entries(row).filter(([key]) => !['next', 'x', 'y'].includes(key)),
  ) as Block;

/** Rows chained, first at the top. */
const chained = (rows: readonly Block[]): Block | undefined =>
  rows.reduceRight<Block | undefined>(
    (next, row) => (next ? {...row, next: {block: next}} : {...row}),
    undefined,
  );

/** The rows under a root, top to bottom. */
function rowsUnder(root: Block): Block[] {
  const rows: Block[] = [];
  let row = (root.next as {block?: Block} | undefined)?.block;
  while (isObject(row)) {
    rows.push(row);
    row = (row.next as {block?: Block} | undefined)?.block;
  }
  return rows;
}

/** The keys a data-shaped file holds beside its workspace. */
const DATA_KEYS = new Set([
  'type',
  'name',
  'for',
  'actsLike',
  'isData',
  'icon',
  'animations',
  'traits',
  'properties',
  'values',
  'effects',
  'blocks',
]);

/**
 * The data a `define actor` workspace stands for, or nothing when it holds
 * no `define actor`. Keys beside the workspace (`for`, and any a later
 * reader added) are kept.
 */
export function foldActor(
  file: Record<string, unknown>,
): ActorData | undefined {
  const roots = ((file.blocks as SavedWorkspace['blocks'])?.blocks ??
    []) as Block[];
  const at = roots.findIndex(root => root?.type === ROOT);
  if (at < 0) {
    return undefined;
  }
  const root = roots[at];
  const data: ActorData = {
    type: ACTOR_DOCUMENT,
    name: String(fieldsOf(root).NAME ?? ''),
  };
  const traits: string[] = [];
  const properties: ActorProperty[] = [];
  const values: ActorValue[] = [];
  const effects: ActorEffect[] = [];
  // What the actor does on being made: rows that are not data, kept in
  // order for its `is created` handler.
  const creation: Block[] = [];
  const code: Block[] = [];
  let animations: Record<string, Timeline> | undefined;
  let sawAnimationsRow = false;
  for (const row of rowsUnder(root)) {
    const trait = oneField(row, 'world_use_trait', 'TRAIT');
    const parent = oneField(row, 'world_acts_like', 'ACTOR');
    const icon = oneField(row, 'world_show_as', 'ICON');
    const look = readLook(row);
    const property = readProperty(row);
    const value = readValue(row);
    const effect = readEffect(row);
    if (trait !== undefined) {
      traits.push(trait);
    } else if (parent !== undefined && data.actsLike === undefined) {
      data.actsLike = parent;
    } else if (
      row.type === 'world_actor_is_data' &&
      only(row, ['type', 'next']) &&
      !data.isData
    ) {
      data.isData = true;
    } else if (icon !== undefined && data.icon === undefined) {
      data.icon = icon;
    } else if (readAnimations(row) && !sawAnimationsRow) {
      // Before or after a still Main's `set sprite`: one set of animations.
      sawAnimationsRow = true;
      animations = {...readAnimations(row)!, ...animations};
    } else if (look && !animations?.[MAIN_ANIMATION]) {
      // A still picture is the Main animation.
      animations = {
        ...animations,
        [MAIN_ANIMATION]: stillAnimation(look.sprite),
      };
    } else if (property) {
      properties.push(property);
    } else if (value) {
      values.push(value);
    } else if (effect && !effects.some(one => one.effect === effect.effect)) {
      effects.push(effect);
    } else if (typeof row.type === 'string' && CODE_ROWS.has(row.type)) {
      code.push(alone(row));
    } else if (
      typeof row.type !== 'string' ||
      !DECLARATION_ROWS.has(row.type)
    ) {
      creation.push(alone(row));
    }
  }
  if (animations && Object.keys(animations).length) {
    data.animations = animations;
  }
  if (traits.length) data.traits = traits;
  if (properties.length) data.properties = properties;
  if (values.length) data.values = values;
  if (effects.length) data.effects = effects;

  const workspace: SavedWorkspace = {};
  const extras: Record<string, unknown> = {};
  for (const [key, held] of Object.entries(file)) {
    if (WORKSPACE_KEYS.has(key)) {
      workspace[key] = held;
    } else {
      extras[key] = held;
    }
  }
  const handlers = withCreation(
    roots.filter((_, index) => index !== at),
    creation,
  );
  workspace.blocks = {
    ...(file.blocks as SavedWorkspace['blocks']),
    languageVersion:
      (file.blocks as SavedWorkspace['blocks'])?.languageVersion ?? 0,
    // The code first, where the root was, and the handlers after.
    blocks: [
      ...code.map((row, index) => ({...row, x: 20, y: 20 + index * 40})),
      ...handlers,
    ],
  };
  return {...extras, ...data, blocks: workspace};
}

/**
 * The handlers, with `rows` at the top of the actor's `is created` handler —
 * the one it has, or a new one. First, because under `define actor` they
 * ran before anything a handler did.
 */
function withCreation(handlers: Block[], rows: readonly Block[]): Block[] {
  if (rows.length === 0) {
    return handlers;
  }
  const at = handlers.findIndex(root => root.type === CREATED_HAT);
  const hat = at < 0 ? {type: CREATED_HAT, x: 20, y: 20} : handlers[at];
  // The rows, chained down onto whatever the handler already did.
  const first = rows.reduceRight<Block | undefined>(
    (next, row) => ({...alone(row), ...(next ? {next: {block: next}} : {})}),
    (hat.next as {block?: Block} | undefined)?.block,
  );
  const settled = {...hat, next: {block: first}};
  return at < 0
    ? [...handlers, settled]
    : handlers.map((root, index) => (index === at ? settled : root));
}

/**
 * The `define actor` workspace the data stands for, as a file holds one:
 * a root whose chain is the definition rows, in a fixed order, then the
 * code; the handlers beside it.
 */
export function actorView(data: ActorData): Record<string, unknown> {
  const roots = (data.blocks?.blocks?.blocks ?? []) as Block[];
  const code = roots.filter(
    root => typeof root.type === 'string' && CODE_ROWS.has(root.type),
  );
  const handlers = roots.filter(root => !code.includes(root));
  const rows: Block[] = [
    ...(data.actsLike === undefined
      ? []
      : [{type: 'world_acts_like', fields: {ACTOR: data.actsLike}}]),
    ...(data.isData ? [{type: 'world_actor_is_data'}] : []),
    ...(data.icon === undefined
      ? []
      : [{type: 'world_show_as', fields: {ICON: data.icon}}]),
    ...writeAnimations(data.animations),
    ...(data.traits ?? []).map(trait => ({
      type: 'world_use_trait',
      fields: {TRAIT: trait},
    })),
    ...(data.properties ?? []).map(writeProperty),
    ...(data.values ?? []).map(writeValue),
    ...(data.effects ?? []).filter(effect => effect.on).map(writeEffect),
    ...code.map(alone),
  ];
  const first = chained(rows);
  const root: Block = {
    type: ROOT,
    x: 20,
    y: 20,
    fields: {NAME: data.name},
    ...(first ? {next: {block: first}} : {}),
  };
  const extras = Object.fromEntries(
    Object.entries(data).filter(([key]) => !DATA_KEYS.has(key)),
  );
  return {
    ...extras,
    ...(data.for === undefined ? {} : {for: data.for}),
    ...data.blocks,
    blocks: {
      languageVersion: 0,
      ...data.blocks?.blocks,
      blocks: [root, ...handlers],
    },
  };
}

/**
 * The contents as a `define actor` workspace, whatever their shape: the view
 * of a data-shaped file, and any other contents as they are.
 */
export function viewOf(contents: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return contents;
  }
  return isActorData(parsed)
    ? JSON.stringify(actorView(parsed), null, 2)
    : contents;
}

/**
 * The contents in the data shape: a `define actor` workspace folded, and a
 * data-shaped file or anything else as it is.
 *
 * `like` is the data-shaped file the workspace was the view of, when it was
 * one. An effect that is off is not in a view, since it adds no row, so the
 * fold takes those from there rather than losing them.
 */
export function asActorData(contents: string, like?: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return contents;
  }
  if (!isObject(parsed) || isActorData(parsed)) {
    return contents;
  }
  const data = foldActor(parsed);
  if (!data) {
    return contents;
  }
  const off = offEffectsOf(like).filter(
    effect => !(data.effects ?? []).some(one => one.effect === effect.effect),
  );
  if (off.length) {
    data.effects = [...(data.effects ?? []), ...off];
  }
  return JSON.stringify(data, null, 2);
}

/** The effects a data-shaped file holds that are off. */
function offEffectsOf(contents: string | undefined): ActorEffect[] {
  if (!isDataShaped(contents)) {
    return [];
  }
  const data = JSON.parse(contents!) as ActorData;
  return (data.effects ?? []).filter(effect => !effect.on);
}

/**
 * Whether the contents are data-shaped, asked cheaply: most callers hold
 * many files, and only an actor's can be.
 */
export function isDataShaped(contents: string | undefined): boolean {
  if (!contents || !/"type":\s*"actor"/.test(contents)) {
    return false;
  }
  try {
    return isActorData(JSON.parse(contents));
  } catch {
    return false;
  }
}

/**
 * A change written for `define actor` rows, made to contents of either
 * shape: a data-shaped file is changed through its view and folded back, so
 * it stays data.
 */
export function throughView(
  contents: string,
  change: (rows: string) => string,
): string {
  if (!isDataShaped(contents)) {
    return change(contents);
  }
  const changed = change(viewOf(contents));
  return changed === viewOf(contents)
    ? contents
    : asActorData(changed, contents);
}

/** The project with every actor file in the data shape. */
export function inDataShape(source: MultiFileSource): MultiFileSource {
  let files: MultiFileSource['files'] | undefined;
  for (const [id, file] of Object.entries(source.files)) {
    if (!file.name.endsWith('.actor')) {
      continue;
    }
    const contents = asActorData(file.contents);
    if (contents !== file.contents) {
      files ??= {...source.files};
      files[id] = {...file, contents};
    }
  }
  return files ? {...source, files} : source;
}
