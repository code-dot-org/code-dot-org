import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import type {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

type AnchorProps = Pick<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'target' | 'rel'
>;

type IconButtonStoryProps = MuiIconButtonProps &
  AnchorProps & {
    icon: FontAwesomeV6IconProps;
  };

type ButtonStoryProps = (MuiButtonProps & AnchorProps) | IconButtonStoryProps;

export default {
  title: 'DesignSystem/Button/LinkButton',
  component: MuiButton,
  parameters: {
    useMui: true,
  },
} as Meta<MuiButtonProps>;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ButtonStoryProps> = args => {
  if ('icon' in args && args.icon) {
    const {icon, ...iconButtonProps} = args as IconButtonStoryProps;
    return (
      <MuiIconButton {...iconButtonProps}>
        <FontAwesomeV6Icon {...icon} />
      </MuiIconButton>
    );
  }

  return <MuiButton {...(args as MuiButtonProps)} />;
};

const MultipleTemplate: StoryFn<{
  components: ButtonStoryProps[];
}> = args => (
  <div
    style={{
      display: 'flex',
      flexFlow: 'wrap',
      alignItems: 'flex-start',
      gap: '20px',
    }}
  >
    {args.components?.map((componentArg, index) => {
      const key = `link-button-${index}`;

      if ('icon' in componentArg && componentArg.icon) {
        const {icon, ...iconButtonProps} = componentArg as IconButtonStoryProps;
        return (
          <MuiIconButton key={key} {...iconButtonProps}>
            <FontAwesomeV6Icon {...icon} />
          </MuiIconButton>
        );
      }

      return <MuiButton key={key} {...(componentArg as MuiButtonProps)} />;
    })}
  </div>
);

export const DefaultLinkButton = SingleTemplate.bind({});
DefaultLinkButton.args = {
  children: 'Button',
  href: 'https://www.google.com',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
};

export const DisabledLinkButton = SingleTemplate.bind({});
DisabledLinkButton.args = {
  children: 'Button',
  href: 'https://www.google.com',
  variant: 'contained',
  color: 'primary',
  disabled: true,
  size: 'medium',
};

export const PendingLinkButton = SingleTemplate.bind({});
PendingLinkButton.args = {
  children: 'Button',
  'aria-label': 'Button',
  href: 'https://www.google.com',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
  startIcon: (
    <FontAwesomeV6Icon
      iconName="spinner"
      iconStyle="solid"
      animationType="spin"
    />
  ),
};

export const LinkButtonWithIcons = SingleTemplate.bind({});
LinkButtonWithIcons.args = {
  children: 'Button',
  href: 'https://www.google.com',
  variant: 'contained',
  color: 'primary',
  startIcon: <FontAwesomeV6Icon iconName="house" iconStyle="solid" />,
  endIcon: (
    <FontAwesomeV6Icon iconName="brands fa-facebook" iconStyle="solid" />
  ),
  size: 'medium',
};

export const IconLinkButton = SingleTemplate.bind({});
IconLinkButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  'aria-label': 'Icon link button',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
  href: 'https://www.google.com',
};

export const AnalyticsCallbackLinkButton = SingleTemplate.bind({});
AnalyticsCallbackLinkButton.args = {
  children: 'Button',
  href: 'https://www.google.com',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
  onClick: () => alert('Sending analytics event...'),
};

export const GroupOfColorsOfLinkButtons = MultipleTemplate.bind({});
GroupOfColorsOfLinkButtons.args = {
  components: [
    {
      children: 'Button Primary Purple',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Primary Black',
      variant: 'contained',
      color: 'secondary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Primary White',
      variant: 'contained',
      color: 'white',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Primary Destructive',
      variant: 'contained',
      color: 'error',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Secondary Black',
      variant: 'outlined',
      color: 'secondary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Secondary Gray',
      variant: 'outlined',
      color: 'tertiary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Secondary White',
      variant: 'outlined',
      color: 'white',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Secondary Destructive',
      variant: 'outlined',
      color: 'error',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Tertiary Purple',
      variant: 'text',
      color: 'primary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Tertiary Black',
      variant: 'text',
      color: 'secondary',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Tertiary White',
      variant: 'text',
      color: 'white',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      children: 'Button Tertiary Destructive',
      variant: 'text',
      color: 'error',
      size: 'medium',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Purple primary icon link button',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black primary icon link button',
      size: 'medium',
      variant: 'contained',
      color: 'secondary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White primary icon link button',
      size: 'medium',
      variant: 'contained',
      color: 'white',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive primary icon link button',
      size: 'medium',
      variant: 'contained',
      color: 'error',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black secondary icon link button',
      size: 'medium',
      variant: 'outlined',
      color: 'secondary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Gray secondary icon link button',
      size: 'medium',
      variant: 'outlined',
      color: 'tertiary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White secondary icon link button',
      size: 'medium',
      variant: 'outlined',
      color: 'white',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive secondary icon link button',
      size: 'medium',
      variant: 'outlined',
      color: 'error',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Purple tertiary icon link button',
      size: 'medium',
      variant: 'text',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black tertiary icon link button',
      size: 'medium',
      variant: 'text',
      color: 'secondary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White tertiary icon link button',
      size: 'medium',
      variant: 'text',
      color: 'white',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Gray tertiary icon link button',
      size: 'medium',
      variant: 'text',
      color: 'tertiary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive tertiary icon link button',
      size: 'medium',
      variant: 'text',
      color: 'error',
      href: 'https://www.google.com',
    },
  ],
};

export const GroupOfSizesOfLinkButtons = MultipleTemplate.bind({});
GroupOfSizesOfLinkButtons.args = {
  components: [
    {
      children: 'Button xs',
      size: 'extraSmall',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      children: 'Button s',
      size: 'small',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      children: 'Button m',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      children: 'Button l',
      size: 'large',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'extraSmall',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
      'aria-label': 'Icon only xs',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'small',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
      'aria-label': 'Icon only s',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
      'aria-label': 'Icon only m',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'large',
      variant: 'contained',
      color: 'primary',
      href: 'https://www.google.com',
      'aria-label': 'Icon only l',
    },
  ],
};
