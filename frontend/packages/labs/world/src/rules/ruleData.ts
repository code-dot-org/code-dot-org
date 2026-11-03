// A rule as data (specs/RULE_EDITOR_PLAN.md, step 1).
//
// A data-shaped rule file is a document, as an actor's is: what the rule
// declares — its name and ability, what it is for, the rules it uses, its
// properties, the events and blocks it adds, its steps, and its traits with
// theirs — as keys. Code appears only as the implementation of one of
// those: a block's body, a step's.
//
// What walks a rule's rows — a rename, a search for what uses a block —
// reads it through `ruleView`, the workspace it stands for, and `foldRule`
// turns a workspace back into data: one written in blocks, by hand or by the
// tutor, and a view after its rows are rewritten. The view lists each definition's
// members in one order — uses, properties, events and blocks as given, then
// steps — and puts the rule's description first. A workspace the data cannot
// say whole, such as one with a note among the members or a block the fold
// does not know, does not fold.

import {
  readMember,
  writeMember,
  type ActorMember,
  type Block,
} from '../actors/actorData';

/** What marks a file as data-shaped: `type: 'rule'`, as an actor says `actor`. */
export const RULE_DOCUMENT = 'rule';

/** `define ⟨type⟩ ⟨name⟩`, with its default as the block's field holds it. */
export interface RuleProperty {
  name: string;
  type: string;
  access: 'writable' | 'readonly';
  value?: unknown;
  /** …and a vector's second half, which the block holds in a field of its own. */
  valueY?: unknown;
}

/**
 * Work done every frame. A rule's runs once for the world; a trait's runs
 * once for each holder of the trait. With no `phase` it is a rule's `when
 * tick`, which names no moment of the frame.
 */
export interface RuleStep {
  name: string;
  phase?: string;
  body?: Block;
}

/** What a trait declares: `define trait` and the members under it. */
export interface RuleTrait {
  name: string;
  /** What holds it, when that is not an actor. */
  subject?: 'camera';
  description?: string;
  /** The traits it needs, as `<Rule>#<Export>Trait`. */
  uses?: string[];
  properties?: RuleProperty[];
  members?: ActorMember[];
  steps?: RuleStep[];
}

export interface RuleData {
  type: typeof RULE_DOCUMENT;
  name: string;
  ability: string;
  description?: string;
  /** The rules it uses, by name. */
  uses?: string[];
  properties?: RuleProperty[];
  members?: ActorMember[];
  steps?: RuleStep[];
  traits?: RuleTrait[];
  /** The workspace's variables, which the bodies and the values read. */
  variables?: unknown[];
}

const RULE = 'world_rule';
const TRAIT = 'world_rule_trait';
const DOC = 'world_doc';
const USE_RULE = 'world_use_rule';
const USE_TRAIT = 'world_use_trait';
const PROPERTY = 'world_rule_property';
const STEP_IN = 'world_rule_step_in';
const STEP_TICK = 'world_rule_step_tick';
const TRAIT_STEP = 'world_trait_step';
const MEMBER_ROWS = new Set(['world_rule_block', 'world_rule_event']);

/** Where the view puts its roots; the editor lays them out again. */
const ROOT_X = 20;
const ROOT_GAP = 400;

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Whether a row holds only these keys, ignoring its id. */
const only = (row: Block, keys: readonly string[]): boolean =>
  Object.keys(row).every(key => key === 'id' || keys.includes(key));

const fieldsOf = (row: Block): Record<string, unknown> =>
  isObject(row.fields) ? row.fields : {};

/** Whether a row's fields are among these, and these are strings. */
const stringFields = (row: Block, names: readonly string[]): boolean =>
  Object.entries(fieldsOf(row)).every(
    ([name, value]) => names.includes(name) && typeof value === 'string',
  );

export const isRuleData = (value: unknown): value is RuleData =>
  isObject(value) &&
  value.type === RULE_DOCUMENT &&
  typeof value.name === 'string' &&
  typeof value.ability === 'string';

