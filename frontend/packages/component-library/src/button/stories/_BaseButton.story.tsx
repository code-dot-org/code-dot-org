import {Meta, StoryFn} from '@storybook/react';

import {buttonColors} from '../index';
import _BaseButton, {_BaseButtonProps} from '../_BaseButton';

export default {
  title: 'DesignSystem/Button/_BaseButton',
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: _BaseButton.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<_BaseButtonProps> = args => (
  <_BaseButton {...args} />
);

const MultipleTemplate: StoryFn<{
  components: _BaseButtonProps[];
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
      <_BaseButton
        key={`${componentArg.size}-${componentArg.text}`}
        {...componentArg}
      />
    ))}
  </div>
);

export const Default_BaseButton = SingleTemplate.bind({});
Default_BaseButton.args = {
  text: 'Button',
  onClick: () => null,
  size: 'm',
};

export const Disabled_BaseButton = SingleTemplate.bind({});
Disabled_BaseButton.args = {
  text: 'Button',
  onClick: () => null,
  disabled: true,
  size: 'm',
};

export const Pending_BaseButton = SingleTemplate.bind({});
Pending_BaseButton.args = {
  text: 'Button',
  ariaLabel: 'Button',
  onClick: () => null,
  isPending: true,
  size: 'm',
};

export const _BaseButtonWithIcons = SingleTemplate.bind({});
_BaseButtonWithIcons.args = {
  text: 'Button',
  onClick: () => null,
  iconLeft: {iconName: 'house', iconStyle: 'solid'},
  iconRight: {iconName: 'smile', iconStyle: 'solid'},
  size: 'm',
};

export const Icon_BaseButton = SingleTemplate.bind({});
Icon_BaseButton.args = {
  icon: {iconName: 'smile', iconStyle: 'solid'},
  ariaLabel: 'Purple primary icon base button',
  type: 'primary',
  isIconOnly: true,
  onClick: () => null,
  size: 'm',
};

export const Link_BaseButton = SingleTemplate.bind({});
Link_BaseButton.args = {
  text: 'Link',
  useAsLink: true,
  href: 'https://www.google.com',
  size: 'm',
};

export const ButtonButtonVsLinkButton = MultipleTemplate.bind({});
ButtonButtonVsLinkButton.args = {
  components: [
    {
      text: 'Button',
      onClick: () => null,
      size: 'm',
    },
    {
      text: 'Link',
      useAsLink: true,
      href: 'https://www.google.com',
      size: 'm',
      target: '_blank',
    },
  ],
};

export const GroupOfColorsOf_BaseButtons = MultipleTemplate.bind({});
GroupOfColorsOf_BaseButtons.args = {
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
      ariaLabel: 'Purple primary icon only base button',
      color: buttonColors.purple,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black primary icon only base button',
      color: buttonColors.black,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White primary icon only base button',
      color: buttonColors.white,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive primary icon only base button',
      color: buttonColors.destructive,
      type: 'primary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black secondary icon only base button',
      color: buttonColors.black,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Gray secondary icon only base button',
      color: buttonColors.gray,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White secondary icon only base button',
      color: buttonColors.white,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive secondary icon only base button',
      color: buttonColors.destructive,
      type: 'secondary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Purple tertiary icon only base button',
      color: buttonColors.purple,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Black tertiary icon only base button',
      color: buttonColors.black,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'White tertiary icon only base button',
      color: buttonColors.white,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      ariaLabel: 'Destructive tertiary icon only base button',
      color: buttonColors.destructive,
      type: 'tertiary',
      isIconOnly: true,
      size: 'm',
      onClick: () => null,
    },
  ],
};

export const GroupOfSizesOf_BaseButtons = MultipleTemplate.bind({});
GroupOfSizesOf_BaseButtons.args = {
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
