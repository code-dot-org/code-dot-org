// Creates a definition for the Image component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ImageContentfulComponentDefinition: ComponentDefinition = {
  id: 'image',
  name: 'Image',
  category: '03: Basic',
  builtInStyles: ['cfWidth', 'cfHeight'],
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/2erlhdZVjByJbpMw9UKcWE/ee11e8a21370bbcd3b1b0b702b00d0e5/component_image_thumbnail.png',
  tooltip: {
    description:
      'Add an image to your layout. Supports border and shadow decorations.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2Yl2LTZiEjpF9cTPzzC4TS/f6d57839806b1d310d1f527042c49e8b/component_image_tooltip.png',
  },
  variables: {
    src: {
      displayName: 'Image source',
      type: 'Media',
      defaultValue: undefined,
      group: 'content',
      validations: {
        bindingSourceType: ['asset', 'manual'],
      },
    },
    altText: {
      displayName: 'Alt text',
      type: 'Text',
      defaultValue: '',
      group: 'content',
      validations: {
        bindingSourceType: ['asset', 'manual', 'entry'],
      },
    },
    decoration: {
      displayName: 'Decoration',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          {value: 'border', displayName: 'Border'},
          {value: 'shadow', displayName: 'Shadow'},
        ],
      },
    },
  },
};
