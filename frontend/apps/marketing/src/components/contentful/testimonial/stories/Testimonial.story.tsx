import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

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

export const PatternDark: Story = {
  render: () => (
    <Testimonial
      quote="Testimonial for patternDark"
      source="Jane Doe"
      context="Student"
      background={TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_DARK}
    />
  ),
  play: async ({canvas}) => {
    const quoteElem = canvas.getByText('Testimonial for patternDark');
    expect(quoteElem).toBeInTheDocument();
    const sourceElem = canvas.getByText('Jane Doe');
    expect(sourceElem).toBeInTheDocument();
    const contextElem = canvas.getByText('Student');
    expect(contextElem).toBeInTheDocument();
  },
};

export const PatternPrimary: Story = {
  render: () => (
    <Testimonial
      quote="Testimonial for patternPrimary"
      source="Jane Doe"
      context="Student"
      background={TESTIMONIAL_CONTENTFUL_BACKGROUNDS.PATTERN_PRIMARY}
    />
  ),
  play: async ({canvas}) => {
    const quoteElem = canvas.getByText('Testimonial for patternPrimary');
    expect(quoteElem).toBeInTheDocument();
    const sourceElem = canvas.getByText('Jane Doe');
    expect(sourceElem).toBeInTheDocument();
    const contextElem = canvas.getByText('Student');
    expect(contextElem).toBeInTheDocument();
  },
};
