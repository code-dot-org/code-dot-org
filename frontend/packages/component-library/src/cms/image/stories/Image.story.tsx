import imageFile from '@public/images/image-component.png';
import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';
import {useState} from 'react';

import Image, {ImageProps} from '../index';

export default {
  title: 'CMS/Image',
  component: Image,
} as Meta;
type Story = StoryObj<typeof Image>;

//
// TEMPLATE
//
const SingleTemplate: StoryObj<ImageProps> = {
  render: args => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [hasImageError, setHasImageError] = useState(false);
    return (
      <>
        <Image
          {...args}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setHasImageError(true)}
        />
        {isImageLoaded && <p>Image loaded</p>}
        {hasImageError && <p>Image has error</p>}
      </>
    );
  },
};

//
// STORIES
//
export const DefaultImage: Story = {
  ...SingleTemplate,
  args: {
    src: imageFile,
    altText: 'Teacher helping student',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = (await canvas.findByAltText(
      'Teacher helping student',
    )) as HTMLImageElement;

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image is loaded
    await canvas.findByText('Image loaded');
    await expect(canvas.queryByText('Image has error')).not.toBeInTheDocument();
  },
};

export const ImageWithBorder: Story = {
  ...SingleTemplate,
  args: {
    src: imageFile,
    altText: 'Teacher helping student',
    decoration: 'border',
  },
  parameters: {
    docs: {
      description: {
        story: 'Add a border to an image if it blends into the background.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Teacher helping student');
    const getComputedStyleValue = (property: string) =>
      window.getComputedStyle(document.body).getPropertyValue(property);
    const expectedBorderColor = getComputedStyleValue(
      '--borders-neutral-primary',
    );
    const expectedBorderSize = '1px';
    const expectedBorderStyle = 'solid';

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image is loaded
    await canvas.findByText('Image loaded');
    await expect(canvas.queryByText('Image has error')).not.toBeInTheDocument();

    // check if image has border
    await expect(image).toHaveStyle(`border-width: ${expectedBorderSize};`);
    await expect(image).toHaveStyle(`border-style: ${expectedBorderStyle};`);
    await expect(image).toHaveStyle(`border-color: ${expectedBorderColor};`);
  },
};

export const ImageWithShadow: Story = {
  ...SingleTemplate,
  args: {
    src: imageFile,
    altText: 'Teacher helping student',
    decoration: 'shadow',
  },
  parameters: {
    docs: {
      description: {
        story: "Add a shadow to an image if it's used at the top of the page.",
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Teacher helping student');
    const expectedBoxShadow = 'rgb(191, 228, 232) 8px 8px 0px 0px';

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image is loaded
    await canvas.findByText('Image loaded');
    await expect(canvas.queryByText('Image has error')).not.toBeInTheDocument();

    // check if image has box shadow
    await expect(image).toHaveStyle(`box-shadow: ${expectedBoxShadow};`);
  },
};

export const ImageWithError: Story = {
  ...SingleTemplate,
  args: {
    src: 'bad-image.png',
    altText: 'Bad image',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests the error state of the image component when the image can't be loaded.",
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Bad image');

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image is loaded
    await expect(canvas.queryByText('Image loaded')).not.toBeInTheDocument();
    await canvas.findByText('Image has error');
  },
};
