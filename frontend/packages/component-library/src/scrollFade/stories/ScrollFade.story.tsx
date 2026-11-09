import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect} from 'storybook/test';

import ScrollFade from '../index';

export default {
  title: 'DesignSystem/ScrollFade',
  component: ScrollFade,
  parameters: {layout: 'centered'},
  argTypes: {
    edges: {
      control: 'inline-check',
      options: ['top', 'right', 'bottom', 'left'],
    },
    fadeSize: {control: 'text'},
    fadeColor: {control: 'text'},
  },
  args: {
    edges: ['top', 'bottom'],
    fadeSize: 24,
  },
} as Meta;
type Story = StoryObj<typeof ScrollFade>;

const frame = {
  height: 200,
  width: 240,
  border: '1px solid var(--borders-neutral-primary)',
  borderRadius: 'var(--shape-md)',
};

const rows = Array.from({length: 20}, (_, i) => (
  <p key={i} style={{margin: 0, padding: '0.5rem 0.75rem'}}>
    Row {i + 1}
  </p>
));

const chips = Array.from({length: 12}, (_, i) => (
  <span
    key={i}
    style={{
      flex: 'none',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(--shape-round)',
      background: 'var(--background-neutral-tertiary)',
    }}
  >
    Chip {i + 1}
  </span>
));

const grid = (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 80px)',
      gap: 8,
      padding: 8,
    }}
  >
    {Array.from({length: 96}, (_, i) => (
      <div
        key={i}
        style={{
          height: 48,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--background-neutral-secondary)',
        }}
      >
        {i + 1}
      </div>
    ))}
  </div>
);

//
// TEMPLATE
//
export const DefaultScrollFade: Story = {
  render: args => (
    <ScrollFade {...args} style={frame}>
      {rows}
    </ScrollFade>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // content overflows, so only the bottom edge fades at first
    expect(
      canvas.getByText('Row 1').closest('[data-fade-bottom]'),
    ).toBeTruthy();
    expect(canvas.getByText('Row 1').closest('[data-fade-top]')).toBeNull();
  },
};

export const Horizontal: Story = {
  args: {edges: ['left', 'right']},
  render: args => (
    <ScrollFade {...args} style={{width: 320}}>
      <div style={{display: 'flex', gap: 8, padding: '8px 0'}}>{chips}</div>
    </ScrollFade>
  ),
};

export const AllEdges: Story = {
  args: {edges: ['top', 'right', 'bottom', 'left']},
  render: args => (
    <ScrollFade {...args} style={{...frame, width: 320}}>
      {grid}
    </ScrollFade>
  ),
};

export const RightToLeft: Story = {
  args: {edges: ['left', 'right']},
  render: args => (
    <div dir="rtl">
      <ScrollFade {...args} style={{width: 320}}>
        <div style={{display: 'flex', gap: 8, padding: '8px 0'}}>{chips}</div>
      </ScrollFade>
    </div>
  ),
};

// The default mask fades the content itself, so it needs no color even over
// a gradient.
export const OverAnyBackground: Story = {
  render: args => (
    <div
      style={{
        padding: 24,
        background:
          'linear-gradient(135deg, var(--background-brand-aqua-light), var(--background-brand-purple-light))',
      }}
    >
      <ScrollFade {...args} style={{height: 200, width: 240}}>
        {rows}
      </ScrollFade>
    </div>
  ),
};

// An opaque overlay instead of the mask, for fading into a specific color.
export const WithFadeColor: Story = {
  args: {
    fadeColor: 'var(--background-neutral-secondary)',
    fadeSize: 40,
  },
  render: args => (
    <ScrollFade
      {...args}
      style={{...frame, background: 'var(--background-neutral-secondary)'}}
    >
      {rows}
    </ScrollFade>
  ),
};

// With no focusable content, the scroller becomes a named tab stop.
export const KeyboardScrollable: Story = {
  args: {scrollerProps: {'aria-label': 'Release notes'}},
  render: args => (
    <ScrollFade {...args} style={frame}>
      {rows}
    </ScrollFade>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', {name: 'Release notes'});
    expect(region).toHaveAttribute('tabindex', '0');
  },
};
