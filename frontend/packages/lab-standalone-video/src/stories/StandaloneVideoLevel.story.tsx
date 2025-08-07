import {Meta, StoryFn} from '@storybook/react';

import StandaloneVideoLevel, {StandaloneVideoLevelProps} from '@code-dot-org/lab-standalone-video';

export default {
  title: 'Labs/StandaloneVideo',
  component: StandaloneVideoLevel,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<StandaloneVideoLevelProps> = args => (
  <StandaloneVideoLevel
    {...args}
  />
);

export const Default = SingleTemplate.bind({});
Default.args = {
  levelData: {
    videoKey: "CSF_maze_intro_text_blocks",
    videoData: {
      download: "https://videos.code.org/csf/maze-intro.mp4",
      youTubeId: "uBZpd6zGVFI",
      locale: "en-US",
    },
  },
};
