import {
  detectChanges,
  isEmptySchema,
  type JsonSchema,
  type ChangeResult,
  type ChangeKind,
} from '@cdo/apps/aiGateway/schemaChangeDetector';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function changesOfKind(results: ChangeResult[], kind: ChangeKind) {
  return results.filter(r => r.kind === kind);
}

function hardBreaking(results: ChangeResult[]) {
  return changesOfKind(results, 'HARD_BREAKING');
}

function unknownNarrowing(results: ChangeResult[]) {
  return changesOfKind(results, 'UNKNOWN_NARROWING');
}

function additive(results: ChangeResult[]) {
  return changesOfKind(results, 'ADDITIVE');
}

// Convenience: a minimal object schema with given props + required list
function objectSchema(
  properties: Record<string, JsonSchema>,
  required: string[] = []
): JsonSchema {
  return {type: 'object', properties, required};
}

// ---------------------------------------------------------------------------
// isEmptySchema
// ---------------------------------------------------------------------------

describe('isEmptySchema', () => {
  it('returns true for an empty object', () => {
    expect(isEmptySchema({})).toBe(true);
  });

  it('returns true when only non-constraining metadata keys are present', () => {
    // $schema / title / description are stripped before detectChanges is called,
    // but isEmptySchema is also called internally so test it directly
    expect(isEmptySchema({title: 'foo'})).toBe(true);
  });

  it('returns false when type is present', () => {
    expect(isEmptySchema({type: 'string'})).toBe(false);
  });

  it('returns false when properties is present', () => {
    expect(isEmptySchema({properties: {}})).toBe(false);
  });

  it('returns false when enum is present', () => {
    expect(isEmptySchema({enum: ['a']})).toBe(false);
  });

  it('returns false when additionalProperties is present', () => {
    expect(isEmptySchema({additionalProperties: false})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// No-change cases
// ---------------------------------------------------------------------------

describe('detectChanges — no change', () => {
  it('returns empty array for identical empty schemas', () => {
    expect(detectChanges({}, {})).toHaveLength(0);
  });

  it('returns empty array for identical primitive schemas', () => {
    expect(detectChanges({type: 'string'}, {type: 'string'})).toHaveLength(0);
  });

  it('returns empty array for identical object schemas', () => {
    const schema = objectSchema({name: {type: 'string'}}, ['name']);
    expect(detectChanges(schema, schema)).toHaveLength(0);
  });

  it('returns empty array for identical nested schemas', () => {
    const schema = objectSchema({
      usage: objectSchema(
        {promptTokens: {type: 'number'}, completionTokens: {type: 'number'}},
        ['promptTokens', 'completionTokens']
      ),
    });
    expect(detectChanges(schema, schema)).toHaveLength(0);
  });

  it('ignores $schema / title / description differences', () => {
    const old: JsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
    };
    const current: JsonSchema = {
      $schema: 'http://json-schema.org/draft-2020-12/schema',
      title: 'MyString',
      type: 'string',
    };
    expect(detectChanges(old, current)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// HARD_BREAKING — property removed
// ---------------------------------------------------------------------------

describe('detectChanges — HARD_BREAKING: property removed', () => {
  it('detects removal of a required property', () => {
    const old = objectSchema({model: {type: 'string'}}, ['model']);
    const current = objectSchema({}, []);
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('model');
  });

  it('detects removal of an optional property', () => {
    const old = objectSchema({
      model: {type: 'string'},
      extra: {type: 'string'},
    });
    const current = objectSchema({model: {type: 'string'}});
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('extra');
  });

  it('detects removal of a nested property', () => {
    const old = objectSchema({
      usage: objectSchema({promptTokens: {type: 'number'}}, ['promptTokens']),
    });
    const current = objectSchema({
      usage: objectSchema({}, []),
    });
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('promptTokens');
  });
});

// ---------------------------------------------------------------------------
// HARD_BREAKING — type changed
// ---------------------------------------------------------------------------

describe('detectChanges — HARD_BREAKING: type change', () => {
  it('detects string → number change on a top-level property', () => {
    const old = objectSchema({count: {type: 'string'}});
    const current = objectSchema({count: {type: 'number'}});
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].description).toMatch(/string.*number/);
  });

  it('detects number → boolean change on a nested property', () => {
    const old = objectSchema({
      usage: objectSchema({tokens: {type: 'number'}}),
    });
    const current = objectSchema({
      usage: objectSchema({tokens: {type: 'boolean'}}),
    });
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('tokens');
  });
});

// ---------------------------------------------------------------------------
// HARD_BREAKING — required / optional flip
// ---------------------------------------------------------------------------

describe('detectChanges — HARD_BREAKING: required ↔ optional', () => {
  it('detects required → optional change', () => {
    const old = objectSchema({name: {type: 'string'}}, ['name']);
    const current = objectSchema({name: {type: 'string'}}, []);
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].description).toMatch(/required.*optional/i);
  });

  it('detects optional → required change', () => {
    const old = objectSchema({name: {type: 'string'}}, []);
    const current = objectSchema({name: {type: 'string'}}, ['name']);
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].description).toMatch(/optional.*required/i);
  });
});

// ---------------------------------------------------------------------------
// HARD_BREAKING — enum narrowed
// ---------------------------------------------------------------------------

describe('detectChanges — HARD_BREAKING: enum narrowed', () => {
  it('detects removed enum value', () => {
    const old: JsonSchema = {type: 'string', enum: ['a', 'b', 'c']};
    const current: JsonSchema = {type: 'string', enum: ['a', 'b']};
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].description).toContain('c');
  });

  it('detects multiple removed enum values', () => {
    const old: JsonSchema = {type: 'string', enum: ['a', 'b', 'c', 'd']};
    const current: JsonSchema = {type: 'string', enum: ['a']};
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(3);
  });

  it('detects removed enum on a nested property', () => {
    const old = objectSchema({
      status: {type: 'string', enum: ['ok', 'error']},
    });
    const current = objectSchema({
      status: {type: 'string', enum: ['ok']},
    });
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].description).toContain('error');
  });
});

