// An actor as data and events (specs/ACTOR_EDITOR_PLAN.md; SIMPLE_INTERFACE.md,
// "An actor is data and events").
//
// A data-shaped actor file is a document, as a map is: what the actor IS —
// its traits, its own properties, the values set on it, its look, its icon,
// what it acts like, the blocks and events it adds to the language — as keys,
// and what it DOES as an event workspace, whose roots are its handlers and its
// code (its drawing, its every-frame work).
//
// The compiler lays the data out as blocks (`blockly/actorSheet`), and a
// walk that knows a reference by a block's type and fields reads the keys
// that name something as the blocks they stand for (`keyRows`). A file is
// written as data and nothing else: one in `define actor` rows cannot be read.

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
  /** One of the project's pictures, by file name. */
  | {type: 'picture'; value: string}
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
  /** The blocks and events it adds to the language (specs/ACTOR_BLOCKS_PLAN.md). */
  members?: ActorMember[];
  /** The handlers and the code, as roots of the workspace. */
  blocks?: SavedWorkspace;
  [key: string]: unknown;
}

export type Block = Record<string, unknown> & {type?: string};

/**
 * One piece of a member's design: a word, a value, or a line break. The
 * designer's own parts (`blockly/extensions/blockDesigner`), whose value
 * names a workspace variable by `var`: a block's implementation reads it
 * through that variable, which the workspace's `variables` declare.
 */
export type ActorMemberPart =
  | {kind: 'label'; text: string}
  | {kind: 'row'}
  | ({kind: 'param'; type: string; var: string; name?: string} & Record<
      string,
      unknown
    >);

/**
 * A block or an event the actor adds to the language: `define block` or
 * `define event`, as data. `id` is the id of the row it stands for, kept so
 * the editor can name it across saves; `body` is a block's implementation,
 * the chain in its `do`.
 */
export interface ActorMember {
  id: string;
  kind: 'event' | 'block';
  parts: ActorMemberPart[];
  description?: string;
  /** The eye shut: offered in this actor's own file and nowhere else. */
  hidden?: true;
  /** What a block reports, by its type; absent for one that does something. */
  returns?: string;
  body?: Block;
}

/**
 * Rows that are code: what the actor does, rather than what it is. In the
 * data shape each is a root of the workspace.
 */
export const CODE_ROWS: ReadonlySet<string> = new Set([
  'world_define_drawing',
  'world_trait_step',
]);

const ROOT = 'world_actor';

/**
 * `when ⟨this actor⟩ is created`: what an actor does on being made. It runs
 * once the actor exists and before it is first drawn (`World.settleCreations`).
 */