/** The rows of a chain, top to bottom. */
function rowsOf(first: unknown): Block[] {
  const rows: Block[] = [];
  for (let at = first; isObject(at); ) {
    rows.push(at as Block);
    at = isObject(at.next) ? at.next.block : undefined;
  }
  return rows;
}

/** The rows chained, each below the one before. */
function chain(rows: readonly Block[]): Block | undefined {
  return rows.reduceRight<Block | undefined>(
    (below, row) => (below ? {...row, next: {block: below}} : row),
    undefined,
  );
}

/** A step's body: the chain in its `do`, or nothing for an empty one. */
function bodyOf(row: Block): Block | undefined | false {
  const inputs = isObject(row.inputs) ? row.inputs : {};
  if (!Object.keys(inputs).every(key => key === 'DO')) {
    return false;
  }
  if (inputs.DO === undefined) {
    return undefined;
  }
  return isObject(inputs.DO) &&
    only(inputs.DO, ['block']) &&
    isObject(inputs.DO.block)
    ? (inputs.DO.block as Block)
    : false;
}

function readProperty(row: Block): RuleProperty | undefined {
  const fields = fieldsOf(row);
  if (
    !only(row, ['type', 'fields', 'next']) ||
    !Object.keys(fields).every(key =>
      ['TYPE', 'ACCESS', 'NAME', 'DEFAULT', 'DEFAULT_Y'].includes(key),
    ) ||
    typeof fields.TYPE !== 'string' ||
    typeof fields.NAME !== 'string' ||
    (fields.ACCESS !== undefined &&
      fields.ACCESS !== 'writable' &&
      fields.ACCESS !== 'readonly')
  ) {
    return undefined;
  }
  return {
    name: fields.NAME,
    type: fields.TYPE,
    // Absent reads as writable, as it always has.
    access: fields.ACCESS ?? 'writable',
    ...('DEFAULT' in fields ? {value: fields.DEFAULT} : {}),
    ...('DEFAULT_Y' in fields ? {valueY: fields.DEFAULT_Y} : {}),
  };
}

const writeProperty = (property: RuleProperty): Block => ({
  type: PROPERTY,
  fields: {
    TYPE: property.type,
    ACCESS: property.access,
    NAME: property.name,
    ...(property.value === undefined ? {} : {DEFAULT: property.value}),
    ...(property.valueY === undefined ? {} : {DEFAULT_Y: property.valueY}),
  },
});

function readStep(row: Block, trait: boolean): RuleStep | undefined {
  const fields = fieldsOf(row);
  const timed = row.type === (trait ? TRAIT_STEP : STEP_IN);
  const ticked = !trait && row.type === STEP_TICK;
  const body = bodyOf(row);
  if (
    (!timed && !ticked) ||
    !only(row, ['type', 'fields', 'inputs', 'next']) ||
    !stringFields(row, timed ? ['NAME', 'PHASE'] : ['NAME']) ||
    typeof fields.NAME !== 'string' ||
    (timed && typeof fields.PHASE !== 'string') ||
    body === false
  ) {
    return undefined;
  }
  return {
    name: fields.NAME,
    ...(timed ? {phase: fields.PHASE as string} : {}),
    ...(body ? {body} : {}),
  };
}

function writeStep(step: RuleStep, trait: boolean): Block {
  const type = trait
    ? TRAIT_STEP
    : step.phase === undefined
      ? STEP_TICK
      : STEP_IN;
  return {
    type,
    fields: {
      ...(step.phase === undefined ? {} : {PHASE: step.phase}),
      NAME: step.name,
    },
    ...(step.body ? {inputs: {DO: {block: step.body}}} : {}),
  };
}

