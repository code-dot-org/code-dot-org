// A lab's settings schema written out for people and for AI: as JSON
// Schema, for tools that generate or check levels, and as a Markdown
// reference with the lab's own introduction, the rules that tie fields
// together, and worked examples. Both come from the zod schema, so they
// stay in step with it; a lab's test regenerates them and fails when they
// are stale.

import {z, ZodType} from 'zod';

import {
  elementOf,
  enumValues,
  discriminatorOf,
  kindOf,
  metaOf,
  optionsOf,
  recordValueOf,
  shapeOf,
  tagOf,
  unwrap,
  defOf,
} from './schemaNodes';

export interface SchemaDocsInput {
  title: string;
  /** Markdown: what the settings are and how a level uses them. */
  intro: string;
  /** Rules that tie fields together, which JSON Schema cannot state. */
  rules: string[];
  examples: {title: string; description?: string; value: unknown}[];
}

// Keys only the form uses.
const FORM_ONLY_KEYS = new Set(['widget', 'placeholder']);

function choicesFrom(pattern: string): string {
  return pattern.startsWith('@')
    ? `one of the names the editor page supplies as "${pattern.slice(1)}"`
    : `a name found at "${pattern}" in the settings`;
}

// The form's keys turned into what a reader of JSON Schema expects.
function forReaders(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(forReaders);
  }
  if (!node || typeof node !== 'object') {
    return node;
  }
  const out: Record<string, unknown> = {};
  Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
    if (FORM_ONLY_KEYS.has(key)) {
      return;
    }
    if (key === 'defaultValue') {
      out.default = value;
    } else if (key === 'options' && typeof value === 'string') {
      out['x-choices'] = choicesFrom(value);
    } else if (key === 'keyOptions' && typeof value === 'string') {
      out['x-key-choices'] = choicesFrom(value);
    } else {
      out[key] = forReaders(value);
    }
  });
  return out;
}

/** The schema as JSON Schema, with every title and description. */
export function jsonSchemaFor(
  schema: ZodType,
  input: Pick<SchemaDocsInput, 'title' | 'rules'>
): object {
  const json = z.toJSONSchema(schema, {unrepresentable: 'any', io: 'input'});
  const readable = forReaders(json) as Record<string, unknown>;
  return {
    ...readable,
    title: input.title,
    'x-rules': input.rules,
  };
}

// One line about a node's type, for the Markdown reference.
function typeOf(schema: ZodType): string {
  const {inner} = unwrap(schema);
  const meta = metaOf(schema);
  if (meta.options) {
    const many = defOf(inner).type === 'array';
    return many
      ? `list of names, each ${choicesFrom(meta.options)}`
      : `name, ${choicesFrom(meta.options)}`;
  }
  switch (kindOf(schema)) {
    case 'object':
      return 'group';
    case 'array':
      return kindOf(elementOf(schema)) === 'object' ||
        kindOf(elementOf(schema)) === 'choice'
        ? 'list'
        : `list; each item: ${typeOf(elementOf(schema))}`;
    case 'enum':
      return `one of ${enumValues(schema)
        .map(value => `\`${value}\``)
        .join(', ')}`;
    case 'boolean':
      return 'true or false';
    case 'number':
      return 'number';
    case 'string':
      return meta.widget === 'markdown' ? 'markdown text' : 'text';
    case 'names':
      return 'list of names';
    case 'record':
      return `map${
        meta.keyOptions
          ? ` whose keys are each ${choicesFrom(meta.keyOptions)}`
          : ''
      } to ${typeOf(recordValueOf(schema))}`;
    case 'choice':
      return 'one of the shapes below';
    case 'literal':
      return `exactly \`${JSON.stringify(defOf(inner).values?.[0])}\``;
    default:
      return 'JSON';
  }
}

function describeFields(
  schema: ZodType,
  depth: number,
  lines: string[],
  skip?: string
): void {
  Object.entries(shapeOf(schema)).forEach(([key, child]) => {
    if (key === skip) {
      return;
    }
    describeNode(key, child, depth, lines);
  });
}

function describeNode(
  key: string,
  schema: ZodType,
  depth: number,
  lines: string[]
): void {
  const meta = metaOf(schema);
  const {optional} = unwrap(schema);
  const pad = '  '.repeat(depth);
  const notes = [
    typeOf(schema),
    optional ? 'optional' : 'required',
    meta.defaultValue !== undefined
      ? `default ${JSON.stringify(meta.defaultValue)}`
      : undefined,
  ].filter(Boolean);
  const words = [
    meta.title && meta.title !== key ? `${meta.title}.` : undefined,
    meta.feature ? `Turns on: ${meta.feature}.` : undefined,
    meta.description,
  ].filter(Boolean);
  lines.push(
    `${pad}- \`${key}\` (${notes.join('; ')})${
      words.length ? `: ${words.join(' ')}` : ''
    }`
  );
  describeInside(schema, depth + 1, lines);
}

function describeInside(schema: ZodType, depth: number, lines: string[]) {
  const pad = '  '.repeat(depth);
  switch (kindOf(schema)) {
    case 'object':
      describeFields(schema, depth, lines);
      return;
    case 'array': {
      const element = elementOf(schema);
      if (kindOf(element) === 'object' || kindOf(element) === 'choice') {
        lines.push(
          `${pad}- each item${
            metaOf(element).title ? ` (${metaOf(element).title})` : ''
          }:`
        );
        describeInside(element, depth + 1, lines);
      }
      return;
    }
    case 'record': {
      const value = recordValueOf(schema);
      if (kindOf(value) === 'object') {
        lines.push(`${pad}- each value:`);
        describeInside(value, depth + 1, lines);
      }
      return;
    }
    case 'choice': {
      const discriminator = discriminatorOf(schema);
      optionsOf(schema).forEach(option => {
        const title = metaOf(option).title;
        const tag = discriminator && tagOf(option, discriminator);
        lines.push(
          `${pad}- ${
            tag !== undefined ? `\`${discriminator}: "${tag}"\`` : 'shape'
          }${title ? `: ${title}` : ''}`
        );
        if (kindOf(option) === 'object') {
          describeFields(option, depth + 1, lines, discriminator);
        }
      });
      return;
    }
  }
}

/** The schema as a Markdown reference. */
export function markdownFor(schema: ZodType, input: SchemaDocsInput): string {
  const lines: string[] = [
    `# ${input.title}`,
    '',
    '<!-- Generated from the zod schema. Do not edit by hand; see the test that writes it. -->',
    '',
    input.intro.trim(),
    '',
    '## Settings',
    '',
  ];
  describeInside(schema, 0, lines);
  lines.push('', '## Rules', '');
  input.rules.forEach(rule => lines.push(`- ${rule}`));
  lines.push('', '## Examples', '');
  input.examples.forEach(example => {
    lines.push(`### ${example.title}`, '');
    if (example.description) {
      lines.push(example.description, '');
    }
    lines.push('```json', JSON.stringify(example.value, null, 2), '```', '');
  });
  return `${lines.join('\n').trimEnd()}\n`;
}
