import React from 'react';
import {Meta, StoryFn} from '@storybook/react';
import {buttonColors} from './../index';
import Button, {BaseButtonProps} from './_BaseButton';

export default {
  title: 'DesignSystem/Button/_BaseButton', // eslint-disable-line storybook/no-title-property-in-meta
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Button.type,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<BaseButtonProps> = args => <Button {...args} />;

const MultipleTemplate: StoryFn<{
  components: BaseButtonProps[];
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
  type: 'iconBorder',
  onClick: () => null,
  size: 'm',
};

export const LinkButton = SingleTemplate.bind({});
LinkButton.args = {
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
      text: 'Button Secondary Purple',
      color: buttonColors.purple,
      type: 'secondary',
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
      text: 'Button Secondary White',
      color: buttonColors.white,
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
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.purple,
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.black,
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.white,
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.purple,
      type: 'iconOnly',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.black,
      type: 'iconOnly',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: buttonColors.white,
      type: 'iconOnly',
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
