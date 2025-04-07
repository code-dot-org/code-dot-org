import {render, screen, act, fireEvent} from '@testing-library/react';
import {ReactPlayerProps} from 'react-player';
import ReactPlayer from 'react-player/file';

import Video from '../Video';

ReactPlayer.canPlay = jest.fn();

jest.mock('react-player/youtube', () => ({
  __esModule: true,
  default: ({light, playIcon, onError}: ReactPlayerProps) => (
    <div>
      YouTube Player
      {light}
      {playIcon}
      <button onClick={onError}>Trigger Error</button>
    </div>
  ),
  canPlay: jest.fn(),
}));

jest.mock('react-player/file', () => ({
  __esModule: true,
  default: ({light, playIcon, onError}: ReactPlayerProps) => (
    <div>
      Fallback Player
      {light}
      {playIcon}
      <button onClick={onError}>Trigger Error</button>
    </div>
  ),
  canPlay: jest.fn(),
}));

describe('Video Component', () => {
  const defaultProps = {
    youTubeId: 'dQw4w9WgXcQ',
    videoTitle: 'Sample Video',
    videoFallback: 'https://example.com/video.mp4',
    showCaption: true,
    downloadLabel: 'Download Video',
    errorHeading: 'Error Heading',
    errorBody: 'Error Body',
    className: 'custom-class',
    isYouTubeCookieAllowed: true,
  };

  beforeEach(() => {
    window.CDOVideoPlayer = {isYouTubeBlocked: false};
  });

  it('renders the facade by default', () => {
    render(<Video {...defaultProps} />);
    expect(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    ).toBeInTheDocument();
  });

  it('renders YouTube video player by default', () => {
    render(<Video {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );

    const player = screen.getByText('YouTube Player');
    expect(player).toBeVisible();
  });

  it('renders caption when showCaption is true', () => {
    render(<Video {...defaultProps} />);
    const caption = screen.getByText(defaultProps.videoTitle);
    expect(caption).toBeInTheDocument();
  });

  it('renders download button when videoFallback is provided', () => {
    render(<Video {...defaultProps} />);
    const downloadButton = screen.getByRole('link', {
      name: defaultProps.downloadLabel,
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute('href', defaultProps.videoFallback);
  });

  it('renders native video player when YouTube video fails and fallback is valid', () => {
    (ReactPlayer.canPlay as jest.Mock).mockReturnValue(true);
    render(<Video {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );

    const triggerErrorButton = screen.getByText('Trigger Error');

    act(() => {
      triggerErrorButton.click();
    });

    const fallbackPlayer = screen.getByText('Fallback Player');
    expect(fallbackPlayer).toBeVisible();
  });

  it('renders error state when both YouTube and fallback video fail', () => {
    (ReactPlayer.canPlay as jest.Mock).mockReturnValue(true);
    render(<Video {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );

    const triggerErrorButton = screen.getByText('Trigger Error');

    act(() => {
      triggerErrorButton.click();
    });

    const fallbackPlayer = screen.getByText('Fallback Player');
    expect(fallbackPlayer).toBeVisible();

    const nativeTriggerErrorButton = screen.getByText('Trigger Error');

    act(() => {
      nativeTriggerErrorButton.click();
    });

    const defaultErrorHeading = screen.getByText('Error Heading');
    const defaultErrorBody = screen.getByText('Error Body');
    expect(defaultErrorHeading).toBeInTheDocument();
    expect(defaultErrorBody).toBeInTheDocument();
  });

  it('renders error state when YouTube is known to be blocked', () => {
    window.CDOVideoPlayer!.isYouTubeBlocked = true;
    (ReactPlayer.canPlay as jest.Mock).mockReturnValue(true);
    render(<Video {...defaultProps} videoFallback={undefined} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );

    const defaultErrorHeading = screen.getByText('Error Heading');
    const defaultErrorBody = screen.getByText('Error Body');
    expect(defaultErrorHeading).toBeInTheDocument();
    expect(defaultErrorBody).toBeInTheDocument();
  });

  it('renders default error messages when errorHeading and errorBody are not provided', () => {
    (ReactPlayer.canPlay as jest.Mock).mockReturnValue(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {errorHeading, errorBody, ...propsWithoutErrorMessages} =
      defaultProps;
    render(<Video {...propsWithoutErrorMessages} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );

    const triggerErrorButton = screen.getByText('Trigger Error');

    act(() => {
      triggerErrorButton.click();
    });

    const fallbackPlayer = screen.getByText('Fallback Player');
    expect(fallbackPlayer).toBeVisible();

    const nativeTriggerErrorButton = screen.getByText('Trigger Error');

    act(() => {
      nativeTriggerErrorButton.click();
    });

    const defaultErrorHeading = screen.getByText('Video unavailable');
    const defaultErrorBody = screen.getByText(
      'This video is blocked on your network.',
    );
    expect(defaultErrorHeading).toBeInTheDocument();
    expect(defaultErrorBody).toBeInTheDocument();
  });

  it('renders the cookie-blocked state when YouTube cookies are not available', () => {
    render(
      <Video
        {...defaultProps}
        videoFallback={undefined}
        isYouTubeCookieAllowed={false}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
  });
});
