import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import Testimonial, {TESTIMONIAL_CONTENTFUL_BACKGROUNDS} from '../Testimonial';

const meta: Meta<typeof Testimonial> = {
  title: 'Marketing/Testimonial',
  component: Testimonial,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof Testimonial>;

const backgrounds = [
  TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_DARK,
  TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_PRIMARY,
];

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {backgrounds.map(background => (
        <Testimonial
          key={background}
          quote={`Testimonial for ${background}`}
          source="Jane Doe"
          context="Student"
          background={background}
        />
      ))}
    </div>
  ),
};

export const Playground: Story = {
  args: {
    quote: 'Playground testimonial text.',
    source: 'Playground Author',
    context: 'Playground Context',
    background: TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_DARK,
  },
  argTypes: {
    quote: {control: 'text'},
    source: {control: 'text'},
    context: {control: 'text'},
    background: {control: 'select', options: backgrounds},
  },
};
