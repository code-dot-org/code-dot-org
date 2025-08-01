import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Spacer, {SpacerProps} from '../Spacer';

const meta: Meta<typeof Spacer> = {
  title: 'Marketing/Spacer',
  component: Spacer,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Spacer>;

const sizes = ['xs', 's', 'm', 'l'] as const;

export const Playground: Story = {
  render: (args: SpacerProps) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: '#f0f0f0',
          padding: 16,
        }}
      >
        <div style={{border: '1px dashed #aaa', marginBottom: 8}}>
          <div>Spacer size: {args.size}</div>
          <Spacer size={args.size} className={args.className} />
        </div>
      </div>
    );
  },
  args: {
    size: 'm',
    className: '',
  },
  argTypes: {
    size: {control: 'select', options: sizes},
    className: {control: 'text'},
  },
};

export const SpacerXS: Story = {
  render: () => (
    <div style={{border: '1px dashed #aaa', marginBottom: 8}}>
      <div>Spacer size: xs</div>
      <Spacer size="xs" />
    </div>
  ),
};

export const SpacerS: Story = {
  render: () => (
    <div style={{border: '1px dashed #aaa', marginBottom: 8}}>
      <div>Spacer size: s</div>
      <Spacer size="s" />
    </div>
  ),
};

export const SpacerM: Story = {
  render: () => (
    <div style={{border: '1px dashed #aaa', marginBottom: 8}}>
      <div>Spacer size: m</div>
      <Spacer size="m" />
    </div>
  ),
};

export const SpacerL: Story = {
  render: () => (
    <div style={{border: '1px dashed #aaa', marginBottom: 8}}>
      <div>Spacer size: l</div>
      <Spacer size="l" />
    </div>
  ),
};
