import image from '@public/images/image-component.png';
import type {Meta, StoryObj} from '@storybook/react';

import ActionBlock, {ActionBlockProps} from '../index';

export default {
  title: 'DesignSystem/ActionBlock',
  component: ActionBlock,
} as Meta;
type Story = StoryObj<typeof ActionBlock>;

const defaultArgs: ActionBlockProps = {
  title: 'Action block title',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.',
  imageSrc: image,
  overline: 'Overline Text',
  primaryButtonLabel: 'Primary action button',
  primaryButtonUrl: '#',
  primaryButtonAriaLabel: '',
  secondaryButtonLabel: 'Secondary action button',
  secondaryButtonUrl: '#',
  secondaryButtonAriaLabel: '',
  background: 'primary',
  isFullWidth: true,
};

//
// STORIES
//
export const DefaultActionBlock: Story = {
  args: {
    ...defaultArgs,
  },
};

export const WithoutSecondaryButton: Story = {
  args: {
    ...defaultArgs,
    secondaryButtonLabel: undefined,
  },
};

export const WithSecondaryBackground: Story = {
  args: {
    ...defaultArgs,
    background: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this when an Action Block is in a section with a `secondary` background color (light gray).',
      },
    },
  },
};

export const TwoAcross: Story = {
  args: {
    ...defaultArgs,
    isFullWidth: false,
  },
  render: args => {
    return (
      <div style={{display: 'flex', gap: '1.5rem'}}>
        <ActionBlock {...args} />
        <ActionBlock {...args} />
      </div>
    );
  },
};

export const ThreeAcross: Story = {
  args: {
    ...defaultArgs,
    isFullWidth: false,
  },
  render: args => {
    return (
      <div style={{display: 'flex', gap: '1.5rem'}}>
        <ActionBlock {...args} />
        <ActionBlock {...args} />
        <ActionBlock {...args} />
      </div>
    );
  },
};
