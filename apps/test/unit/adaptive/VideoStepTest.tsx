import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {VideoStep as Step} from '@cdo/apps/adaptive/types';
import VideoStep from '@cdo/apps/adaptive/views/steps/VideoStep';
import testYouTubeAvailable from '@cdo/apps/standaloneVideo/testYouTubeAvailable';

// Provide a host size so the video and continue button render.
jest.mock('@cdo/apps/util/hooks/useElementSize', () => ({
  __esModule: true,
  default: () => [800, 600],
}));
jest.mock('@cdo/apps/standaloneVideo/testYouTubeAvailable');
jest.mock('@cdo/apps/standaloneVideo/VideoJS', () => ({
  __esModule: true,
  default: () => <div role="region" aria-label="VideoJS player" />,
}));

const mockTestYouTubeAvailable = testYouTubeAvailable as jest.MockedFunction<
  typeof testYouTubeAvailable
>;

const step: Step = {
  id: 'intro-video',
  title: 'Watch this',
  kind: 'video',
  videoKey: 'maze_intro',
  src: 'https://www.youtube-nocookie.com/embed/abc123',
  download: 'https://videos.code.org/youtube/maze_intro.mp4',
  thumbnail: 'https://videos.code.org/youtube/maze_intro.jpg',
};

function renderStep(partial: Partial<Step> = {}, continueLabel = 'Continue') {
  const onComplete = jest.fn();
  render(
    <VideoStep
      step={{...step, ...partial}}
      continueLabel={continueLabel}
      onComplete={onComplete}
    />
  );
  return {onComplete};
}

describe('VideoStep', () => {
  it('renders the continue button with the provided label', () => {
    renderStep({}, 'Complete checkpoint');
    expect(
      screen.getByRole('button', {name: 'Complete checkpoint'})
    ).toBeInTheDocument();
  });

  it('calls onComplete when the continue button is clicked', () => {
    const {onComplete} = renderStep();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a YouTube iframe when YouTube is available', () => {
    mockTestYouTubeAvailable.mockImplementation((_noCookie, cb) => cb(true));
    renderStep();
    expect(screen.getByTitle('Simple Modal Video Player')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', {name: 'VideoJS player'})
    ).not.toBeInTheDocument();
  });

  it('shows the VideoJS fallback when YouTube is unavailable', () => {
    mockTestYouTubeAvailable.mockImplementation((_noCookie, cb) => cb(false));
    renderStep();
    expect(
      screen.getByRole('region', {name: 'VideoJS player'})
    ).toBeInTheDocument();
    expect(screen.queryByTitle('Video player')).not.toBeInTheDocument();
  });

  it('uses the VideoJS fallback when no src is provided', () => {
    renderStep({src: undefined});
    expect(
      screen.getByRole('region', {name: 'VideoJS player'})
    ).toBeInTheDocument();
  });
});
