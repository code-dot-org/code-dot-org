/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import TextToSpeech from '../TextToSpeech';

const {mockUseLocalization, mockSpeak} = vi.hoisted(() => ({
  mockUseLocalization: vi.fn(() => 'en'),
  mockSpeak: vi.fn(),
}));

vi.mock('@code-dot-org/core/plugins/localization', () => ({
  useLocalization: mockUseLocalization,
}));

vi.mock('../BrowserTextToSpeechWrapper', () => ({
  useBrowserTextToSpeech: () => ({
    isTtsAvailable: true,
    speak: mockSpeak,
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  }),
}));

function button() {
  return screen.queryByRole('button', {name: /text-to-speech/i});
}

// The locale mock is module-scoped, so every test states the locale it wants
// rather than inheriting whatever the previous one left behind.
beforeEach(() => {
  mockUseLocalization.mockReturnValue('en');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TextToSpeech locale gating', () => {
  it('is offered in a locale on the list', () => {
    render(<TextToSpeech text="hello" enabledLocales={['en', 'es']} />);

    expect(button()).toBeInTheDocument();
  });

  it('is withheld in a locale that is not', () => {
    mockUseLocalization.mockReturnValue('de');
    render(<TextToSpeech text="hello" enabledLocales={['en', 'es']} />);

    expect(button()).not.toBeInTheDocument();
  });

  // `true` is how a host says "every locale", matching the shape the DCDO flag
  // this replaced could take.
  it('is offered in any locale when the list is true', () => {
    mockUseLocalization.mockReturnValue('de');
    render(<TextToSpeech text="hello" enabledLocales />);

    expect(button()).toBeInTheDocument();
  });

  it('falls back to its own default list when given none', () => {
    render(<TextToSpeech text="hello" />);
    expect(button()).toBeInTheDocument();

    cleanup();
    mockUseLocalization.mockReturnValue('de');
    render(<TextToSpeech text="hello" />);
    expect(button()).not.toBeInTheDocument();
  });
});

describe('TextToSpeech as a toggle', () => {
  // It is a two-state control, so its state belongs in aria-pressed rather
  // than only in the icon, which a screen reader does not see.
  it('reports its unpressed state', () => {
    render(<TextToSpeech text="hello" />);

    expect(button()).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports being pressed once speech starts', () => {
    const listeners: Record<string, () => void> = {};
    mockSpeak.mockReturnValue({
      addEventListener: (name: string, listener: () => void) => {
        listeners[name] = listener;
      },
    });

    render(<TextToSpeech text="hello" />);
    fireEvent.click(button()!);

    // The utterance reports when the engine actually begins; that arrives from
    // outside React, so the resulting render has to be flushed.
    act(() => listeners['start']?.());

    expect(button()).toHaveAttribute('aria-pressed', 'true');
  });
});
