import attributionImg from '@public/images/action-block-01.png';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, userEvent, fn} from 'storybook/test';

import Footer, {FooterProps} from '../Footer';

export default {
  title: 'DesignSystem/Footer',
  component: Footer,
} as Meta<FooterProps>;

type Story = StoryObj<FooterProps>;

const SITE_LINKS: FooterProps['siteLinks'] = [
  {id: 'privacy', label: 'Privacy Policy', href: '/privacy', accent: true},
  {id: 'manage_cookies', label: 'Manage Cookies', href: '/cookies'},
  {
    id: 'help_support',
    label: 'Help and support',
    href: '/support',
    external: true,
  },
  {id: 'store', label: 'Store', href: '/store', external: true},
  {id: 'tos_short', label: 'Terms', href: '/tos'},
];

const LANGUAGES: FooterProps['languages'] = [
  {value: 'en', text: 'English'},
  {value: 'es', text: 'Español'},
  {value: 'fr', text: 'Français'},
];

const IMAGE_LINK: NonNullable<FooterProps['imageLink']> = {
  src: attributionImg,
  altText: 'Attribution image',
  href: '/attribution',
  external: true,
};

const BASE_ARGS: FooterProps = {
  siteLinks: SITE_LINKS,
  copyright: '© Example, 2026',
  fineprint:
    'Engineers from various companies helped create these materials. ' +
    '© Example, 2026. Example® and the Example logo are trademarks of Example.',
  imageLink: IMAGE_LINK,
  languages: LANGUAGES,
  selectedLocaleCode: 'en',
  onLanguageChange: fn(),
};

/** Full footer with all slots populated, Privacy Policy in accent (brand orange). */
export const Default: Story = {
  args: BASE_ARGS,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // All links present.
    for (const link of SITE_LINKS) {
      expect(
        await canvas.findByRole('link', {name: new RegExp(link.label)}),
      ).toBeInTheDocument();
    }

    // Privacy Policy anchor carries data-accent for orange + bold styling.
    const privacyLink = await canvas.findByRole('link', {
      name: /Privacy Policy/,
    });
    expect(privacyLink).toHaveAttribute('data-accent');

    // Footer links are inside a navigation landmark.
    expect(
      canvas.getByRole('navigation', {name: 'Footer'}),
    ).toBeInTheDocument();

    // Language select is rendered, seeded with English, and labelled.
    expect(canvas.getByLabelText('Language')).toHaveValue('en');

    // Attribution image present.
    expect(canvas.getByAltText(IMAGE_LINK.altText)).toBeInTheDocument();
  },
};

/** Skeleton placeholder shown while language list is loading. */
export const SkeletonLoading: Story = {
  args: {
    ...BASE_ARGS,
    languages: 'loading',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // No select rendered during loading.
    expect(canvas.queryByRole('combobox')).toBeNull();

    // Loading status indicator is present.
    expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

/** Footer without fineprint or attribution image — minimum required props. */
export const WithoutOptionals: Story = {
  args: {
    ...BASE_ARGS,
    fineprint: undefined,
    imageLink: undefined,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // No attribution image when imageLink is omitted.
    expect(canvas.queryByAltText(IMAGE_LINK.altText)).toBeNull();

    // No fineprint element rendered.
    expect(canvas.queryByTestId('footer-fineprint')).toBeNull();

    // Core links still present.
    expect(
      canvas.getByRole('link', {name: /Privacy Policy/}),
    ).toBeInTheDocument();
  },
};

/** Language picker interaction — verifies onLanguageChange fires with the chosen code. */
export const LanguageChange: Story = {
  args: {
    ...BASE_ARGS,
    onLanguageChange: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText('Language');

    await userEvent.selectOptions(select, 'es');

    // Footer is a controlled component — selectedLocaleCode doesn't update
    // via the fn() spy, so we assert the callback was called rather than the DOM value.
    expect(args.onLanguageChange).toHaveBeenCalledWith('es');
  },
};
