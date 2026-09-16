import type {RenderOptions} from '@testing-library/react';
import {render as renderComponent, screen} from '@testing-library/react';
import type {ReactElement} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {RootStateProvider} from '@code-dot-org/core/redux';

import Lab from '../components/Lab';
import {useLevelProperties} from '../contexts/LevelPropertiesContext';
import type {LevelPropertiesMap} from '../types';

// This Lab dispatches to the shared store (it sets the current level id), so it
// only renders inside the host's store provider — Studio supplies it via
// LabProviders. Upstream's leaner shell had no such requirement; the provider
// came with folding the fuller implementation in behind /host. Passing it as
// `wrapper` means rerender() keeps it too.
const render = (ui: ReactElement, options?: RenderOptions) =>
  renderComponent(ui, {wrapper: RootStateProvider, ...options});

// Minimal stub — the shell threads this through context without inspecting it.
const LEVEL_MAP = {
  '29091': {appName: 'fish', mode: 'fishvtrash'},
  '29092': {appName: 'fish', mode: 'short'},
} as unknown as LevelPropertiesMap;

function LevelDisplay() {
  const props = useLevelProperties();
  return <div data-testid="level-info">{JSON.stringify(props)}</div>;
}

describe('Lab', () => {
  it('provides level context to children', () => {
    render(
      <Lab levelId={29091} levelPropertiesMap={LEVEL_MAP}>
        <LevelDisplay />
      </Lab>,
    );

    const info = screen.getByTestId('level-info');
    expect(JSON.parse(info.textContent!)).toEqual({
      appName: 'fish',
      mode: 'fishvtrash',
    });
  });

  it('updates children when levelId changes without remounting shell', () => {
    const shellMountSpy = vi.fn();

    function ShellSentinel() {
      shellMountSpy();
      return null;
    }

    const {rerender} = render(
      <Lab levelId={29091} levelPropertiesMap={LEVEL_MAP}>
        <ShellSentinel />
        <LevelDisplay />
      </Lab>,
    );

    expect(shellMountSpy).toHaveBeenCalledTimes(1);

    rerender(
      <Lab levelId={29092} levelPropertiesMap={LEVEL_MAP}>
        <ShellSentinel />
        <LevelDisplay />
      </Lab>,
    );

    const info = screen.getByTestId('level-info');
    expect(JSON.parse(info.textContent!)).toEqual({
      appName: 'fish',
      mode: 'short',
    });
    // Shell re-rendered (React always calls render), but was not remounted
    // (no second mount lifecycle). Two calls = two renders, not two mounts.
    expect(shellMountSpy).toHaveBeenCalledTimes(2);
  });
});

describe('Lab error containment', () => {
  it('shows error state and reports via onError when child throws', () => {
    const reportSpy = vi.fn();

    function Bomb(): never {
      throw new Error('boom');
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Lab levelId={29091} levelPropertiesMap={LEVEL_MAP} onError={reportSpy}>
        <Bomb />
      </Lab>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /error occurred.*reloading/i,
    );
    expect(reportSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(String),
    );

    consoleSpy.mockRestore();
  });

  it('does not render an alert region before any error', () => {
    render(
      <Lab levelId={29091} levelPropertiesMap={LEVEL_MAP}>
        <LevelDisplay />
      </Lab>,
    );

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears the alert and renders children after recovery', () => {
    let shouldThrow = true;

    function MaybeBomb() {
      if (shouldThrow) {
        throw new Error('level broke');
      }
      return <div>recovered</div>;
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const {rerender} = render(
      <Lab levelId={29091} levelPropertiesMap={LEVEL_MAP}>
        <MaybeBomb />
      </Lab>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /error occurred.*reloading/i,
    );

    shouldThrow = false;
    rerender(
      <Lab levelId={29092} levelPropertiesMap={LEVEL_MAP}>
        <MaybeBomb />
      </Lab>,
    );

    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();

    consoleSpy.mockRestore();
  });
});

describe('Lab without level properties (project route)', () => {
  it('renders children directly when no levelId or map provided', () => {
    render(
      <Lab>
        <div data-testid="lab-child">Oceans Lab Content</div>
      </Lab>,
    );

    expect(screen.getByTestId('lab-child')).toHaveTextContent(
      'Oceans Lab Content',
    );
  });

  it('catches errors from children even without level properties', () => {
    const reportSpy = vi.fn();

    function Bomb(): never {
      throw new Error('project crash');
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Lab onError={reportSpy}>
        <Bomb />
      </Lab>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /error occurred.*reloading/i,
    );
    expect(reportSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
