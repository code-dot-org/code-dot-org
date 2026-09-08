// The one build setting no component test can check.
//
// See `../cssAssetNames` for what goes wrong without it, and why the demo
// cannot catch it.

import {describe, expect, it} from 'vitest';

import {stripModuleFromCssName} from '../cssAssetNames';

/** As rollup hands it to `assetFileNames`. */
const nameFor = (...names: string[]) =>
  (stripModuleFromCssName as (info: {names: string[]}) => string)({names});

describe('stripModuleFromCssName', () => {
  it('renames an emitted CSS module to a plain stylesheet', () => {
    expect(nameFor('components/composer.module.css')).toBe(
      'components/composer.css',
    );
  });

  it('renames the extension only, not a `.module.` earlier in the path', () => {
    expect(nameFor('components/a.module.b.module.css')).toBe(
      'components/a.module.b.css',
    );
  });

  it('leaves every other asset where preserveModules put it', () => {
    expect(nameFor('components/plain.css')).toBe('components/plain.css');
    expect(nameFor('assets/logo.svg')).toBe('assets/logo.svg');
  });

  it('has a fallback for an asset rollup did not name', () => {
    expect(nameFor()).toBe('assets/[name]-[hash][extname]');
  });
});
