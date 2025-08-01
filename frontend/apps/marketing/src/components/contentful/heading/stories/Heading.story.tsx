import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Heading from '../Heading';

const meta: Meta<typeof Heading> = {
  title: 'Marketing/Heading',
  component: Heading,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Heading>;

const visualAppearances = [
  'heading-xxl',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
] as const;
const colors = ['primary', 'white'] as const;
const removeMarginBottoms = [false, true] as const;

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {visualAppearances
        .map(visualAppearance =>
          colors.map(color =>
            removeMarginBottoms.map(removeMarginBottom => (
              <div
                key={`${visualAppearance}-${color}-${removeMarginBottom}`}
                style={
                  color === 'white' ? {background: '#333', padding: 8} : {}
                }
              >
                <Heading
                  visualAppearance={visualAppearance}
                  color={color}
                  removeMarginBottom={removeMarginBottom}
                >
                  {`${visualAppearance} | ${color} | removeMarginBottom: ${removeMarginBottom}`}
                </Heading>
              </div>
            )),
          ),
        )
        .flat()
        .flat()}
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: 'Playground Heading',
    visualAppearance: 'heading-xl',
    color: 'primary',
    className: '',
    removeMarginBottom: false,
  },
  argTypes: {
    children: {control: 'text'},
    visualAppearance: {
      control: {type: 'select'},
      options: [
        'heading-xxl',
        'heading-xl',
        'heading-lg',
        'heading-md',
        'heading-sm',
        'heading-xs',
      ],
    },
    color: {
      control: {type: 'select'},
      options: ['primary', 'white'],
    },
    className: {control: 'text'},
    removeMarginBottom: {control: 'boolean'},
  },
};
