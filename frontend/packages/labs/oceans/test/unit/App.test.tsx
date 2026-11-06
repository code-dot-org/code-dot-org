import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import OceansLab from '@/App';

vi.mock('@/oceans/init', () => ({
  initAll: vi.fn(),
  stopUIRerender: vi.fn(),
}));
vi.mock('@/oceans/Sounds', () => ({
  default: function Sounds() {
    return {play: vi.fn(), register: vi.fn(), stopAllAudio: vi.fn()};
  },
}));

const cancel = vi.fn();

beforeEach(() => {
  vi.stubGlobal('speechSynthesis', {cancel, getVoices: () => []});
});

afterEach(() => {
  cleanup();
  cancel.mockReset();
  vi.unstubAllGlobals();
});

describe('OceansLab text-to-speech teardown', () => {
  it('stops speech when unmounted', () => {
    const {unmount} = render(<OceansLab textToSpeechLocale="it" />);
    expect(cancel).not.toHaveBeenCalled();

    unmount();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('stops speech in the old locale when textToSpeechLocale changes', () => {
    const {rerender} = render(<OceansLab textToSpeechLocale="it" />);

    rerender(<OceansLab textToSpeechLocale="en" />);

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('stops speech when the level (appMode) changes', () => {
    const {rerender} = render(
      <OceansLab appMode="fishvtrash" textToSpeechLocale="it" />,
    );

    rerender(<OceansLab appMode="creaturesvtrash" textToSpeechLocale="it" />);

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not touch speechSynthesis when text-to-speech is off', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const {unmount} = render(<OceansLab />);

    expect(() => unmount()).not.toThrow();
  });
});
