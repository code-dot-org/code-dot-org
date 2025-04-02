import type {Meta, StoryObj} from '@storybook/react';

import Footer, {FooterProps} from '../Footer';

type Story = StoryObj<typeof Footer>;

export default {
  title: 'CMS/Footer',
  component: Footer,
  render: args => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: '600px',
      }}
    >
      <Footer {...args} />
    </div>
  ),
} as Meta<FooterProps>;

const defaultArgs: FooterProps = {
  copyright: `Code.org, 2025. Code.org, the CODE logo, Hour of Code and CS Discoveries are trademarks of Code.org.\nBuilt on GitHub from Microsoft`,
  siteLinks: [
    {
      key: 'privacyPolicy',
      label: 'Privacy Policy',
      href: '/privacy',
    },
    {
      key: 'manageCookies',
      label: 'Manage Cookies',
      href: '/cookies',
    },
    {
      key: 'about',
      label: 'About',
      href: '/about',
    },
    {
      key: 'partners',
      label: 'Partners',
      href: '/partners',
    },
    {
      key: 'blog',
      label: 'Blog',
      href: 'https://medium.com/@codeorg',
    },
    {
      key: 'donate',
      label: 'Donate',
      href: '/donate',
    },
    {
      key: 'store',
      label: 'Store',
      href: '/shop',
    },
    {
      key: 'support',
      label: 'Support',
      href: 'https://support.code.org/',
    },
    {
      key: 'terms',
      label: 'Terms',
      href: '/tos',
    },
  ],
  socialLinks: [
    {
      key: 'facebook',
      label: 'Facebook',
      href: '/facebook',
      icon: {iconFamily: 'brands', iconName: 'facebook'},
    },
    {
      key: 'xTwitter',
      label: 'X Twitter',
      href: '/x-twitter',
      icon: {iconFamily: 'brands', iconName: 'x-twitter'},
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: '/instagram',
      icon: {iconFamily: 'brands', iconName: 'instagram'},
    },
    {
      key: 'medium',
      label: 'Medium',
      href: '/medium',
      icon: {iconFamily: 'brands', iconName: 'medium'},
    },
  ],
  imageLinks: [
    {
      key: 'poweredByAWS',
      label: 'Powered by AWS Cloud Computing',
      href: 'https://aws.amazon.com/what-is-cloud-computing',
      image: {
        src: 'https://code.org/shared/images/Powered-By_logo-horiz_RGB_REV.png',
      },
    },
  ],
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
};
