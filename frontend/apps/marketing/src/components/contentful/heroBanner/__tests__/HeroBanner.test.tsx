import {render, screen} from '@testing-library/react';

import HeroBanner from '../HeroBanner';

jest.mock('@/components/contentful/video', () => ({
  __esModule: true,
  default: ({videoTitle}: {videoTitle: string}) => (
    <button aria-label={`Play video ${videoTitle}`}>Play</button>
  ),
}));

describe('Hero Banner', () => {
  const contentMode = 'Light';
  const heading = 'Test Heading';
  const imageSize = 'Small';

  const renderComponent = (props = {}) =>
    render(
      <HeroBanner
        heading={heading}
        contentMode={contentMode}
        imageSize={imageSize}
        {...props}
      />,
    );

  it('renders announcement banner internal link when props provided', () => {
    const announcementBannerText = 'Test Announcement Banner';
    const bannerLinkData = {
      label: 'Internal Banner Link',
      primaryTarget: '/test-link',
      ariaLabel: 'Internal Banner Link Label',
      isThisAnExternalLink: false,
    };

    renderComponent({
      announcementBannerText,
      announcementBannerLink: [{fields: bannerLinkData}],
    });

    const bannerLink = screen.getByRole('link', {
      name: bannerLinkData.ariaLabel,
    });
    expect(bannerLink).toBeInTheDocument();
    expect(bannerLink).toHaveTextContent(bannerLinkData.label);
    expect(bannerLink).toHaveAttribute('href', bannerLinkData.primaryTarget);
    expect(bannerLink).not.toHaveAttribute('rel');
    expect(bannerLink).not.toHaveAttribute('target');
  });

  it('renders announcement banner external link when props provided', () => {
    const announcementBannerText = 'Test Announcement Banner';
    const bannerLinkData = {
      label: 'External Banner Link',
      primaryTarget: '/test-link',
      ariaLabel: 'External Banner Link Label',
      isThisAnExternalLink: true,
    };

    renderComponent({
      announcementBannerText,
      announcementBannerLink: [{fields: bannerLinkData}],
    });

    const bannerLink = screen.getByRole('link', {
      name: bannerLinkData.ariaLabel,
    });
    expect(bannerLink).toBeInTheDocument();
    expect(bannerLink).toHaveTextContent(bannerLinkData.label);
    expect(bannerLink).toHaveAttribute('href', bannerLinkData.primaryTarget);
    expect(bannerLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(bannerLink).toHaveAttribute('target', '_blank');
  });

  it('renders internal button link when props provided', () => {
    const buttonLinkData = {
      label: 'Internal Button Link',
      primaryTarget: '/test-link',
      ariaLabel: 'Internal Button Link Label',
      isThisAnExternalLink: false,
    };

    renderComponent({buttonLinks: [{fields: buttonLinkData}]});

    const buttonLink = screen.getByRole('link', {
      name: buttonLinkData.ariaLabel,
    });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent(buttonLinkData.label);
    expect(buttonLink).toHaveAttribute('href', buttonLinkData.primaryTarget);
    expect(buttonLink).not.toHaveAttribute('rel');
    expect(buttonLink).not.toHaveAttribute('target');
  });

  it('renders external button link when props provided', () => {
    const buttonLinkData = {
      label: 'External Button Link',
      primaryTarget: '/test-link',
      ariaLabel: 'External Button Link Label',
      isThisAnExternalLink: true,
    };

    renderComponent({buttonLinks: [{fields: buttonLinkData}]});

    const buttonLink = screen.getByRole('link', {
      name: buttonLinkData.ariaLabel,
    });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent(buttonLinkData.label);
    expect(buttonLink).toHaveAttribute('href', buttonLinkData.primaryTarget);
    expect(buttonLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(buttonLink).toHaveAttribute('target', '_blank');
  });
});
