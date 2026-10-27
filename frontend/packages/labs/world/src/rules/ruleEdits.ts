// What the Rule Editor changes in a rule's data (specs/RULE_EDITOR_PLAN.md,
// step 2).
//
// Pure, as `actors/editor/actorEdits` is: each edit takes the data and gives
// it back changed, or the same data when nothing changed. A property or a
// member is owned by the rule or by one of its traits, named by `owner`:
// `null` for the rule's own, else the trait's name.
//
// A RULE'S NAMES ARE ONE NAMESPACE. Its properties, traits and members are
// exported under keys made from their names (`GravityScaleProperty`), with no
// trait in the key, so two properties in different traits of one rule cannot
// share a name.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {renameMemberInSource} from '../blockly/renameRule';
import {rewriteWorkspace, workspaceViewOf} from '../blockly/rewriteWorkspaces';
import {pascal} from '../blockly/ruleMeta';
import {ruleSlug} from '../blockly/ruleRegistry';

import {
  asRuleData,
  isRuleData,
  type RuleData,
  type RuleProperty,
  type RuleTrait,
} from './ruleData';
import {
  forgetPlacedProperty,
  placedTraitUses,
  renamePlacedProperty,
  renamePlacedTrait,
} from './rulePlacements';
import {resolveRuleContents} from './ruleReference';

/** Whose a property is: the rule's own, or the named trait's. */
export type Owner = string | null;

/** What a property's blocks are named by: `gravity scale` → `GravityScaleProperty`. */
export const propertyKey = (name: string): string => `${pascal(name)}Property`;

/** …and a trait's: `Affected by Gravity` → `AffectedByGravityTrait`. */
export const traitKey = (name: string): string => `${pascal(name)}Trait`;

/** The types a property may have, as the `define` block offers them. */
export const PROPERTY_TYPES: readonly string[] = [
  'number',
  'angle',
  'boolean',
  'string',
  'color',
  'picture',
  'vector',
  'point',
  'actor',
  'actors',
  'numbers',
  'words',
  'vectors',
];

/** What a new property of each type starts at; a list starts empty. */
const STARTING: Readonly<
  Record<string, Pick<RuleProperty, 'value' | 'valueY'>>
> = {
  number: {value: '0'},
  angle: {value: '0'},
  boolean: {value: 'false'},
  string: {value: ''},
  color: {value: '#ffffff'},
  picture: {value: ''},
  vector: {value: {x: 0, y: 0}},
  point: {value: 0, valueY: 0},
};

/** Whether a property of this type has a default to set. */
export const takesDefault = (type: string): boolean => type in STARTING;

/** A property's default as the text its field shows: a pair as `x,y`. */
export function defaultText(property: RuleProperty): string {
  const value = property.value;
  if (property.type === 'point') {
    return `${Number(property.value ?? 0)},${Number(property.valueY ?? 0)}`;
  }
  if (value && typeof value === 'object') {
    const {x, y} = value as {x?: unknown; y?: unknown};
    return `${Number(x ?? 0)},${Number(y ?? 0)}`;
  }
  return value === undefined ? '' : String(value);
}

/** The definition an owner names, or nothing for a trait the rule lacks. */
const definitionOf = (
  data: RuleData,
  owner: Owner,
): RuleData | RuleTrait | undefined =>
  owner === null
    ? data
    : (data.traits ?? []).find(trait => trait.name === owner);

/** The data with one definition changed. */
function withDefinition(
  data: RuleData,
  owner: Owner,
  change: <T extends RuleData | RuleTrait>(definition: T) => T,
): RuleData {
  if (owner === null) {
    return change(data);
  }
  const traits = data.traits ?? [];
  const at = traits.findIndex(trait => trait.name === owner);
  if (at < 0) {
    return data;
  }
  const next = change(traits[at]);
  return next === traits[at]
    ? data
    : {...data, traits: traits.map((one, i) => (i === at ? next : one))};
}

