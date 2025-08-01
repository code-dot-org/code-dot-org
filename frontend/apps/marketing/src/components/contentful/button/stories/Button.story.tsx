import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import Button from '../Button';

const meta: Meta<typeof Button> = {
  title: 'Marketing/MuiButton',
  component: Button,
  tags: ['autodocs', 'marketing'],
  argTypes: {
    type: {
      control: {type: 'select'},
      options: ['emphasized', 'primary', 'secondary', 'white'],
    },
    size: {
      control: {type: 'select'},
      options: ['small', 'medium', 'large'],
    },
    isLinkExternal: {control: 'boolean'},
    text: {control: 'text'},
    href: {control: 'text'},
    ariaLabel: {control: 'text'},
    className: {control: 'text'},
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    text: 'Playground Button',
    type: 'primary',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
    ariaLabel: '',
    className: '',
  },
};

export const Emphasized: Story = {
  args: {
    text: 'Emphasized',
    type: 'emphasized',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
  },
  play: async ({canvas}) => {
    const btn = canvas.getByRole('link', {name: 'Emphasized'});
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveAttribute('target');
    expect(btn.querySelector('svg')).not.toBeInTheDocument();
  },
};

export const Primary: Story = {
  args: {
    text: 'Primary',
    type: 'primary',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
  },
  play: async ({canvas}) => {
    const btn = canvas.getByRole('link', {name: 'Primary'});
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveAttribute('target');
    expect(btn.querySelector('svg')).not.toBeInTheDocument();
  },
};

export const Secondary: Story = {
  args: {
    text: 'Secondary',
    type: 'secondary',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
  },
  play: async ({canvas}) => {
    const btn = canvas.getByRole('link', {name: 'Secondary'});
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveAttribute('target');
    expect(btn.querySelector('svg')).not.toBeInTheDocument();
  },
};

export const White: Story = {
  args: {
    text: 'White',
    type: 'white',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: false,
  },
  play: async ({canvas}) => {
    const btn = canvas.getByRole('link', {name: 'White'});
    expect(btn).toBeInTheDocument();
    expect(btn).not.toHaveAttribute('target');
    expect(btn.querySelector('svg')).not.toBeInTheDocument();
  },
};

export const ExternalLink: Story = {
  args: {
    text: 'External Link',
    type: 'primary',
    size: 'medium',
    href: 'about:blank',
    isLinkExternal: true,
  },
  play: async ({canvas}) => {
    const btn = canvas.getByRole('link', {name: 'External Link'});
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('target', '_blank');
    expect(btn).toHaveAttribute('rel', 'noopener noreferrer');
    expect(btn.querySelector('svg')).toBeInTheDocument();
    btn.click();
  },
};
