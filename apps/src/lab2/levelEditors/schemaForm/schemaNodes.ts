// What the schema form needs to know about a zod schema node: which
// control it gets, its meta, and the value a new one starts with.

import type {GlobalMeta, ZodType} from 'zod';

interface Def {
  type: string;
  innerType?: ZodType;
  element?: ZodType;
  shape?: Record<string, ZodType>;
  entries?: Record<string, string>;
  values?: unknown[];
  options?: ZodType[];
  discriminator?: string;
  keyType?: ZodType;
  valueType?: ZodType;
  checks?: {_zod: {def: {check: string; minimum?: number}}}[];
}

export const defOf = (schema: ZodType): Def =>
  (schema as unknown as {_zod: {def: Def}})._zod.def;

const ownMeta = (schema: ZodType): GlobalMeta =>
  (schema as unknown as {meta: () => GlobalMeta | undefined}).meta() ?? {};

/** The node under any optional wrapper, and whether there was one. */
export function unwrap(schema: ZodType): {inner: ZodType; optional: boolean} {
  let inner = schema;
  let optional = false;
  while (defOf(inner).type === 'optional') {
    optional = true;
    inner = defOf(inner).innerType as ZodType;
  }
  return {inner, optional};
}

/** The node's meta: the inner node's, with the optional wrapper's own meta
    taking precedence. */
export function metaOf(schema: ZodType): GlobalMeta {
  const {inner} = unwrap(schema);
  return {...ownMeta(inner), ...ownMeta(schema)};
}

export type NodeKind =
  | 'object'
  | 'array'
  | 'enum'
  | 'boolean'
  | 'string'
  | 'number'
  | 'record'
  | 'choice'
  | 'names'
  | 'literal'
  | 'json';

/** The control a node gets. */
export function kindOf(schema: ZodType): NodeKind {
  const {inner} = unwrap(schema);
  const meta = metaOf(schema);
  if (meta.widget === 'json') {
    return 'json';
  }
  if (meta.widget === 'names') {
    return 'names';
  }
  const type = defOf(inner).type;
  switch (type) {
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    case 'enum':
      return 'enum';
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'record':
      return 'record';
    case 'union':
      return 'choice';
    case 'literal':
      return 'literal';
    default:
      return 'json';
  }
}

export function enumValues(schema: ZodType): string[] {
  const def = defOf(unwrap(schema).inner);
  return def.entries ? Object.values(def.entries) : [];
}

export function shapeOf(schema: ZodType): Record<string, ZodType> {
  return defOf(unwrap(schema).inner).shape ?? {};
}

export function elementOf(schema: ZodType): ZodType {
  return defOf(unwrap(schema).inner).element as ZodType;
}

export function recordValueOf(schema: ZodType): ZodType {
  return defOf(unwrap(schema).inner).valueType as ZodType;
}

export function optionsOf(schema: ZodType): ZodType[] {
  return defOf(unwrap(schema).inner).options ?? [];
}

export function discriminatorOf(schema: ZodType): string | undefined {
  return defOf(unwrap(schema).inner).discriminator;
}

/** The literal a discriminated option carries under the discriminator. */
export function tagOf(option: ZodType, discriminator: string): unknown {
  const field = shapeOf(option)[discriminator];
  return field ? defOf(field).values?.[0] : undefined;
}

/** Whether a names node also takes a lone string, as a block check's type
    does: one name or several. */
export function namesTakeString(schema: ZodType): boolean {
  const {inner} = unwrap(schema);
  return (
    defOf(inner).type === 'union' &&
    optionsOf(inner).some(option => defOf(option).type === 'string')
  );
}

/** The element a names node lists. */
export function namesElementOf(schema: ZodType): ZodType {
  const {inner} = unwrap(schema);
  if (defOf(inner).type === 'array') {
    return elementOf(inner);
  }
  const list = optionsOf(inner).find(option => defOf(option).type === 'array');
  return list ? elementOf(list) : inner;
}

/** Which option of a choice a value is: the tagged one, the first that
    takes it, or the first whose required keys it has. */
export function optionIndexFor(schema: ZodType, value: unknown): number {
  const options = optionsOf(schema);
  const discriminator = discriminatorOf(schema);
  if (discriminator && value && typeof value === 'object') {
    const tag = (value as Record<string, unknown>)[discriminator];
    const index = options.findIndex(
      option => tagOf(option, discriminator) === tag
    );
    return Math.max(index, 0);
  }
  const taken = options.findIndex(option => option.safeParse(value).success);
  if (taken >= 0) {
    return taken;
  }
  const keyed = options.findIndex(
    option =>
      kindOf(option) === 'object' &&
      !!value &&
      typeof value === 'object' &&
      requiredKeys(option).every(key => key in (value as object))
  );
  return keyed >= 0 ? keyed : 0;
}

export function requiredKeys(schema: ZodType): string[] {
  return Object.entries(shapeOf(schema))
    .filter(([, child]) => !unwrap(child).optional)
    .map(([key]) => key);
}

/** The value a new node starts with: what its required parts need, and
    nothing optional. */
export function startValue(schema: ZodType): unknown {
  const literal = defOf(unwrap(schema).inner);
  if (literal.type === 'literal') {
    return literal.values?.[0];
  }
  const kind = kindOf(schema);
  switch (kind) {
    case 'object': {
      const start: Record<string, unknown> = {};
      Object.entries(shapeOf(schema)).forEach(([key, child]) => {
        if (!unwrap(child).optional) {
          start[key] = startValue(child);
        }
      });
      return start;
    }
    case 'array':
      return [];
    case 'names':
      return namesTakeString(schema) ? '' : [];
    case 'record':
      return {};
    case 'enum':
      return enumValues(schema)[0];
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'string':
      return '';
    case 'choice': {
      const first = optionsOf(schema)[0];
      return first ? startValue(first) : undefined;
    }
    case 'literal':
      return defOf(unwrap(schema).inner).values?.[0];
    case 'json':
      return {type: ''};
  }
}

/** The title of one item of a list: the element's own title, or the list's
    title without a final s ("Steps" gives "Step"). */
export function itemTitle(schema: ZodType, listTitle?: string): string {
  const own = metaOf(elementOf(schema)).title;
  if (own) {
    return own;
  }
  const title = listTitle ?? 'item';
  return title.endsWith('s') ? title.slice(0, -1) : title;
}
