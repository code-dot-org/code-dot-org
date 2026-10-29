import {describe, expect, it} from 'vitest';
import {z} from 'zod';

import {fixtureFactory} from '../factory';

const schema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean().default(true),
});

const thing = fixtureFactory(schema, {id: 0, name: 'stub'});

describe('fixtureFactory', () => {
  it('layers overrides on defaults', () => {
    expect(thing.wire({id: 7})).toMatchObject({id: 7, name: 'stub'});
  });

  it('wire() returns the raw input (defaults not yet applied)', () => {
    expect(thing.wire()).toEqual({id: 0, name: 'stub'});
  });

  it('parsed() applies schema defaults', () => {
    expect(thing.parsed({id: 1})).toEqual({id: 1, name: 'stub', active: true});
  });

  it('preserves fields the schema does not enumerate (wire only)', () => {
    expect(thing.wire({extra: 'kept'})).toHaveProperty('extra', 'kept');
    expect(thing.parsed({extra: 'dropped'})).not.toHaveProperty('extra');
  });

  it('throws when a required field is invalid, catching fixture drift', () => {
    expect(() => thing.wire({id: 'nope' as unknown as number})).toThrow();
  });
});
