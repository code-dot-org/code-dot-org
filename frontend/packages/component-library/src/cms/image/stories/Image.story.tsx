import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import imageFile from '@public/images/image-component.png';

import Image from '../index';

export default {
  title: 'CMS/Image',
  component: Image,
} as Meta;
type Story = StoryObj<typeof Image>;

//
// STORIES
//
export const DefaultImage: Story = {
  args: {
    src: imageFile,
    altText: 'Teacher in front of classroom',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Teacher in front of classroom');

    // check if image is visible
    expect(image).toBeVisible();
  },
};

export const ImageWithBorder: Story = {
  args: {
    src: imageFile,
    altText: 'Teacher helping student at computer',
    hasBorder: true,
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
    const image = await canvas.findByAltText(
      'Teacher helping student at computer',
    );
    const getComputedStyleValue = (property: string) =>
      window.getComputedStyle(document.body).getPropertyValue(property);
    const expectedBorderColor = getComputedStyleValue(
      '--borders-neutral-primary',
    );
    const expectedBorderSize = '1px';
    const expectedBorderStyle = 'solid';

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image has border
    await expect(image).toHaveStyle(`border-width: ${expectedBorderSize};`);
    await expect(image).toHaveStyle(`border-style: ${expectedBorderStyle};`);
    await expect(image).toHaveStyle(`border-color: ${expectedBorderColor};`);
  },
};

export const ImageWithBoxShadow: Story = {
  args: {
    src: imageFile,
    altText: 'Teacher in front of classroom',
    hasBoxShadow: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Add a box shadow to an image if it's used at the top of the page.",
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Teacher in front of classroom');
    const expectedBoxShadow = 'rgb(191, 228, 232) 8px 8px 0px 0px';

    // check if image is visible
    await expect(image).toBeVisible();

    // check if image has box shadow
    await expect(image).toHaveStyle(`box-shadow: ${expectedBoxShadow};`);
  },
};
