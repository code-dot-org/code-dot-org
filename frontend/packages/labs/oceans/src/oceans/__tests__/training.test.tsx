/** Unit tests for the Training scene and Erase confirmation dialog; runtime-heavy modules are stubbed below. */

import {ThemeProvider} from '@mui/material';
import {render, screen, within, fireEvent} from '@testing-library/react';
import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import {AppMode, Modes} from '@/oceans/constants';
import I18n from '@/oceans/i18n';
import train from '@/oceans/models/train';
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

/** Render <UI /> wrapped in MUI ThemeProvider with state set to Training. */
function renderTraining() {
  setInitialState({
    currentMode: Modes.Training,
    appMode: AppMode.FishVTrash,
    word: I18n.t('fish'),
    trainingQuestion: I18n.t('isThisAFish'),
  });
  return render(
    <ThemeProvider theme={CdoTheme}>
      <UI />
    </ThemeProvider>,
  );
}

/** Re-render the component tree to pick up any state changes. */
function rerender(result: ReturnType<typeof renderTraining>): void {
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
  vi.mocked(train.onClassifyFish).mockImplementation((doesLike: boolean) => {
    const {yesCount, noCount} = getState();
    setState(doesLike ? {yesCount: yesCount + 1} : {noCount: noCount + 1});
    return true;
  });
});

/*
 * Training scene — initial render
 */

describe('Training scene — initial render', () => {
  test('loads with counter at zero', () => {
    renderTraining();
    expect(screen.getByTestId('training-count')).toHaveTextContent('0');
  });

  test('yes, no, and erase buttons are visible', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Fish'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Not Fish'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Erase'})).toBeVisible();
  });

  test('yes button label is "Fish" in fishvtrash mode', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Fish'})).toBeInTheDocument();
  });

  test('no button label is "Not Fish" in fishvtrash mode', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Not Fish'})).toBeInTheDocument();
  });

  test('training question contains "fish"', () => {
    renderTraining();
    expect(screen.getByText(/Is this a fish\?/i)).toBeInTheDocument();
  });
});

/*
 * Training scene — count increments
 */

describe('Training scene — count increments', () => {
  test('yes click increments training count', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('1');
  });

  test('no click increments training count', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Not Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('1');
  });

  test('mixed training updates count correctly', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    fireEvent.click(screen.getByRole('button', {name: 'Not Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('2');
  });
});

/*
 * Training scene — ARIA attributes
 */

describe('Training scene — ARIA attributes', () => {
  test('counter is SR-inspectable: aria-label carries count, not a live region', () => {
    renderTraining();
    const counter = screen.getByTestId('training-count');
    expect(counter).toHaveAttribute('aria-label', '0 items classified');
    expect(counter).not.toHaveAttribute('role', 'status');
    expect(counter).not.toHaveAttribute('aria-live');
  });

  test('counter aria-label updates as the count changes', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveAttribute(
      'aria-label',
      '1 item classified',
    );
  });

  test('classification announcement region carries label + count', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);
    expect(screen.getByRole('status')).toHaveTextContent('1 item classified.');
  });

  test('erase button has aria-label="Erase"', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Erase'})).toHaveAttribute(
      'aria-label',
      'Erase',
    );
  });

  test('erase button has type="button"', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Erase'})).toHaveAttribute(
      'type',
      'button',
    );
  });

  test('yes and no buttons have type="button"', () => {
    renderTraining();
    expect(screen.getByRole('button', {name: 'Fish'})).toHaveAttribute(
      'type',
      'button',
    );
    expect(screen.getByRole('button', {name: 'Not Fish'})).toHaveAttribute(
      'type',
      'button',
    );
  });

  test('FontAwesome icons inside yes/no buttons carry aria-hidden', () => {
    renderTraining();
    const yesBtn = screen.getByRole('button', {name: 'Fish'});
    const noBtn = screen.getByRole('button', {name: 'Not Fish'});
    const svgs = [
      ...yesBtn.querySelectorAll('svg'),
      ...noBtn.querySelectorAll('svg'),
    ];
    const hidden = svgs.filter(svg => svg.hasAttribute('aria-hidden'));
    expect(hidden).toHaveLength(svgs.length);
  });

  test('yes button responds to click when focused', () => {
    // jsdom can't run the keyDown→click chain; covered in e2e instead.
    const result = renderTraining();
    const yesBtn = screen.getByRole('button', {name: 'Fish'});
    yesBtn.focus();
    expect(yesBtn).toHaveFocus();
    fireEvent.click(yesBtn);
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('1');
  });
});

