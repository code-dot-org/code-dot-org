import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect} from 'storybook/test';

import ScrollFade from '../index';

export default {
  title: 'DesignSystem/ScrollFade',
  component: ScrollFade,
  parameters: {layout: 'centered'},
} as Meta;
type Story = StoryObj<typeof ScrollFade>;

const rows = Array.from({length: 20}, (_, i) => (
  <p key={i} style={{margin: 0, padding: '0.5rem'}}>
    Row {i + 1}
  </p>
));

//
// TEMPLATE
//
export const DefaultScrollFade: Story = {
  render: args => (
    <ScrollFade
      {...args}
      style={{
        height: 200,
        width: 240,
        border: '1px solid var(--border-neutral-primary)',
      }}
    >
      {rows}
    </ScrollFade>
  ),
  args: {
    fadeHeight: 24,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // content overflows, so only the bottom edge fades at first
    expect(
      canvas.getByText('Row 1').closest('[data-fade-bottom]'),
    ).toBeTruthy();
    expect(canvas.getByText('Row 1').closest('[data-fade-top]')).toBeNull();
  },
};

export const OnACustomBackground: Story = {
  render: args => (
    <ScrollFade
      {...args}
      style={{
        height: 200,
        width: 240,
        background: 'var(--background-neutral-secondary)',
      }}
    >
      {rows}
    </ScrollFade>
  ),
  args: {
    fadeColor: 'var(--background-neutral-secondary)',
    fadeHeight: 40,
  },
};
