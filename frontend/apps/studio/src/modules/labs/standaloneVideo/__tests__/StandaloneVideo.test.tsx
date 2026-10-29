import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactPlayer from 'react-player';
import {type Mock, describe, expect, it, vi} from 'vitest';

import type {LevelPropertiesMap} from '@code-dot-org/core/api';
import {useConsent} from '@code-dot-org/core/plugins/consent';
import {Lab} from '@code-dot-org/lab/host';

import StandaloneVideo from '..';

// Mirrors the mock in component-library's video/__tests__/Video.test.tsx.
// It fakes the player by src, so no real player runs in this test.
ReactPlayer.canPlay = vi.fn();
vi.mock('react-player', () => ({
  __esModule: true,
  default: ({src}: {src?: string}) => (
    <div>{src?.endsWith('.mp4') ? 'Fallback Player' : 'YouTube Player'}</div>
  ),
  canPlay: vi.fn(),
}));

// Defaults to no functional consent, matching the store's deny-until-known
// state. Tests override this with mockReturnValueOnce.
vi.mock('@code-dot-org/core/plugins/consent', () => ({
  useConsent: vi.fn(() => ({categories: new Set()})),
}));

const levelData = {
  src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  name: 'Machine Learning Basics',
  download: 'https://example.com/oceans_machine_learning.mp4',
  thumbnail: '/c/video_thumbnails/oceans_machine_learning.jpg',
};

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

  it('shows Continue as visible and clickable immediately, with no delay', async () => {
    const onContinue = vi.fn();
    renderWithLab(
      {displayName: 'Test', appName: 'standalone_video'},
      onContinue,
    );
    const continueButton = screen.getByRole('button', {name: /continue/i});
    expect(continueButton).toBeVisible();
    await userEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("renders the facade play button with the video's accessible name", () => {
    renderWithLab({appName: 'standalone_video', levelData});
    expect(
      screen.getByRole('button', {name: `Play video ${levelData.name}`}),
    ).toBeInTheDocument();
  });

  // Video upgrades to YouTube's larger poster only after that image loads.
  // jsdom loads no images, so the level's own thumbnail is what shows.
  it('passes the level thumbnail to the facade', () => {
    renderWithLab({appName: 'standalone_video', levelData});
    expect(screen.getByAltText(`Play video ${levelData.name}`)).toHaveAttribute(
      'src',
      levelData.thumbnail,
    );
  });

  it('reaches the YouTube player when functional consent is granted', async () => {
    (useConsent as Mock).mockReturnValueOnce({
      categories: new Set(['functional']),
    });
    renderWithLab({appName: 'standalone_video', levelData});

    await userEvent.click(
      screen.getByRole('button', {name: `Play video ${levelData.name}`}),
    );

    expect(screen.getByText('YouTube Player')).toBeInTheDocument();
  });

  it('falls back to the native player when functional consent is denied', async () => {
    (useConsent as Mock).mockReturnValueOnce({categories: new Set()});
    (ReactPlayer.canPlay as Mock).mockReturnValueOnce(true);
    renderWithLab({appName: 'standalone_video', levelData});

    await userEvent.click(
      screen.getByRole('button', {name: `Play video ${levelData.name}`}),
    );

    expect(screen.getByText('Fallback Player')).toBeInTheDocument();
  });

  it('points the download link at levelData.download', () => {
    renderWithLab({appName: 'standalone_video', levelData});
    expect(screen.getByRole('link', {name: /download/i})).toHaveAttribute(
      'href',
      levelData.download,
    );
  });

  // The lab2 player leaves the box empty and keeps Continue usable.
  it('renders no player but still offers Continue when levelData is missing', () => {
    renderWithLab({appName: 'standalone_video'}, vi.fn());
    expect(screen.queryByRole('button', {name: /play video/i})).toBeNull();
    expect(screen.getByRole('button', {name: /continue/i})).toBeInTheDocument();
  });

  it('renders no player but still offers Continue when levelData is malformed', () => {
    renderWithLab(
      {appName: 'standalone_video', levelData: {name: 'no src field'}},
      vi.fn(),
    );
    expect(screen.queryByRole('button', {name: /play video/i})).toBeNull();
    expect(screen.getByRole('button', {name: /continue/i})).toBeInTheDocument();
  });
});
