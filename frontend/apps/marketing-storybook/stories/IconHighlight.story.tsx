import IconHighlightContentful from '@/components/contentful/iconHighlight';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import IconHighlightMock from './__mocks__/IconHighlight.json';

const meta: Meta<typeof IconHighlightContentful> = {
  title: 'Marketing/IconHighlight',
  component: IconHighlightContentful,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof IconHighlightContentful>;

export const Playground: Story = {
  args: {
    heading: 'Playground Heading',
    text: 'Playground text for IconHighlight.',
    iconName: 'smile',
    linkEntries: [],
  },
  argTypes: {
    heading: {control: 'text'},
    text: {control: 'text'},
    iconName: {control: 'text'},
    linkEntries: {control: 'object'},
  },
};

export const FilledOut: Story = {
  args: IconHighlightMock,
  play: async ({canvas}) => {
    // Check heading
    const heading = canvas.getByRole('heading', {
      name: /Icon Highlight Heading/i,
    });
    await expect(heading).toBeInTheDocument();

    // Check text
    const text = canvas.getByText(/Icon Highlight\s*Multiline Text/i);
    await expect(text).toBeInTheDocument();

    // Check link
    const link = canvas.getByRole('link', {name: /Editorial Card Link/i});
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', '/editorial-card-test');
    await expect(link).toHaveAttribute('target', '_blank');
  },
};
