// What the Actor Editor's panel changes in an actor's data, and what it
// offers (specs/ACTOR_EDITOR_PLAN.md, step 4).
//
// Pure: each edit takes the data and gives back the data changed, or the
// same data when there was nothing to change, and the editor writes it.

import {projectRuleMetas} from '../../blockly/projectModules';
import {memberLocalName, memberValue} from '../../blockly/ruleRegistry';
import {parseVectorText, vectorText} from '../../mapEditor/worldProperties';
import {STOCK_RULES} from '../../rules/stock';
import type {
  ActorData,
  ActorLiteral,
  ActorLook,
  ActorProperty,
  ActorValue,
} from '../actorData';
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

/** The data with one of its own properties starting at another value. */
export function setPropertyDefault(
  data: ActorData,
  name: string,
  text: string,
): ActorData {
  const held = data.properties ?? [];
  const at = held.findIndex(one => one.name === name);
  if (at < 0 || held[at].value === text) {
    return data;
  }
  const properties = [...held];
  properties[at] = {...held[at], value: text};
  return {...data, properties};
}

/** The data looking like something else, or like nothing it chose. */
export function setLook(
  data: ActorData,
  look: ActorLook | undefined,
): ActorData {
  const next = {...data};
  if (look) {
    next.look = look;
  } else {
    delete next.look;
  }
  return next;
}

/** The data for a game, an interface, or both (`actorPurpose`). */
export const setPurpose = (
  data: ActorData,
  purpose: ActorPurpose,
): ActorData => ({...data, for: purpose});
