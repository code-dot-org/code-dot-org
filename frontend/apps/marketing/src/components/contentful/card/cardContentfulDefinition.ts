// Creates a definition for the ActionBlock component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const CardContentfulComponentDefinition: ComponentDefinition = {
  id: 'card',
  name: 'Card',
  category: '04: Layout Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/AHRiLWYa6NruVlsM61hbn/8dc5d6ba056e81df347445738fb8cd5c/component_actionblock_thumbnail.png',
  tooltip: {
    description:
      'A flexible card for highlighting key content. Supports text, images, and a primary and secondary CTA.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/5cjcKrwgMCHaJxEK48xN2B/75599dc0fab6fb3a0cae8c2fb963827b/component_actionblock_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    imageHeight: {
      displayName: 'Image height',
      type: 'Number',
      group: 'style',
      description: 'The height of the image in the card.',
      defaultValue: 300,
    },
    overline: {
      displayName: 'Overline',
      type: 'Text',
      group: 'content',
      description: 'The overline of the card.',
      defaultValue: 'Overline',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      description: 'The title of the card.',
      defaultValue: 'Card Title',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    description: {
      displayName: 'Description',
      type: 'Text',
      group: 'content',
      description: 'The description of the card.',
      defaultValue: 'Card description goes here.',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    primaryButton: {
      displayName: 'Primary button',
      type: 'Link',
      group: 'content',
      description: 'The primary button of the card.',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    secondaryButton: {
      displayName: 'Secondary button',
      type: 'Link',
      group: 'content',
      description: 'The secondary button of the card.',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    imageSrc: {
      displayName: 'Image',
      type: 'Media',
      group: 'content',
      description: 'The image to display in the card.',
      defaultValue:
        'https://contentful-images.code.org/90t6bu6vlf76/3ObZQWtgyo31ILZ7j8qm4c/421404b4e7ee968584902c697cdca751/action_block_placeholder_image.png?fm=avif',
      validations: {
        bindingSourceType: ['entry', 'asset'],
      },
    },
  },
};
