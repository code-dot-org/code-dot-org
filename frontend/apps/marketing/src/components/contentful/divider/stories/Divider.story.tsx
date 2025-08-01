import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Divider from '../Divider';

const meta: Meta<typeof Divider> = {
  title: 'Marketing/Divider',
  component: Divider,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Variants = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Divider color="primary" margin="m" />
      <Divider color="strong" margin="l" />
      <Divider color="white" margin="s" />
    </div>
  ),
};

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
