import {render, screen, fireEvent} from '@testing-library/react';
import ReactPlayer from 'react-player/file';

import Video from '@/components/video/Video';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';

ReactPlayer.canPlay = jest.fn();

jest.mock('react-player/youtube', () => ({
  __esModule: true,
  default: () => <div>YouTube Player</div>,
  canPlay: jest.fn(),
}));

jest.mock('react-player/file', () => ({
  __esModule: true,
  default: () => <div>File Player</div>,
  canPlay: jest.fn(),
}));

const FUNCTIONAL_COOKIES_ALLOWED = {
  allowedCookies: new Set([
    OneTrustCookieGroup.StrictlyNecessary,
    OneTrustCookieGroup.Functional,
  ]),
};

const FUNCTIONAL_COOKIES_DISALLOWED = {
  allowedCookies: new Set([OneTrustCookieGroup.StrictlyNecessary]),
};

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

  it('renders the facade by default', () => {
    render(<Video {...defaultProps} />);
    expect(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    ).toBeInTheDocument();
  });

  it('renders the YouTube video when facade is clicked and cookies are allowed', () => {
    render(
      <OneTrustContext.Provider value={FUNCTIONAL_COOKIES_ALLOWED}>
        <Video {...defaultProps} />
      </OneTrustContext.Provider>,
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );
    expect(screen.getByText('YouTube Player')).toBeInTheDocument();
  });

  it('renders the native video player when YouTube is blocked and fallback is available', () => {
    (ReactPlayer.canPlay as jest.Mock).mockReturnValue(true);
    render(
      <OneTrustContext.Provider value={FUNCTIONAL_COOKIES_DISALLOWED}>
        <Video {...defaultProps} />
      </OneTrustContext.Provider>,
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );
    expect(screen.getByText('File Player')).toBeInTheDocument();
  });

  it('renders the cookie-blocked state when cookies are not allowed', () => {
    render(
      <OneTrustContext.Provider value={FUNCTIONAL_COOKIES_DISALLOWED}>
        <Video {...defaultProps} videoFallback={undefined} />
      </OneTrustContext.Provider>,
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
  });

  it('renders the cookie-blocked state when OneTrust context is not available', () => {
    render(<Video {...defaultProps} videoFallback={undefined} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: `Play video ${defaultProps.videoTitle}`,
      }),
    );
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
  });
});
