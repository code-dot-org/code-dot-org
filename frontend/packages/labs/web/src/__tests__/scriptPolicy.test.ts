import {describe, expect, it} from 'vitest';

import {allowUserScripts} from '../preview/scriptPolicy';

const inputs = (
  overrides: Partial<Parameters<typeof allowUserScripts>[0]>,
) => ({
  isPredictLevel: false,
  hasSubmittedPredictResponse: false,
  isStartMode: false,
  ...overrides,
});

describe('allowUserScripts', () => {
  it('allows scripts on an ordinary level', () => {
    expect(allowUserScripts(inputs({}))).toBe(true);
  });

  it('blocks scripts on a predict level before the response is submitted', () => {
    expect(allowUserScripts(inputs({isPredictLevel: true}))).toBe(false);
  });

  it('allows scripts once the predict response is submitted', () => {
    expect(
      allowUserScripts(
        inputs({isPredictLevel: true, hasSubmittedPredictResponse: true}),
      ),
    ).toBe(true);
  });

  it('allows scripts in start mode, so an author can run the start code', () => {
    expect(
      allowUserScripts(inputs({isPredictLevel: true, isStartMode: true})),
    ).toBe(true);
  });

  it('ignores a submitted response when the level is not a predict level', () => {
    expect(allowUserScripts(inputs({hasSubmittedPredictResponse: true}))).toBe(
      true,
    );
  });
});
