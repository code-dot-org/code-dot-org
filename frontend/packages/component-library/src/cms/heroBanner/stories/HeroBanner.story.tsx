import codeOrgLogo from '@public/images/code-org-logo.png';
import customBackgroundImage from '@public/images/hero-banner-custom-bg-example.png';
import imageFile from '@public/images/image-component.png';
import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Video from '@/video';

import HeroBanner from './../HeroBanner';

export default {
  title: 'CMS/HeroBanner',
  component: HeroBanner,
  parameters: {
    componentSubtitle: 'Renders a Hero Banner/Section',
  },
} as Meta<typeof HeroBanner>;

type Story = StoryObj<typeof HeroBanner>;

export const Default: Story = {
  args: {
    heading: 'Welcome to Code.org',
    subHeading: 'Empowering the next generation of coders',
    description:
      'Join millions of students learning computer science around the world.',
    VideoComponent: Video,
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
  },
};

export const WithImage: Story = {
  args: {
    heading: 'Explore with Visuals',
    subHeading: 'This banner uses an image',
    description:
      'Hero banners can include imagery to better communicate your message.',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
      className: 'custom-image-class',
    },
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByAltText('Decorative image for hero section'),
    ).toBeInTheDocument();
  },
};

export const WithVideo: Story = {
  args: {
    heading: 'Watch and Learn',
    subHeading: 'Now featuring video support!',
    description: 'Use videos for impactful first impressions.',
    videoProps: {
      youTubeId: 'dQw4w9WgXcQ',
      videoTitle: 'Watch our intro video',
    },
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByLabelText('Play video Watch our intro video'),
    ).toBeInTheDocument();
  },
};

export const WithPartnerAndCTA: Story = {
  args: {
    heading: 'Partnering with Great Orgs',
    subHeading: 'In collaboration with Tech for Good',
    description: 'Together we build inclusive education tools.',
    partner: {
      title: 'In partnership with',
      logo: {
        src: codeOrgLogo,
        altText: 'Tech for Good Logo',
      },
    },
    buttonProps: {
      text: 'Learn More',
      href: '#',
    },
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('In partnership with')).toBeInTheDocument();
    await expect(canvas.getByAltText('Tech for Good Logo')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', {name: 'Learn More'}),
    ).toBeInTheDocument();
  },
};

export const TextOnly: Story = {
  args: {
    heading: 'Minimalist Hero',
    subHeading: 'Simple and elegant',
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Minimalist Hero')).toBeInTheDocument();
    await expect(canvas.getByText('Simple and elegant')).toBeInTheDocument();
  },
};

export const LongContent: Story = {
  args: {
    heading:
      'This is a longer hero heading to test wrapping behavior and layout',
    subHeading:
      'Subheading can also be multiline and should be styled correctly across breakpoints.',
    description:
      'The description here is intentionally long to ensure text flows properly across viewports and doesn’t break layout.',

    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/This is a longer hero heading/),
    ).toBeInTheDocument();
  },
};

export const WithBackgroundColor: Story = {
  args: {
    heading: 'Custom Background Color',
    subHeading: 'This hero has a background color set via hex code',
    description:
      'You can use the `backgroundColor` prop to apply any hex or CSS color value.',
    backgroundColor: '#E3F2FD',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
    },
    VideoComponent: Video,
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const banner = canvasElement.querySelector('section > div');
    const styles = window.getComputedStyle(banner as Element);
    await expect(styles.backgroundColor).toBe('rgb(227, 242, 253)');
  },
};

export const WithBackgroundImage: Story = {
  args: {
    heading: 'Background Image Example',
    subHeading: 'This hero has a custom background image',
    description:
      'The background image should not interfere with the text readability.',
    backgroundImageUrl: customBackgroundImage,
    'data-theme': 'Dark',
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const banner = canvasElement.querySelector('section > div');
    const styles = window.getComputedStyle(banner as Element);
    await expect(styles.backgroundImage).toMatch(
      /hero-banner-custom-bg-example.*\.png/,
    );
  },
};

export const WithoutBackground: Story = {
  args: {
    heading: 'No Background Example',
    subHeading: 'This hero has no background color or image',
    description:
      'The content should be clearly visible without any background distractions.',
    removeBackground: true,
    VideoComponent: Video,
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('banner');
    const styles = window.getComputedStyle(banner);
    await expect(styles.backgroundImage).toBe('none');
  },
};

