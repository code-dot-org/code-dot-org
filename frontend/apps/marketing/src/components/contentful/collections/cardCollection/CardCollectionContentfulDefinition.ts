// Creates a definition for the CardCollection component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  collectionsSortOrderDefinition,
  hideImagesDefinition,
} from '@/components/common/definitions';

export const CardCollectionContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'collection-card',
    name: 'Card Collection',
    category: '06: Dynamic Displays',
    thumbnailUrl:
      'https://contentful-images.code.org/27jkibac934d/3bdIeTGv7l5IiHYnUrBETw/7fc9611f531bdfdfd431778161eef313/component_card_collection_icon.png',
    tooltip: {
      description:
        'Display a responsive grid of cards from a content collection.',
      imageUrl:
        'https://contentful-images.code.org/27jkibac934d/Js2xmo7ZuOsL5T1IeAt9o/f15dac4bcabbb2e72999b0c79ef7b813/component_card_collection_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      cards: {
        displayName: 'Card Collection',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      ...collectionsSortOrderDefinition,
      ...hideImagesDefinition,
      hideSecondaryButton: {
        displayName: 'Hide secondary button',
        type: 'Boolean',
        defaultValue: false,
        group: 'style',
      },
    },
  };
