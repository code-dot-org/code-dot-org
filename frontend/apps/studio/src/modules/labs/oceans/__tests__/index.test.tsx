import {render} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab/host';

const oceansLabSpy = vi.fn();
vi.mock('@code-dot-org/oceans-lab', () => ({
  default: (props: Record<string, unknown>) => {
    oceansLabSpy(props);
    return null;
  },
}));
vi.mock('@code-dot-org/oceans-lab/styles.css', () => ({}));

import OceansContainer from '..';

function renderOceans(levelProperties: Record<string, unknown>, search = '') {
  window.history.pushState({}, '', `/${search}`);
  render(
    <Lab
      levelId={1}
      levelPropertiesMap={
        {'1': levelProperties} as unknown as LevelPropertiesMap
      }
    >
      <OceansContainer />
    </Lab>,
  );
}

describe('OceansContainer', () => {
  beforeEach(() => oceansLabSpy.mockClear());

  it('passes per-level mode and guides through to OceansLab', () => {
    renderOceans({appName: 'fish', mode: 'fishvtrash', guides: 'K5'});
    expect(oceansLabSpy).toHaveBeenCalledWith(
      expect.objectContaining({appMode: 'fishvtrash', guides: 'K5'}),
    );
  });

  it('narrows away non-string mode/guides to undefined', () => {
    renderOceans({appName: 'fish', mode: 42, guides: {}});
    expect(oceansLabSpy).toHaveBeenCalledWith(
      expect.objectContaining({appMode: undefined, guides: undefined}),
    );
  });

  it('reads textToSpeechLocale from the ?tts query param (parity with Fish.js)', () => {
    renderOceans({appName: 'fish', mode: 'fishvtrash'}, '?tts=en');
    expect(oceansLabSpy).toHaveBeenCalledWith(
      expect.objectContaining({textToSpeechLocale: 'en'}),
    );
  });

  it('leaves textToSpeechLocale undefined without ?tts', () => {
    renderOceans({appName: 'fish', mode: 'fishvtrash'});
    expect(oceansLabSpy).toHaveBeenCalledWith(
      expect.objectContaining({textToSpeechLocale: undefined}),
    );
  });
});
