import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Section from '../index';
import {BodyOneText, Heading1} from '@/typography';

export default {
  title: 'CMS/Section',
  component: Section,
} as Meta;
type Story = StoryObj<typeof Section>;

//
// TEMPLATE
//
export const DefaultSection: Story = {
  args: {
    padding: 'l',
    alignment: 'left',
    children: (
      <div>
        <Heading1 visualAppearance="heading-xl">
          This is a default section.
        </Heading1>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </div>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByTestId('section');
    const container = await canvas.findByTestId('container');
    await expect(section).toBeInTheDocument();
    await expect(container).toBeInTheDocument();
  },
};

export const SectionWithBackgroundColor: Story = {
  args: {
    backgroundColor: 'secondary',
    padding: 'l',
    alignment: 'left',
    children: (
      <div>
        <Heading1 visualAppearance="heading-xl">
          This is a section with a background color.
        </Heading1>
        <BodyOneText>I'm just a sentence.</BodyOneText>
      </div>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByTestId('section');
    const container = await canvas.findByTestId('container');
    await expect(section).toBeInTheDocument();
    await expect(container).toBeInTheDocument();
  },
};

export const SectionWithBackgroundImage: Story = {
  args: {
    backgroundColor: 'dark',
    backgroundImage:
      'https://code.org/images/banners/banner-bg-lines-neutral-dark.png',
    backgroundImageRepeat: true,
    backgroundSize: 'contain',
    padding: 'l',
    alignment: 'left',
    children: (
      <div>
        <Heading1 style={{color: 'white'}} visualAppearance="heading-xl">
          This is a section with a patterned background image.
        </Heading1>
        <BodyOneText style={{color: 'white'}}>I'm just a sentence.</BodyOneText>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Show a patterned `backgroundImage` over `backgroundColor`. Use a transparent png and set `backgroundImageRepeat` to `true` and `backgroundSize` to `contain` for best results.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByTestId('section');
    const container = await canvas.findByTestId('container');
    await expect(section).toBeInTheDocument();
    await expect(container).toBeInTheDocument();
  },
};
