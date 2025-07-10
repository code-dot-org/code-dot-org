// Creates a definition for the Rich Text component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const RichTextContentfulComponentDefinition: ComponentDefinition = {
  id: 'richText',
  name: 'Rich Text',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2GEuq3yVKIXryX2p3cLjQC/0db314e4e19acd7a90cbdded8b348848/component_rich_text_thumbnail.png',
  tooltip: {
    description:
      'An enhanced text block that binds to rich text fields. Supports inline links, selective bold styling, line breaks, and tables — ideal for structured, formatted text content.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/2nDq9QyBr8reF6G31qpfS3/73a5fdd1d402ff31c9f31e17c09685db/component_rich_text_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
  children: false,
  variables: {
    content: {
      displayName: 'Content',
      type: 'RichText',
      group: 'content',
      validations: {
        required: true,
        bindingSourceType: ['entry'],
      },
    },
  },
};
