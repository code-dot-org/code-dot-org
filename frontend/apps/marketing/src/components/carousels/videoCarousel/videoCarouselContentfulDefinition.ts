// Creates a definition for the Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const VideoCarouselContentfulComponentDefinition: ComponentDefinition = {
  id: 'carousel-video',
  name: 'Video Carousel',
  category: '05: Carousels',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/6YMaK6meOohBICfHq6CAZf/fa536c664bb65bc2435cb12c1ca48b89/component_carousel_video_thumbnail.png',
  tooltip: {
    description: 'A rotating display for showcasing videos.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/6HsoNlHnL1AM5wrNjOgZGJ/51280e87c7d089e93b322a98ef3dca15/component_carousel_video_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    slides: {
      displayName: 'Video slides',
      type: 'Array',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
  },
};