/** One string field of a row that holds nothing else, or nothing. */
function oneField(row: Block, field: string): string | undefined {
  const value = fieldsOf(row)[field];
  return only(row, ['type', 'fields', 'next']) &&
    stringFields(row, [field]) &&
    typeof value === 'string'
    ? value
    : undefined;
}

/** What a definition's chain declares, or nothing if a row is not one. */
interface Declared {
  uses: string[];
  properties: RuleProperty[];
  members: ActorMember[];
  steps: RuleStep[];
}

function readChain(
  rows: readonly Block[],
  trait: boolean,
  made: {count: number},
): Declared | undefined {
  const declared: Declared = {uses: [], properties: [], members: [], steps: []};
  for (const row of rows) {
    if (row.type === (trait ? USE_TRAIT : USE_RULE)) {
      const used = oneField(row, trait ? 'TRAIT' : 'RULE');
      if (used === undefined) {
        return undefined;
      }
      declared.uses.push(used);
    } else if (row.type === PROPERTY) {
      const property = readProperty(row);
      if (!property) {
        return undefined;
      }
      declared.properties.push(property);
    } else if (MEMBER_ROWS.has(row.type ?? '')) {
      const member = readMember(row, made.count, {reports: true});
      if (!member) {
        return undefined;
      }
      made.count += 1;
      declared.members.push(member);
    } else {
      const step = readStep(row, trait);
      if (!step) {
        return undefined;
      }
      declared.steps.push(step);
    }
  }
  return declared;
}

/** The keys a definition's lists take, the empty ones left out. */
const listed = (declared: Declared) => ({
  ...(declared.uses.length ? {uses: declared.uses} : {}),
  ...(declared.properties.length ? {properties: declared.properties} : {}),
  ...(declared.members.length ? {members: declared.members} : {}),
  ...(declared.steps.length ? {steps: declared.steps} : {}),
});

function readTrait(root: Block, made: {count: number}): RuleTrait | undefined {
  const fields = fieldsOf(root);
  if (
    !only(root, ['type', 'fields', 'next', 'x', 'y']) ||
    !stringFields(root, ['NAME', 'DESCRIPTION', 'SUBJECT']) ||
    typeof fields.NAME !== 'string' ||
    (fields.SUBJECT !== undefined &&
      fields.SUBJECT !== 'actor' &&
      fields.SUBJECT !== 'camera')
  ) {
    return undefined;
  }
  const declared = readChain(
    rowsOf(isObject(root.next) ? root.next.block : undefined),
    true,
    made,
  );
  if (!declared) {
    return undefined;
  }
  return {
    name: fields.NAME,
    ...(fields.SUBJECT === 'camera' ? {subject: 'camera' as const} : {}),
    ...(typeof fields.DESCRIPTION === 'string'
      ? {description: fields.DESCRIPTION}
      : {}),
    ...listed(declared),
  };
}

/** The code a rule holds: each block's and each step's body, the rule's and its traits'. */
export const ruleBodies = (data: RuleData): Block[] =>
  [data, ...(data.traits ?? [])].flatMap(definition => [
    ...(definition.members ?? []).flatMap(one => (one.body ? [one.body] : [])),
    ...(definition.steps ?? []).flatMap(one => (one.body ? [one.body] : [])),
  ]);

/** A definition's keys that name something, each as the block it stands for. */
interface DefinitionRows {
  uses: Block[];
  properties: Block[];
  members: Block[];
  steps: Block[];
}

/**
 * A rule's keys that name something — its name, its uses, properties,
 * members and steps, and its traits with theirs — each as the block that
 * says it, for a walk that knows a reference by a block's type and fields
 * (`blockly/rewriteWorkspaces`), as an actor's are (`actorData.keyRows`).
 * `withRuleKeyRows` reads them back.
 */
export interface RuleKeyRows extends DefinitionRows {
  rule: Block;
  traits: Array<DefinitionRows & {trait: Block}>;
}

