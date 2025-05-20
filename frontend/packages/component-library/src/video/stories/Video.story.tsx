import type {Meta, StoryObj} from '@storybook/react';
import {within, expect, userEvent} from '@storybook/test';

import Section from '@/cms/section';

import Video from '../index';

export default {
  title: 'DesignSystem/Video',
  component: Video,
} as Meta;
type Story = StoryObj<typeof Video>;

//
// TEMPLATE
//
export const DefaultVideo: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
    isYouTubeCookieAllowed: true,
  },
  parameters: {
    eyes: {
      // Skip eyes for video as this auto plays
      include: false,
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const playButton = await canvas.findByLabelText(
      `Play video ${args.videoTitle}`,
    );
    await expect(playButton).toBeVisible();
    await userEvent.click(playButton);

    const video = await canvas.findByTitle("What Most Schools Don't Teach");

    // check if video is visible
    await expect(video).toBeVisible();
  },
};

export const VideoWithCaption: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
    isYouTubeCookieAllowed: true,
  },
  decorators: Story => {
    return (
      <Section background={'dark'}>
        <Story />
      </Section>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const playButton = await canvas.findByLabelText(
      `Play video ${args.videoTitle}`,
    );
    await expect(playButton).toBeVisible();

    const caption = canvas.getByText("What Most Schools Don't Teach");

    // check if caption is visible
    await expect(caption).toBeVisible();
  },
};

export const VideoWithFallback: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: false,
    isYouTubeCookieAllowed: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This is a video component with a fallback HTML video player. The fallback player will show up if YouTube is blocked, and a Download button will also show up. To test this block _www.youtube.com_ and _www.youtube-nocookie.com_ in the Network tab in DevTools.',
      },
    },
    eyes: {
      // Skip eyes for video as this auto plays
      include: false,
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const playButton = await canvas.findByLabelText(
      `Play video ${args.videoTitle}`,
    );
    await expect(playButton).toBeVisible();
    await userEvent.click(playButton);

    const download = canvas.getByRole('link');

    // check if download button is visible
    await expect(download).toBeVisible();
  },
};

export const VideoWithCaptionAndFallback: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
    isYouTubeCookieAllowed: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const caption = canvas.getByText("What Most Schools Don't Teach");
    const download = canvas.getByRole('link');

    // check if caption is visible
    await expect(caption).toBeVisible();

    // check if download button is visible
    await expect(download).toBeVisible();
  },
};

export const VideoCookieBlocked: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
    isYouTubeCookieAllowed: false,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const playButton = await canvas.findByLabelText(
      `Play video ${args.videoTitle}`,
    );
    await expect(playButton).toBeVisible();
    await userEvent.click(playButton);

    expect(
      canvas.getByText(
        'Please enable "Functional Cookies" and refresh the page to play this video.',
      ),
    );
  },
};
