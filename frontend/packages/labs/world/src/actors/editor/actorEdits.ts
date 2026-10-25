// What the Actor Editor's panel changes in an actor's data, and what it
// offers (specs/ACTOR_EDITOR_PLAN.md, step 4).
//
// Pure: each edit takes the data and gives back the data changed, or the
// same data when there was nothing to change, and the editor writes it.

import {
  paramSockets,
  socketName,
  socketShadow,
  toParamState,
  type EffectParamState,
} from '../../blockly/extensions/effectParamsMutator';
import {projectRuleMetas} from '../../blockly/projectModules';
import {memberLocalName, memberValue} from '../../blockly/ruleRegistry';
import type {EffectParameter} from '../../effect/model/types';
import {
  endOf,
  withKey,
  withKeyMoved,
  withoutKey,
  type Timeline,
} from '../../engine/core/keyframes';
import {parseVectorText, vectorText} from '../../mapEditor/worldProperties';
import {STOCK_RULES} from '../../rules/stock';
import type {
  ActorData,
  ActorEffect,
  ActorLiteral,
  ActorLook,
  ActorProperty,
  ActorValue,
  Block,
} from '../actorData';
import {MAIN_ANIMATION, withLookOf} from '../actorData';
import type {ActorPurpose} from '../actorPurpose';

/** One property of a trait, as the panel edits it. */
export interface TraitProperty {
  /** The block type that sets it: `world_set_<owner>_<property>`. */
  setter: string;
  name: string;
  type: string;
  /** Its own starting value, as text, for a field the actor leaves alone. */
  default: string;
}

/** A trait an actor may take, with the properties a value means something for. */
export interface TraitChoice {
  /** What `traits` holds: `Gravity#AffectedByGravityTrait`. */
  value: string;
  name: string;
  rule: string;
  description?: string;
  properties: TraitProperty[];
}

const textOf = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'object' && 'x' in value && 'y' in value) {
    const held = value as {x: unknown; y: unknown};
    return vectorText({x: Number(held.x), y: Number(held.y)});
  }
  return Array.isArray(value) ? value.join(', ') : String(value);
};

/**
 * The traits the project's rules offer an actor, as `cameraTraitChoices`
 * offers a camera its own. Read-only properties are the trait's working
 * state and are left out.
 */
export function actorTraitChoices(
  files: Record<string, string>,
): TraitChoice[] {
  return projectRuleMetas(files).flatMap(rule =>
    rule.traits
      .filter(trait => trait.subject === 'actor')
      .map(trait => {
        const description =
          trait.description ??
          STOCK_RULES.find(stock => stock.name === rule.name)?.description;
        return {
          value: memberValue(trait.ref),
          name: trait.name,
          rule: rule.name,
          ...(description ? {description} : {}),
          properties: rule.properties
            .filter(
              property =>
                property.ownerTraitId === trait.id && !property.readonly,
            )
            .map(property => ({
              setter: `world_set_${memberLocalName(property.ref)}`,
              name: property.name,
              type: property.type,
              default: textOf(property.default),
            })),
        };
      }),
  );
}

/** The kinds of value a property can be set to as data. */
const LITERAL: Record<string, ActorLiteral['type']> = {
  number: 'number',
  angle: 'number',
  string: 'string',
  color: 'color',
  boolean: 'boolean',
  vector: 'vector',
  point: 'vector',
  words: 'list',
};

/** Whether a property of this type takes a value as data, not as code. */
export const takesValue = (type: string): boolean => type in LITERAL;

/** A value as the text a field shows. */
export const valueText = (value: ActorValue | undefined): string | undefined =>
  value === undefined ? undefined : textOf(value.value);

/** Text a field holds, as the literal a property of `type` takes, or nothing. */
export function literalOf(
  type: string,
  text: string,
): ActorLiteral | undefined {
  switch (LITERAL[type]) {
    case 'number': {
      const number = Number(text);
      return text.trim() !== '' && Number.isFinite(number)
        ? {type: 'number', value: number}
        : undefined;
    }
    case 'string':
      return {type: 'string', value: text};
    case 'color':
      return /^#[0-9a-f]{6}$/i.test(text.trim())
        ? {type: 'color', value: text.trim().toLowerCase()}
        : undefined;
    case 'boolean':
      return text === 'true' || text === 'false'
        ? {type: 'boolean', value: text === 'true'}
        : undefined;
    case 'vector': {
      const at = parseVectorText(text);
      return at ? {type: 'vector', value: at} : undefined;
    }
    case 'list':
      return {
        type: 'list',
        value: text
          .split(',')
          .map(word => word.trim())
          .filter(Boolean),
      };
    default:
      return undefined;
  }
}

