import {describe, expect, it} from 'vitest';

import {checkModuleUrl} from '../checkModuleUrl';

describe('checkModuleUrl', () => {
  const bundle = 'https://sandbox.test/__build/abc123.mjs';

  it('keeps the path the build worker serves by', () => {
    expect(new URL(checkModuleUrl(bundle, '7')).pathname).toBe(
      '/__build/abc123.mjs',
    );
  });

  it('differs for each check, and from the game’s', () => {
    const one = checkModuleUrl(bundle, '1');
    const two = checkModuleUrl(bundle, '2');
    expect(new Set([bundle, one, two]).size).toBe(3);
  });
});
