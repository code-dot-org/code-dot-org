import type {Meta, StoryObj} from '@storybook/react';

import Carousel from '../index';

import Video from '../../video/Video';

export default {
  title: 'DesignSystem/Carousel',
  component: Carousel,
} as Meta;
type Story = StoryObj<typeof Carousel>;

//
// TEMPLATE
//
export const DefaultCarousel: Story = {
  args: {
    children: [
      <Video
        videoTitle="Generative AI: Input & Pre-training"
        youTubeId="JO9MgO1Zp3E"
        showCaption={true}
      />,
      <Video
        videoTitle="Generative AI: Storage & Embeddings"
        youTubeId="s1fhxAVpYx8"
        showCaption={true}
      />,
      <Video
        videoTitle="Generative AI: Processing & Neural Networks"
        youTubeId="Z7Mes_Ej69Y"
        showCaption={true}
      />,
      <Video
        videoTitle="Generative AI: Attention"
        youTubeId="2RdK6k45koY"
        showCaption={true}
      />,
    ],
  },
};
