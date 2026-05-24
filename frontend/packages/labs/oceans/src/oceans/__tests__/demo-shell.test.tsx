/**
 * Unit tests for the DemoShell dev harness.
 *
 * Covers static rendering and URL-param-driven initial state.  Tests that
 * require a running TF.js model (mode switching to Creatures Demo) or real
 * navigation stay in demo-shell.spec.ts (Playwright).
 *
 * OceansLab is mocked to prevent TF.js / canvas initialisation.
 */

import {ThemeProvider} from '@mui/material';
import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, test, vi} from 'vitest';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import DemoShell from '../../DemoShell';

// ─── Mocks ───────────────────────────────────────────────────────────────────

/** Replace the full lab with a lightweight sentinel — no TF.js, no canvas. */
vi.mock('../../App', () => ({default: () => <div data-testid="oceans-lab" />}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderDemoShell() {
  return render(
    <ThemeProvider theme={CdoTheme}>
      <DemoShell />
    </ThemeProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────────────────────────────────────
// Mode picker — static rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('DemoShell mode picker', () => {
  test('renders all five mode radio buttons', () => {
    renderDemoShell();
    for (const label of [
      'Fish vs Trash',
      'Fish Short',
      'Fish Long',
      'Creatures vs Trash',
      'Creatures Demo',
    ]) {
      expect(screen.getByRole('radio', {name: label})).toBeInTheDocument();
    }
  });

  test('FishVTrash is selected by default', () => {
    renderDemoShell();
    expect(screen.getByRole('radio', {name: 'Fish vs Trash'})).toBeChecked();
  });

  test('URL param ?mode=short selects Fish Short radio', () => {
    // Stub window.location so getInitialMode() returns AppMode.FishShort.
    vi.stubGlobal('location', {search: '?mode=short'});
    renderDemoShell();
    expect(screen.getByRole('radio', {name: 'Fish Short'})).toBeChecked();
  });
});
