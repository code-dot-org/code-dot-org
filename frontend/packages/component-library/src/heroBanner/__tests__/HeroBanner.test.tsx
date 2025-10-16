import {render, screen} from '@testing-library/react';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';
import Video, {VideoProps} from '@/video';

import HeroBanner from './../HeroBanner';

// Mock Video to avoid issues with react-player
jest.mock('@/video', () => ({
  __esModule: true,
  default: ({videoTitle}: {videoTitle: string}) => (
    <div>
      <button aria-label={`Play video ${videoTitle}`}>Play</button>
    </div>
  ),
}));

describe('HeroBanner', () => {
  const defaultHeading = 'Welcome to Code.org';
  const defaultProps = {
    heading: defaultHeading,
    VideoComponent: Video,
  };

  it('renders heading', () => {
    render(<HeroBanner {...defaultProps} />);
    expect(
      screen.getByRole('heading', {name: defaultHeading}),
    ).toBeInTheDocument();
  });

  it('renders subheading and description', () => {
    render(
      <HeroBanner
        {...defaultProps}
        subHeading="Subheading here"
        description="Description text"
      />,
    );
    expect(screen.getByText('Subheading here')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders image if imageProps is provided', () => {
    const imageProps: ImageProps = {
      src: '/test-image.jpg',
      altText: 'Test Image',
    };
    render(<HeroBanner {...defaultProps} imageProps={imageProps} />);
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('renders video if videoProps is provided', () => {
    const videoProps: VideoProps = {
      youTubeId: 'dQw4w9WgXcQ',
      videoTitle: 'Test Video Title',
    };
    render(<HeroBanner {...defaultProps} videoProps={videoProps} />);
    expect(
      screen.getByLabelText('Play video Test Video Title'),
    ).toBeInTheDocument();
  });

  it('renders button if buttonProps is provided', () => {
    const buttonProps: LinkButtonProps = {
      text: 'Click me!',
      href: '/link',
    };
    render(<HeroBanner {...defaultProps} buttonProps={buttonProps} />);
    expect(screen.getByRole('link', {name: 'Click me!'})).toBeInTheDocument();
  });

  it('renders partner logo and title if partner is provided', () => {
    const partnerLogo: ImageProps = {
      src: '/partner-logo.png',
      alt: 'Partner Logo Alt',
    };
    render(
      <HeroBanner
        {...defaultProps}
        partner={{
          title: 'Partner Title',
          logo: partnerLogo,
        }}
      />,
    );
    expect(screen.getByText('Partner Title')).toBeInTheDocument();
    expect(screen.getByAltText('Partner Logo Alt')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(
      <HeroBanner {...defaultProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('prefers video over image when both are provided', () => {
    const videoProps: VideoProps = {
      youTubeId: 'abc123',
      videoTitle: 'Video always wins',
    };
    const imageProps: ImageProps = {
      src: '/image.jpg',
      altText: 'This should not render',
    };
    render(
      <HeroBanner
        {...defaultProps}
        videoProps={videoProps}
        imageProps={imageProps}
      />,
    );
    expect(
      screen.queryByAltText('This should not render'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Play video Video always wins'),
    ).toBeInTheDocument();
  });
});
