import attributionImg from '@public/images/action-block-01.png';
import {Meta, StoryFn} from '@storybook/react-vite';
import {within, expect} from 'storybook/test';

import Footer, {FooterProps} from '../Footer';

export default {
  title: 'DesignSystem/Footer',
  component: Footer,
} as Meta;

const Template: StoryFn<FooterProps> = (args: FooterProps) => (
  <Footer {...args} />
);

/** Realistic studio footer links — Privacy Policy uses accent (brand orange). */
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

const IMAGE_LINK: FooterProps['imageLink'] = {
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
  languagesReady: true,
  onLanguageChange: () => {},
};

/** Full footer with all slots populated, Privacy Policy in accent (brand orange). */
export const Default = Template.bind({});
Default.args = BASE_ARGS;
Default.play = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);

  // All links present with correct labels.
  for (const link of SITE_LINKS) {
    expect(
      await canvas.findByRole('link', {name: link.label}),
    ).toBeInTheDocument();
  }

  // Privacy Policy wrapper carries data-accent for orange styling.
  const privacyLink = await canvas.findByRole('link', {name: 'Privacy Policy'});
  expect(privacyLink.closest('[data-accent]')).not.toBeNull();

  // Language select is rendered and seeded with English.
  const select = canvas.getByRole('combobox') as HTMLSelectElement;
  expect(select.value).toBe('en');

  // Attribution image present with non-empty alt text.
  expect(canvas.getByAltText(IMAGE_LINK.altText)).toBeInTheDocument();
};

/** Skeleton placeholder shown while language list is loading. */
export const SkeletonLoading = Template.bind({});
SkeletonLoading.args = {
  ...BASE_ARGS,
  languagesReady: false,
  languages: [],
};
SkeletonLoading.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // No select rendered during loading.
  expect(canvas.queryByRole('combobox')).toBeNull();

  // MUI Skeleton is present in its place.
  expect(canvasElement.querySelector('.MuiSkeleton-root')).not.toBeNull();
};

/** Footer without fineprint or attribution image — minimum required props. */
export const WithoutOptionals = Template.bind({});
WithoutOptionals.args = {
  ...BASE_ARGS,
  fineprint: undefined,
  imageLink: undefined,
};
WithoutOptionals.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // No attribution image when imageLink is omitted.
  expect(canvas.queryByAltText(IMAGE_LINK.altText)).toBeNull();

  // No fineprint element rendered.
  expect(canvasElement.querySelector('.MuiFooter-fineprint')).toBeNull();

  // Core links still present.
  expect(
    canvas.getByRole('link', {name: 'Privacy Policy'}),
  ).toBeInTheDocument();
};
