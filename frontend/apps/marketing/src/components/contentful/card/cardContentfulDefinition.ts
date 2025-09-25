// Creates a definition for the Card component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const CardContentfulComponentDefinition: ComponentDefinition = {
  id: 'card',
  name: 'Card',
  category: '04: Layout Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/5GISjBzkhPQIXj9i7Gc7yg/6af2043e1ed4e57a1d1f3dd5a33e0d30/component_card_thumbnail.png',
  tooltip: {
    description:
      'A simple flexible card for highlighting key content. Supports text, images, and a primary and secondary CTA.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/5H922jIBGENGq8KNoQZsZ4/6885497ab9854c6cf53e0922a075607c/component_card_tooltip.png',
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
