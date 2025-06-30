// Creates a definition for the PeopleCollection component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const PeopleCollectionContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'collection-people',
    name: 'People Collection',
    category: '06: Dynamic Displays',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3QZlhUeuj9IhmDRX1kTxT0/93f43fbab28129b0cdffbbf839e6aa9a/component_peoplecollection_icon.png',
    tooltip: {
      description:
        'Showcase a list of people from a content collection, including their name, title, bio, and image.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/1bdUSHOZDxL5yrnBF6YJH4/e2144ad57d0038cbfe00304d15c6b9de/component_peoplecollection_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      people: {
        displayName: 'People Collection',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      imageVisibility: {
        displayName: 'Image Visibility',
        type: 'Text',
        defaultValue: 'show',
        group: 'style',
        validations: {
          in: [
            {value: 'show', displayName: 'Show'},
            {value: 'hide', displayName: 'Hide'},
          ],
        },
      },
    },
  };
