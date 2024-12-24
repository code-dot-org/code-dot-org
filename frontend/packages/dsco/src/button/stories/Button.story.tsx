import {Meta, StoryFn} from '@storybook/react';

import Button, {ButtonProps, buttonColors} from '../Button';

export default {
  title: 'DesignSystem/Button/Button',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Button.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ButtonProps> = args => <Button {...args} />;

const MultipleTemplate: StoryFn<{
  components: ButtonProps[];
}> = args => (
  <div
    style={{
      display: 'flex',
      flexFlow: 'wrap',
      alignItems: 'flex-start',
      gap: '20px',
    }}
  >
    {args.components?.map(componentArg => (
      <Button
        key={`${componentArg.size}-${componentArg.text}`}
        {...componentArg}
      />
    ))}
  </div>
);

export const DefaultButton = SingleTemplate.bind({});
DefaultButton.args = {
  text: 'Button',
  onClick: () => null,
  size: 'm',
};

export const DisabledButton = SingleTemplate.bind({});
DisabledButton.args = {
  text: 'Button',
  onClick: () => null,
  disabled: true,
  size: 'm',
};

export const PendingButton = SingleTemplate.bind({});
PendingButton.args = {
  text: 'Button',
  ariaLabel: 'Button',
  onClick: () => null,
  isPending: true,
  size: 'm',
};

export const ButtonWithIcons = SingleTemplate.bind({});
ButtonWithIcons.args = {
  text: 'Button',
  onClick: () => null,
  iconLeft: {iconName: 'house', iconStyle: 'solid'},
  iconRight: {iconName: 'smile', iconStyle: 'solid'},
  size: 'm',
};

export const IconButton = SingleTemplate.bind({});
IconButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  ariaLabel: 'Icon Button',
  type: 'primary',
  isIconOnly: true,
  onClick: () => null,
  size: 'm',
};

export const GroupOfColorsOfButtons = MultipleTemplate.bind({});
GroupOfColorsOfButtons.args = {
  components: [
    {
      text: 'Button Primary Purple',
      color: buttonColors.purple,
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Primary Black',
      color: buttonColors.black,
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Primary White',
      color: buttonColors.white,
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Primary Destructive',
      color: buttonColors.destructive,
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary Black',
      color: buttonColors.black,
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary Gray',
      color: buttonColors.gray,
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary White',
      color: buttonColors.white,
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary Destructive',
      color: buttonColors.destructive,
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary Purple',
      color: buttonColors.purple,
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary Black',
      color: buttonColors.black,
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary White',
      color: buttonColors.white,
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary Destructive',
      color: buttonColors.destructive,
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'purple primary icon only button',
      color: buttonColors.purple,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'black primary icon only button',
      color: buttonColors.black,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'white primary icon only button',
      color: buttonColors.white,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      'aria-label': 'destructive primary icon only button',
      color: buttonColors.destructive,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'black secondary icon only button',
      color: buttonColors.black,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'gray secondary icon only button',
      color: buttonColors.gray,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'white secondary icon only button',
      color: buttonColors.white,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'destructive secondary icon only button',
      color: buttonColors.destructive,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'purple tertiary icon only button',
      color: buttonColors.purple,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'black tertiary icon only button',
      color: buttonColors.black,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'white tertiary icon only button',
      color: buttonColors.white,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'destructive tertiary icon only button',
      color: buttonColors.destructive,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
  ],
};

export const GroupOfSizesOfButtons = MultipleTemplate.bind({});
GroupOfSizesOfButtons.args = {
  components: [
    {
      text: 'Button xs',
      size: 'xs',
      onClick: () => null,
    },
    {
      text: 'Button s',
      size: 's',
      onClick: () => null,
    },
    {
      text: 'Button m',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button l',
      size: 'l',
      onClick: () => null,
    },
  ],
};
