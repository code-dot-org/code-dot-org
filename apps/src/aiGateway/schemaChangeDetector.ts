/**
 * Detects semantic changes between two JSON Schema objects (as produced by
 * zod-to-json-schema) and classifies each change as HARD_BREAKING,
 * UNKNOWN_NARROWING, or ADDITIVE.
 *
 * HARD_BREAKING  — callers or servers would break without a code change
 * UNKNOWN_NARROWING — a previously unconstrained field (z.unknown → {}) is now
 *                    typed; may or may not be breaking depending on direction
 *                    and context; requires human judgement
 * ADDITIVE       — backward-compatible expansion (new optional field, widened
 *                    type, new enum value, etc.)
 */

export type ChangeKind = 'HARD_BREAKING' | 'UNKNOWN_NARROWING' | 'ADDITIVE';

export interface ChangeResult {
  kind: ChangeKind;
  path: string;
  description: string;
}

// JSON Schema as produced by zod-to-json-schema
export type JsonSchema = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare `oldSchema` (the committed snapshot) against `currentSchema` (the
 * live Zod-derived schema) and return every detected change.
 *
 * Strip `_warnings` from the snapshot before calling this — those are update-
 * script metadata and are not part of the contract.
 */
export function detectChanges(
  oldSchema: JsonSchema,
  currentSchema: JsonSchema,
  path = 'root'
): ChangeResult[] {
  const effectiveOld = stripMetaKeys(oldSchema);
  const effectiveCurrent = stripMetaKeys(currentSchema);
  return compareSchemas(effectiveOld, effectiveCurrent, path);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strip keys that are schema-level metadata and should not participate in
 * semantic comparison.
 */
function stripMetaKeys(schema: JsonSchema): JsonSchema {
  const {$schema, title, description, ...rest} = schema;
  void $schema;
  void title;
  void description;
  return rest;
}

/**
 * Returns true if the schema places no constraints on its value — i.e. it is
 * equivalent to z.unknown() / JSON Schema `{}`.
 */
export function isEmptySchema(schema: JsonSchema): boolean {
  const CONSTRAINING_KEYS = [
    'type',
    'properties',
    'required',
    'enum',
    'items',
    'allOf',
    'anyOf',
    'oneOf',
    'not',
    'minimum',
    'maximum',
    'minLength',
    'maxLength',
    'pattern',
    'format',
    'const',
    'additionalProperties',
  ];
  return !CONSTRAINING_KEYS.some(k => k in schema);
}

function compareSchemas(
  oldSchema: JsonSchema,
  currentSchema: JsonSchema,
  path: string
): ChangeResult[] {
  const results: ChangeResult[] = [];

  const oldEmpty = isEmptySchema(oldSchema);
  const currentEmpty = isEmptySchema(currentSchema);

  // {} → concrete: unknown narrowing
  if (oldEmpty && !currentEmpty) {
    results.push({
      kind: 'UNKNOWN_NARROWING',
      path,
      description: `'${path}' was unconstrained (unknown) and is now typed`,
    });
    return results;
  }

  // concrete → {}: widening (additive)
  if (!oldEmpty && currentEmpty) {
    results.push({
      kind: 'ADDITIVE',
      path,
      description: `'${path}' was typed and is now unconstrained (widened to unknown)`,
    });
    return results;
  }

  // Both empty — no change
  if (oldEmpty && currentEmpty) {
    return results;
  }

  // Type changed
  if (
    oldSchema.type !== undefined &&
    currentSchema.type !== undefined &&
    oldSchema.type !== currentSchema.type
  ) {
    results.push({
      kind: 'HARD_BREAKING',
      path,
      description: `'${path}' type changed from '${oldSchema.type}' to '${currentSchema.type}'`,
    });
    return results; // type mismatch makes further property recursion meaningless
  }

  // Enum changes
  const hadEnum = 'enum' in oldSchema;
  const hasEnum = 'enum' in currentSchema;
  if (hadEnum || hasEnum) {
    results.push(...compareEnums(oldSchema, currentSchema, path));
  }

  // Object: recurse into properties + check required
  const isObject =
    oldSchema.type === 'object' ||
    currentSchema.type === 'object' ||
    oldSchema.properties !== undefined ||
    currentSchema.properties !== undefined;

  if (isObject) {
    results.push(...compareObjectSchemas(oldSchema, currentSchema, path));
  }

  // Array: recurse into items
  if (oldSchema.type === 'array' && currentSchema.type === 'array') {
    const oldItems = ((oldSchema.items ?? {}) as JsonSchema);
    const currentItems = ((currentSchema.items ?? {}) as JsonSchema);
    results.push(...compareSchemas(oldItems, currentItems, `${path}[]`));
  }

  return results;
}

function compareObjectSchemas(
  oldSchema: JsonSchema,
  currentSchema: JsonSchema,
  path: string
): ChangeResult[] {
  const results: ChangeResult[] = [];

  const oldProps = ((oldSchema.properties ?? {}) as Record<string, JsonSchema>);
  const currentProps = ((currentSchema.properties ?? {}) as Record<string, JsonSchema>);
  const oldRequired = new Set<string>((oldSchema.required as string[]) ?? []);
  const currentRequired = new Set<string>(
    (currentSchema.required as string[]) ?? []
  );

  // Removed properties
  for (const key of Object.keys(oldProps)) {
    const childPath = `${path}.${key}`;
    if (!(key in currentProps)) {
      results.push({
        kind: 'HARD_BREAKING',
        path: childPath,
        description: `Property '${childPath}' was removed`,
      });
    } else {
      // Property exists in both — recurse
      results.push(
        ...compareSchemas(oldProps[key], currentProps[key], childPath)
      );

      // Required status changed for this property
      const wasRequired = oldRequired.has(key);
      const isRequired = currentRequired.has(key);
      if (wasRequired && !isRequired) {
        results.push({
          kind: 'HARD_BREAKING',
          path: childPath,
          description: `'${childPath}' changed from required to optional`,
        });
      } else if (!wasRequired && isRequired) {
        results.push({
          kind: 'HARD_BREAKING',
          path: childPath,
          description: `'${childPath}' changed from optional to required`,
        });
      }
    }
  }

  // Added properties
  for (const key of Object.keys(currentProps)) {
    if (!(key in oldProps)) {
      const childPath = `${path}.${key}`;
      results.push({
        kind: 'ADDITIVE',
        path: childPath,
        description: `New property '${childPath}' added`,
      });
    }
  }

  return results;
}

function compareEnums(
  oldSchema: JsonSchema,
  currentSchema: JsonSchema,
  path: string
): ChangeResult[] {
  const results: ChangeResult[] = [];
  const oldEnum = (oldSchema.enum as unknown[]) ?? [];
  const currentEnum = (currentSchema.enum as unknown[]) ?? [];

  // Removed values = breaking
  for (const val of oldEnum) {
    if (!currentEnum.includes(val)) {
      results.push({
        kind: 'HARD_BREAKING',
        path,
        description: `Enum value '${String(val)}' was removed from '${path}'`,
      });
    }
  }

  // Added values = additive
  for (const val of currentEnum) {
    if (!oldEnum.includes(val)) {
      results.push({
        kind: 'ADDITIVE',
        path,
        description: `Enum value '${String(val)}' was added to '${path}'`,
      });
    }
  }

  return results;
}