const definitionRows = (
  definition: Pick<RuleTrait, 'uses' | 'properties' | 'members' | 'steps'>,
  trait: boolean,
): DefinitionRows => ({
  uses: (definition.uses ?? []).map(used =>
    trait
      ? {type: USE_TRAIT, fields: {TRAIT: used}}
      : {type: USE_RULE, fields: {RULE: used}},
  ),
  properties: (definition.properties ?? []).map(writeProperty),
  members: (definition.members ?? []).map(writeMember),
  steps: (definition.steps ?? []).map(step => writeStep(step, trait)),
});

export const ruleKeyRows = (data: RuleData): RuleKeyRows => ({
  rule: {type: RULE, fields: {NAME: data.name, ABILITY: data.ability}},
  ...definitionRows(data, false),
  traits: (data.traits ?? []).map(trait => ({
    trait: {
      type: TRAIT,
      fields: {
        NAME: trait.name,
        ...(trait.description === undefined
          ? {}
          : {DESCRIPTION: trait.description}),
      },
    },
    ...definitionRows(trait, true),
  })),
});

/** A definition with what its rows now say; a row it cannot read keeps its key. */
function withDefinitionRows(
  definition: Pick<RuleTrait, 'uses' | 'properties' | 'members' | 'steps'>,
  rows: DefinitionRows,
  trait: boolean,
): Pick<RuleTrait, 'uses' | 'properties' | 'members' | 'steps'> {
  const next = {...definition};
  if (definition.uses) {
    next.uses = definition.uses.map(
      (used, at) => oneField(rows.uses[at], trait ? 'TRAIT' : 'RULE') ?? used,
    );
  }
  if (definition.properties) {
    next.properties = definition.properties.map(
      (property, at) => readProperty(rows.properties[at]) ?? property,
    );
  }
  if (definition.members) {
    next.members = definition.members.map(
      (member, at) =>
        readMember(rows.members[at], at, {reports: true}) ?? member,
    );
  }
  if (definition.steps) {
    next.steps = definition.steps.map(
      (step, at) => readStep(rows.steps[at], trait) ?? step,
    );
  }
  return next;
}

export function withRuleKeyRows(data: RuleData, rows: RuleKeyRows): RuleData {
  const name = fieldsOf(rows.rule).NAME;
  const ability = fieldsOf(rows.rule).ABILITY;
  return {
    ...data,
    ...withDefinitionRows(data, rows, false),
    name: typeof name === 'string' ? name : data.name,
    ability: typeof ability === 'string' ? ability : data.ability,
    ...(data.traits
      ? {
          traits: data.traits.map((trait, at) => {
            const held = rows.traits[at];
            const named = fieldsOf(held.trait).NAME;
            const said = fieldsOf(held.trait).DESCRIPTION;
            return {
              ...trait,
              ...withDefinitionRows(trait, held, true),
              name: typeof named === 'string' ? named : trait.name,
              ...(typeof said === 'string' ? {description: said} : {}),
            };
          }),
        }
      : {}),
  };
}

/**
 * A `define rule` workspace as data, or nothing for one the data cannot
 * say whole: anything but one `define rule` and its traits at the top, a
 * note anywhere but first under the rule, or a row the fold does not know.
 */
