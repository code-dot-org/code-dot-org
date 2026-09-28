import {z} from 'zod';

/**
 * Compile-time check that a schema's output is a subset of T: assignable to
 * T, and declaring no key T lacks. `satisfies z.ZodType<T>` alone checks
 * only assignability, which lets unknown keys through. Returns the schema
 * unchanged: `subsetOf<T>()(z.strictObject({...}))`.
 */
export const subsetOf =
  <T>() =>
  <S extends z.ZodType<T>>(
    schema: S & (keyof z.output<S> extends keyof T ? unknown : never)
  ): S =>
    schema;
