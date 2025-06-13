import {Meta, StoryObj} from '@storybook/react';

import BasicButton, {ButtonProps} from '../Button';

export default {
  title: 'MUI/Button',
  component: BasicButton,
} as Meta;
type Story = StoryObj<typeof BasicButton>;

const defaultArgs: ButtonProps = {
  variant: 'contained',
  label: 'Button',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};
