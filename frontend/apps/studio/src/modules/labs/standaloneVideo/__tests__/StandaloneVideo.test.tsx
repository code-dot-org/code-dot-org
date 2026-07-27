import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab/host';

import StandaloneVideo from '..';

function renderWithLab(
  levelProperties: Record<string, unknown>,
  onContinue?: () => void,
) {
  render(
    <Lab
      levelId={1}
      levelPropertiesMap={
        {'1': levelProperties} as unknown as LevelPropertiesMap
      }
    >
      <StandaloneVideo onContinue={onContinue} />
    </Lab>,
  );
}

describe('StandaloneVideo', () => {
  it('shows displayName from level properties', () => {
    renderWithLab({
      displayName: 'Video: Machine Learning',
      appName: 'standalone_video',
    });
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Video: Machine Learning',
    );
  });

  it('falls back to name when displayName is absent', () => {
    renderWithLab({
      name: 'Oceans_Video_Training_Data',
      appName: 'standalone_video',
    });
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Oceans_Video_Training_Data',
    );
  });

  it('shows a continue button only when onContinue is provided', () => {
    const {rerender} = render(
      <Lab
        levelId={1}
        levelPropertiesMap={
          {'1': {appName: 'standalone_video'}} as unknown as LevelPropertiesMap
        }
      >
        <StandaloneVideo />
      </Lab>,
    );
    expect(
      screen.queryByRole('button', {name: /continue/i}),
    ).not.toBeInTheDocument();

    rerender(
      <Lab
        levelId={1}
        levelPropertiesMap={
          {'1': {appName: 'standalone_video'}} as unknown as LevelPropertiesMap
        }
      >
        <StandaloneVideo onContinue={vi.fn()} />
      </Lab>,
    );
    expect(screen.getByRole('button', {name: /continue/i})).toBeInTheDocument();
  });

  it('calls onContinue when the continue button is clicked', async () => {
    const onContinue = vi.fn();
    renderWithLab(
      {displayName: 'Test', appName: 'standalone_video'},
      onContinue,
    );
    await userEvent.click(screen.getByRole('button', {name: /continue/i}));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
