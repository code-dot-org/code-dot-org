// Reads a schema and says what form to draw for it: one field for each
// option, with the control that suits the option's type. Nothing here knows
// about any one lab.

import {z} from 'zod';

export type FieldKind =
  | 'flag' // yes or no
  | 'choice' // one of a fixed set
  | 'text'
  | 'number'
  | 'names' // a list of short strings, typed with commas between
  | 'lines' // a list of strings, typed one to a line
  | 'group' // a set of fields under a heading
  | 'json'; // anything else, typed as JSON

export interface FieldInfo {
  key: string;
  kind: FieldKind;
  /** What the author reads beside the control. */
  title: string;
  description?: string;
  /** Whether the option can be left unset. */
  optional: boolean;
  /** The values of a choice, or the values allowed in a list of names. */
  choices?: string[];
  /** The fields of a group. */
  fields?: FieldInfo[];
}

interface FieldMeta {
  title?: string;
  description?: string;
  /** Asks for a control other than the type's usual one. */
  widget?: 'lines';
}

// "startPattern" reads "Start pattern" when an option has no title.
function titleFromKey(key: string): string {
  const words = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const choicesOf = (schema: z.ZodType): string[] | undefined =>
  schema.def.type === 'enum'
    ? (schema as z.ZodEnum).options.map(String)
    : undefined;

function describeField(key: string, schema: z.ZodType): FieldInfo {
  // An option's label may be set on the option or on what it wraps.
  let inner = schema;
  let optional = false;
  let meta = (schema.meta() ?? {}) as FieldMeta;
  while (inner.def.type === 'optional') {
    optional = true;
    inner = (inner as z.ZodOptional<z.ZodType>).def.innerType;
    meta = {...((inner.meta() ?? {}) as FieldMeta), ...meta};
  }
  const info = {
    key,
    title: meta.title ?? titleFromKey(key),
    description: meta.description,
    optional,
  };
  switch (inner.def.type) {
    case 'boolean':
      return {...info, kind: 'flag'};
    case 'enum':
      return {...info, kind: 'choice', choices: choicesOf(inner)};
    case 'string':
      return {...info, kind: 'text'};
    case 'number':
      return {...info, kind: 'number'};
    case 'object':
      return {...info, kind: 'group', fields: describeSchema(inner)};
    case 'array': {
      const element = (inner as z.ZodArray<z.ZodType>).def.element;
      if (element.def.type === 'string' || element.def.type === 'enum') {
        return {
          ...info,
          kind: meta.widget === 'lines' ? 'lines' : 'names',
          choices: choicesOf(element),
        };
      }
      return {...info, kind: 'json'};
    }
    default:
      return {...info, kind: 'json'};
  }
}

/** The fields to draw for an object schema, in the order it lists them. */
export function describeSchema(schema: z.ZodType): FieldInfo[] {
  if (schema.def.type !== 'object') {
    return [];
  }
  const shape = (schema as z.ZodObject).shape;
  return Object.keys(shape).map(key => describeField(key, shape[key]));
}
