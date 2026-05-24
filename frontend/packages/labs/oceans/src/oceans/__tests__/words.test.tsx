/**
 * Unit tests for the Words scene (FishShort mode).
 *
 * Renders <UI /> with state pre-set to Modes.Words / AppMode.FishShort so each
 * test exercises the word-selection scene without TF.js, network, or canvas.
 *
 * Mocked:
 *   @/oceans/models/guide        getCurrentGuide() → null (no guides)
 *   @/oceans/models/soundLibrary playSound, loadSounds → no-ops
 *   @/oceans/modeHelpers         toMode() sets currentMode without TF.js
 *   @/oceans/models/train        onClassifyFish() → no-op (not exercised here)
 */

import {ThemeProvider} from '@mui/material';
import {render, screen, fireEvent} from '@testing-library/react';
import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import {AppMode, Modes} from '@/oceans/constants';
import I18n from '@/oceans/i18n';
import {getState, resetState, setInitialState, setState} from '@/oceans/state';
import UI from '@/oceans/ui';

/* Mocks */

vi.mock('@/oceans/models/guide', () => ({
  default: {
    getCurrentGuide: vi.fn(() => null),
    dismissCurrentGuide: vi.fn(),
  },
}));

vi.mock('@/oceans/models/soundLibrary', () => ({
  default: {
    playSound: vi.fn(),
    injectSoundAPIs: vi.fn(),
    loadSounds: vi.fn(),
  },
}));

/** Prevent modeHelpers from loading models/index (which imports TF.js). */
vi.mock('@/oceans/modeHelpers', () => ({
  default: {
    toMode: vi.fn((mode: number) => setState({currentMode: mode})),
  },
}));

/** Replace TF.js-backed classifier with a pure-state stub. */
vi.mock('@/oceans/models/train', () => ({
  default: {
    init: vi.fn(),
    onClassifyFish: vi.fn(),
  },
}));

/* Helpers */

/** Render <UI /> wrapped in MUI ThemeProvider with state set to Words / FishShort. */
function renderWords() {
  setInitialState({
    currentMode: Modes.Words,
    appMode: AppMode.FishShort,
  });
  return render(
    <ThemeProvider theme={CdoTheme}>
      <UI />
    </ThemeProvider>,
  );
}

/** Re-render the component tree to pick up any state changes. */
function rerender(result: ReturnType<typeof renderWords>): void {
  result.rerender(
    <ThemeProvider theme={CdoTheme}>
      <UI />
    </ThemeProvider>,
  );
}

/* Setup */

beforeAll(() => {
  I18n.initI18n();
});

beforeEach(() => {
  resetState();
});

/*
 * Words scene — initial render
 */

describe('Words scene — initial render', () => {
  test('shows 6 word-choice buttons for FishShort', () => {
    renderWords();
    // FishShort has two columns: colors (3) + shapes (3) = 6 word buttons.
    expect(screen.getAllByTestId('word-button')).toHaveLength(6);
  });

  test('word question prompt is visible', () => {
    renderWords();
    expect(
      screen.getByText(/What type of fish do you want to train/i),
    ).toBeInTheDocument();
  });
});

/*
 * Words scene — word selection
 */

describe('Words scene — word selection', () => {
  test('clicking a word transitions to training scene', () => {
    const result = renderWords();
    fireEvent.click(screen.getAllByTestId('word-button')[0]);
    rerender(result);
    expect(getState().currentMode).toBe(Modes.Training);
  });

  test('training question includes the selected word', () => {
    const result = renderWords();
    const wordButton = screen.getAllByTestId('word-button')[0];
    // Button textContent is the i18n-translated word (e.g. "Blue").
    const wordTextLower = wordButton.textContent!.trim().toLowerCase();
    fireEvent.click(wordButton);
    rerender(result);
    // I18n.t('isThisFish', {word: 'blue'}) = "Is this fish blue?"
    expect(
      screen.getByText(new RegExp(`Is this fish ${wordTextLower}`, 'i')),
    ).toBeInTheDocument();
  });

  test('yes button text matches the selected word after word selection', () => {
    const result = renderWords();
    const wordButton = screen.getAllByTestId('word-button')[0];
    // Capture before click; textContent is the capitalised i18n word (e.g. "Blue").
    const wordText = wordButton.textContent!.trim();
    fireEvent.click(wordButton);
    rerender(result);
    // In FishShort training, yes button accessible name = state.word.
    expect(screen.getByRole('button', {name: wordText})).toBeInTheDocument();
  });
});
