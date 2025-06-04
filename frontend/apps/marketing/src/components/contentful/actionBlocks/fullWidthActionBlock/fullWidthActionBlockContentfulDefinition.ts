// Creates a definition for the ActionBlock component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {videoRelatedDefinitions} from '@/components/common/definitions';

export const FullWidthActionBlockContentfulComponentDefinition: ComponentDefinition =
  {
    id: 'fullWidthActionBlock',
    name: 'Full-Width Action Block',
    category: '04: Layout Building Blocks',
    thumbnailUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/7IOZn0XSZFGgzMsJqrGsjz/4e589f5a1190796cc5ab7cd366db3a68/component_fullwidthactionblock_thumbnail.png',
    tooltip: {
      description:
        'A flexible card for highlighting curriculum, resources, or other key content with text, media, and a CTA. Use this version for single blocks that span the full-width of the page.',
      imageUrl:
        'https://contentful-images.code.org/90t6bu6vlf76/5aObqySLlxixrbLYnChYJi/53d151aa26389c4da270562b25883454/component_fullwidthactionblock_tooltip.png',
    },
    // Adding an empty array here so no default style options show in the Design tab.
    builtInStyles: [],
    variables: {
      overline: {
        displayName: 'Overline',
        type: 'Text',
        group: 'content',
        description: 'The overline of the action block.',
        validations: {
          bindingSourceType: ['entry', 'manual'],
        },
      },
      title: {
        displayName: 'Title',
        type: 'Text',
        group: 'content',
        description: 'The title of the action block.',
        defaultValue: 'Action Block Title',
        validations: {
          bindingSourceType: ['entry', 'manual'],
        },
      },
      description: {
        displayName: 'Description',
        type: 'Text',
        group: 'content',
        description: 'The description of the action block.',
        defaultValue: 'Action block description goes here.',
        validations: {
          bindingSourceType: ['entry', 'manual'],
        },
      },
      image: {
        displayName: 'Image',
        type: 'Media',
        group: 'content',
        description: 'The image to display in the action block.',
        defaultValue:
          'contentful-images.code.org/90t6bu6vlf76/3ObZQWtgyo31ILZ7j8qm4c/421404b4e7ee968584902c697cdca751/action_block_placeholder_image.png',
        validations: {
          bindingSourceType: ['entry', 'asset'],
        },
      },
      ...videoRelatedDefinitions,
      primaryButton: {
        displayName: 'Primary button',
        type: 'Link',
        group: 'content',
        description: 'The primary button of the action block.',
        defaultValue: {
          fields: {
            label: 'Primary button',
            url: '#',
          },
        },
        validations: {
          bindingSourceType: ['entry'],
        },
      },
      secondaryButton: {
        displayName: 'Secondary button',
        type: 'Link',
        group: 'content',
        description: 'The secondary button of the action block.',
        validations: {
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
      publishedDate: {
        displayName: 'Published date',
        type: 'Date',
        group: 'content',
        description: 'Adds a "New" tag on the action block.',
        validations: {
          bindingSourceType: ['entry'],
        },
      },
    },
  };
