import {z} from 'zod';

// Registry stores Zod schemas that validate the *extra* fields for a kind
const kindSchemaRegistry = new Map<string, z.ZodTypeAny>();

export function registerLevelKindSchema(kind: string, schema: z.ZodTypeAny) {
  if (kindSchemaRegistry.has(kind)) {
    throw new Error(`Level kind schema already registered for kind="${kind}"`);
  }
  kindSchemaRegistry.set(kind, schema);
}

export function getLevelKindSchema(kind: string): z.ZodTypeAny | undefined {
  return kindSchemaRegistry.get(kind);
}
