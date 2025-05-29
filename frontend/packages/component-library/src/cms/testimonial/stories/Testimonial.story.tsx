import bgPattern from '@public/images/bg-pattern.png';
import type {Meta, StoryObj} from '@storybook/react';

import Testimonial, {
  TESTIMONIAL_BACKGROUNDS,
  TestimonialProps,
} from './../Testimonial';

type Story = StoryObj<TestimonialProps>;

export default {
  title: 'CMS/Testimonial',
  component: Testimonial,
} as Meta<TestimonialProps>;

const defaultProps: TestimonialProps = {
  quote:
    'We’re not just teaching students — we are systemically, school by school, classroom by classroom, making this baked into education... This has really become a global movement. Powered by teachers.',
  source: 'Hadi Partovi',
  context: 'CEO of Code.org',
  style: {
    backgroundImage: `url(${bgPattern})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '18rem',
  },
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultProps,
  },
};

export const WithDarkBackground: Story = {
  args: {
    ...defaultProps,
    background: TESTIMONIAL_BACKGROUNDS.DARK,
  },
};

export const WithPrimaryBackground: Story = {
  args: {
    ...defaultProps,
    background: TESTIMONIAL_BACKGROUNDS.PRIMARY,
  },
};
