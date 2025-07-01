import partnerLogo from '@public/images/code-org-logo.png';
import imageFile from '@public/images/image-component.png';
import {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import SkinnyBanner from './../SkinnyBanner';

export default {
  title: 'CMS/SkinnyBanner',
  component: SkinnyBanner,
  parameters: {
    componentSubtitle:
      'Renders a slim banner section with optional image, partner logo, and CTA button.',
  },
} as Meta<typeof SkinnyBanner>;

type Story = StoryObj<typeof SkinnyBanner>;

export const Default: Story = {
  args: {
    heading: 'Welcome to Code.org',
    description:
      'Join millions of students learning computer science around the world.',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', {name: 'Welcome to Code.org'}),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'Join millions of students learning computer science around the world.',
      ),
    ).toBeInTheDocument();
  },
};

export const WithImage: Story = {
  args: {
    heading: 'Explore with Visuals',
    description:
      'Skinny banners can include imagery to better communicate your message.',
    imageProps: {
      src: imageFile,
      altText: 'Decorative image for skinny banner',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByAltText('Decorative image for skinny banner'),
    ).toBeInTheDocument();
  },
};

export const WithPartner: Story = {
  args: {
    heading: 'Partnering with Great Organizations',
    description: 'Together we build inclusive education tools.',
    partner: {
      title: 'In partnership with',
      logo: {
        src: partnerLogo,
        altText: 'Partner Logo',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('In partnership with')).toBeInTheDocument();
    await expect(canvas.getByAltText('Partner Logo')).toBeInTheDocument();
  },
};

export const WithButton: Story = {
  args: {
    heading: 'Call to Action Example',
    description: 'Encourage engagement with a clear call to action.',
    buttonProps: {
      text: 'Learn More',
      href: '#',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('link', {name: 'Learn More'});
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('href', '#');
  },
};

export const WithBackgroundColor: Story = {
  args: {
    heading: 'Custom Background Color',
    description:
      'Use the `backgroundColor` prop to apply custom color styling.',
    backgroundColor: '#E3F2FD',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('complementary');
    const styles = window.getComputedStyle(banner);
    await expect(styles.backgroundColor).toBe('rgb(227, 242, 253)');
  },
};

export const WithBackgroundImage: Story = {
  args: {
    heading: 'Background Image Example',
    description:
      'Use the `backgroundImageUrl` prop to set a custom background image.',
    backgroundImageUrl: '/images/hero-banner-custom-bg-example.png',
    'data-theme': 'Dark',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole('complementary');
    const styles = window.getComputedStyle(banner);
    await expect(styles.backgroundImage).toContain(
      'hero-banner-custom-bg-example.png',
    );
  },
};

export const FullExample: Story = {
  args: {
    heading: 'Full Example: Partner, Image, Button, and Custom Background',
    description:
      'This is a fully featured skinny banner with all options enabled.',
    backgroundColor: '#F0F4C3',
    partner: {
      title: 'In partnership with',
      logo: {
        src: partnerLogo,
        altText: 'Partner Logo',
      },
    },
    imageProps: {
      src: imageFile,
      altText: 'Decorative skinny banner image',
    },
    buttonProps: {
      text: 'Get Started',
      href: '#',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('In partnership with')).toBeInTheDocument();
    await expect(canvas.getByAltText('Partner Logo')).toBeInTheDocument();
    await expect(
      canvas.getByAltText('Decorative skinny banner image'),
    ).toBeInTheDocument();
    const button = canvas.getByRole('link', {name: 'Get Started'});
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('href', '#');
  },
};

export const WithCustomStyles: Story = {
  args: {
    heading: 'Styled via className',
    description:
      'We apply a dashed border and fixed height using a custom class injected in the Storybook play function.',
    className: 'customSkinnyBannerClass',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const style = document.createElement('style');
    style.innerHTML = `
      aside.customSkinnyBannerClass {
        outline: 3px dashed rgb(255, 165, 0);
        background-color: #fefbe9;
        padding: 0;
      }
    `;
    canvasElement.appendChild(style);

    const banner = await canvas.findByRole('complementary');
    await expect(banner).toHaveClass('customSkinnyBannerClass');

    const styles = window.getComputedStyle(banner);
    await expect(styles.outline).toBe('rgb(255, 165, 0) dashed 3px');
    await expect(styles.backgroundColor).toBe('rgb(254, 251, 233)');
  },
};
