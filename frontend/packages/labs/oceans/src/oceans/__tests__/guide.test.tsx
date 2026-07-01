/** L2 component tests for Guide's componentDidUpdate focus gates. */

import {ThemeProvider} from '@mui/material';
import {render} from '@testing-library/react';
import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import {Guide} from '@/oceans/components/common';
import I18n from '@/oceans/i18n';
import {resetState} from '@/oceans/state';

/* Mocks */

const mockGetCurrentGuide = vi.fn();
vi.mock('@/oceans/models/guide', () => ({
  default: {
    getCurrentGuide: () => mockGetCurrentGuide(),
    dismissCurrentGuide: vi.fn(() => true),
  },
}));

vi.mock('@/oceans/models/soundLibrary', () => ({
  default: {playSound: vi.fn()},
}));

vi.mock('@/utils/TextToSpeech', () => ({
  startTextToSpeech: vi.fn(() => false),
  stopTextToSpeech: vi.fn(),
  hasTextToSpeechVoices: vi.fn(() => false),
}));

/* Helpers */

interface FakeGuide {
  id: string;
  textFn: () => string;
  when: Record<string, never>;
  style?: 'Info' | 'Center';
  noDimBackground?: boolean;
}

function makeGuide(id: string, overrides: Partial<FakeGuide> = {}): FakeGuide {
  return {id, textFn: () => `Text for ${id}`, when: {}, ...overrides};
}

function renderGuide() {
  // The "no current guide" branch focuses the first interactive inside
  // #container-react; provide one so the assertion has a target.
  const container = document.createElement('div');
  container.id = 'container-react';
  const sceneButton = document.createElement('button');
  sceneButton.textContent = 'Next';
  container.appendChild(sceneButton);
  document.body.appendChild(container);

  const result = render(
    <ThemeProvider theme={CdoTheme}>
      <Guide />
    </ThemeProvider>,
  );
  return {...result, sceneButton};
}

function rerenderGuide(result: ReturnType<typeof renderGuide>) {
  result.rerender(
    <ThemeProvider theme={CdoTheme}>
      <Guide />
    </ThemeProvider>,
  );
}

/* Setup */

beforeAll(() => {
  I18n.initI18n();
});

beforeEach(() => {
  resetState();
  mockGetCurrentGuide.mockReturnValue(null);
  document.body.innerHTML = '';
});

/*
 * Guide focus management
 */

describe('Guide focus management', () => {
  test('does not steal focus on the first guide queue', () => {
    const result = renderGuide();
    mockGetCurrentGuide.mockReturnValue(makeGuide('init1'));
    rerenderGuide(result);
    // Skip-link must remain reachable on initial load.
    expect(document.activeElement).toBe(document.body);
  });

  test('moves focus to next dialog on guide-to-guide transition', () => {
    const result = renderGuide();
    mockGetCurrentGuide.mockReturnValue(makeGuide('init1'));
    rerenderGuide(result);
    mockGetCurrentGuide.mockReturnValue(makeGuide('init2'));
    rerenderGuide(result);
    const dialog = document.querySelector<HTMLElement>('dialog.guide-dialog');
    expect(document.activeElement).toBe(dialog);
  });

  test('moves focus to first scene control on guide-to-noGuide transition', () => {
    const result = renderGuide();
    mockGetCurrentGuide.mockReturnValue(makeGuide('init1'));
    rerenderGuide(result);
    mockGetCurrentGuide.mockReturnValue(null);
    rerenderGuide(result);
    expect(document.activeElement).toBe(result.sceneButton);
  });

  test('non-modal guide (noDimBackground) routes to scene control, not dialog', () => {
    const result = renderGuide();
    mockGetCurrentGuide.mockReturnValue(makeGuide('init1'));
    rerenderGuide(result);
    mockGetCurrentGuide.mockReturnValue(
      makeGuide('toast', {noDimBackground: true}),
    );
    rerenderGuide(result);
    expect(document.activeElement).toBe(result.sceneButton);
  });

  test('same guide id across re-renders is a no-op (no focus move)', () => {
    const result = renderGuide();
    const sameGuide = makeGuide('same');
    mockGetCurrentGuide.mockReturnValue(sameGuide);
    rerenderGuide(result); // first queue — focus skipped
    const before = document.activeElement;
    rerenderGuide(result); // same id — early return, no focus change
    expect(document.activeElement).toBe(before);
  });
});
