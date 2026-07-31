import {z} from 'zod';

import {EFFECT_DOCUMENT_VERSION} from './constants';
import type {EffectDocument} from './types';

/**
 * Runtime validation for `.effect` files. Documents arrive from project
 * storage, from other learners' shared projects, and from hand-editing, so
 * they are parsed rather than trusted.
 */

const literalSchema = z.union([z.number(), z.array(z.number())]);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const portRefSchema = z.object({
  node: z.string().min(1),
  port: z.string().min(1),
  // Canonical `xyzw` only — `rgba` is a display spelling, never a stored one.
  swizzle: z
    .string()
    .regex(/^[xyzw]{1,4}$/)
    .optional(),
});

const graphNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: positionSchema,
  params: z.record(z.string(), literalSchema).optional(),
  note: z.string().optional(),
  size: z
    .object({width: z.number().positive(), height: z.number().positive()})
    .optional(),
  inspected: z.boolean().optional(),
});

const graphEdgeSchema = z.object({
  id: z.string().min(1),
  source: portRefSchema,
  target: portRefSchema,
});

const parameterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // `bool` and `int` are authoring constraints on a float uniform.
  type: z.enum(['float', 'int', 'bool', 'vec2', 'vec3', 'vec4']),
  defaultValue: literalSchema,
  min: z.number().optional(),
  max: z.number().optional(),
  description: z.string().optional(),
});

const functionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  outputType: z.enum(['float', 'vec2', 'vec3', 'vec4']),
  parameters: z.array(parameterSchema),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

export const effectDocumentSchema = z.object({
  version: z.number().int().positive(),
  name: z.string(),
  // Optional, so documents written before it existed still parse — which is
  // why adding it needs no version bump. See `migrate`.
  description: z.string().optional(),
  parameters: z.array(parameterSchema),
  functions: z.array(functionSchema),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  testTexture: z.string().optional(),
});

/** Thrown when a `.effect` file cannot be read as a document. */
export class EffectParseError extends Error {
  /** Field-level problems, as `path: message`. Empty for a JSON syntax error. */
  issues: readonly string[];

  constructor(message: string, issues: readonly string[] = []) {
    super(message);
    this.name = 'EffectParseError';
    this.issues = issues;
  }
}

/**
 * Bring an older document up to the current version.
 *
 * A pass-through until `.effect` files exist outside this repo — shape changes
 * before then (functions were added to v1, for instance) need no migration
 * because there is nothing on disk to migrate. Once files are in the wild,
 * bump `EFFECT_DOCUMENT_VERSION` with the shape change and translate here.
 */
function migrate(raw: unknown): unknown {
  return raw;
}

/** Parse the text contents of a `.effect` file. */
export function parseEffectDocument(source: string): EffectDocument {
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch (error) {
    throw new EffectParseError(
      `Effect file is not valid JSON: ${(error as Error).message}`,
    );
  }

  const result = effectDocumentSchema.safeParse(migrate(raw));
  if (!result.success) {
    const issues = result.error.issues.map(
      issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    throw new EffectParseError('Effect file is not a valid document', issues);
  }

  if (result.data.version > EFFECT_DOCUMENT_VERSION) {
    throw new EffectParseError(
      `Effect file version ${result.data.version} is newer than this editor supports (${EFFECT_DOCUMENT_VERSION})`,
    );
  }

  return result.data;
}

/** Serialize a document to the text contents of a `.effect` file. */
export function serializeEffectDocument(document: EffectDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
