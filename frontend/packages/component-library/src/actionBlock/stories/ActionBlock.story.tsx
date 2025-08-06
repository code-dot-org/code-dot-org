import image1 from '@public/images/action-block-01.png';
import image2 from '@public/images/action-block-02.png';
import image3 from '@public/images/action-block-03.png';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect} from 'storybook/test';

import Video from '@/video';

import ActionBlock, {ActionBlockProps} from '../index';

export default {
  title: 'DesignSystem/Action Block',
  component: ActionBlock,
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
type Story = StoryObj<typeof ActionBlock>;

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';
const DESCRIPTION_MED =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const DESCRIPTION_LONG =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';

const defaultArgs: ActionBlockProps = {
  title: 'Action block title',
  description: DESCRIPTION,
  image: {src: image1},
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
export const DefaultActionBlocks: Story = {
  args: {
    ...defaultArgs,
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
        <ActionBlock {...args} image={{src: image2}} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const titles = await canvas.findAllByText('Action block title');
    const descriptions = await canvas.findAllByText(DESCRIPTION);
    const overlines = await canvas.findAllByText('Overline Text');
    const images = await canvas.findAllByAltText('');
    const primaryButtons = await canvas.findAllByLabelText(
      'Primary Button aria label',
    );
    const secondaryButtons = await canvas.findAllByLabelText(
      'Secondary Button aria label',
    );

    // check if images are visible
    await expect(images).toHaveLength(2);
    for (const image of images) {
      await expect(image).toBeVisible();
    }

    // check if text content is visible
    await expect(titles).toHaveLength(2);
    for (const title of titles) {
      await expect(title).toBeVisible();
    }

    await expect(descriptions).toHaveLength(2);
    for (const description of descriptions) {
      await expect(description).toBeVisible();
    }

    await expect(overlines).toHaveLength(2);
    for (const overline of overlines) {
      await expect(overline).toBeVisible();
    }

    // check if buttons are visible
    await expect(primaryButtons).toHaveLength(2);
    for (const primaryButton of primaryButtons) {
      await expect(primaryButton).toBeVisible();
    }

    await expect(secondaryButtons).toHaveLength(2);
    for (const secondaryButton of secondaryButtons) {
      await expect(secondaryButton).toBeVisible();
    }
  },
};

export const WithTag: Story = {
  args: {
    ...defaultArgs,
    tag: 'New',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a "New" tag.',
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
        <ActionBlock {...args} image={{src: image2}} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const newTags = await canvas.findAllByText('New');

    // check if New tag is visible
    await expect(newTags).toHaveLength(2);
    for (const tag of newTags) {
      await expect(tag).toBeVisible();
    }
  },
};

export const WithDetail: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sets a detail on the action block like duration, projects, or any other relevant information.',
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
        <ActionBlock
          {...args}
          details={{label: 'Duration', description: '1 hour'}}
        />
        <ActionBlock
          {...args}
          image={{src: image2}}
          details={{label: 'Duration', description: '2 weeks'}}
        />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const detailLabels = await canvas.findAllByText('Duration:');
    const detailDescription1hr = await canvas.findByText('1 hour');
    const detailDescription2wk = await canvas.findByText('2 weeks');

    // check if details are visible
    await expect(detailLabels).toHaveLength(2);
    for (const detailLabel of detailLabels) {
      await expect(detailLabel).toBeVisible();
    }

    await expect(detailDescription1hr).toBeVisible();
    await expect(detailDescription2wk).toBeVisible();
  },
};

export const WithoutSecondaryButton: Story = {
  args: {
    ...defaultArgs,
    secondaryButton: undefined,
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
        <ActionBlock {...args} image={{src: image2}} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const primaryButtons = await canvas.findAllByLabelText(
      'Primary Button aria label',
    );
    const secondaryButtons = await canvas.queryAllByLabelText(
      'Secondary Button aria label',
    );

    // check if primary buttons are visible
    await expect(primaryButtons).toHaveLength(2);
    for (const primaryButton of primaryButtons) {
      await expect(primaryButton).toBeVisible();
    }

    // check that secondary buttons are not visible
    await expect(secondaryButtons).toHaveLength(0);
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
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
        }}
      >
        <ActionBlock {...args} overline={'Overline One'} />
        <ActionBlock {...args} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const titles = await canvas.findAllByText('Action block title');
    const title = titles[0];
    const textWrapper = title.parentElement;
    const actionBlock = textWrapper?.parentElement;

    const expectedBackgroundColor = window
      .getComputedStyle(document.body)
      .getPropertyValue('--background-neutral-primary');

    // check if background color is white
    await expect(actionBlock).toHaveStyle(
      `background-color: ${expectedBackgroundColor};`,
    );
  },
};

export const WithVideo: Story = {
  args: {
    ...defaultArgs,
    title: 'Watch Our Mission',
    description: 'See how we’re making an impact.',
    video: {
      videoTitle: 'What Most Schools Don’t Teach',
      youTubeId: 'nKIu9yen5nc',
      isYouTubeCookieAllowed: true,
    },
    VideoComponent: Video,
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
      </div>
    );
  },
};

export const ThreeAcross: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Carousels are recommended for sections with 4+ action blocks, but up to six can be displayed simultaneously.',
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
        <ActionBlock
          {...args}
          image={{src: image2}}
          description={DESCRIPTION_LONG}
        />
        <ActionBlock
          {...args}
          image={{src: image3}}
          description={DESCRIPTION_MED}
        />
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
