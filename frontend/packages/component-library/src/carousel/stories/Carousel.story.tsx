import type {Meta, StoryFn} from '@storybook/react';

import Carousel, {CarouselProps} from '../index';

import {Heading2} from '@/typography';
import Video from '../../video/Video';

export default {
  title: 'DesignSystem/Carousel',
  component: Carousel,
} as Meta;

const slideTemplate = (index: number) => (
  <div
    style={{
      height: '250px',
      background: '#EEE',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
    }}
    key={index}
  >
    <div style={{margin: '0 auto'}}>
      <Heading2>This is slide {index.toString()}</Heading2>
    </div>
  </div>
);

//
// TEMPLATE
//
const SingleTemplate: StoryFn<CarouselProps> = args => (
  <div style={{width: '800px', margin: '0 auto'}}>
    <Carousel {...args} />
  </div>
);

const MultipleTemplate: StoryFn<{components: CarouselProps[]}> = args => (
  <>
    {args.components?.map((componentArg, index) => (
      <div style={{width: '800px', margin: '0 auto', marginBlock: '2rem'}}>
        <Carousel
          key={index}
          {...componentArg}
          children={componentArg.children}
        />
      </div>
    ))}
  </>
);

//
// STORIES
//
export const DefaultCarousel = SingleTemplate.bind({});
DefaultCarousel.args = {
  carouselName: 'default-carousel',
  children: Array.from({length: 6}, (_, index) => slideTemplate(index + 1)),
};
DefaultCarousel.parameters = {
  docs: {
    description: {
      story:
        "This is the default carousel with navigation buttons and pagination. Carousels are inside a 800px container so we can see the navigation arrow buttons in Storybook, but the default width of the carousel is 100%. Navigation arrow buttons are on the outside of the container so the carousel content is the same width as the rest of the pages's content. **Note:** Pagination dots are not showing here, but are showing in the documentation example above, or in the Default Carousel standalone story page. This is because both carousels share the same `carouselName` prop that is used on the pagination `el` prop in the Swiper component. This should show as expected outside of Storybook Docs.",
    },
  },
};

export const CarouselWithoutNavArrows = SingleTemplate.bind({});
CarouselWithoutNavArrows.args = {
  carouselName: 'carousel-without-nav-arrows',
  showNavArrows: false,
  children: Array.from({length: 6}, (_, index) => slideTemplate(index + 1)),
};
CarouselWithoutNavArrows.parameters = {
  docs: {
    description: {
      story:
        'This carousel does not show navigation arrows on the outside of the container.',
    },
  },
};

// TODO - Add Action Block carousel when Action Block component is ready
export const ActionBlockCarousel = MultipleTemplate.bind({});
ActionBlockCarousel.args = {
  components: [
    {
      carouselName: 'action-block-carousel',
      children: 'COMING SOON',
    },
  ],
};
ActionBlockCarousel.parameters = {
  docs: {
    description: {
      story: 'COMING SOON',
    },
  },
};

export const VideoCarousel = MultipleTemplate.bind({});
VideoCarousel.args = {
  components: [
    {
      carouselName: 'video-carousel',
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
    {
      carouselName: 'image-carousel',
      children: [
        <Video
          videoTitle="Generative AI: Input & Pre-training"
          youTubeId="JO9MgO1Zp3E"
          showCaption={false}
        />,
        <Video
          videoTitle="Generative AI: Storage & Embeddings"
          youTubeId="s1fhxAVpYx8"
          showCaption={false}
        />,
        <Video
          videoTitle="Generative AI: Processing & Neural Networks"
          youTubeId="Z7Mes_Ej69Y"
          showCaption={false}
        />,
        <Video
          videoTitle="Generative AI: Attention"
          youTubeId="2RdK6k45koY"
          showCaption={false}
        />,
      ],
    },
  ],
};
VideoCarousel.parameters = {
  docs: {
    description: {
      story:
        'Videos carousels can show or hide captions. There are bottom margins applied between carousels so this displays nicely in Storybook. This is not a part of the component itself.',
    },
  },
};

export const ImageCarousel = MultipleTemplate.bind({});
ImageCarousel.args = {
  components: [
    {
      carouselName: 'image-carousel',
      children: [
        <img
          src="https://code.org/images/cs-stats/Slide1_Schools_Teach.png"
          style={{width: '100%'}}
          alt=""
        />,
        <img
          src="https://code.org/images/cs-stats/Slide2_STEM_CS.png"
          style={{width: '100%'}}
          alt=""
        />,
        <img
          src="https://code.org/images/cs-stats/Slide_Students_Like_CS.png"
          style={{width: '100%'}}
          alt=""
        />,
        <img
          src="https://code.org/images/cs-stats/Slide3_Diversity_K12.png"
          style={{width: '100%'}}
          alt=""
        />,
      ],
    },
  ],
};