export const CREATED_HAT = 'world_on_Space_CreatedEvent';

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
    case 'world_picture':
      return plain && typeof fields.SPRITE === 'string'
        ? {type: 'picture', value: fields.SPRITE}
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
    case 'picture':
      return {shadow: {type: 'world_picture', fields: {SPRITE: literal.value}}};
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
export function readValue(row: Block): ActorValue | undefined {
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

/** The `set` row a value is, on this actor. */
export function writeValue(value: ActorValue): Block {
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

export function readProperty(row: Block): ActorProperty | undefined {
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

export const writeProperty = (property: ActorProperty): Block => ({
  type: 'world_rule_property',
  fields: {
    TYPE: property.type,
    ACCESS: property.access,
    NAME: property.name,
    ...(property.value === undefined ? {} : {DEFAULT: property.value}),
    ...(property.valueY === undefined ? {} : {DEFAULT_Y: property.valueY}),
  },
});

/** A row's one string field that matters, read as that string. */
const oneField = (row: Block, type: string, field: string) => {
  const fields = fieldsOf(row);
  // AS LENIENT AS BLOCKLY about fields: one the block does not have is one
  // Blockly drops as it loads it, and says nothing. Read strictly for it,
  // the row was a declaration the fold could not take, which it drops
  // (`DECLARATION_ROWS`).
  return row.type === type &&
    only(row, ['type', 'fields', 'next']) &&
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

/** The `add effect` row an effect is. */
export const writeEffect = (effect: ActorEffect): Block =>
  effect.row ?? {type: ADD_EFFECT, fields: {EFFECT: effect.effect}};

const MEMBER_ROWS = {block: 'world_rule_block', event: 'world_rule_event'};

const isPart = (part: unknown): part is ActorMemberPart =>
  isObject(part) &&
  ((part.kind === 'label' && typeof part.text === 'string') ||
    (part.kind === 'row' && only(part, ['kind'])) ||
    (part.kind === 'param' &&
      typeof part.type === 'string' &&
      typeof part.var === 'string'));

/**
 * `define block` or `define event` as data, or nothing for one the data
 * cannot hold whole: a row with anything the data has no key for, or a
 * block that reports a value unless `reports` allows one. An actor cannot
 * define one yet; a rule can (`rules/ruleData`).
 */
export function readMember(
  row: Block,
  made: number,
  {reports = false}: {reports?: boolean} = {},
): ActorMember | undefined {
  const kind =
    row.type === MEMBER_ROWS.block
      ? 'block'
      : row.type === MEMBER_ROWS.event
        ? 'event'
        : undefined;
  const state = row.extraState;
  if (
    !kind ||
    !isObject(state) ||
    !only(state, ['parts']) ||
    !Array.isArray(state.parts) ||
    !state.parts.every(isPart)
  ) {
    return undefined;
  }
  const id = typeof row.id === 'string' ? row.id : `${kind}-${made}`;
  const parts = state.parts.map(part => ({...part}));
  if (kind === 'event') {
    return only(row, ['type', 'extraState', 'next'])
      ? {id, kind, parts}
      : undefined;
  }
  const fields = fieldsOf(row);
  const inputs = isObject(row.inputs) ? row.inputs : {};
  const body = inSocket(inputs.DO);
  if (
    !only(row, ['type', 'fields', 'extraState', 'inputs', 'next']) ||
    !Object.keys(fields).every(key =>
      ['RETURNS', 'DESCRIPTION', 'ACCESS'].includes(key),
    ) ||
    (fields.RETURNS !== undefined && typeof fields.RETURNS !== 'string') ||
    (!reports && (fields.RETURNS ?? 'none') !== 'none') ||
    !Object.keys(inputs).every(key => key === 'DO') ||
    (inputs.DO !== undefined &&
      !(isObject(inputs.DO) && only(inputs.DO, ['block'])))
  ) {
    return undefined;
  }
  return {
    id,
    kind,
    parts,
    ...(typeof fields.DESCRIPTION === 'string' && fields.DESCRIPTION
      ? {description: fields.DESCRIPTION}
      : {}),
    ...(fields.ACCESS === 'private' ? {hidden: true as const} : {}),
    ...(typeof fields.RETURNS === 'string' && fields.RETURNS !== 'none'
      ? {returns: fields.RETURNS}
      : {}),
    ...(body ? {body} : {}),
  };
}

/**
 * What a member is called on the trail: its words, or what it is while it
 * has none.
 */
export function memberName(contents: string | undefined, id: string): string {
  let member: ActorMember | undefined;
  try {
    const held = JSON.parse(contents ?? '') as unknown;
    member = isActorData(held)
      ? held.members?.find(one => one.id === id)
      : undefined;
  } catch {
    member = undefined;
  }
  const words = (member?.parts ?? [])
    .flatMap(part => (part.kind === 'label' ? [part.text.trim()] : []))
    .filter(Boolean)
    .join(' ');
  return words || (member?.kind === 'event' ? 'New event' : 'New block');
}

/** The row a member stands for. */
export function writeMember(member: ActorMember): Block {
  const extraState = {parts: member.parts};
  if (member.kind === 'event') {
    return {type: MEMBER_ROWS.event, id: member.id, extraState};
  }
  return {
    type: MEMBER_ROWS.block,
    id: member.id,
    fields: {
      RETURNS: member.returns ?? 'none',
      DESCRIPTION: member.description ?? '',
      ACCESS: member.hidden ? 'private' : 'shared',
    },
    extraState,
    ...(member.body ? {inputs: {DO: {block: member.body}}} : {}),
  };
}

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

// ── The keys that hold names ────────────────────────────────────────────

/**
 * An actor's keys that name something — itself, its parent, its icon, its
 * traits, properties, values, effects, members and animations — each as the
 * block that says it, for a walk that knows a reference by a block's type
 * and fields (`blockly/rewriteWorkspaces`). `withKeyRows` reads them back.
 */
export interface KeyRows {
  name: Block;
  actsLike?: Block;
  icon?: Block;
  traits: Block[];
  properties: Block[];
  values: Block[];
  effects: Block[];
  members: Block[];
  animations: Block[];
}

export const keyRows = (data: ActorData): KeyRows => ({
  name: {type: ROOT, fields: {NAME: data.name}},
  ...(data.actsLike === undefined
    ? {}
    : {actsLike: {type: 'world_acts_like', fields: {ACTOR: data.actsLike}}}),
  ...(data.icon === undefined
    ? {}
    : {icon: {type: 'world_show_as', fields: {ICON: data.icon}}}),
  traits: (data.traits ?? []).map(trait => ({
    type: 'world_use_trait',
    fields: {TRAIT: trait},
  })),
  properties: (data.properties ?? []).map(writeProperty),
  values: (data.values ?? []).map(writeValue),
  effects: (data.effects ?? []).map(writeEffect),
  members: (data.members ?? []).map(writeMember),
  animations: writeAnimations(data.animations),
});

/** The data with what its key rows now say; a row it cannot read keeps the key as it was. */
export function withKeyRows(data: ActorData, rows: KeyRows): ActorData {
  const field = (row: Block | undefined, name: string, was: string) => {
    const held = row && fieldsOf(row)[name];
    return typeof held === 'string' ? held : was;
  };
  const next: ActorData = {...data, name: field(rows.name, 'NAME', data.name)};
  if (data.actsLike !== undefined) {
    next.actsLike = field(rows.actsLike, 'ACTOR', data.actsLike);
  }
  if (data.icon !== undefined) {
    next.icon = field(rows.icon, 'ICON', data.icon);
  }
  if (data.traits) {
    next.traits = data.traits.map((trait, at) =>
      field(rows.traits[at], 'TRAIT', trait),
    );
  }
  if (data.properties) {
    next.properties = data.properties.map(
      (property, at) => readProperty(rows.properties[at]) ?? property,
    );
  }
  if (data.values) {
    next.values = data.values.map(
      (value, at) => readValue(rows.values[at]) ?? value,
    );
  }
  if (data.effects) {
    next.effects = data.effects.map((effect, at) => {
      const read = readEffect(rows.effects[at]);
      return read ? {...read, on: effect.on} : effect;
    });
  }
  if (data.members) {
    next.members = data.members.map(
      (member, at) =>
        readMember(rows.members[at], at, {reports: true}) ?? member,
    );
  }
  if (data.animations) {
    const animated = rows.animations.find(row => row.type === ANIMATIONS_ROW);
    const still = rows.animations.find(row => row.type !== ANIMATIONS_ROW);
    const sprite = still && readLook(still);
    next.animations = {
      ...(animated ? readAnimations(animated) : {}),
      ...(sprite ? {[MAIN_ANIMATION]: stillAnimation(sprite.sprite)} : {}),
    };
  }
  return next;
}

// ── Reading a file ──────────────────────────────────────────────────────

/** The data an actor file holds, or nothing for contents that are not one. */
export function actorDataOf(contents: string): ActorData | undefined {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return isActorData(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Whether the contents are an actor's data, asked cheaply: most callers hold
 * many files, and only an actor's can be.
 */
export function isDataShaped(contents: string | undefined): boolean {
  return Boolean(
    contents && /"type":\s*"actor"/.test(contents) && actorDataOf(contents),
  );
}
