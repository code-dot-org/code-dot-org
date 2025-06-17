import imageFile from '@public/images/image-component.png';
import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import {ActionBlock} from '@/actionBlock';

import Collection, {CollectionProps} from './../index';

type Story = StoryObj<CollectionProps>;
export default {
  title: 'CMS/Collection',
  component: Collection,
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
  render: args => {
    return (
      <section>
        <Collection {...args} />
      </section>
    );
  },
} as Meta;

const defaultArgs: CollectionProps = {
  items: [
    ...Array.from({length: 14}, (_, i) => (
      <div key={i + 1} style={{backgroundColor: '#eeeeee', padding: '1rem'}}>
        {`Item ${i + 1}`}
      </div>
    )),
  ],
};

const imageArgs: CollectionProps = {
  items: [
    ...Array.from({length: 6}, (_, i) => (
      <img key={i + 1} style={{width: '100%'}} src={imageFile} alt="" />
    )),
  ],
};

const actionBlockItems = Array.from({length: 6}, (_, i) => (
  <ActionBlock
    key={i + 1}
    title="Action block title"
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam."
    image={{src: imageFile}}
    overline="Overline Text"
    background="primary"
    primaryButton={{
      text: 'Primary Button',
      href: '#',
      ariaLabel: 'Primary Button aria label',
    }}
    secondaryButton={{
      text: 'Secondary Button',
      href: '#',
      ariaLabel: 'Secondary Button aria label',
    }}
  />
));

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays a collection of items in a grid layout. Item styles are custom to this story.',
      },
    },
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const collectionItems = canvas.getAllByText(/Item \d+/);

    // check if the collection has the correct number of items
    expect(collectionItems.length).toBe(defaultArgs?.items?.length);
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'A collection with no items to display.',
      },
    },
  },
};

export const Images: Story = {
  args: {
    ...imageArgs,
  },
  parameters: {
    docs: {
      description: {
        story: 'A collection displaying images in a grid layout.',
      },
    },
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const collectionItems = canvas.getAllByAltText('');

    // check if the collection has the correct number of items
    expect(collectionItems.length).toBe(imageArgs?.items?.length);
  },
};

export const ActionBlocks: Story = {
  args: {
    items: actionBlockItems,
    columns: 3,
    gap: '1.5rem',
  },
  parameters: {
    docs: {
      description: {
        story: 'A collection displaying images in a grid layout.',
      },
    },
  },
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const collectionItems = canvas.getAllByText('Action block title');

    // check if the collection has the correct number of items
    expect(collectionItems.length).toBe(actionBlockItems.length);
  },
};

export const Tablet: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'tablet',
    },
    eyes: {
      browser: {width: 834, height: 1112, name: 'chrome'},
    },
  },
};

export const Mobile: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
      defaultViewport: 'mobile2',
    },
    eyes: {
      browser: {width: 414, height: 896, name: 'chrome'},
    },
  },
};