/**
 * The data with one property set. Set back to the property's own default,
 * the value is taken away, so the actor says only what differs; text that
 * is no literal of the type changes nothing.
 */
export function setValue(
  data: ActorData,
  property: TraitProperty,
  text: string,
): ActorData {
  const literal = literalOf(property.type, text);
  if (!literal) {
    return data;
  }
  const kept = (data.values ?? []).filter(
    value => value.setter !== property.setter,
  );
  const values =
    text === property.default
      ? kept
      : [...kept, {setter: property.setter, ...literal} as ActorValue];
  return withList(data, 'values', values);
}

/** A list key, left out when it is empty, as the fold leaves it. */
function withList<K extends 'traits' | 'properties' | 'values'>(
  data: ActorData,
  key: K,
  list: NonNullable<ActorData[K]>,
): ActorData {
  const next = {...data};
  if (list.length) {
    next[key] = list;
  } else {
    delete next[key];
  }
  return next;
}

/** The data with a trait taken, once. */
export const addTrait = (data: ActorData, trait: string): ActorData =>
  (data.traits ?? []).includes(trait)
    ? data
    : withList(data, 'traits', [...(data.traits ?? []), trait]);

/**
 * The data without a trait, and without the values set on its properties:
 * a value for a trait the actor does not take sets nothing anyone reads.
 */
export function removeTrait(
  data: ActorData,
  trait: TraitChoice | string,
): ActorData {
  const value = typeof trait === 'string' ? trait : trait.value;
  const setters = new Set(
    typeof trait === 'string' ? [] : trait.properties.map(one => one.setter),
  );
  return withList(
    withList(
      data,
      'traits',
      (data.traits ?? []).filter(one => one !== value),
    ),
    'values',
    (data.values ?? []).filter(one => !setters.has(one.setter)),
  );
}

/** What a new property of each type starts at. */
const STARTING: Record<string, string | undefined> = {
  number: '0',
  angle: '0',
  boolean: 'false',
  string: '',
  color: '#ffffff',
};

/**
 * The data with a new property of its own, or as it was when the name is
 * empty or already one of its own: two would be one name with two slots.
 */
export function addProperty(
  data: ActorData,
  name: string,
  type: string,
): ActorData {
  const trimmed = name.trim();
  const held = data.properties ?? [];
  if (!trimmed || held.some(one => one.name === trimmed)) {
    return data;
  }
  const start = STARTING[type];
  const property: ActorProperty = {
    name: trimmed,
    type,
    access: 'writable',
    ...(start === undefined ? {} : {value: start}),
  };
  return withList(data, 'properties', [...held, property]);
}

/**
 * The data with one of its own properties starting at another value. A
 * vector's text is `x,y`, and the block keeps the two halves in two fields.
 */
export function setPropertyDefault(
  data: ActorData,
  name: string,
  text: string,
): ActorData {
  const held = data.properties ?? [];
  const at = held.findIndex(one => one.name === name);
  if (at < 0) {
    return data;
  }
  const was = held[at];
  let next: ActorProperty;
  if (was.type === 'vector' || was.type === 'point') {
    const pair = parseVectorText(text);
    if (!pair) {
      return data;
    }
    next = {...was, value: String(pair.x), valueY: String(pair.y)};
  } else {
    next = {...was, value: text};
  }
  if (next.value === was.value && next.valueY === was.valueY) {
    return data;
  }
  const properties = [...held];
  properties[at] = next;
  return {...data, properties};
}

/**
 * The data looking like something else, or like nothing it chose: a
 * picture is its Main animation, still (`actorData.withLookOf`).
 */
export function setLook(
  data: ActorData,
  look: ActorLook | undefined,
): ActorData {
  return withLookOf(data, look);
}

// ── Its animations (specs/ANIMATION_PLAN.md, step 5) ──────────────────────

/** Its animations' names, Main first and the rest as the file has them. */
export const animationNames = (data: ActorData): string[] => {
  const names = Object.keys(data.animations ?? {});
  return [
    ...names.filter(name => name === MAIN_ANIMATION),
    ...names.filter(name => name !== MAIN_ANIMATION),
  ];
};

/**
 * What is wrong with `name` for a new or renamed animation, in the words a
 * prompt shows, or nothing. A name is what `play animation` stores and what
 * the engine finds it by, so two of one name would be one animation lost.
 */
