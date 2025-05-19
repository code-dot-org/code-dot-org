import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ReactPlayerProps} from 'react-player';
import ReactPlayer from 'react-player/file';

import Video from '@/video';

import FullWidthActionBlock, {ActionBlockProps} from '../index';

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

describe('FullWidthActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Full width action block title',
    description: 'This is the full width action block description.',
  };

  const primaryButtonProps = {
    primaryButton: {
      text: 'Full Width Primary Button',
      href: 'https://code.org',
      ariaLabel: 'Full Width Primary Button aria label',
    },
  };

  const secondaryButtonProps = {
    secondaryButton: {
      text: 'Full Width Secondary Button',
      href: 'https://hourofcode.com',
      ariaLabel: 'Full Width Secondary Button aria label',
    },
  };

  it('renders the title and description', () => {
    render(<FullWidthActionBlock {...defaultProps} />);

    expect(
      screen.getByText('Full width action block title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is the full width action block description.'),
    ).toBeInTheDocument();
  });

  it('renders an image', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        image={{src: 'image.png', alt: ''}}
      />,
    );

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image.png');
  });

  it('renders a video if provided and image is ignored', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        image={{src: 'image.png', alt: ''}}
        video={{
          youTubeId: '123abc',
          videoTitle: 'My Test Video',
          isYouTubeCookieAllowed: true,
        }}
        VideoComponent={Video}
      />,
    );

    // Image should NOT be rendered when video is provided
    expect(screen.queryByAltText('')).not.toBeInTheDocument();

    // Video should be rendered when provided
    expect(
      screen.getByLabelText('Play video My Test Video'),
    ).toBeInTheDocument();
  });

  it('shows fallback message if VideoComponent is missing', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        video={{
          youTubeId: 'abc123',
          videoTitle: 'Missing Component Video',
          isYouTubeCookieAllowed: true,
        }}
      />,
    );

    expect(
      screen.getByText(
        'VideoComponent is not provided. Please provide VideoComponent in order to render a video.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an overline', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        overline="Full Width Overline Text"
      />,
    );

    expect(screen.getByText('Full Width Overline Text')).toBeInTheDocument();
  });

  it('renders a tag', () => {
    render(<FullWidthActionBlock {...defaultProps} tag="New" />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders detail', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        details={{label: 'Duration', description: '1 week'}}
      />,
    );

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('1 week')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        {...primaryButtonProps}
        {...secondaryButtonProps}
      />,
    );

    const primaryButton = screen.getByLabelText(
      'Full Width Primary Button aria label',
    );
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', 'https://code.org');

    const secondaryButton = screen.getByLabelText(
      'Full Width Secondary Button aria label',
    );
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', 'https://hourofcode.com');
  });

  it('does not render buttons when the primary button is not provided', () => {
    render(
      <FullWidthActionBlock {...defaultProps} primaryButton={undefined} />,
    );

    // check for primary button
    const primaryButton = screen.queryByLabelText(
      'Full Width Primary Button aria label',
    );
    expect(primaryButton).not.toBeInTheDocument();

    // check for secondary button
    const secondaryButton = screen.queryByLabelText(
      'Full Width Secondary Button aria label',
    );
    expect(secondaryButton).not.toBeInTheDocument();
  });
});
