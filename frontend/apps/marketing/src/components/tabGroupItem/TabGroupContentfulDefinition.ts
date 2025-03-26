// Creates a definition for the Tab Group component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const TabGroupItemContentfulComponentDefinition: ComponentDefinition = {
  id: 'tabGroupItem',
  name: 'Tab Group Item',
  category: '04: Advanced',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/1HJ7nWwydFt54zhjpJVn3D/67f46ccf2fab57678fd0b7e4de11386c/3eac18fce1deaddc61c5fbe1c795fbd5.png',
  tooltip: {
    description:
      'A set of interactive tabs for organizing and displaying content in panels.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/6XQS13VHTxw1PI5amrG2Xk/071d039bf0f12501b5e0feabfd67b2bd/8d2ea9a267cbbfe371d8ce5fe73908ac.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: true,
  variables: {
    ctaLink: {
      displayName: 'Link',
      type: 'Link',
    },
    description: {
      displayName: 'Description',
      type: 'Text',
    },
    image: {
      displayName: 'Image',
      type: 'Media',
    },
    tabLabel: {
      displayName: 'Tab Label',
      type: 'Text',
    },
    title: {
      displayName: 'Title',
      type: 'Text',
    },
  },
};