export function animationNameProblem(
  data: ActorData,
  name: string,
  was?: string,
): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Enter a name.';
  }
  if (trimmed !== was && trimmed in (data.animations ?? {})) {
    return `It already has an animation called ${trimmed}.`;
  }
  return undefined;
}

/**
 * The data with a new animation that does nothing yet: no tracks, and not
 * looping (SIMPLE_INTERFACE.md, "Animations": "by default, just the empty
 * properties").
 */
export const addAnimation = (data: ActorData, name: string): ActorData => ({
  ...data,
  animations: {...(data.animations ?? {}), [name.trim()]: {tracks: {}}},
});

/**
 * The data with an animation renamed, in its place in the file, and every
 * `play animation` in the actor's own code that named it naming it still.
 *
 * Only its own code: a block in another file playing it on this kind names
 * it too, and is not followed here.
 */
export function renameAnimation(
  data: ActorData,
  from: string,
  to: string,
): ActorData {
  const name = to.trim();
  if (!data.animations?.[from] || from === name) {
    return data;
  }
  const animations = Object.fromEntries(
    Object.entries(data.animations).map(([key, timeline]) => [
      key === from ? name : key,
      timeline,
    ]),
  );
  const renamed = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map(renamed);
    }
    if (!node || typeof node !== 'object') {
      return node;
    }
    const held = node as Record<string, unknown>;
    const next = Object.fromEntries(
      Object.entries(held).map(([key, value]) => [key, renamed(value)]),
    );
    const fields = held.fields as Record<string, unknown> | undefined;
    if (held.type === 'world_play_animation' && fields?.ANIMATION === from) {
      next.fields = {...fields, ANIMATION: name};
    }
    return next;
  };
  return {
    ...data,
    animations,
    ...(data.blocks
      ? {blocks: renamed(data.blocks) as ActorData['blocks']}
      : {}),
  };
}

/** The data without an animation. */
export function removeAnimation(data: ActorData, name: string): ActorData {
  if (!data.animations?.[name]) {
    return data;
  }
  const animations = {...data.animations};
  delete animations[name];
  const next: ActorData = {...data, animations};
  if (!Object.keys(animations).length) {
    delete next.animations;
  }
  return next;
}

/** The data with an animation starting again at its end, or not. */
export function setAnimationLoop(
  data: ActorData,
  name: string,
  loop: boolean,
): ActorData {
  const timeline = data.animations?.[name];
  if (!timeline || Boolean(timeline.loop) === loop) {
    return data;
  }
  const next = {...timeline};
  if (loop) {
    next.loop = true;
  } else {
    delete next.loop;
  }
  return {...data, animations: {...data.animations, [name]: next}};
}

/** The data for a game, an interface, or both (`actorPurpose`). */
export const setPurpose = (
  data: ActorData,
  purpose: ActorPurpose,
): ActorData => ({...data, for: purpose});

// ── Effects ─────────────────────────────────────────────────────────────

/** One setting of an effect, as the panel edits it. */
export interface EffectSetting {
  /** The parameter's index, and the socket's within it (`socketName`). */
  param: number;
  socket: number;
  label: string;
  type: 'number' | 'boolean' | 'color';
  value: string;
}

const withEffects = (data: ActorData, effects: ActorEffect[]): ActorData => {
  const next = {...data};
  if (effects.length) {
    next.effects = effects;
  } else {
    delete next.effects;
  }
  return next;
};

/**
 * The data with an effect added, on, at its parameters' own defaults: the
 * `add effect` row its block would be built as (`effectParamsMutator`).
 */
export function addEffect(
  data: ActorData,
  effect: string,
  parameters: readonly EffectParameter[],
): ActorData {
  if ((data.effects ?? []).some(one => one.effect === effect)) {
    return data;
  }
  const params = parameters.map(toParamState);
  const inputs = Object.fromEntries(
    params.flatMap((param, index) =>
      paramSockets(param.type).map((socket, at) => [
        socketName(index, at),
        {shadow: socketShadow(param, socket, at)},
      ]),
    ),
  );
  const row: Block = {
    type: 'world_add_effect',
    fields: {EFFECT: effect},
    ...(params.length ? {extraState: {params}, inputs} : {}),
  };
  return withEffects(data, [
    ...(data.effects ?? []),
    {effect, on: true, ...(params.length ? {row} : {})},
  ]);
}

/** The data with an effect on or off at the start. */
export const switchEffect = (
  data: ActorData,
  effect: string,
  on: boolean,
): ActorData =>
  withEffects(
    data,
    (data.effects ?? []).map(one =>
      one.effect === effect ? {...one, on} : one,
    ),
  );

