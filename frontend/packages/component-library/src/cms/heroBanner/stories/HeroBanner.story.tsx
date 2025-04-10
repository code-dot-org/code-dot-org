import codeOrgLogo from '@public/images/code-org-logo.png';
import customBackgroundImage from '@public/images/hero-banner-custom-bg-example.png';
import imageFile from '@public/images/image-component.png';
import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

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
  },
};

export const TextOnly: Story = {
  args: {
    heading: 'Minimalist Hero',
    subHeading: 'Simple and elegant',
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
  },
};

export const WithBackgroundColor: Story = {
  args: {
    heading: 'Custom Background Color',
    subHeading: 'This hero has a background color set via hex code',
    description:
      'You can use the `backgroundColor` prop to apply any hex or CSS color value.',
    backgroundColor: '#E3F2FD', // Light blue as an example
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for hero section',
    },
  },
};

WithBackgroundColor.parameters = {
  docs: {
    description: {
      story:
        'This story shows how to apply a custom background color using the `backgroundColor` prop.' +
        ' This is useful when a design calls for specific color values outside of design tokens.',
    },
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
  },
};

export const WithoutBackground: Story = {
  args: {
    heading: 'No Background Example',
    subHeading: 'This hero has no background color or image',
    description:
      'The content should be clearly visible without any background distractions.',
    removeBackground: true,
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
  },
};

export const WithCustomStyles: Story = {
  args: {
    heading: 'Styled via className',
    subHeading: 'This HeroBanner has custom styles via className',
    description:
      'We apply a dashed border and fixed height using a custom class injected in the Storybook play function.',
    className: 'customHeroBannerClass',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Dynamically inject custom style for test and visual verification
    const style = document.createElement('style');
    style.innerHTML = `
      section.customHeroBannerClass {
        outline: 3px dashed rgb(255, 165, 0);
        background-color: #fefbe9;
        padding: 0;
      }
    `;
    canvasElement.appendChild(style);

    const heroBannerSection = await canvas.findByRole('banner');

    await expect(heroBannerSection).toHaveClass('customHeroBannerClass');

    const computedStyle = window.getComputedStyle(heroBannerSection);

    await expect(computedStyle.outline).toBe('rgb(255, 165, 0) dashed 3px');
    await expect(computedStyle.backgroundColor).toBe('rgb(254, 251, 233)'); // #fefbe9
  },
};

WithCustomStyles.parameters = {
  docs: {
    description: {
      story: 'This example demonstrates how to apply styles via className',
    },
  },
};
