// Creates a definition for the ActionBlockCollection component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  collectionsSortOrderDefinition,
  hideImagesDefinition,
} from '@/components/common/definitions';

export const ActionBlockCollectionContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'collection-action-block',
    name: 'Action Block Collection',
    category: '06: Dynamic Displays',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/38MZh5NgUDLrLFpMO4Pkxj/62c65a6f691ca2705f90dc7134f3ae4d/component_actionblock_collection_icon.png',
    tooltip: {
      description:
        'Display a responsive grid of action blocks from a content collection. Supports the same set of content types as the action block carousel.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/28KZp35UMzBXNFzAxFfcwB/41c5ff21c6348c041dbafb52f7086c25/component_actionblock_collection_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      blocks: {
        displayName: 'Action Block Collection',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      background: {
        displayName: 'Background',
        type: 'Text',
        group: 'style',
        description: 'The background color of the action block.',
        defaultValue: 'primary',
        validations: {
          in: [
            {value: 'primary', displayName: 'Primary (light gray)'},
            {value: 'secondary', displayName: 'Secondary (white)'},
          ],
        },
      },
      ...collectionsSortOrderDefinition,
      ...hideImagesDefinition,
    },
  };
