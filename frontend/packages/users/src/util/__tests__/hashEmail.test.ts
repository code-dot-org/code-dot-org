import {describe, expect, it} from 'vitest';

import {hashEmail} from '../hashEmail';

// Digests below are pre-computed with the real md5 package, matching what
// Rails stores; hardcoded so the test isn't tautologically calling md5 itself.
const KNOWN_DIGEST = '55502f40dc8b7c769880b10874abc9d0';
const EMPTY_DIGEST = 'd41d8cd98f00b204e9800998ecf8427e';
const UPPERCASE_DIGEST = '2b9150605ac374d671a306b5fcee60a0';

describe('hashEmail', () => {
  it('hashes a known address to the digest Rails stores', () => {
    expect(hashEmail('test@example.com')).toBe(KNOWN_DIGEST);
  });

  it('normalizes case and surrounding whitespace', () => {
    expect(hashEmail('  TEST@Example.COM  ')).toBe(
      hashEmail('test@example.com'),
    );
  });

  it('hashes an uppercase mixed-case address to the lowercased digest', () => {
    expect(hashEmail('Ada.Lovelace@Example.COM')).toBe(UPPERCASE_DIGEST);
  });

  it('hashes an empty string rather than guarding it', () => {
    // The caller/server validates presence; hashEmail itself never guards.
    expect(hashEmail('')).toBe(EMPTY_DIGEST);
  });
});