/** A definition with one of its lists set, or without it when empty. */
function withList<T extends object, K extends keyof T>(
  definition: T,
  key: K,
  list: T[K] & unknown[],
): T {
  const next = {...definition};
  if (list.length) {
    next[key] = list;
  } else {
    delete next[key];
  }
  return next;
}

/** Every property of the rule, with its owner. */
export function allProperties(
  data: RuleData,
): Array<{owner: Owner; property: RuleProperty}> {
  return [
    ...(data.properties ?? []).map(property => ({owner: null, property})),
    ...(data.traits ?? []).flatMap(trait =>
      (trait.properties ?? []).map(property => ({
        owner: trait.name,
        property,
      })),
    ),
  ];
}

/** Why a property cannot be called this, or nothing. */
export function propertyProblem(
  data: RuleData,
  name: string,
  was?: string,
): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'A property needs a name.';
  }
  const key = propertyKey(trimmed);
  const taken = allProperties(data).some(
    ({property}) => property.name !== was && propertyKey(property.name) === key,
  );
  return taken
    ? `This rule already has a property called ${trimmed}.`
    : undefined;
}

export function addProperty(
  data: RuleData,
  owner: Owner,
  name: string,
  type: string,
): RuleData {
  const trimmed = name.trim();
  if (propertyProblem(data, trimmed) || !definitionOf(data, owner)) {
    return data;
  }
  const property: RuleProperty = {
    name: trimmed,
    type,
    access: 'writable',
    ...(STARTING[type] ?? {}),
  };
  return withDefinition(data, owner, definition =>
    withList(definition, 'properties', [
      ...(definition.properties ?? []),
      property,
    ]),
  );
}

/** The data with one property changed, found by its owner and name. */
function withProperty(
  data: RuleData,
  owner: Owner,
  name: string,
  change: (property: RuleProperty) => RuleProperty,
): RuleData {
  return withDefinition(data, owner, definition => {
    const held = definition.properties ?? [];
    const at = held.findIndex(one => one.name === name);
    if (at < 0) {
      return definition;
    }
    const next = change(held[at]);
    return JSON.stringify(next) === JSON.stringify(held[at])
      ? definition
      : {
          ...definition,
          properties: held.map((one, i) => (i === at ? next : one)),
        };
  });
}

/**
 * The data with a property starting at the value its field now says. A
 * vector's or a point's text is `x,y`; text a number cannot be is ignored.
 */
export function setPropertyDefault(
  data: RuleData,
  owner: Owner,
  name: string,
  text: string,
): RuleData {
  return withProperty(data, owner, name, property => {
    if (property.type === 'vector' || property.type === 'point') {
      const [x, y] = text.split(',').map(part => Number(part.trim()));
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return property;
      }
      return property.type === 'point'
        ? {...property, value: x, valueY: y}
        : {...property, value: {x, y}};
    }
    if (
      (property.type === 'number' || property.type === 'angle') &&
      (text.trim() === '' || !Number.isFinite(Number(text)))
    ) {
      return property;
    }
    return takesDefault(property.type) ? {...property, value: text} : property;
  });
}

/** Read-only: only the rule's own code may set it. */
export const setPropertyReadOnly = (
  data: RuleData,
  owner: Owner,
  name: string,
  readOnly: boolean,
): RuleData =>
  withProperty(data, owner, name, property => ({
    ...property,
    access: readOnly ? 'readonly' : 'writable',
  }));

/** Another type, starting where a new property of that type starts. */
export const setPropertyType = (
  data: RuleData,
  owner: Owner,
  name: string,
  type: string,
): RuleData =>
  withProperty(data, owner, name, property =>
    property.type === type
      ? property
      : {
          name: property.name,
          type,
          access: property.access,
          ...(STARTING[type] ?? {}),
        },
  );

/** The data without the property; its blocks elsewhere say so in their editors. */
export const deleteProperty = (
  data: RuleData,
  owner: Owner,
  name: string,
): RuleData =>
  withDefinition(data, owner, definition =>
    withList(
      definition,
      'properties',
      (definition.properties ?? []).filter(one => one.name !== name),
    ),
  );

