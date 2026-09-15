import type {z} from 'zod';

/**
 * A test-data builder for fixture API responses.
 *
 * Given a zod schema and a set of wire-shape defaults, returns builders that
 * layer per-call overrides on top and validate the result *through the schema*,
 * so a fixture can never silently drift from the contract the API client
 * parses. Overrides may carry lab-specific fields the base schema does not
 * enumerate; the base schema strips them on parse, but `wire()` returns the raw
 * object so they survive for the client's own parse.
 *
 * Two exits, because MSW responses and unit tests want different shapes:
 *  - `wire()`   — the raw payload (schema *input*). Validated (throws if it
 *    would not parse) but returned unparsed. Use for MSW `respond` bodies.
 *  - `parsed()` — the post-parse value (schema *output*). Use for unit tests
 *    that consume already-parsed data.
 */
export function fixtureFactory<S extends z.ZodType>(
  schema: S,
  defaults: z.input<S>,
) {
  type Overrides = Partial<z.input<S>> & Record<string, unknown>;
  const build = (overrides: Overrides = {}): z.input<S> =>
    ({...(defaults as Record<string, unknown>), ...overrides}) as z.input<S>;
  return {
    wire: (overrides?: Overrides): z.input<S> => {
      const value = build(overrides);
      schema.parse(value);
      return value;
    },
    parsed: (overrides?: Overrides): z.output<S> =>
      schema.parse(build(overrides)) as z.output<S>,
  };
}
