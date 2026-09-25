// The checks here are compile-time: a line marked @ts-expect-error fails the
// typecheck if the helper stops rejecting it.

import {z} from 'zod';

import {subsetOf} from '@cdo/apps/adaptive/schema/subsetOf';

interface Target {
  id: string;
  label?: string;
  count?: number;
}

describe('subsetOf', () => {
  it('accepts a schema with the required keys and a subset of the optional ones', () => {
    const schema = subsetOf<Target>()(
      z.strictObject({id: z.string(), label: z.string().optional()})
    );
    expect(schema.parse({id: 'a'})).toEqual({id: 'a'});
  });

  it('rejects a missing required key, a wrong type, and an unknown key', () => {
    // @ts-expect-error id is required by Target
    subsetOf<Target>()(z.strictObject({label: z.string()}));
    // @ts-expect-error count is a number in Target
    subsetOf<Target>()(z.strictObject({id: z.string(), count: z.string()}));
    subsetOf<Target>()(
      // @ts-expect-error Target has no `lable` key
      z.strictObject({id: z.string(), lable: z.string()})
    );
  });

  it('checks enum members against a literal union', () => {
    type Mode = 'a' | 'b';
    expect(subsetOf<Mode>()(z.enum(['a'])).parse('a')).toBe('a');
    // @ts-expect-error 'c' is not a Mode
    subsetOf<Mode>()(z.enum(['a', 'c']));
  });
});
