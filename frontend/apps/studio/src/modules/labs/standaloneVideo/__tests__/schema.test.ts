import {describe, expect, it} from 'vitest';

import {VideoLevelDataSchema} from '../schema';

describe('VideoLevelDataSchema', () => {
  // The player degrades on a bad payload, so this schema must reject one.
  it('rejects a payload with no src', () => {
    const result = VideoLevelDataSchema.safeParse({name: 'no src field'});
    expect(result.success).toBe(false);
  });
});
