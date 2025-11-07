import logoImage from '@public/images/cdo-logo-inverse.svg';
import {Meta, StoryFn} from '@storybook/react-webpack5';

import Header, {HeaderProps} from '../Header';

export default {
  title: 'DesignSystem/Header',
  component: Header,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for the Header.
            // Header component has one a11y issue, and it's related to the background and link colors.
            // This is a known issue across our design system, and we are ok accepting this for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
    useMui: true,
  },
} as Meta;

const Template: StoryFn<HeaderProps> = (args: HeaderProps) => (
  <Header {...args} />
);

export const Default = Template.bind({});

const SIGNED_OUT_MENU_ITEMS = [
  {label: 'Learn', href: '/students'},
  {label: 'Teach', href: '/teach'},
  {label: 'Districts', href: '/administrators'},
  {label: 'Stats', href: '/promote'},
  {label: 'Donate', href: '/donate'},
  {label: 'Incubator', href: '/incubator'},
  {label: 'About', href: '/about'},
];

Default.args = {
  logoImageUrl: logoImage,
  menuItems: SIGNED_OUT_MENU_ITEMS,
};
