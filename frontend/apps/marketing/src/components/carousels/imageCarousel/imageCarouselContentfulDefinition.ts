// Creates a definition for the Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ImageCarouselContentfulComponentDefinition: ComponentDefinition = {
  id: 'carousel-image',
  name: 'Image Carousel',
  category: '05: Carousels',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/18ndVxW5lB6s1OLO8AFhc9/ee51190ff569dace1eb3af5c29e306d0/component_carousel_image_thumbnail.png',
  tooltip: {
    description: 'A rotating display for showcasing images.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/66uMMqP7kkReI6Fgl2I6p4/978d47ec3008e439c9e04f346180e065/component_carousel_image_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    slides: {
      displayName: 'Image slides',
      type: 'Array',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
    slidesPerView: {
      displayName: 'Slides per view',
      type: 'Number',
      group: 'style',
      defaultValue: 2,
      validations: {
        in: [
          {value: 1, displayName: '1'},
          {value: 2, displayName: '2'},
          {value: 3, displayName: '3'},
          {value: 4, displayName: '4'},
        ],
      },
    },
  },
};
