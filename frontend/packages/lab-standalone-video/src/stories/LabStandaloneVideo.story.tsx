import {Meta, StoryFn} from '@storybook/react';

import LabStandaloneVideo, {LabStandaloneVideoProps} from '@code-dot-org/lab-standalone-video';

export default {
  title: 'Labs/StandaloneVideo',
  component: LabStandaloneVideo,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<LabStandaloneVideoProps> = args => (
  <LabStandaloneVideo
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
