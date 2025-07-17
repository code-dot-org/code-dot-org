import type {Meta, StoryObj} from '@storybook/react';
import {within, expect, userEvent, fn} from '@storybook/test';

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
        height: '650px',
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
  languages: [
    {value: 'en-US', text: 'English'},
    {value: 'es', text: 'Spanish'},
    {value: 'zh-CN', text: 'Chinese'},
  ],
  selectedLocaleCode: 'es',
  onLanguageChange: fn(),
};

//
// STORIES
//
export const DefaultFooter: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const MobileFooter: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    eyes: {
      browser: {width: 414, height: 896, name: 'chrome'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // check that the Code.org links button is visible
    const mobileLinksButton = await canvas.findByLabelText(
      'Click to expand or collapse Site links',
    );
    await expect(mobileLinksButton).toBeVisible();

    // click the button to open the menu
    await userEvent.click(mobileLinksButton);

    // check that Code.org links menu is visible
    const mobileLinksMenu = await canvas.findByLabelText('Site links');
    const mobileLinks = await canvas.findAllByRole('link', {
      name: /privacy policy|manage cookies|about|partners|blog|donate|store|support|terms/i,
    });
    await expect(mobileLinksMenu).toBeVisible();
    await expect(mobileLinks).toHaveLength(9);
    for (const link of mobileLinks) {
      await expect(link).toBeVisible();
    }

    // check that language dropdown can be used
    const languageDropdown = await canvas.findByRole('combobox', {
      name: 'Language selection dropdown',
    });

    await expect(languageDropdown).toBeVisible();
    await userEvent.selectOptions(languageDropdown, 'zh-CN');
    await expect(defaultArgs.onLanguageChange).toHaveBeenCalledWith('zh-CN');
  },
};
