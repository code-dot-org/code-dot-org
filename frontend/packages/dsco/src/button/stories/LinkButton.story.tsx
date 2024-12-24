import {Meta, StoryFn} from '@storybook/react';

import LinkButton, {LinkButtonProps} from '../LinkButton';

import {buttonColors} from '../index';

export default {
  title: 'DesignSystem/Button/LinkButton',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: LinkButton.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<LinkButtonProps> = args => (
  <LinkButton {...args} />
);

const MultipleTemplate: StoryFn<{
  components: LinkButtonProps[];
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
      <LinkButton
        key={`${componentArg.size}-${componentArg.text}-${
          componentArg.icon?.iconName
        }-${Math.random()}`}
        {...componentArg}
      />
    ))}
  </div>
);

export const DefaultLinkButton = SingleTemplate.bind({});
DefaultLinkButton.args = {
  text: 'Button',
  href: 'https://www.google.com',
  size: 'm',
};

export const DisabledLinkButton = SingleTemplate.bind({});
DisabledLinkButton.args = {
  text: 'Button',
  href: 'https://www.google.com',
  disabled: true,
  size: 'm',
};

export const PendingLinkButton = SingleTemplate.bind({});
PendingLinkButton.args = {
  text: 'Button',
  ariaLabel: 'Button',
  href: 'https://www.google.com',
  isPending: true,
  size: 'm',
};

export const LinkButtonWithIcons = SingleTemplate.bind({});
LinkButtonWithIcons.args = {
  text: 'Button',
  href: 'https://www.google.com',
  iconLeft: {iconName: 'house', iconStyle: 'solid'},
  iconRight: {iconName: 'brands fa-facebook', iconStyle: 'solid'},
  size: 'm',
};

export const IconLinkButton = SingleTemplate.bind({});
IconLinkButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  ariaLabel: 'Icon link button',
  type: 'primary',
  isIconOnly: true,
  href: 'https://www.google.com',
  size: 'm',
};

export const GroupOfColorsOfLinkButtons = MultipleTemplate.bind({});
GroupOfColorsOfLinkButtons.args = {
  components: [
    {
      text: 'Button Primary Purple',
      color: buttonColors.purple,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Primary Black',
      color: buttonColors.black,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Primary White',
      color: buttonColors.white,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Primary Destructive',
      color: buttonColors.destructive,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Secondary Black',
      color: buttonColors.black,
      type: 'secondary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Secondary Gray',
      color: buttonColors.gray,
      type: 'secondary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Secondary White',
      color: buttonColors.white,
      type: 'secondary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Secondary Destructive',
      color: buttonColors.destructive,
      type: 'secondary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Tertiary Purple',
      color: buttonColors.purple,
      type: 'tertiary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Tertiary Black',
      color: buttonColors.black,
      type: 'tertiary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Tertiary White',
      color: buttonColors.white,
      type: 'tertiary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button Tertiary Destructive',
      color: buttonColors.destructive,
      type: 'tertiary',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Purple primary icon link button',
      color: buttonColors.purple,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black primary icon link button',
      color: buttonColors.black,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White primary icon link button',
      color: buttonColors.white,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive primary icon link button',
      color: buttonColors.destructive,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black secondary icon link button',
      color: buttonColors.black,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Gray secondary icon link button',
      color: buttonColors.gray,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White secondary icon link button',
      color: buttonColors.white,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive secondary icon link button',
      color: buttonColors.destructive,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Purple tertiary icon link button',
      color: buttonColors.purple,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black tertiary icon link button',
      color: buttonColors.black,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White tertiary icon link button',
      color: buttonColors.white,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive tertiary icon link button',
      color: buttonColors.destructive,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
  ],
};

export const GroupOfSizesOfLinkButtons = MultipleTemplate.bind({});
GroupOfSizesOfLinkButtons.args = {
  components: [
    {
      text: 'Button xs',
      size: 'xs',
      href: 'https://www.google.com',
    },
    {
      text: 'Button s',
      size: 's',
      href: 'https://www.google.com',
    },
    {
      text: 'Button m',
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      text: 'Button l',
      size: 'l',
      href: 'https://www.google.com',
    },
  ],
};