/** The block-type prefixes a rule's members are generated under. */
const MEMBER_TYPE =
  /^(world_(?:get|set|do|query|on|emit))_([A-Za-z0-9]+)_(.+)$/;

/**
 * The files whose code uses one of the rule's members, by file id: the rule's
 * own file aside, where a use is the rule at work rather than a dependent.
 */
export function memberUses(
  source: MultiFileSource,
  fileId: string,
  rule: string,
  key: string,
): string[] {
  const slug = ruleSlug(rule);
  return Object.entries(source.files)
    .filter(([id]) => id !== fileId)
    .filter(([, file]) => {
      let used = false;
      rewriteWorkspace(workspaceViewOf(file.contents ?? ''), {
        type(type) {
          const parts = MEMBER_TYPE.exec(type);
          used ||= Boolean(parts && parts[2] === slug && parts[3] === key);
          return type;
        },
        fields() {},
      });
      return used;
    })
    .map(([id]) => id);
}

/**
 * The project with a property of the rule in `fileId` called `to`: its
 * declaration, and every block that reads or sets it, in every file. The
 * same project when the name will not do.
 */
export function renameProperty(
  source: MultiFileSource,
  fileId: string,
  owner: Owner,
  from: string,
  to: string,
): MultiFileSource {
  const file = source.files[fileId];
  let data: unknown;
  try {
    data = JSON.parse(asRuleData(resolveRuleContents(file?.contents ?? '')));
  } catch {
    return source;
  }
  const name = to.trim();
  if (!isRuleData(data) || name === from || propertyProblem(data, name, from)) {
    return source;
  }
  const renamed = withProperty(data, owner, from, property => ({
    ...property,
    name,
  }));
  if (renamed === data) {
    return source;
  }
  const declared: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...file, contents: JSON.stringify(renamed, null, 2)},
    },
  };
  const followed = renameMemberInSource(
    declared,
    data.name,
    propertyKey(from),
    propertyKey(name),
  );
  // A trait's property is overridden where its holders are placed.
  return owner === null
    ? followed
    : renamePlacedProperty(followed, owner, from, name);
}

/**
 * The project with a property of the rule in `fileId` gone: from the data,
 * and from every placement that overrode it. Its blocks elsewhere are left,
 * and say so in their own editors.
 */
export function deletePropertyInProject(
  source: MultiFileSource,
  fileId: string,
  owner: Owner,
  name: string,
): MultiFileSource {
  const file = source.files[fileId];
  const data = ruleDataOf(file?.contents ?? '');
  if (!data) {
    return source;
  }
  const next = deleteProperty(data, owner, name);
  if (next === data) {
    return source;
  }
  const declared: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...file, contents: JSON.stringify(next, null, 2)},
    },
  };
  return owner === null
    ? declared
    : forgetPlacedProperty(declared, owner, name);
}

/** What using the rule gives a world, as `use rule` names it in a menu. */
export const setAbility = (data: RuleData, text: string): RuleData =>
  data.ability === text ? data : {...data, ability: text};

export const setDescription = (data: RuleData, text: string): RuleData => {
  if ((data.description ?? '') === text) {
    return data;
  }
  const next = {...data};
  if (text) {
    next.description = text;
  } else {
    delete next.description;
  }
  return next;
};

/** Why a trait cannot be called this, or nothing. */
export function traitProblem(
  data: RuleData,
  name: string,
  was?: string,
): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'A trait needs a name.';
  }
  return (data.traits ?? []).some(
    trait => trait.name !== was && traitKey(trait.name) === traitKey(trimmed),
  )
    ? `This rule already has a trait called ${trimmed}.`
    : undefined;
}

/** How the rest of the project names one of this rule's traits. */
export const traitReference = (rule: string, name: string): string =>
  `${rule}#${traitKey(name)}`;

/**
 * The files that name a trait of the rule in `fileId`, by file id: an actor
 * taking it, a rule or trait needing it, a placement overriding it.
 */
