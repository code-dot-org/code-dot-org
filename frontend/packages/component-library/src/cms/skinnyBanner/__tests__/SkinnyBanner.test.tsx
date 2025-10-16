import {render, screen} from '@testing-library/react';

import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/image';

import SkinnyBanner from '../SkinnyBanner';

describe('SkinnyBanner', () => {
  const defaultHeading = 'Test Banner Heading';

  it('renders heading correctly', () => {
    render(<SkinnyBanner heading={defaultHeading} />);
    expect(
      screen.getByRole('heading', {name: defaultHeading}),
    ).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <SkinnyBanner
        heading={defaultHeading}
        description="This is a test description"
      />,
    );
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders partner title and logo when partner is provided', () => {
    const partnerLogo: ImageProps = {
      src: '/partner-logo.png',
      altText: 'Partner Logo Alt',
    };

    render(
      <SkinnyBanner
        heading={defaultHeading}
        partner={{
          title: 'Partner Title',
          logo: partnerLogo,
        }}
      />,
    );

    expect(screen.getByText('Partner Title')).toBeInTheDocument();
    expect(screen.getByAltText('Partner Logo Alt')).toBeInTheDocument();
  });

  it('renders image when imageProps is provided', () => {
    const imageProps: ImageProps = {
      src: '/test-image.jpg',
      altText: 'Test Image Alt',
    };

    render(<SkinnyBanner heading={defaultHeading} imageProps={imageProps} />);
    expect(screen.getByAltText('Test Image Alt')).toBeInTheDocument();
  });

  it('renders button when buttonProps is provided', () => {
    const buttonProps: LinkButtonProps = {
      text: 'Click Me!',
      href: '/test-link',
    };

    render(<SkinnyBanner heading={defaultHeading} buttonProps={buttonProps} />);
    const linkButton = screen.getByRole('link', {name: 'Click Me!'});
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', '/test-link');
  });

  it('applies background color style if backgroundColor is provided', () => {
    render(<SkinnyBanner heading={defaultHeading} backgroundColor="#abcdef" />);

    const banner = screen.getByRole('complementary');
    expect(banner).toHaveStyle('background-color: #abcdef');
  });

  it('applies background image style if backgroundImageUrl is provided', () => {
    render(
      <SkinnyBanner
        heading={defaultHeading}
        backgroundImageUrl="/background-image.jpg"
      />,
    );

    const banner = screen.getByRole('complementary');
    expect(banner.style.backgroundImage).toContain('background-image.jpg');
  });
});