/** The data without an effect. */
export const removeEffect = (data: ActorData, effect: string): ActorData =>
  withEffects(
    data,
    (data.effects ?? []).filter(one => one.effect !== effect),
  );

/** What a socket holds, as text, and the field that holds it. */
function socketValue(
  input: unknown,
): {field: string; value: string} | undefined {
  const held =
    (input as {shadow?: Block; block?: Block} | undefined)?.block ??
    (input as {shadow?: Block} | undefined)?.shadow;
  const fields = (held?.fields ?? {}) as Record<string, unknown>;
  for (const field of ['NUM', 'BOOL', 'COLOUR']) {
    if (field in fields) {
      const value = fields[field];
      return {
        field,
        value:
          field === 'BOOL' ? String(value === 'TRUE') : String(value ?? ''),
      };
    }
  }
  return undefined;
}

/** An effect's settings: each socket of each of its parameters. */
export function effectSettings(effect: ActorEffect): EffectSetting[] {
  const row = effect.row;
  const params = ((row?.extraState as {params?: EffectParamState[]})?.params ??
    []) as EffectParamState[];
  const inputs = (row?.inputs ?? {}) as Record<string, unknown>;
  return params.flatMap((param, index) =>
    paramSockets(param.type).flatMap((socket, at) => {
      const held = socketValue(inputs[socketName(index, at)]);
      return held
        ? [
            {
              param: index,
              socket: at,
              label: socket.label
                ? `${param.name} ${socket.label}`
                : param.name,
              type: socket.kind,
              value: held.value,
            },
          ]
        : [];
    }),
  );
}

/** The data with one setting of an effect changed, or as it was. */
export function setEffectSetting(
  data: ActorData,
  effect: string,
  setting: EffectSetting,
  text: string,
): ActorData {
  const one = (data.effects ?? []).find(each => each.effect === effect);
  const name = socketName(setting.param, setting.socket);
  const input = (
    one?.row?.inputs as
      | Record<string, {shadow?: Block; block?: Block}>
      | undefined
  )?.[name];
  const held = socketValue(input);
  if (!one?.row || !input || !held) {
    return data;
  }
  const value =
    held.field === 'NUM'
      ? Number(text)
      : held.field === 'BOOL'
        ? text === 'true'
          ? 'TRUE'
          : 'FALSE'
        : text;
  if (held.field === 'NUM' && !Number.isFinite(value as number)) {
    return data;
  }
  const slot = input.block ? 'block' : 'shadow';
  const block = input[slot]!;
  const row = {
    ...one.row,
    inputs: {
      ...(one.row.inputs as object),
      [name]: {
        ...input,
        [slot]: {
          ...block,
          fields: {...(block.fields as object), [held.field]: value},
        },
      },
    },
  };
  return withEffects(
    data,
    (data.effects ?? []).map(each =>
      each.effect === effect ? {...each, row} : each,
    ),
  );
}

/** The data with one of its animations changed by `change`. */
function withTimeline(
  data: ActorData,
  name: string,
  change: (timeline: Timeline) => Timeline,
): ActorData {
  const timeline = data.animations?.[name];
  if (!timeline) {
    return data;
  }
  const next = change(timeline);
  return next === timeline
    ? data
    : {...data, animations: {...data.animations, [name]: next}};
}

/**
 * The data with `property` set to `value` at `at` in an animation: a key
 * there, replacing one that was (specs/ANIMATION_PLAN.md, step 7).
 */
export const setAnimationKey = (
  data: ActorData,
  name: string,
  property: string,
  at: number,
  value: unknown,
): ActorData =>
  withTimeline(data, name, timeline => withKey(timeline, property, at, value));

/** The data without the key of `property` at `at` in an animation. */
export const removeAnimationKey = (
  data: ActorData,
  name: string,
  property: string,
  at: number,
): ActorData =>
  withTimeline(data, name, timeline => withoutKey(timeline, property, at));

/** The data with a key moved from `from` to `to`, over one already there. */
export const moveAnimationKey = (
  data: ActorData,
  name: string,
  property: string,
  from: number,
  to: number,
): ActorData =>
  withTimeline(data, name, timeline =>
    withKeyMoved(timeline, property, from, to),
  );

/**
 * The data with an animation's timeline drawn `length` seconds long — room
 * to put keys later than its last. Never shorter than its last key.
 */
export const setAnimationLength = (
  data: ActorData,
  name: string,
  length: number,
): ActorData =>
  withTimeline(data, name, timeline => {
    const next = Math.max(endOf(timeline), Math.round(length * 10) / 10);
    return timeline.length === next ? timeline : {...timeline, length: next};
  });
