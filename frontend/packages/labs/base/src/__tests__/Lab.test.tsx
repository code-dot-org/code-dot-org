import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import Lab from '../components/Lab';
import {useLevelProperties} from '../contexts/LevelPropertiesContext';
import type {LevelPropertiesMap} from '../types';

const LEVEL_MAP: LevelPropertiesMap = {
  '29091': {appName: 'fish', mode: 'fishvtrash'},
  '29092': {appName: 'fish', mode: 'short'},
};

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
