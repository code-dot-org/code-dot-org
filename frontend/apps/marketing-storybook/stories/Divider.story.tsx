import Divider from '@/components/contentful/divider';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof Divider> = {
  title: 'Marketing/Divider',
  component: Divider,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  args: {
    color: 'primary',
    margin: 'm',
    className: '',
  },
  argTypes: {
    color: {
      control: {type: 'select'},
      options: ['primary', 'strong', 'white'],
    },
    margin: {control: 'text'},
    className: {control: 'text'},
  },
};

export const Primary: Story = {
  args: {
    color: 'primary',
    margin: 'm',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    expect(separator).toBeInTheDocument();
  },
};

export const Strong: Story = {
  args: {
    color: 'strong',
    margin: 'l',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    expect(separator).toBeInTheDocument();
  },
};

export const White: Story = {
  globals: {
    backgrounds: {value: 'dark'},
  },
  args: {
    color: 'white',
    margin: 's',
  },
  play: async ({canvas}) => {
    const separator = canvas.getByRole('separator');
    expect(separator).toBeInTheDocument();
  },
};
