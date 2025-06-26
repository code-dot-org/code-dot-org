// Creates a definition for the LogoCollection component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LogoCollectionContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'collection-logo',
    name: 'Logo Collection',
    category: '06: Dynamic Displays',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/X57vBxMESGE78cq07DYOq/b61a9f38ade871c8ada6716286e7da92/component_logocollection_icon.png',
    tooltip: {
      description:
        'Display a responsive grid of logos from a content collection. Logos are automatically scaled to maintain balance across varying sizes and shapes.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/37hGc97RdMypdCrJzrvsyZ/f5dc16a6ef37420c3516a33211b1c676/component_logocollection_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      logos: {
        displayName: 'Logo Collection',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
    },
  };
