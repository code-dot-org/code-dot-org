import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import Iframe from '../Iframe';

const meta: Meta<typeof Iframe> = {
  title: 'Marketing/Iframe',
  component: Iframe,
  tags: ['autodocs', 'marketing'],
  argTypes: {
    src: {control: 'text'},
    title: {control: 'text'},
    className: {control: 'text'},
    height: {control: 'text'},
    width: {control: 'text'},
  },
};
export default meta;
type Story = StoryObj<typeof Iframe>;

export const Playground: Story = {
  args: {
    src: 'data:text/html,<h1>hello world!</h1>',
    title: 'Playground Iframe',
    className: '',
    height: '100%',
    width: '100%',
  },
};

export const CustomSize: Story = {
  args: {
    src: 'data:text/html,<h2>custom size</h2>',
    title: 'Custom Size Iframe',
    className: '',
    height: '300px',
    width: '400px',
  },
  play: async ({canvas}) => {
    const iframe = canvas.getByTitle('Custom Size Iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('height', '300px');
    expect(iframe).toHaveAttribute('width', '400px');
    expect(iframe).toHaveAttribute(
      'src',
      'data:text/html,<h2>custom size</h2>',
    );
  },
};

export const CustomClassName: Story = {
  args: {
    src: 'data:text/html,<h3>class name</h3>',
    title: 'ClassName Iframe',
    className: 'iframe-test-class',
    height: '200px',
    width: '200px',
  },
  play: async ({canvas}) => {
    const iframe = canvas.getByTitle('ClassName Iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveClass('iframe-test-class');
    expect(iframe).toHaveAttribute('src', 'data:text/html,<h3>class name</h3>');
  },
};