export function foldRule(document: unknown): RuleData | undefined {
  if (
    !isObject(document) ||
    !Object.keys(document).every(key =>
      ['blocks', 'variables'].includes(key),
    ) ||
    (document.variables !== undefined && !Array.isArray(document.variables))
  ) {
    return undefined;
  }
  const blocks = document.blocks;
  if (
    !isObject(blocks) ||
    !Object.keys(blocks).every(key =>
      ['languageVersion', 'blocks'].includes(key),
    ) ||
    !Array.isArray(blocks.blocks)
  ) {
    return undefined;
  }
  const [root, ...others] = blocks.blocks as Block[];
  const fields = isObject(root) ? fieldsOf(root) : {};
  if (
    !isObject(root) ||
    root.type !== RULE ||
    !only(root, ['type', 'fields', 'next', 'x', 'y']) ||
    !stringFields(root, ['NAME', 'ABILITY']) ||
    typeof fields.NAME !== 'string' ||
    !others.every(other => isObject(other) && other.type === TRAIT)
  ) {
    return undefined;
  }
  let rows = rowsOf(isObject(root.next) ? root.next.block : undefined);
  let description: string | undefined;
  if (rows[0]?.type === DOC) {
    description = oneField(rows[0], 'DOC');
    if (description === undefined) {
      return undefined;
    }
    rows = rows.slice(1);
  }
  const made = {count: 0};
  const declared = readChain(rows, false, made);
  if (!declared) {
    return undefined;
  }
  const traits: RuleTrait[] = [];
  for (const other of others) {
    const trait = readTrait(other, made);
    if (!trait) {
      return undefined;
    }
    traits.push(trait);
  }
  return {
    type: RULE_DOCUMENT,
    name: fields.NAME,
    // Absent reads as the name, as `parseRuleMeta` always read it.
    ability: (fields.ABILITY as string | undefined) || fields.NAME,
    ...(description === undefined ? {} : {description}),
    ...listed(declared),
    ...(traits.length ? {traits} : {}),
    ...(document.variables ? {variables: document.variables as unknown[]} : {}),
  };
}

/** A definition's members as rows, in the view's order. */
const rowsFor = (
  definition: Pick<RuleTrait, 'uses' | 'properties' | 'members' | 'steps'>,
  trait: boolean,
): Block[] => [
  ...(definition.uses ?? []).map(used =>
    trait
      ? {type: USE_TRAIT, fields: {TRAIT: used}}
      : {type: USE_RULE, fields: {RULE: used}},
  ),
  ...(definition.properties ?? []).map(writeProperty),
  ...(definition.members ?? []).map(writeMember),
  ...(definition.steps ?? []).map(step => writeStep(step, trait)),
];

/** A definition's root, with its members chained below it. */
function rootOf(row: Block, members: readonly Block[], at: number): Block {
  const below = chain(members);
  return {
    ...row,
    x: ROOT_X,
    y: ROOT_X + at * ROOT_GAP,
    ...(below ? {next: {block: below}} : {}),
  };
}

/** The `define rule` workspace the data stands for. */
export function ruleView(data: RuleData): Record<string, unknown> {
  const rule = rootOf(
    {type: RULE, fields: {NAME: data.name, ABILITY: data.ability}},
    [
      ...(data.description === undefined
        ? []
        : [{type: DOC, fields: {DOC: data.description}}]),
      ...rowsFor(data, false),
    ],
    0,
  );
  const traits = (data.traits ?? []).map((trait, at) =>
    rootOf(
      {
        type: TRAIT,
        fields: {
          NAME: trait.name,
          ...(trait.subject ? {SUBJECT: trait.subject} : {}),
          ...(trait.description === undefined
            ? {}
            : {DESCRIPTION: trait.description}),
        },
      },
      rowsFor(trait, true),
      at + 1,
    ),
  );
  return {
    blocks: {languageVersion: 0, blocks: [rule, ...traits]},
    ...(data.variables ? {variables: data.variables} : {}),
  };
}

/**
 * The contents as a `define rule` workspace, whatever their shape: the view
 * of a data-shaped file, and any other contents as they are.
 */
export function ruleViewOf(contents: string): string {
  if (!/"type":\s*"rule"/.test(contents)) {
    return contents;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return contents;
  }
  return isRuleData(parsed)
    ? JSON.stringify(ruleView(parsed), null, 2)
    : contents;
}

/** The contents in the data shape: a workspace folded, or as they are. */
export function asRuleData(contents: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return contents;
  }
  if (isRuleData(parsed)) {
    return contents;
  }
  const data = foldRule(parsed);
  return data ? JSON.stringify(data, null, 2) : contents;
}