// ---------------------------------------------------------------------------
// UNKNOWN_NARROWING
// ---------------------------------------------------------------------------

describe('detectChanges — UNKNOWN_NARROWING', () => {
  it('detects {} → string narrowing on a property', () => {
    const old = objectSchema({metadata: {}});
    const current = objectSchema({metadata: {type: 'string'}});
    const results = detectChanges(old, current);
    expect(unknownNarrowing(results)).toHaveLength(1);
    expect(unknownNarrowing(results)[0].path).toContain('metadata');
    expect(hardBreaking(results)).toHaveLength(0);
  });

  it('detects {} → object narrowing on a property', () => {
    const old = objectSchema({extra: {}});
    const current = objectSchema({
      extra: objectSchema({foo: {type: 'string'}}),
    });
    const results = detectChanges(old, current);
    expect(unknownNarrowing(results)).toHaveLength(1);
  });

  it('detects {} → enum narrowing on a property', () => {
    const old = objectSchema({kind: {}});
    const current = objectSchema({kind: {type: 'string', enum: ['a', 'b']}});
    const results = detectChanges(old, current);
    expect(unknownNarrowing(results)).toHaveLength(1);
  });

  it('detects {} → string narrowing on array items', () => {
    // array of unknown items → array of string items
    const old: JsonSchema = {type: 'array', items: {}};
    const current: JsonSchema = {type: 'array', items: {type: 'string'}};
    const results = detectChanges(old, current);
    expect(unknownNarrowing(results)).toHaveLength(1);
    expect(unknownNarrowing(results)[0].path).toContain('[]');
  });

  it('does NOT flag {} → {} as any kind of change', () => {
    const old = objectSchema({meta: {}});
    const current = objectSchema({meta: {}});
    expect(detectChanges(old, current)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ADDITIVE — new fields / widening
// ---------------------------------------------------------------------------

describe('detectChanges — ADDITIVE', () => {
  it('detects a new optional property', () => {
    const old = objectSchema({model: {type: 'string'}}, ['model']);
    const current = objectSchema(
      {model: {type: 'string'}, newField: {type: 'string'}},
      ['model']
    );
    const results = detectChanges(old, current);
    expect(additive(results)).toHaveLength(1);
    expect(additive(results)[0].path).toContain('newField');
    expect(hardBreaking(results)).toHaveLength(0);
  });

  it('detects a new enum value as additive', () => {
    const old: JsonSchema = {type: 'string', enum: ['a', 'b']};
    const current: JsonSchema = {type: 'string', enum: ['a', 'b', 'c']};
    const results = detectChanges(old, current);
    expect(additive(results)).toHaveLength(1);
    expect(additive(results)[0].description).toContain('c');
    expect(hardBreaking(results)).toHaveLength(0);
  });

  it('detects concrete → {} (widening) as additive', () => {
    const old = objectSchema({meta: {type: 'string'}});
    const current = objectSchema({meta: {}});
    const results = detectChanges(old, current);
    expect(additive(results)).toHaveLength(1);
    expect(hardBreaking(results)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Mixed changes in one schema diff
// ---------------------------------------------------------------------------

describe('detectChanges — mixed changes', () => {
  it('reports each change independently', () => {
    const old = objectSchema(
      {
        model: {type: 'string'},
        token: {type: 'string'},
        metadata: {},
      },
      ['model', 'token']
    );
    const current = objectSchema(
      {
        model: {type: 'number'}, // type changed → HARD_BREAKING
        // token removed → HARD_BREAKING
        metadata: {type: 'object', properties: {}}, // narrowed → UNKNOWN_NARROWING
        newField: {type: 'string'}, // added → ADDITIVE
      },
      ['model']
    );

    const results = detectChanges(old, current);
    expect(hardBreaking(results).length).toBeGreaterThanOrEqual(2);
    expect(unknownNarrowing(results)).toHaveLength(1);
    expect(additive(results)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('detectChanges — edge cases', () => {
  it('handles schemas with no properties key', () => {
    const old: JsonSchema = {type: 'object'};
    const current: JsonSchema = {
      type: 'object',
      properties: {name: {type: 'string'}},
    };
    const results = detectChanges(old, current);
    expect(additive(results)).toHaveLength(1);
    expect(hardBreaking(results)).toHaveLength(0);
  });

  it('handles deeply nested removal', () => {
    const old = objectSchema({
      a: objectSchema({
        b: objectSchema({c: {type: 'string'}}, ['c']),
      }),
    });
    const current = objectSchema({
      a: objectSchema({
        b: objectSchema({}, []),
      }),
    });
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('a.b.c');
  });

  it('handles array of objects with typed items', () => {
    const old: JsonSchema = {
      type: 'array',
      items: objectSchema({id: {type: 'string'}}, ['id']),
    };
    const current: JsonSchema = {
      type: 'array',
      items: objectSchema({}, []),
    };
    const results = detectChanges(old, current);
    expect(hardBreaking(results)).toHaveLength(1);
    expect(hardBreaking(results)[0].path).toContain('[]');
  });
});
