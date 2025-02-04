import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Section from '../index';

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
    children: 'This is a section!',
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
    children: 'This is a section!',
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
      'https://code.org/images/banners/banner-bg-horizontal-line-gaps.png',
    padding: 'l',
    alignment: 'left',
    children: 'This is a section!',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('section')).toBeInTheDocument();
  },
};
