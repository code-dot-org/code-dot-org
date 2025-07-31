import type {Meta, StoryObj} from '@storybook/nextjs-vite';

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
