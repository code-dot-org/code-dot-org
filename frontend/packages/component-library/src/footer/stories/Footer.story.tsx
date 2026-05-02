import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, userEvent, fn} from 'storybook/test';

import {Footer} from '../Footer';
import type {FooterLanguageOption, FooterSiteLink} from '../types';

/** Generic site links — hrefs are path-only to avoid dependence on any external domain. */
const SITE_LINKS: FooterSiteLink[] = [
  {id: 'link-one', label: 'Link One', href: '/link-one'},
  {id: 'link-two', label: 'Link Two', href: '/link-two'},
  {id: 'link-three', label: 'Link Three', href: '/link-three', external: true},
  {id: 'link-four', label: 'Link Four', href: '/link-four', external: true},
];

/** Representative locale set covering Latin-script and extended-script labels. */
const LANGUAGES: FooterLanguageOption[] = [
  {value: 'en', text: 'English'},
  {value: 'es', text: 'Español'},
  {value: 'fr', text: 'Français'},
];

export default {
  title: 'DesignSystem/Footer',
  component: Footer,
} satisfies Meta<typeof Footer>;

type Story = StoryObj<typeof Footer>;

/** Full footer layout: link list, language picker, copyright, fineprint, and attribution image. */
export const Default: Story = {
  args: {
    siteLinks: SITE_LINKS,
    copyright: <span>© 2025</span>,
    fineprint: <span>Additional information.</span>,
    imageLink: {
      src: '/images/attribution.webp',
      altText: 'Powered by cloud computing',
      href: '/cloud',
      external: true,
    },
    languages: LANGUAGES,
    selectedLocaleCode: 'en',
    onLanguageChange: fn(),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // Every site link renders with the configured href.
    for (const link of SITE_LINKS) {
      const anchor = canvas.getByRole('link', {name: link.label});
      await expect(anchor).toBeInTheDocument();
      await expect(anchor).toHaveAttribute('href', link.href);
    }

    // External links carry rel and target.
    for (const link of SITE_LINKS.filter(l => l.external)) {
      const anchor = canvas.getByRole('link', {name: link.label});
      await expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(anchor).toHaveAttribute('target', '_blank');
    }

    // Internal links carry neither rel nor target.
    for (const link of SITE_LINKS.filter(l => !l.external)) {
      const anchor = canvas.getByRole('link', {name: link.label});
      await expect(anchor).not.toHaveAttribute('rel');
      await expect(anchor).not.toHaveAttribute('target');
    }

    // Picker is pre-selected on the current locale.
    const select = canvas.getByRole('combobox');
    await expect(select).toHaveValue('en');

    // Picking a new language fires onLanguageChange with the chosen code.
    await userEvent.selectOptions(select, 'fr');
    await expect(args.onLanguageChange).toHaveBeenCalledWith('fr');
  },
};

/** Language picker replaced by a skeleton while the locale list loads. */
export const LanguagePickerLoading: Story = {
  args: {
    ...Default.args,
    languagesLoading: true,
  },
};