export function traitUses(
  source: MultiFileSource,
  fileId: string,
  rule: string,
  name: string,
): string[] {
  const reference = JSON.stringify(traitReference(rule, name));
  const placed = new Set(
    placedTraitUses(source, traitReference(rule, name), name),
  );
  return Object.entries(source.files)
    .filter(([id]) => id !== fileId)
    .filter(
      ([id, file]) =>
        placed.has(id) ||
        resolveRuleContents(file.contents ?? '').includes(reference),
    )
    .map(([id]) => id);
}

/**
 * The project with a trait of the rule in `fileId` called `to`: its
 * declaration, every reference to it, and every placement's overrides of
 * it. The same project when the name will not do.
 */
export function renameTrait(
  source: MultiFileSource,
  fileId: string,
  from: string,
  to: string,
): MultiFileSource {
  const file = source.files[fileId];
  const data = ruleDataOf(file?.contents ?? '');
  const name = to.trim();
  if (
    !data ||
    name === from ||
    traitProblem(data, name, from) ||
    !(data.traits ?? []).some(trait => trait.name === from)
  ) {
    return source;
  }
  const renamed: RuleData = {
    ...data,
    traits: data.traits!.map(trait =>
      trait.name === from ? {...trait, name} : trait,
    ),
  };
  const declared: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...file, contents: JSON.stringify(renamed, null, 2)},
    },
  };
  const followed = renameMemberInSource(
    declared,
    data.name,
    traitKey(from),
    traitKey(name),
  );
  return renamePlacedTrait(
    followed,
    {
      from: traitReference(data.name, from),
      to: traitReference(data.name, name),
    },
    {from, to: name},
  );
}

/** The data without a trait, and so without all it declared. */
export const deleteTrait = (data: RuleData, name: string): RuleData => {
  const traits = (data.traits ?? []).filter(trait => trait.name !== name);
  if (traits.length === (data.traits ?? []).length) {
    return data;
  }
  const next = {...data};
  if (traits.length) {
    next.traits = traits;
  } else {
    delete next.traits;
  }
  return next;
};

export function addTrait(data: RuleData, name: string): RuleData {
  const trimmed = name.trim();
  if (traitProblem(data, trimmed)) {
    return data;
  }
  return {...data, traits: [...(data.traits ?? []), {name: trimmed}]};
}

export const setTraitDescription = (
  data: RuleData,
  owner: string,
  text: string,
): RuleData =>
  withDefinition(data, owner, trait => {
    const was = (trait as RuleTrait).description ?? '';
    if (was === text) {
      return trait;
    }
    return {...trait, description: text};
  });

export const setTraitSubject = (
  data: RuleData,
  owner: string,
  subject: 'actor' | 'camera',
): RuleData =>
  withDefinition(data, owner, trait => {
    const held = trait as RuleTrait;
    if ((held.subject ?? 'actor') === subject) {
      return trait;
    }
    const next = {...held};
    if (subject === 'camera') {
      next.subject = 'camera';
    } else {
      delete next.subject;
    }
    return next as typeof trait;
  });

/** The data using one more rule, or trait for a trait's owner, by name. */
export const addUse = (data: RuleData, owner: Owner, used: string): RuleData =>
  withDefinition(data, owner, definition =>
    !used || (definition.uses ?? []).includes(used)
      ? definition
      : withList(definition, 'uses', [...(definition.uses ?? []), used]),
  );

export const removeUse = (
  data: RuleData,
  owner: Owner,
  used: string,
): RuleData =>
  withDefinition(data, owner, definition =>
    withList(
      definition,
      'uses',
      (definition.uses ?? []).filter(one => one !== used),
    ),
  );

/** The data as the file holds it, or nothing for one that is not a rule. */
export function ruleDataOf(contents: string): RuleData | undefined {
  try {
    const parsed = JSON.parse(asRuleData(resolveRuleContents(contents)));
    return isRuleData(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
