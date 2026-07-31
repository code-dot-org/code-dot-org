// The `(import…)` row and the seam behind it.
//
// The row is a sentinel, not a value, and the whole point of the machinery is
// that it never survives as one: a block left holding `__import_effect__` would
// generate `actor.useEffect("__import_effect__", …)` and fail at run time.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  IMPORT_EFFECT_VALUE,
  requestEffectImport,
  setEffectImportHandler,
} from '../effectImport';
import {
  effectFileImportOptions,
  effectFileOptions,
  setProjectEffectFiles,
} from '../moduleOptions';

afterEach(() => {
  setProjectEffectFiles([]);
  setEffectImportHandler(null);
});

describe('the effect dropdown options', () => {
  it('offers import last, after the project’s own effects', () => {
    setProjectEffectFiles([['Ripple', 'effects/ripple']]);

    expect(effectFileImportOptions()).toEqual([
      ['Ripple', 'effects/ripple'],
      ['(import…)', IMPORT_EFFECT_VALUE],
    ]);
  });

  it('still shows (none) when the project has no effects', () => {
    // Not the import row as the fallback: a saved block whose effect has been
    // deleted would then silently re-point at "import" rather than reading as
    // unset.
    expect(effectFileImportOptions()[0]).toEqual(['(none)', '']);
  });

  it('leaves the plain options alone, for the remove blocks', () => {
    // Importing an effect in order to stop playing it is not a thing anyone
    // means to do.
    setProjectEffectFiles([['Ripple', 'effects/ripple']]);

    expect(effectFileOptions()).toEqual([['Ripple', 'effects/ripple']]);
  });
});

describe('requestEffectImport', () => {
  it('resolves undefined when nothing is listening', async () => {
    // The headless code generator and the unit tests have no dialog; asking
    // there must be harmless rather than a crash or a hang.
    await expect(requestEffectImport()).resolves.toBeUndefined();
  });

  it('hands the request to a registered handler', async () => {
    setEffectImportHandler(() => Promise.resolve('effects/tint'));

    await expect(requestEffectImport()).resolves.toBe('effects/tint');
  });

  it('stops asking once the handler is cleared', async () => {
    // Unmounting the editor clears it, so a field on a disposed workspace
    // cannot open a dialog nobody owns.
    const handler = vi.fn(() => Promise.resolve('effects/tint'));
    setEffectImportHandler(handler);
    setEffectImportHandler(null);

    await expect(requestEffectImport()).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });
});
