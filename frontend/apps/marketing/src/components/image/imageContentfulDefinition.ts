// Creates a definition for the Divider component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ImageContentfulComponentDefinition: ComponentDefinition = {
  id: 'image',
  name: 'Image',
  category: 'Custom Components',
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/2erlhdZVjByJbpMw9UKcWE/27dd8f0be5edd691efec64368d99caae/component_image_thumbnail.png',
  tooltip: {
    description:
      'Add an image to your layout. Supports border and shadow options.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2Yl2LTZiEjpF9cTPzzC4TS/f6d57839806b1d310d1f527042c49e8b/component_image_tooltip.png',
  },
  variables: {
    src: {
      displayName: 'Image source',
      type: 'Media',
      defaultValue: '',
      group: 'content',
    },
    altText: {
      displayName: 'Alt text',
      type: 'Text',
      defaultValue: '',
      group: 'content',
    },
    hasBorder: {
      displayName: 'Add border',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    hasBoxShadow: {
      displayName: 'Add shadow',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
