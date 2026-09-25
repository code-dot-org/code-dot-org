// A world's name and own properties, read from and written to its file
// without a workspace (specs/MAIN_MAP_PLAN.md, "the world's properties on
// empty selection").
//
// The world's workspace serialization holds `define world` as a root with
// its rows chained below; a `define property` row carries NAME, TYPE and a
// DEFAULT field, which is the starting value the engine gives the property
// (`ownProperties.parseWorldOwnMeta`). The map editor shows those as fields
// with nothing selected, and an edit is one field rewritten in the JSON —
// the same document surgery a placement's rename does — so a value can be
// set where the world is, without opening the blocks.

export interface WorldProperty {
  /** As the row names it: `score`, `lives`. */
  name: string;
  /** The row's TYPE: `number`, `boolean`, `string`, `vector`, … */
  type: string;
  /** The row's DEFAULT as stored — a string, whatever the type. */
  value: string;
  /**
   * The block that sets it, for a RULE's world-scoped property —
   * `world_set_Scoring_TargetScoreProperty`. Absent for the world's own,
   * which carry their starting value as a DEFAULT field instead.
   */
  setter?: string;
  /** Which rule it came from, which is the group the inspector lists it under. */
  rule?: string;
}

/**
 * A rule's world-scoped property, as the caller describes one.
 *
 * Handed in rather than looked up, so this file stays what it is: surgery on
 * a world's JSON, with no idea what a rule is. What a project holds and what
 * each property's default is are the map editor's to know
 * (`blockly/projectModules`, specs/WORLD_RULE_FIELDS_PLAN.md).
 */
export interface WorldRuleProperty {
  /** The setter's block type. */
  setter: string;
  name: string;
  type: string;
  rule: string;
  /** The rule's own starting value, shown when the world says nothing. */
  default: string;
}

export interface WorldHeader {
  name: string;
  properties: WorldProperty[];
}

interface Block {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Block; shadow?: Block} | undefined>;
  next?: {block?: Block};
}

interface Document {
  blocks?: {blocks?: Block[]};
}

const parse = (contents: string): Document | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return parsed && typeof parsed === 'object'
      ? (parsed as Document)
      : undefined;
  } catch {
    return undefined;
  }
};

const rootOf = (document: Document | undefined): Block | undefined =>
  document?.blocks?.blocks?.find(block => block?.type === 'world_world');

function* rows(root: Block): Generator<Block> {
  for (let at = root.next?.block; at; at = at.next?.block) {
    yield at;
  }
}

const asText = (value: unknown): string =>
  value === undefined || value === null ? '' : String(value);

/**
 * The literal a `set` row holds, as text — or nothing when the row's value
 * is anything but a literal, which is a world saying something a field
 * cannot show.
 */
const literalOf = (row: Block): string | undefined => {
  const value = row.inputs?.VALUE;
  const held = value?.block ?? value?.shadow;
  const fields = held?.fields;
  if (!held || !fields) {
    return undefined;
  }
  if (held.type === 'math_number') {
    return 'NUM' in fields ? asText(fields.NUM) : undefined;
  }
  if (held.type === 'text') {
    return 'TEXT' in fields ? asText(fields.TEXT) : undefined;
  }
  if (held.type === 'logic_boolean') {
    return asText(fields.BOOL).toUpperCase() === 'TRUE' ? 'true' : 'false';
  }
  return undefined;
};

/** The value block a literal of this type is written as. */
const literalBlock = (type: string, value: string): Block | undefined => {
  if (type === 'number' || type === 'angle') {
    const held = Number(value);
    return Number.isFinite(held)
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
  return undefined;
};

/** The world's name and properties, or nothing when the file has no world. */
export function readWorldHeader(
  contents: string,
  ruleProperties: readonly WorldRuleProperty[] = [],
): WorldHeader | undefined {
  const root = rootOf(parse(contents));
  if (!root) {
    return undefined;
  }
  const properties: WorldProperty[] = [];
  for (const row of rows(root)) {
    if (row.type !== 'world_rule_property') {
      continue;
    }
    const name = asText(row.fields?.NAME).trim();
    if (name) {
      properties.push({
        name,
        type: asText(row.fields?.TYPE) || 'number',
        value: asText(row.fields?.DEFAULT),
      });
    }
  }
  // …and the world-scoped properties of the rules the project holds, each
  // showing what the world says about it or, saying nothing, the rule's own
  // (specs/WORLD_RULE_FIELDS_PLAN.md). The FIRST row that sets one is what
  // is shown: a world may set a property twice and the last would win, but
  // a field that showed the last and wrote the first would agree with
  // neither.
  for (const property of ruleProperties) {
    const row = [...rows(root)].find(each => each.type === property.setter);
    properties.push({
      name: property.name,
      type: property.type,
      value: (row && literalOf(row)) ?? property.default,
      setter: property.setter,
      rule: property.rule,
    });
  }
  return {name: asText(root.fields?.NAME), properties};
}

/** The file with the world renamed, or as it was when it has no world. */
export function writeWorldName(contents: string, name: string): string {
  return rewrite(contents, root => {
    root.fields = {...root.fields, NAME: name};
    return true;
  });
}

/**
 * The file with one property's DEFAULT replaced, or as it was when no row
 * declares `property`. A number is stored as the digits typed; the engine
 * reads the type from the row (`propertyDefault`).
 */
export function writeWorldPropertyDefault(
  contents: string,
  property: string,
  value: string,
): string {
  return rewrite(contents, root => {
    for (const row of rows(root)) {
      if (
        row.type === 'world_rule_property' &&
        asText(row.fields?.NAME).trim() === property
      ) {
        row.fields = {...row.fields, DEFAULT: value};
        return true;
      }
    }
    return false;
  });
}

/**
 * The file with a RULE's world property set to `value`.
 *
 * The row that sets it is rewritten, or added at the top of the world's rows
 * when there is none — at the top because this is a STARTING value, and a
 * row below something that reads it would be too late. A value equal to the
 * rule's own default takes the row away again, so a world's file says only
 * what differs from the rules it holds.
 */
export function writeWorldRuleValue(
  contents: string,
  property: WorldRuleProperty,
  value: string,
): string {
  const held = literalBlock(property.type, value);
  if (!held) {
    return contents;
  }
  return rewrite(contents, root => {
    let previous: Block = root;
    for (const row of rows(root)) {
      if (row.type === property.setter) {
        if (value === property.default) {
          previous.next = row.next;
        } else {
          row.inputs = {...row.inputs, VALUE: {shadow: held}};
        }
        return true;
      }
      previous = row;
    }
    if (value === property.default) {
      return false;
    }
    root.next = {
      block: {
        type: property.setter,
        inputs: {VALUE: {shadow: held}},
        ...(root.next ? {next: root.next} : {}),
      },
    };
    return true;
  });
}

/**
 * Parse, hand the root to `change`, and write the whole document back —
 * or hand the contents back untouched when `change` found nothing to do,
 * so a miss is not a rewrite.
 */
function rewrite(contents: string, change: (root: Block) => boolean): string {
  const document = parse(contents);
  const root = rootOf(document);
  if (!document || !root || !change(root)) {
    return contents;
  }
  return JSON.stringify(document, null, 2);
}
