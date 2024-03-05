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
  <>
    {args.components?.map(componentArg => (
      // TODO: fix key
      <Button key={componentArg.size} {...componentArg} />
    ))}
  </>
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
  disabled: true,
  size: 'm',
};

export const GroupOfSizesOfButtons = MultipleTemplate.bind({});
GroupOfSizesOfButtons.args = {
  components: [
    {
      text: 'Button xs',
      size: 'xs',
    },
    {
      text: 'Button s',
      size: 's',
    },
    {
      text: 'Button m',
      size: 'm',
    },
    {
      text: 'Button l',
      size: 'l',
    },
  ],
};
