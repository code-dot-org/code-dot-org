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
  /**
   * The row's DEFAULT as stored — a string, whatever the type. A vector or a
   * point is two numbers with a comma between, `"0,1"` (`vectorText`), so a
   * value can be compared to a rule's own as text like every other.
   */
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
  /** The color behind the background image (`readBackgroundColor`). */
  backgroundColor?: BackgroundColor;
  /**
   * The theme the world is painted in: its first `use theme` row's, or
   * nothing. A main map has no theme of its own — the world's is its.
   */
  theme?: string;
}

/**
 * The world's background color, as its `set background color` row says it.
 *
 * `color` is the `#rrggbb` a swatch holds, or nothing when no row sets one
 * — the engine's own then (`DEFAULT_BACKDROP_COLOR`). `inCode` says a row
 * sets it to something a field cannot show, a blend or an `r g b a`, which
 * a field would throw away by writing over it.
 */
export interface BackgroundColor {
  color: string | undefined;
  inCode: boolean;
}

/** The block that sets the world's background color, and its swatch. */
const SET_BACKGROUND_COLOR = 'world_set_background_color';
const SWATCH = 'colour_picker';

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

/** A vector or point, as the text a `WorldProperty` carries it in. */
export const vectorText = (value: {x: number; y: number}): string =>
  `${value.x},${value.y}`;

/** The vector `vectorText` wrote, or nothing for text that is not one. */
export const parseVectorText = (
  text: string,
): {x: number; y: number} | undefined => {
  const parts = text.split(',');
  if (parts.length !== 2) {
    return undefined;
  }
  const [x, y] = parts.map(part => Number(part.trim()));
  return Number.isFinite(x) && Number.isFinite(y) ? {x, y} : undefined;
};

// A number where one is stored, whatever it was stored as.
const asNumber = (value: unknown): number => {
  const held = Number(value ?? 0);
  return Number.isFinite(held) ? held : 0;
};

// The vector a `world_vector` literal or a `define vector` row holds: one
// field with both axes in it, `{x, y}`.
const asVectorText = (value: unknown): string => {
  const held = (value ?? {}) as {x?: unknown; y?: unknown};
  return vectorText({x: asNumber(held.x), y: asNumber(held.y)});
};

/**
 * A row's DEFAULT as text. A vector's is one field holding both axes; a
 * point's is two fields, `DEFAULT` and `DEFAULT_Y` — the shapes the
 * `define property` block gives them (`domainBlocks.shapeDefaultField`).
 */
const defaultText = (row: Block, type: string): string => {
  if (type === 'vector') {
    return asVectorText(row.fields?.DEFAULT);
  }
  if (type === 'point') {
    return vectorText({
      x: asNumber(row.fields?.DEFAULT),
      y: asNumber(row.fields?.DEFAULT_Y),
    });
  }
  return asText(row.fields?.DEFAULT);
};

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
  if (held.type === 'world_vector') {
    return 'VECTOR' in fields ? asVectorText(fields.VECTOR) : undefined;
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
  if (type === 'vector') {
    const held = parseVectorText(value);
    return held ? {type: 'world_vector', fields: {VECTOR: held}} : undefined;
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
      const type = asText(row.fields?.TYPE) || 'number';
      properties.push({name, type, value: defaultText(row, type)});
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
  return {
    name: asText(root.fields?.NAME),
    properties,
    backgroundColor: readBackgroundColor(root),
    theme: readWorldTheme(root),
  };
}

/** The block that says which theme a world is painted in. */
const USE_THEME = 'world_use_theme';

/** What the first `use theme` row under `define world` names, or nothing. */
function readWorldTheme(root: Block): string | undefined {
  const row = [...rows(root)].find(each => each.type === USE_THEME);
  return asText(row?.fields?.THEME) || undefined;
}

/**
 * The file with the world painted in `theme`, a `.style` module path; nothing
 * takes the `use theme` row away. The first row is rewritten, or one added at
 * the top of the world's rows — at the top because it decides how everything
 * after it is drawn.
 */
export function writeWorldTheme(
  contents: string,
  theme: string | undefined,
): string {
  return rewrite(contents, root => {
    let previous: Block = root;
    for (const row of rows(root)) {
      if (row.type === USE_THEME) {
        if (theme) {
          row.fields = {...row.fields, THEME: theme};
        } else {
          previous.next = row.next;
        }
        return true;
      }
      previous = row;
    }
    if (!theme) {
      return false;
    }
    root.next = {
      block: {
        type: USE_THEME,
        fields: {THEME: theme},
        ...(root.next ? {next: root.next} : {}),
      },
    };
    return true;
  });
}

/**
 * What the FIRST `set background color` row under `define world` says: a
 * world may set it twice and the last would win, but a field that showed the
 * last and wrote the first would agree with neither — the same choice the
 * rules' rows make above.
 */
function readBackgroundColor(root: Block): BackgroundColor {
  const row = [...rows(root)].find(each => each.type === SET_BACKGROUND_COLOR);
  if (!row) {
    return {color: undefined, inCode: false};
  }
  const value = row.inputs?.COLOR;
  const held = value?.block ?? value?.shadow;
  const color = held?.type === SWATCH ? asText(held.fields?.COLOUR) : '';
  return color ? {color, inCode: false} : {color: undefined, inCode: true};
}

/**
 * The file with the world's background color set to `color`, a `#rrggbb`.
 *
 * The first row that sets it is given the swatch, or one is added at the top
 * of the world's rows — at the top because this is a STARTING value. Nothing
 * is written over a row that sets it to more than a swatch (`inCode`).
 */
export function writeWorldBackgroundColor(
  contents: string,
  color: string,
): string {
  const swatch = {type: SWATCH, fields: {COLOUR: color}};
  return rewrite(contents, root => {
    const row = [...rows(root)].find(
      each => each.type === SET_BACKGROUND_COLOR,
    );
    if (row) {
      if (readBackgroundColor(root).inCode) {
        return false;
      }
      row.inputs = {...row.inputs, COLOR: {shadow: swatch}};
      return true;
    }
    root.next = {
      block: {
        type: SET_BACKGROUND_COLOR,
        inputs: {COLOR: {shadow: swatch}},
        ...(root.next ? {next: root.next} : {}),
      },
    };
    return true;
  });
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
 * reads the type from the row (`propertyDefault`). A vector or point is
 * stored in the shape its row keeps it in (`defaultText`), and text that is
 * not one leaves the file as it was.
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
        const type = asText(row.fields?.TYPE);
        if (type === 'vector' || type === 'point') {
          const held = parseVectorText(value);
          if (!held) {
            return false;
          }
          row.fields =
            type === 'vector'
              ? {...row.fields, DEFAULT: held}
              : {...row.fields, DEFAULT: held.x, DEFAULT_Y: held.y};
          return true;
        }
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
