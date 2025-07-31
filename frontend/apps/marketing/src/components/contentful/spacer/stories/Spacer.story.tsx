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

const createStory = (theme: string) => ({
  globals: {theme},
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#f0f0f0',
        padding: 16,
      }}
    >
      {sizes.map(size => (
        <div key={size} style={{border: '1px dashed #aaa', marginBottom: 8}}>
          <div>Spacer size: {size}</div>
          <Spacer size={size} />
        </div>
      ))}
    </div>
  ),
});

export const CDOVariants = createStory('code.org');
export const CSForAllVariants = createStory('csforall');

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
