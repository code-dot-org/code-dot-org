import {render, screen} from '@testing-library/react';

import YouTubeVideo from '../YoutubeVideo';

jest.mock('react-player/youtube', () => ({
  __esModule: true,
  default: () => <div>YouTube Player</div>,
  canPlay: jest.fn(),
}));

describe('YouTubeVideo', () => {
  const defaultProps = {
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    posterThumbnail: 'https://example.com/thumbnail.jpg',
    onError: jest.fn(),
  };

  it('renders the YouTube video player', () => {
    render(<YouTubeVideo {...defaultProps} />);
    const player = screen.getByText('YouTube Player');
    expect(player).toBeVisible();
  });

  it('injects the YouTube API script if not already present', () => {
    delete window.YT;
    delete window.CDOVideoPlayer;

    render(<YouTubeVideo {...defaultProps} />);

    const script = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    expect(script).toBeInTheDocument();
    expect(script?.className).toBe('optanon-category-C0003');
  });

  it('does not inject the YouTube API script if already present', () => {
    window.YT = {Player: jest.fn()};
    const appendSpy = jest.spyOn(document.head, 'appendChild');

    render(<YouTubeVideo {...defaultProps} />);

    expect(appendSpy).not.toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it('calls onError when the YouTube API script fails to load', () => {
    delete window.YT;
    delete window.CDOVideoPlayer;

    render(<YouTubeVideo {...defaultProps} />);

    const script = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    script?.dispatchEvent(new Event('error'));

    expect(defaultProps.onError).toHaveBeenCalled();
    expect(window.CDOVideoPlayer!.isYouTubeBlocked).toBe(true);
  });
});
