import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ReactPlayerProps} from 'react-player';
import ReactPlayer from 'react-player/file';

import Video from '@/video';

import ActionBlock, {ActionBlockProps} from '../index';

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

describe('ActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Action block title',
    description: 'This is the action block description.',
  };

  const primaryButtonProps = {
    primaryButton: {
      text: 'Primary Button',
      href: 'https://code.org',
      ariaLabel: 'Primary Button aria label',
    },
  };

  const secondaryButtonProps = {
    secondaryButton: {
      text: 'Secondary Button',
      href: 'https://hourofcode.com',
      ariaLabel: 'Secondary Button aria label',
    },
  };

  it('renders the title and description', () => {
    render(<ActionBlock {...defaultProps} />);

    expect(screen.getByText('Action block title')).toBeInTheDocument();
    expect(
      screen.getByText('This is the action block description.'),
    ).toBeInTheDocument();
  });

  it('renders an image', () => {
    render(
      <ActionBlock {...defaultProps} image={{src: 'image.png', alt: ''}} />,
    );

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image.png');
  });

  it('renders an overline', () => {
    render(<ActionBlock {...defaultProps} overline="Overline Text" />);

    expect(screen.getByText('Overline Text')).toBeInTheDocument();
  });

  it('renders a tag', () => {
    render(<ActionBlock {...defaultProps} tag="New" />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders detail', () => {
    render(
      <ActionBlock
        {...defaultProps}
        details={{label: 'Duration', description: '1 hour'}}
      />,
    );

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    render(
      <ActionBlock
        {...defaultProps}
        {...primaryButtonProps}
        {...secondaryButtonProps}
      />,
    );

    // check for primary button
    const primaryButton = screen.getByLabelText('Primary Button aria label');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', 'https://code.org');

    // check for secondary button
    const secondaryButton = screen.getByLabelText(
      'Secondary Button aria label',
    );
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', 'https://hourofcode.com');
  });

  it('does not render buttons when the primary button is not provided', () => {
    render(<ActionBlock {...defaultProps} primaryButton={undefined} />);

    // check for primary button
    const primaryButton = screen.queryByLabelText('Primary Button aria label');
    expect(primaryButton).not.toBeInTheDocument();

    // check for secondary button
    const secondaryButton = screen.queryByLabelText(
      'Secondary Button aria label',
    );
    expect(secondaryButton).not.toBeInTheDocument();
  });

  it('renders video component when video prop and VideoComponent are provided', () => {
    render(
      <ActionBlock
        {...defaultProps}
        VideoComponent={Video}
        video={{
          youTubeId: 'abc123',
          videoTitle: 'Sample Video Title',
          isYouTubeCookieAllowed: true,
        }}
      />,
    );

    expect(
      screen.getByLabelText('Play video Sample Video Title'),
    ).toBeInTheDocument();
  });

  it('shows fallback message if video is provided but VideoComponent is missing', () => {
    render(
      <ActionBlock
        {...defaultProps}
        video={{
          youTubeId: 'abc123',
          videoTitle: 'Fallback',
          isYouTubeCookieAllowed: true,
        }}
      />,
    );

    expect(
      screen.getByText(/VideoComponent is not provided/i),
    ).toBeInTheDocument();
  });
});
