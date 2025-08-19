import Video from '@/components/contentful/video';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Video> = {
  title: 'Marketing/Video',
  component: Video,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

export const Playground: StoryObj<typeof Video> = {
  args: {
    youTubeId: 'dQw4w9WgXcQ',
    videoTitle: 'Playground Video',
    videoDesc: 'A sample video for playground.',
    uploadDate: '2025-01-01',
    videoFallback: 'https://example.com/video.mp4',
    showCaption: true,
  },
  argTypes: {
    youTubeId: {control: 'text'},
    videoTitle: {control: 'text'},
    videoDesc: {control: 'text'},
    uploadDate: {control: 'text'},
    videoFallback: {control: 'text'},
    showCaption: {control: 'boolean'},
  },
};

export const WithoutFallback: StoryObj<typeof Video> = {
  args: {
    videoTitle: 'Video without Fallback',
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
  },
};

export const WithFallback: StoryObj<typeof Video> = {
  args: {
    className: '',
    videoTitle: 'Video with Fallback',
    youTubeId: 'nKIu9yen5nc',
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    showCaption: true,
  },
};
