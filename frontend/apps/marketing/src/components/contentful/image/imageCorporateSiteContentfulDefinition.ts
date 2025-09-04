// Creates a definition for the Image component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {
  imageSrcDefinition,
  imageAltTextDefinition,
  imageHasRoundedCornersDefinition,
} from '@/components/common/definitions';

export const ImageCorporateSiteContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'image',
    name: 'Image',
    category: '03: Content Building Blocks',
    builtInStyles: ['cfWidth', 'cfHeight'],
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/2erlhdZVjByJbpMw9UKcWE/ee11e8a21370bbcd3b1b0b702b00d0e5/component_image_thumbnail.png',
    tooltip: {
      description:
        'Add an image to your layout. Supports border and shadow decorations.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/2Yl2LTZiEjpF9cTPzzC4TS/f6d57839806b1d310d1f527042c49e8b/component_image_tooltip.png',
    },
    variables: {
      ...imageSrcDefinition,
      ...imageAltTextDefinition,
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
      ...imageHasRoundedCornersDefinition,
    },
  };
