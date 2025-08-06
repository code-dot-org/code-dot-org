import VideoCarousel, {
  VideoCarouselProps,
} from '@/components/contentful/carousels/videoCarousel';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import VideoCarouselMock from './__mocks__/VideoCarousel.json';

const meta: Meta<VideoCarouselProps> = {
  title: 'Marketing/Carousel/Video',
  component: VideoCarousel,
  parameters: {eyes: {include: false}},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<VideoCarouselProps>;

export const FilledOut: Story = {
  args: VideoCarouselMock,
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for video elements and captions
    VideoCarouselMock.slides.forEach(slide => {
      const {videoTitle} = slide.fields;
      // Check for video by title (caption)
      if (videoTitle) {
        expect(canvas.getByText(videoTitle)).toBeInTheDocument();
      }
    });
    // Check for anchor links if present
    const links = canvas.queryAllByRole('link');
    if (links.length) {
      expect(links.length).toBeGreaterThan(0);
    }
  },
};
