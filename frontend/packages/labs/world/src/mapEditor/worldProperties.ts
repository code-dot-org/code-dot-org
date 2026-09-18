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
}

export interface WorldHeader {
  name: string;
  properties: WorldProperty[];
}

interface Block {
  type?: string;
  fields?: Record<string, unknown>;
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

/** The world's name and properties, or nothing when the file has no world. */
export function readWorldHeader(contents: string): WorldHeader | undefined {
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
