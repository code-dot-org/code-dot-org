// The import seam, tested once instead of five times.
//
// The three mechanism tests here used to sit at the bottom of `ruleImport` and
// `effectImport` in identical copies, and the other three kinds had none at
// all. They are about `libraryImport` rather than about any dropdown, so they
// live with it; what stays in a kind's own test is its dropdown, which is the
// part that differs.
//
// THE LAST TEST IS THE NEW ONE, and it is the risk that sharing a factory
// introduces: five seams that came from one call must not share one handler
// slot. Nothing above would notice — every kind would pass its own three tests
// while quietly answering another kind's dialog.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {setAppearanceImportHandler} from '../../appearance/appearanceImport';
import {requestSoundImport} from '../../sound/soundImport';
import {requestEffectImport, setEffectImportHandler} from '../effectImport';
import {importSeam} from '../libraryImport';
import {requestRuleImport, setRuleImportHandler} from '../ruleImport';

afterEach(() => {
  setRuleImportHandler(null);
  setEffectImportHandler(null);
  setAppearanceImportHandler(null);
});

describe('an import seam', () => {
  it('resolves undefined when nothing is listening', async () => {
    // The headless code generator and the unit tests have no dialog; asking
    // there must be harmless rather than a crash or a hang. That is why this
    // resolves rather than throwing — a field asking with nobody listening is
    // ordinary.
    const seam = importSeam();

    await expect(seam.request()).resolves.toBeUndefined();
  });

  it('hands the request to a registered handler', async () => {
    const seam = importSeam();
    seam.register(() => Promise.resolve('rules/gravity'));

    await expect(seam.request()).resolves.toBe('rules/gravity');
  });

  it('stops asking once the handler is cleared', async () => {
    // Unmounting the editor clears it, so a field on a disposed workspace
    // cannot open a dialog nobody owns.
    const seam = importSeam();
    const handler = vi.fn(() => Promise.resolve('rules/gravity'));
    seam.register(handler);
    seam.register(null);

    await expect(seam.request()).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });

  it('carries the arguments the kind declares', async () => {
    // Appearance is the only one that takes any: three sentinels naming one
    // picker opened on a different shelf.
    const seam = importSeam<[kind: string]>();
    seam.register(kind => Promise.resolve(`picked a ${kind}`));

    await expect(seam.request('sprite')).resolves.toBe('picked a sprite');
  });

  it('gives every kind a slot of its own', async () => {
    // What sharing a factory puts at risk. A rule dialog answering a sound
    // dropdown would put a module path where a file name belongs, and every
    // kind's own tests would still pass.
    setRuleImportHandler(() => Promise.resolve('rules/gravity'));

    await expect(requestRuleImport()).resolves.toBe('rules/gravity');
    await expect(requestEffectImport()).resolves.toBeUndefined();
    await expect(requestSoundImport()).resolves.toBeUndefined();
  });
});
