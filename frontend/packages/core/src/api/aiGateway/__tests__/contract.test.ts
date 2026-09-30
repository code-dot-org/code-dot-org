// Core's copy of the gateway contract must say what apps' says: the worker
// compiles against apps' copy, and apps snapshots it as JSON Schema.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';
import type {z} from 'zod/v3';

import {ALL_GATEWAY_SCHEMA_GROUPS} from '../contract/gatewaySchemas';

const SNAPSHOTS = resolve(
  __dirname,
  '../../../../../../../apps/src/aiGateway/contract/schemaSnapshots',
);

type Json = Record<string, unknown>;
type Def = {typeName: string} & Record<string, unknown>;

const def = (schema: z.ZodTypeAny) => schema._def as Def;

function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
  const d = def(schema);
  if (d.typeName === 'ZodOptional' || d.typeName === 'ZodDefault') {
    return unwrap(d.innerType as z.ZodTypeAny);
  }
  if (d.typeName === 'ZodLazy') {
    return unwrap((d.getter as () => z.ZodTypeAny)());
  }
  return schema;
}

const PRIMITIVES: Record<string, string[]> = {
  string: ['ZodString', 'ZodLiteral'],
  number: ['ZodNumber'],
  boolean: ['ZodBoolean'],
};

/** Every place the zod schema and the JSON Schema snapshot disagree. */
function differences(schema: z.ZodTypeAny, snap: Json, path: string): string[] {
  if ('$ref' in snap) {
    return [];
  }
  const zod = unwrap(schema);
  const d = def(zod);
  if (snap.properties) {
    if (d.typeName !== 'ZodObject') {
      return [`${path}: ${d.typeName}, where the snapshot has an object`];
    }
    const shape = (d.shape as () => Record<string, z.ZodTypeAny>)();
    const props = snap.properties as Record<string, Json>;
    const ours = Object.keys(shape).sort();
    const theirs = Object.keys(props).sort();
    if (ours.join() !== theirs.join()) {
      return [`${path}: keys ${ours} against ${theirs}`];
    }
    const required = Object.keys(shape)
      .filter(key => !shape[key].isOptional())
      .sort();
    const snapRequired = ((snap.required as string[]) ?? []).slice().sort();
    const found =
      required.join() === snapRequired.join()
        ? []
        : [`${path}: required ${required} against ${snapRequired}`];
    return found.concat(
      ...ours.map(key => differences(shape[key], props[key], `${path}.${key}`)),
    );
  }
  if (snap.anyOf) {
    const options = (d.options as z.ZodTypeAny[]) ?? [];
    const branches = snap.anyOf as Json[];
    if (d.typeName !== 'ZodUnion' || options.length !== branches.length) {
      return [`${path}: ${d.typeName} against anyOf(${branches.length})`];
    }
    return options.flatMap((option, i) =>
      differences(option, branches[i], `${path}|${i}`),
    );
  }
  if (snap.type === 'array') {
    return d.typeName === 'ZodArray'
      ? differences(d.type as z.ZodTypeAny, snap.items as Json, `${path}[]`)
      : [`${path}: ${d.typeName} against an array`];
  }
  if (typeof snap.type === 'string' && snap.type in PRIMITIVES) {
    return PRIMITIVES[snap.type].includes(d.typeName)
      ? []
      : [`${path}: ${d.typeName} against ${snap.type}`];
  }
  return [];
}

describe('the gateway contract', () => {
  for (const [group, versions] of Object.entries(ALL_GATEWAY_SCHEMA_GROUPS)) {
    for (const [version, schema] of Object.entries(versions)) {
      it(`matches apps' snapshot of ${group} V${version}`, () => {
        const snapshot = JSON.parse(
          readFileSync(resolve(SNAPSHOTS, `${group}V${version}.json`), 'utf8'),
        ) as Json;
        expect(differences(schema, snapshot, group)).toEqual([]);
      });
    }
  }
});
