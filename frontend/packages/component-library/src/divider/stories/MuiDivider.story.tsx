import {Divider} from '@mui/material';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

/**
 * Every story renders `Divider` straight from `@mui/material`; the color
 * comes from the `MuiDivider` theme entry.
 */
export default {
  title: 'DesignSystem/Divider/MuiDivider',
  component: Divider,
  parameters: {
    componentSubtitle: 'Bare MUI Divider, colored by CdoTheme.',
  },
} as Meta;
type Story = StoryObj<typeof Divider>;

const tokenColor = () =>
  window
    .getComputedStyle(document.body)
    .getPropertyValue('--background-neutral-quaternary');

export const DefaultDivider: Story = {
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    await expect(divider).toHaveStyle(`border-bottom-color: ${tokenColor()};`);
    await expect(divider).toHaveStyle('margin: 0');
  },
};

export const BetweenLabels: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
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
    const divider = within(canvasElement).getByRole('separator');
    await expect(divider).toHaveStyle(`border-bottom-color: ${tokenColor()};`);
    await expect(divider.getBoundingClientRect().width).toBeGreaterThan(0);
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
          'Curriculum `<hr style="width: 50%">` reaches Divider through Markdown as an inline style.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    await expect(divider.getBoundingClientRect().width).toBe(200);
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
      <span>Left</span>
      <Divider orientation="vertical" flexItem />
      <span>Right</span>
    </div>
  ),
  play: async ({canvasElement}) => {
    const divider = within(canvasElement).getByRole('separator');
    await expect(divider).toHaveStyle(`border-right-color: ${tokenColor()};`);
  },
};
