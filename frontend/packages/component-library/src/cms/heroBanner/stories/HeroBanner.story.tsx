import imageFile from '@public/images/image-component.png';
import {Meta, StoryObj} from '@storybook/react';

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
      title: 'Tech for Good',
      logo: {
        src: imageFile,
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
