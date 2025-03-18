import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Video from '../index';

export default {
  title: 'DesignSystem/Video',
  component: Video,
} as Meta;
type Story = StoryObj<typeof Video>;

const COMMON_PARAMETERS = {
  eyes: {
    ignoreRegions: [
      {
        left: 0,
        top: 625,
        width: 230,
        height: 50,
      },
      {
        left: 975,
        top: 625,
        width: 230,
        height: 50,
      },
    ],
  },
};

//
// TEMPLATE
//
export const DefaultVideoT: Story = {
  ...COMMON_PARAMETERS,
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const video = await canvas.findByTitle("What Most Schools Don't Teach");

    // check if video is visible
    await expect(video).toBeVisible();
  },
};

export const VideoWithCaptionT: Story = {
  ...COMMON_PARAMETERS,
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
  },
  parameters: {
    eyes: {
      ignoreRegions: [{selector: '.ytp-impression-link'}],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const video = await canvas.findByTitle("What Most Schools Don't Teach");
    const caption = canvas.getByText("What Most Schools Don't Teach");

    // check if video is visible
    await expect(video).toBeVisible();

    // check if caption is visible
    await expect(caption).toBeVisible();
  },
};

export const VideoWithFallbackT: Story = {
  ...COMMON_PARAMETERS,
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This is a video component with a fallback HTML video player. The fallback player will show up if YouTube is blocked, and a Download button will also show up. To test this block _www.youtube.com_ and _www.youtube-nocookie.com_ in the Network tab in DevTools.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const video = await canvas.findByTitle("What Most Schools Don't Teach");
    const download = canvas.getByRole('link');

    // check if video is visible
    await expect(video).toBeVisible();

    // check if download button is visible
    await expect(download).toBeVisible();
  },
};

export const VideoWithCaptionAndFallback: Story = {
  ...COMMON_PARAMETERS,
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
  },
  parameters: {
    eyes: {},
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const video = await canvas.findByTitle("What Most Schools Don't Teach");
    const caption = canvas.getByText("What Most Schools Don't Teach");
    const download = canvas.getByRole('link');

    // check if video is visible
    await expect(video).toBeVisible();

    // check if caption is visible
    await expect(caption).toBeVisible();

    // check if download button is visible
    await expect(download).toBeVisible();
  },
};
