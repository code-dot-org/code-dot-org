import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import type {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-webpack5';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

type IconButtonStoryProps = MuiIconButtonProps & {
  icon: FontAwesomeV6IconProps;
};

type ButtonStoryProps = MuiButtonProps | IconButtonStoryProps;

export default {
  title: 'DesignSystem/Button/MuiButton',
  component: MuiButton,
  parameters: {
    useMui: true,
    docs: {
      description: {
        component:
          'MUI Button component with custom theme overrides. See [MUI Button documentation](https://mui.com/material-ui/react-button/) for full API.',
      },
    },
  },
  argTypes: {
    // Explicitly include common MUI Button props to ensure they show in docs
    children: {
      control: 'text',
      description: 'The content of the button.',
    },
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: 'The variant to use.',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'inherit',
        'white',
        'tertiary',
      ],
      description: 'The color of the component.',
    },
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium', 'large'],
      description: 'The size of the component.',
    },
    disabled: {
      control: 'boolean',
      description: 'If true, the component is disabled.',
    },
    fullWidth: {
      control: 'boolean',
      description:
        'If true, the button will take up the full width of its container.',
    },
    href: {
      control: 'text',
      description:
        'The URL to link to when the button is clicked. If set, the button will render as an anchor element.',
    },
    startIcon: {
      control: false, // Disable control for React elements
      description: 'Element placed before the children.',
    },
    endIcon: {
      control: false, // Disable control for React elements
      description: 'Element placed after the children.',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback fired when the button is clicked.',
    },
    // Include all other standard HTML button props
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'The type of button.',
    },
    className: {
      control: 'text',
      description: 'CSS class name applied to the root element.',
    },
    id: {
      control: 'text',
      description: 'HTML id attribute.',
    },
  },
} as Meta<MuiButtonProps>;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ButtonStoryProps> = args => {
  // Check if it's an icon button by looking for icon prop
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
      const key = `mui-button-${index}`;

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

export const DefaultButton = SingleTemplate.bind({});
DefaultButton.args = {
  children: 'Button',
  onClick: () => null,
  size: 'medium',
  type: 'button',
  variant: 'contained',
  color: 'primary',
};

export const DisabledButton = SingleTemplate.bind({});
DisabledButton.args = {
  children: 'Button',
  onClick: () => null,
  variant: 'contained',
  color: 'primary',
  disabled: true,
  size: 'medium',
};

export const PendingButton = SingleTemplate.bind({});
PendingButton.args = {
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

export const ButtonWithIcons = SingleTemplate.bind({});
ButtonWithIcons.args = {
  children: 'Button',
  onClick: () => null,
  variant: 'contained',
  color: 'primary',
  startIcon: <FontAwesomeV6Icon iconName="house" iconStyle="solid" />,
  endIcon: <FontAwesomeV6Icon iconName="smile" iconStyle="solid" />,
  size: 'medium',
};

export const IconButton = SingleTemplate.bind({});
IconButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  'aria-label': 'Icon Button',
  size: 'medium',
  variant: 'contained',
  color: 'primary',
  onClick: () => null,
};

export const GroupOfColorsOfButtons = MultipleTemplate.bind({});
GroupOfColorsOfButtons.args = {
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
      'aria-label': 'purple primary icon only button',
      size: 'medium',
      variant: 'contained',
      color: 'primary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'black primary icon only button',
      size: 'medium',
      variant: 'contained',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'white primary icon only button',
      size: 'medium',
      variant: 'contained',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'destructive primary icon only button',
      size: 'medium',
      variant: 'contained',
      color: 'error',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'black secondary icon only button',
      size: 'medium',
      variant: 'outlined',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'gray secondary icon only button',
      size: 'medium',
      variant: 'outlined',
      color: 'tertiary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'white secondary icon only button',
      size: 'medium',
      variant: 'outlined',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'destructive secondary icon only button',
      size: 'medium',
      variant: 'outlined',
      color: 'error',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'purple tertiary icon only button',
      size: 'medium',
      variant: 'text',
      color: 'primary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'black tertiary icon only button',
      size: 'medium',
      variant: 'text',
      color: 'secondary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'white tertiary icon only button',
      size: 'medium',
      variant: 'text',
      color: 'white',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'gray tertiary icon only button',
      size: 'medium',
      variant: 'text',
      color: 'tertiary',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'destructive tertiary icon only button',
      size: 'medium',
      variant: 'text',
      color: 'error',
      onClick: () => null,
    },
  ],
};

export const GroupOfSizesOfButtons = MultipleTemplate.bind({});
GroupOfSizesOfButtons.args = {
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