/*
 * Training scene — Tab order (DOM order)
 */

describe('Training scene — Tab order', () => {
  test('Tab order: Not Fish → Fish → Continue → Erase', () => {
    renderTraining();
    const allButtons = screen.getAllByRole('button');
    const idx = (name: string, exact = false) =>
      allButtons.findIndex(b =>
        exact
          ? b.textContent?.trim() === name ||
            b.getAttribute('aria-label') === name
          : b.textContent?.includes(name) ||
            b.getAttribute('aria-label') === name,
      );

    const noIdx = idx('Not Fish');
    const yesIdx = idx('Fish', true);
    const continueIdx = idx('Continue');
    const eraseIdx = idx('Erase', true);

    expect(noIdx).toBeGreaterThanOrEqual(0);
    expect(yesIdx).toBeGreaterThanOrEqual(0);
    expect(continueIdx).toBeGreaterThanOrEqual(0);
    expect(eraseIdx).toBeGreaterThanOrEqual(0);

    expect(noIdx).toBeLessThan(yesIdx);
    expect(yesIdx).toBeLessThan(continueIdx);
    expect(continueIdx).toBeLessThan(eraseIdx);
  });
});

/*
 * Erase confirmation dialog — structure
 */

describe('Erase confirmation dialog — structure', () => {
  test('erase button opens confirmation dialog', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Are you sure?'}),
    ).toBeInTheDocument();
  });

  test('erase dialog shows warning text', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
  });

  test('confirmation dialog has aria-modal="true"', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('focus moves to Cancel button when dialog opens', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    const dialog = screen.getByRole('dialog');
    const cancelBtn = within(dialog).getByRole('button', {name: 'Cancel'});
    expect(cancelBtn).toHaveFocus();
  });
});

/*
 * Erase confirmation dialog — interactions
 */

describe('Erase confirmation dialog — interactions', () => {
  test('cancel dismisses dialog without resetting count', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {name: 'Cancel'}),
    );
    rerender(result);

    expect(screen.getByTestId('training-count')).toHaveTextContent('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('confirm erase resets training count to zero', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);
    expect(screen.getByTestId('training-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', {name: 'Erase'}));
    rerender(result);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {name: 'Erase'}),
    );
    rerender(result);

    expect(screen.getByTestId('training-count')).toHaveTextContent('0');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

/*
 * Erase confirmation dialog — keyboard
 */

describe('Erase confirmation dialog — keyboard', () => {
  // jsdom can't run Enter→click on focused buttons; e2e covers that path.

  test('focus + click on erase opens dialog; focus + click on cancel dismisses', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);

    const eraseBtn = screen.getByRole('button', {name: 'Erase'});
    eraseBtn.focus();
    expect(eraseBtn).toHaveFocus();
    fireEvent.click(eraseBtn);
    rerender(result);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Cancel',
    });
    cancelBtn.focus();
    expect(cancelBtn).toHaveFocus();
    fireEvent.click(cancelBtn);
    rerender(result);

    expect(screen.getByTestId('training-count')).toHaveTextContent('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('focus + click on erase opens dialog; focus + click on confirm resets count', () => {
    const result = renderTraining();
    fireEvent.click(screen.getByRole('button', {name: 'Fish'}));
    rerender(result);

    const eraseBtn = screen.getByRole('button', {name: 'Erase'});
    eraseBtn.focus();
    expect(eraseBtn).toHaveFocus();
    fireEvent.click(eraseBtn);
    rerender(result);

    const confirmBtn = within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Erase',
    });
    confirmBtn.focus();
    expect(confirmBtn).toHaveFocus();
    fireEvent.click(confirmBtn);
    rerender(result);

    expect(screen.getByTestId('training-count')).toHaveTextContent('0');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
