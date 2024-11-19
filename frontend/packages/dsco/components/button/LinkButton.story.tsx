import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import LinkButton, {LinkButtonProps} from './LinkButton';

import {buttonColors} from './index';

export default {
  title: 'DesignSystem/Button/LinkButton', // eslint-disable-line storybook/no-title-property-in-meta
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
      color: buttonColors.purple,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.black,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.white,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.destructive,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.black,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.gray,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.white,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.destructive,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.purple,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.black,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.white,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      href: 'https://www.google.com',
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
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
