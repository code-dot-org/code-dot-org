import image from '@public/images/action-block-01.png';
import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import FullWidthActionBlock, {ActionBlockProps} from '../index';

export default {
  title: 'DesignSystem/Action Block/Full Width Action Block',
  component: FullWidthActionBlock,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for action blocks.
            // ActionBlock component has one a11y issue, and it's related to the overline color.
            // This is a known issue across our design system, and we are ok accepting this for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
} as Meta;
type Story = StoryObj<typeof FullWidthActionBlock>;

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';

const defaultArgs: ActionBlockProps = {
  image: image,
  title: 'Action block title',
  description: DESCRIPTION,
  overline: 'Overline Text',
  background: 'primary',
  primaryButton: {
    text: 'Primary Button',
    href: '#',
    ariaLabel: 'Primary Button aria label',
  },
  secondaryButton: {
    text: 'Secondary Button',
    href: '#',
    ariaLabel: 'Secondary Button aria label',
  },
};

//
// STORIES
//
export const DefaultFullWidthActionBlock: Story = {
  args: {
    ...defaultArgs,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByText('Action block title');
    const description = await canvas.findByText(DESCRIPTION);
    const overline = await canvas.findByText('Overline Text');
    const image = await canvas.findByAltText('');
    const primaryButton = await canvas.findByLabelText(
      'Primary Button aria label',
    );
    const secondaryButton = await canvas.findByLabelText(
      'Secondary Button aria label',
    );

    // check if image is visible
    await expect(image).toBeVisible();

    // check if text content is visible
    await expect(title).toBeVisible();
    await expect(description).toBeVisible();
    await expect(overline).toBeVisible();

    // check if buttons are visible
    await expect(primaryButton).toBeVisible();
    await expect(secondaryButton).toBeVisible();
  },
};

export const WithDetail: Story = {
  args: {
    ...defaultArgs,
    details: {label: 'Duration', description: '1 hour'},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sets a detail on the action block like duration, projects, or any other relevant information.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const detailLabel = await canvas.findByText('Duration:');
    const detailDescription = await canvas.findByText('1 hour');

    // check if details are visible
    await expect(detailLabel).toBeVisible();
    await expect(detailDescription).toBeVisible();
  },
};

export const WithoutSecondaryButton: Story = {
  args: {
    ...defaultArgs,
    secondaryButton: undefined,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const primaryButton = await canvas.findByLabelText(
      'Primary Button aria label',
    );
    const secondaryButton = canvas.queryByLabelText(
      'Secondary Button aria label',
    );

    // check if primary button is visible
    await expect(primaryButton).toBeVisible();

    // check that secondary button is not present
    await expect(secondaryButton).toBeNull();
  },
};

export const WithSecondaryBackground: Story = {
  args: {
    ...defaultArgs,
    background: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this when an Action Block is in a section with a `secondary` background color (light gray).',
      },
    },
  },
  render: args => {
    return (
      <div
        style={{
          backgroundColor: 'var(--background-neutral-secondary)',
          padding: '2rem',
        }}
      >
        <FullWidthActionBlock {...args} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole('figure');
    const actionBlock = image.closest('div');
    const expectedBackgroundColor = window
      .getComputedStyle(document.body)
      .getPropertyValue('--background-neutral-primary');

    // check if background color is white
    await expect(actionBlock).toHaveStyle(
      `background-color: ${expectedBackgroundColor};`,
    );
  },
};