export const WithWideText: Story = {
  args: {
    heading: 'Wide Text Example',
    subHeading: 'This hero has wide text layout',
    description:
      'The text should be left-aligned and span the full width of the container.',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
      className: 'custom-image-class',
    },
    withWideText: true,
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Wide Text Example')).toBeInTheDocument();
    await expect(
      canvas.getByAltText('Decorative image for hero section'),
    ).toBeInTheDocument();
  },
};

export const WithAnnouncementBanner: Story = {
  args: {
    heading: 'Announcement Banner Example',
    subHeading: 'This hero has an announcement banner',
    description:
      'The announcement banner should be clearly visible and distinct from the hero content.',
    announcementBannerProps: {
      text: 'Important Announcement: New features released!',
      icon: {
        iconName: 'info-circle',
        title: 'info icon',
      },
      link: {
        text: 'Learn more',
        href: '#',
      },
    },
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Assert that the banner text is visible
    await expect(
      canvas.getByText('Important Announcement: New features released!'),
    ).toBeInTheDocument();

    // Assert that the link is rendered and points to the correct href
    const link = canvas.getByRole('link', {name: 'Learn more'});
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', '#');

    // Assert that the icon is rendered using the title
    const icon = canvas.getByTitle('info icon');
    await expect(icon).toBeInTheDocument();
  },
};

export const WithCustomStyles: Story = {
  args: {
    heading: 'Styled via className',
    subHeading: 'This HeroBanner has custom styles via className',
    description:
      'We apply a dashed border and fixed height using a custom class injected in the Storybook play function.',
    className: 'customHeroBannerClass',
    VideoComponent: Video,
  },
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({canvasElement}) => {
    const style = document.createElement('style');
    style.innerHTML = `
      section.customHeroBannerClass > div {
        background: #fefbe9;
        border: 3px dashed rgb(255, 165, 0);
      }
    `;
    canvasElement.appendChild(style);

    const bannerSection = canvasElement.querySelector('section');
    await expect(bannerSection).toHaveClass('customHeroBannerClass');

    const banner = canvasElement.querySelector('section > div');
    const styles = window.getComputedStyle(banner as Element);
    await expect(styles.backgroundColor).toBe('rgb(254, 251, 233)');
    await expect(styles.border).toBe('3px dashed rgb(255, 165, 0)');
  },
};

export const Tablet: Story = {
  args: {
    heading: 'Tablet Example',
    subHeading: 'This banner uses an image',
    description: 'This is how the hero looks on a tablet device.',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
      className: 'custom-image-class',
    },
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'tablet',
    },
    eyes: {
      browser: {width: 834, height: 1112, name: 'chrome'},
    },
  },
};

export const TabletWithHiddenImage: Story = {
  args: {
    heading: 'Tablet w/ Hidden Image',
    subHeading: 'This banner uses an image that is hidden on small screens',
    description: 'This is how the hero looks on a tablet device.',
    imageProps: {
      src: imageFile,
      altText: 'This should not show on small screens',
      className: 'custom-image-class',
    },
    VideoComponent: Video,
    hideImageOnSmallScreen: true,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'tablet',
    },
    eyes: {
      browser: {width: 834, height: 1112, name: 'chrome'},
    },
  },
};

export const Mobile: Story = {
  args: {
    heading: 'Mobile Example',
    subHeading: 'This banner uses an image',
    description: 'This is how the hero looks on a mobile device.',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
      className: 'custom-image-class',
    },
    VideoComponent: Video,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'mobile2',
    },
    eyes: {
      browser: {width: 414, height: 896, name: 'chrome'},
    },
  },
};

export const MobileWithHiddenImage: Story = {
  args: {
    heading: 'Mobile w/ Hidden Image',
    subHeading: 'This banner uses an image that is hidden on small screens',
    description: 'This is how the hero looks on a mobile device.',
    imageProps: {
      src: imageFile,
      altText: 'This should not show on small screens',
      className: 'custom-image-class',
    },
    VideoComponent: Video,
    hideImageOnSmallScreen: true,
    backgroundColor: '#e4e6e9',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'mobile2',
    },
    eyes: {
      browser: {width: 414, height: 896, name: 'chrome'},
    },
  },
};
