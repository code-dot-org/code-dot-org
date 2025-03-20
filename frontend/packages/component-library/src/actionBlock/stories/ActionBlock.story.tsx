import image from '@public/images/image-component.png';
import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import ActionBlock, {ActionBlockProps} from '../index';

export default {
  title: 'DesignSystem/ActionBlock',
  component: ActionBlock,
} as Meta;
type Story = StoryObj<typeof ActionBlock>;

const SHORT_DESC =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';
const LONG_DESC =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.';

const defaultArgs: ActionBlockProps = {
  title: 'Action block title',
  description: SHORT_DESC,
  image: image,
  overline: 'Overline Text',
  detail: 'none',
  detailString: undefined,
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
    const description = await canvas.findByText(SHORT_DESC);
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

    // check if secondary button is not visible
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

export const WithLongDescription: Story = {
  args: {
    ...defaultArgs,
    description: LONG_DESC,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const description = await canvas.findByText(LONG_DESC);
    await expect(description).toBeVisible();
  },
};

export const WithDetails: Story = {
  args: {
    ...defaultArgs,
    isFullWidth: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sets a detail on the action block. These can be used with Curriculum, Self-paced PL, and Lab content types.',
      },
    },
  },
  render: args => {
    return (
      <div style={{display: 'flex', gap: '1.5rem'}}>
        <ActionBlock {...args} detail={'duration'} detailString={'1 hour'} />
        <ActionBlock
          {...args}
          detail={'labProject'}
          detailString={'A lab project'}
        />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const duration = await canvas.findByText('1 hour');
    const labProject = await canvas.findByText('A lab project');
    await expect(duration).toBeVisible();
    await expect(labProject).toBeVisible();
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
          'When `isFullWidth` is set to `false`, the Action Block will fit within multiple columns. You will need to create a wrapper to control the layout. In this case, we are using a flexbox with a gap of `1.5rem` to create space between the Action Blocks.',
      },
    },
  },
  render: args => {
    return (
      <div style={{display: 'flex', gap: '1.5rem'}}>
        <ActionBlock {...args} />
        <ActionBlock {...args} />
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
      <div style={{display: 'flex', gap: '1.5rem'}}>
        <ActionBlock {...args} />
        <ActionBlock {...args} />
        <ActionBlock {...args} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const actionBlocks = await canvas.findAllByText('Action block title');

    // check if two Action Blocks are rendered
    await expect(actionBlocks).toHaveLength(3);
  },
};
