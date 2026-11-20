import {Divider} from '@mui/material';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

/**
 * Bare `Divider` from `@mui/material`; the color comes from the `MuiDivider`
 * theme entry.
 */
export default {
  title: 'DesignSystem/Divider/MuiDivider',
  component: Divider,
  parameters: {
    componentSubtitle: 'Bare MUI Divider, colored by CdoTheme.',
  },
} as Meta;
type Story = StoryObj<typeof Divider>;

// The token resolved to rgb(), as getComputedStyle reports border colors.
const tokenColor = (element: Element) => {
  const probe = document.createElement('span');
  probe.style.color = 'var(--background-neutral-quaternary)';
  element.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

export const DefaultDivider: Story = {
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    const color = tokenColor(canvasElement);
    await expect(color).toMatch(/^rgb/);
    await expect(getComputedStyle(divider).borderBottomColor).toBe(color);
    await expect(getComputedStyle(divider).borderBottomWidth).toBe('1px');
    await expect(divider).toHaveStyle('margin: 0');
  },
};

export const BetweenLabels: Story = {
  render: () => (
    <div
      data-testid="row"
      style={{display: 'flex', alignItems: 'center', gap: '12px'}}
    >
      <span>Page 1 of 2</span>
      <Divider sx={{flex: '1 0 0'}} />
      <span>Questions 1–3</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A horizontal rule that fills the space between two labels.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const row = canvas.getByTestId('row');
    const divider = canvas.getByRole('separator');
    const labels = row.querySelectorAll('span');
    const filled =
      row.getBoundingClientRect().width -
      labels[0].getBoundingClientRect().width -
      labels[1].getBoundingClientRect().width -
      2 * 12;
    await expect(divider.getBoundingClientRect().width).toBeCloseTo(filled, 0);
    await expect(getComputedStyle(divider).borderBottomColor).toBe(
      tokenColor(canvasElement),
    );
  },
};

export const WithLabel: Story = {
  render: () => <Divider>Or</Divider>,
  parameters: {
    docs: {
      description: {
        story:
          'A labelled divider draws its two lines with ::before and ::after.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    const color = tokenColor(canvasElement);
    await expect(getComputedStyle(divider, '::before').borderTopColor).toBe(
      color,
    );
    await expect(getComputedStyle(divider, '::after').borderTopColor).toBe(
      color,
    );
  },
};

export const NarrowedByStyle: Story = {
  render: () => (
    <div style={{width: '400px'}}>
      <Divider style={{width: '50%'}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'An inline `width` narrows the rule; it sits at the inline-start edge.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    const box = divider.getBoundingClientRect();
    const parent = divider.parentElement!.getBoundingClientRect();
    await expect(box.width).toBe(200);
    await expect(box.left).toBe(parent.left);
  },
};

export const Vertical: Story = {
  render: () => (
    <div
      data-testid="row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '40px',
      }}
    >
      <span>Left</span>
      <Divider orientation="vertical" flexItem />
      <span>Right</span>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const divider = canvas.getByRole('separator');
    await expect(getComputedStyle(divider).borderRightColor).toBe(
      tokenColor(canvasElement),
    );
    await expect(divider.getBoundingClientRect().height).toBe(
      canvas.getByTestId('row').getBoundingClientRect().height,
    );
  },
};
