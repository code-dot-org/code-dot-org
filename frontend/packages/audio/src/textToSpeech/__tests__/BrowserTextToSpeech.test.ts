/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';

// The module tracks `initialized`/`ttsAvailable` at module scope, so each
// test imports a fresh copy.
async function freshModule() {
  vi.resetModules();
  return await import('../BrowserTextToSpeech');
}

describe('BrowserTextToSpeech without a speech engine', () => {
  beforeEach(() => {
    // jsdom ships no speechSynthesis; pin that assumption explicitly.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });
  });

  it('neither throws nor reports availability', async () => {
    const {initialize, isTtsAvailable, onTtsAvailable} = await freshModule();
    const callback = vi.fn();

    expect(() => {
      initialize();
      onTtsAvailable(callback);
    }).not.toThrow();

    expect(callback).not.toHaveBeenCalled();
    expect(isTtsAvailable()).toBe(false);
  });
});

describe('BrowserTextToSpeech with a speech engine', () => {
  it('reports availability when voices load', async () => {
    const listeners: Record<string, Array<() => void>> = {};
    let voices: unknown[] = [];
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => voices,
        addEventListener: (event: string, listener: () => void) => {
          (listeners[event] ??= []).push(listener);
        },
        cancel: vi.fn(),
      },
    });

    const {initialize, isTtsAvailable, onTtsAvailable} = await freshModule();
    initialize();
    expect(isTtsAvailable()).toBe(false);

    const callback = vi.fn();
    onTtsAvailable(callback);

    voices = [{name: 'test-voice'}];
    listeners['voiceschanged']?.forEach(listener => listener());

    expect(callback).toHaveBeenCalledWith(true);
    expect(isTtsAvailable()).toBe(true);
  });
});
