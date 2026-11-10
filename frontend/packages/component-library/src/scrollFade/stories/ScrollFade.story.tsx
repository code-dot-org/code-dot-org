import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, waitFor} from 'storybook/test';

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
    <ScrollFade {...args} style={frame} scrollerProps={{'aria-label': 'Rows'}}>
      {rows}
    </ScrollFade>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // content overflows, so only the bottom edge fades at first
    await waitFor(() =>
      expect(
        canvas.getByText('Row 1').closest('[data-fade-bottom]'),
      ).toBeTruthy(),
    );
    expect(canvas.getByText('Row 1').closest('[data-fade-top]')).toBeNull();
  },
};

export const Horizontal: Story = {
  args: {edges: ['left', 'right']},
  render: args => (
    <ScrollFade
      {...args}
      style={{width: 320}}
      scrollerProps={{'aria-label': 'Chips'}}
    >
      <div style={{display: 'flex', gap: 8, padding: '8px 0'}}>{chips}</div>
    </ScrollFade>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const scroller = await canvas.findByRole('region', {name: 'Chips'});
    const root = scroller.parentElement as HTMLElement;

    // the chips overflow to the right, so only the right edge fades
    await waitFor(() => expect(root).toHaveAttribute('data-fade-right'));
    expect(root).not.toHaveAttribute('data-fade-left');

    scroller.scrollLeft = scroller.scrollWidth;
    await waitFor(() => expect(root).not.toHaveAttribute('data-fade-right'));
    expect(root).toHaveAttribute('data-fade-left');

    // a chip added below the observed children must bring the right fade back
    scroller.firstElementChild?.appendChild(
      Object.assign(document.createElement('span'), {
        textContent: 'Chip 13',
        style: 'flex: none; padding: 0 3rem',
      }),
    );
    await waitFor(() => expect(root).toHaveAttribute('data-fade-right'));
  },
};

export const AllEdges: Story = {
  args: {edges: ['top', 'right', 'bottom', 'left']},
  render: args => (
    <ScrollFade
      {...args}
      style={{...frame, width: 320}}
      scrollerProps={{'aria-label': 'Grid'}}
    >
      {grid}
    </ScrollFade>
  ),
};

export const RightToLeft: Story = {
  args: {edges: ['left', 'right']},
  render: args => (
    <div dir="rtl">
      <ScrollFade
        {...args}
        style={{width: 320}}
        scrollerProps={{'aria-label': 'Chips'}}
      >
        <div style={{display: 'flex', gap: 8, padding: '8px 0'}}>{chips}</div>
      </ScrollFade>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const scroller = await canvas.findByRole('region', {name: 'Chips'});
    const root = scroller.parentElement as HTMLElement;

    // RTL starts at the right edge, so the hidden chips are to the left
    await waitFor(() => expect(root).toHaveAttribute('data-fade-left'));
    expect(root).not.toHaveAttribute('data-fade-right');
  },
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
      <ScrollFade
        {...args}
        style={{height: 200, width: 240}}
        scrollerProps={{'aria-label': 'Rows'}}
      >
        {rows}
      </ScrollFade>
    </div>
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
    const region = await canvas.findByRole('region', {name: 'Release notes'});
    expect(region).toHaveAttribute('tabindex', '0');
  },
};
