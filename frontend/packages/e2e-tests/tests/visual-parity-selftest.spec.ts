import {test, expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import {captureRegion, compareRegions} from './shared/visual-parity';

/**
 * Self-test for the visual-parity harness (design.md §4). No candidate route
 * exists yet in this program phase, so this proves the mechanism against a
 * stable legacy page instead of a legacy-vs-candidate pair: two independent
 * navigations of the same page, then a deliberate perturbation, then the same
 * perturbation hidden behind a named mask.
 */

const SIGN_IN_URL = '/users/sign_in';
const SIGN_IN_FORM = '#signin';

/** Named mask: the "Sign in" submit button, the self-test's perturbation target. */
const MASK_SIGNIN_BUTTON = '#signin-button';

/** Perturbation CSS: recolors the submit button so it paints differently. */
const PERTURBATION_CSS =
  '#signin-button { background-color: #ff0000 !important; }';

test.describe('visual-parity harness self-test', () => {
  // TDF-VIS-01
  test('same stable region captured twice yields zero diff', async ({page}) => {
    const first = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
    });
    const second = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
    });

    const {diffPixels} = compareRegions(first, second);
    expect(diffPixels).toBe(0);
  });

  // TDF-VIS-02
  test('unmasked perturbation yields a nonzero diff and a diff artifact', async ({
    page,
  }) => {
    const baseline = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
    });
    const perturbed = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
      injectCss: PERTURBATION_CSS,
    });

    const {diffPixels, diffPng} = compareRegions(baseline, perturbed);
    expect(diffPixels).toBeGreaterThan(0);

    const diffDir = path.join('test-results', 'visual-parity-selftest');
    fs.mkdirSync(diffDir, {recursive: true});
    fs.writeFileSync(path.join(diffDir, 'tdf-vis-02-diff.png'), diffPng);
  });

  // TDF-VIS-03
  test('the same perturbation under a named mask yields zero diff', async ({
    page,
  }) => {
    const baseline = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
      masks: [MASK_SIGNIN_BUTTON],
    });
    const perturbed = await captureRegion(page, {
      url: SIGN_IN_URL,
      selector: SIGN_IN_FORM,
      injectCss: PERTURBATION_CSS,
      masks: [MASK_SIGNIN_BUTTON],
    });

    const {diffPixels} = compareRegions(baseline, perturbed);
    expect(diffPixels).toBe(0);
  });
});
