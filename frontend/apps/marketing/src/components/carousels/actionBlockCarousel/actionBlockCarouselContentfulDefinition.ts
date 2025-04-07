// Creates a definition for the Carousel component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ActionBlockCarouselContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'carousel-action-block',
    name: 'Action Block Carousel',
    category: '05: Carousels',
    thumbnailUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2FJZgRPkYkJIKwr46SLPX0/02afd1439ea6f0f4cb8f48a27afb231b/component_carousel_action_block_thumbnail.png',
    tooltip: {
      description:
        'A rotating display for showcasing action blocks with media, text, and a call-to-action.',
      imageUrl:
        'https://images.ctfassets.net/90t6bu6vlf76/cpJZaOkkG3bV3yk6qXAou/bd14dd5733c13f6b483ca03b48783be7/component_carousel_action_block_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    children: false,
    variables: {
      slides: {
        displayName: 'Action Block slides',
        type: 'Array',
        validations: {
          required: true,
          bindingSourceType: ['entry'],
        },
      },
      background: {
        displayName: 'Action Block background',
        type: 'Text',
        group: 'style',
        description: 'The background color of the action blocks.',
        defaultValue: 'primary',
        validations: {
          in: [
            {value: 'primary', displayName: 'Primary (light gray)'},
            {value: 'secondary', displayName: 'Secondary (white)'},
          ],
        },
      },
    },
  };
