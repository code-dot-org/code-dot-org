// Creates a definition for the Editorial Card component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {EDITORIAL_CARD_CONTENTFUL_LAYOUTS} from './EditorialCard';

export const EditorialCardContentfulComponentDefinition: ComponentDefinition = {
  id: 'editorialCard',
  name: 'Editorial Card',
  category: '03: Basic',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/1SptVYIyW5meSA34NcP99o/499a67854db82f98ee7717dbc9b95c6e/component_editorial_card_thumbnail.png',
  tooltip: {
    description:
      'A customizable content card with an image, text, and optional link. Supports both vertical and landscape orientations.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/18GIGLig36NtxqDSFegTHX/bca85090d5410f0e31c49a44bfee6b64/component_editorial_card_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    layoutOpt: {
      displayName: 'Layout',
      type: 'Text',
      group: 'style',
      defaultValue: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE,
      validations: {
        required: true,
        bindingSourceType: ['manual'],
        in: [
          {
            value: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE,
            displayName: 'Horizontal with Image',
          },
          {
            value: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE,
            displayName: 'Vertical with Image',
          },
          {
            value: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON,
            displayName: 'Vertical with Icon',
          },
        ],
      },
    },
    heading: {
      displayName: 'Heading',
      type: 'Text',
      group: 'content',
      defaultValue: 'Editorial Card Heading',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    text: {
      displayName: 'Text content',
      type: 'Text',
      group: 'content',
      defaultValue: 'Editorial Card\nMultiline Text',
      validations: {
        required: true,
        bindingSourceType: ['entry', 'manual'],
      },
    },
    image: {
      displayName: 'Image',
      type: 'Media',
      group: 'content',
      description:
        'The image to display in "Horizontal/Vertical with Image" layouts',
      defaultValue:
        'https://contentful-images.code.org/90t6bu6vlf76/1SptVYIyW5meSA34NcP99o/499a67854db82f98ee7717dbc9b95c6e/component_editorial_card_thumbnail.png',
      validations: {
        bindingSourceType: ['entry', 'asset', 'manual'],
      },
    },
    iconName: {
      displayName: 'Icon name',
      type: 'Text',
      group: 'style',
      description:
        'Font Awesome icon name to display in the "Vertical with Icon" layout',
      defaultValue: 'smile',
    },
    linkEntry: {
      displayName: 'Link',
      type: 'Link',
      group: 'content',
      description: 'Accepts only the "Link" content type entry',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
  },
};
