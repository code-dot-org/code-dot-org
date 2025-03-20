import image1 from '@public/images/action-block-01.png';
import image2 from '@public/images/action-block-02.png';
import image3 from '@public/images/action-block-03.png';
import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import ActionBlock, {ActionBlockProps} from '../index';

export default {
  title: 'DesignSystem/ActionBlock',
  component: ActionBlock,
} as Meta;
type Story = StoryObj<typeof ActionBlock>;

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';

const defaultArgs: ActionBlockProps = {
  title: 'Action block title',
  description: DESCRIPTION,
  image: image1,
  overline: 'Overline Text',
  detailLabel: '',
  detailDescription: '',
  primaryButtonLabel: 'Primary action button',
  primaryButtonUrl: '#',
  primaryButtonAriaLabel: '',
  secondaryButtonLabel: 'Secondary action button',
  secondaryButtonUrl: '#',
  secondaryButtonAriaLabel: '',
  background: 'primary',
  isFullWidth: true,
};

//
// STORIES
//
export const DefaultActionBlock: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `isFullWidth` prop is set to `true` by default, which means the Action Block will take up the full width of the page. If you want it to fit within two or three columns, set `isFullWidth` to `false`. (See additional stories below)',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByText('Action block title');
    const description = await canvas.findByText(DESCRIPTION);
    const overline = await canvas.findByText('Overline Text');
    const image = await canvas.findByRole('figure');
    const primaryButton = await canvas.findByRole('button', {
      name: 'Primary action button',
    });
    const secondaryButton = await canvas.findByRole('button', {
      name: 'Secondary action button',
    });

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
    detailLabel: 'Duration',
    detailDescription: '1 hour',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sets a detail on the action block like duration, projects, or any other relevant information..',
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
    secondaryButtonLabel: undefined,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const primaryButton = await canvas.findByRole('button', {
      name: 'Primary action button',
    });
    const secondaryButton = canvas.queryByRole('button', {
      name: 'Secondary action button',
    });

    // check if primary button is visible
    await expect(primaryButton).toBeVisible();

    // check that secondary button is not visible
    if (secondaryButton) {
      await expect(secondaryButton).not.toBeVisible();
    }
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
        <ActionBlock {...args} />
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

export const MultipleActionBlocksTwoAcross: Story = {
  args: {
    ...defaultArgs,
    isFullWidth: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `isFullWidth` is set to `false`, the Action Block will fit within multiple columns. You will need to create a wrapper to control the layout.',
      },
    },
  },
  render: args => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
        }}
      >
        <ActionBlock {...args} />
        <ActionBlock {...args} image={image2} />
      </div>
    );
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const actionBlocks = await canvas.findAllByText('Action block title');

    // check if two Action Blocks are rendered
    await expect(actionBlocks).toHaveLength(2);
  },
};

export const MultipleActionBlocksThreeAcross: Story = {
  args: {
    ...defaultArgs,
    isFullWidth: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'If there are more than six action blocks in a section use a carousel.',
      },
    },
  },
  render: args => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}
      >
        <ActionBlock {...args} />
        <ActionBlock {...args} image={image2} />
        <ActionBlock {...args} image={image3} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const actionBlocks = await canvas.findAllByText('Action block title');

    // check if three Action Blocks are rendered
    await expect(actionBlocks).toHaveLength(3);
  },
};
