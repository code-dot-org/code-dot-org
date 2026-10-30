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
  title: 'DesignSystem/Button/GenericButton',
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
      const key = `generic-button-${index}`;

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

export const DefaultGenericButton = SingleTemplate.bind({});
DefaultGenericButton.args = {
  children: 'Button',
  onClick: () => null,
  size: 'medium',
  type: 'button',
  variant: 'contained',
  color: 'primary',
};

export const DisabledGenericButton = SingleTemplate.bind({});
DisabledGenericButton.args = {
  children: 'Button',
  onClick: () => null,
  variant: 'contained',
  color: 'primary',
  disabled: true,
  size: 'medium',
};

export const PendingGenericButton = SingleTemplate.bind({});
PendingGenericButton.args = {
  children: 'Button',
  'aria-label': 'Button',
  onClick: () => null,
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

export const GenericButtonWithIcons = SingleTemplate.bind({});
GenericButtonWithIcons.args = {
  children: 'Button',
  onClick: () => null,
  variant: 'contained',
  color: 'primary',
  startIcon: <FontAwesomeV6Icon iconName="house" iconStyle="solid" />,
  endIcon: <FontAwesomeV6Icon iconName="smile" iconStyle="solid" />,
  size: 'medium',
};

export const IconGenericButton = SingleTemplate.bind({});
IconGenericButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  'aria-label': 'Purple primary icon generic button',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
  onClick: () => null,
};

export const LinkGenericButton = SingleTemplate.bind({});
LinkGenericButton.args = {
  children: 'Link',
  href: 'https://www.google.com',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
};

export const ButtonButtonVsLinkButton = MultipleTemplate.bind({});
ButtonButtonVsLinkButton.args = {
  components: [
    {
      children: 'Button',
      onClick: () => null,
      size: 'medium',
      variant: 'contained',
      color: 'primary',
    },
    {
      children: 'Link',
      href: 'https://www.google.com',
      target: '_blank',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
    },
  ],
};

export const GroupOfColorsOfGenericButtons = MultipleTemplate.bind({});
GroupOfColorsOfGenericButtons.args = {
  components: [
    {
      children: 'Button Primary Purple',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Primary Black',
      variant: 'contained',
      color: 'secondary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Primary White',
      variant: 'contained',
      color: 'white',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Primary Destructive',
      variant: 'contained',
      color: 'error',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Secondary Black',
      variant: 'outlined',
      color: 'secondary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Secondary Gray',
      variant: 'outlined',
      color: 'tertiary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Secondary White',
      variant: 'outlined',
      color: 'white',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Secondary Destructive',
      variant: 'outlined',
      color: 'error',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Tertiary Purple',
      variant: 'text',
      color: 'primary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Tertiary Black',
      variant: 'text',
      color: 'secondary',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Tertiary White',
      variant: 'text',
      color: 'white',
      size: 'medium',
      onClick: () => null,
    },
    {
      children: 'Button Tertiary Destructive',
      variant: 'text',
      color: 'error',
      size: 'medium',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Purple primary icon only generic button',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black primary icon only generic button',
      size: 'medium',
      variant: 'contained',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White primary icon only generic button',
      size: 'medium',
      variant: 'contained',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive primary icon only generic button',
      size: 'medium',
      variant: 'contained',
      color: 'error',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black secondary icon only generic button',
      size: 'medium',
      variant: 'outlined',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Gray secondary icon only generic button',
      size: 'medium',
      variant: 'outlined',
      color: 'tertiary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White secondary icon only generic button',
      size: 'medium',
      variant: 'outlined',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive secondary icon only generic button',
      size: 'medium',
      variant: 'outlined',
      color: 'error',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Purple tertiary icon only generic button',
      size: 'medium',
      variant: 'text',
      color: 'primary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Black tertiary icon only generic button',
      size: 'medium',
      variant: 'text',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'White tertiary icon only generic button',
      size: 'medium',
      variant: 'text',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Gray tertiary icon only generic button',
      size: 'medium',
      variant: 'text',
      color: 'tertiary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'Destructive tertiary icon only generic button',
      size: 'medium',
      variant: 'text',
      color: 'error',
      onClick: () => null,
    },
  ],
};

export const GroupOfSizesOfGenericButtons = MultipleTemplate.bind({});
GroupOfSizesOfGenericButtons.args = {
  components: [
    {
      children: 'Button xs',
      size: 'extraSmall',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      children: 'Button s',
      size: 'small',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      children: 'Button m',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      children: 'Button l',
      size: 'large',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'extraSmall',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
      'aria-label': 'Icon only xs',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'small',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
      'aria-label': 'Icon only s',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
      'aria-label': 'Icon only m',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      size: 'large',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
      'aria-label': 'Icon only l',
    },
  ],
};
