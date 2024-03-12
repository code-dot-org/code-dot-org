import React from 'react';
import Button, {ButtonProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Button', // eslint-disable-line storybook/no-title-property-in-meta
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
const SingleTemplate: Story<ButtonProps> = args => <Button {...args} />;

const MultipleTemplate: Story<{
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
  onClick: () => console.log('Button clicked'),
  size: 'm',
};

export const DisabledButton = SingleTemplate.bind({});
DisabledButton.args = {
  text: 'Button',
  onClick: () => console.log('Button clicked'),
  disabled: true,
  size: 'm',
};

export const IconButton = SingleTemplate.bind({});
IconButton.args = {
  // text: 'Button',
  icon: {iconName: 'smile', iconStyle: 'solid'},
  type: 'iconBorder',
  onClick: () => console.log('Button clicked'),
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
      onClick: () => console.log('Button clicked'),
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
      color: 'purple',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Primary Black',
      color: 'black',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Primary White',
      color: 'white',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary Purple',
      color: 'purple',
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary Black',
      color: 'black',
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Secondary White',
      color: 'white',
      type: 'secondary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary Purple',
      color: 'purple',
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary Black',
      color: 'black',
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      text: 'Button Tertiary White',
      color: 'white',
      type: 'tertiary',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'purple',
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'black',
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'white',
      type: 'iconBorder',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'purple',
      type: 'iconOnly',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'black',
      type: 'iconOnly',
      size: 'm',
      onClick: () => null,
    },
    {
      icon: {iconName: 'smile', iconStyle: 'solid'},
      color: 'white',
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
