// Creates a definition for the Paragraph component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ParagraphContentfulComponentDefinition: ComponentDefinition = {
  id: 'paragraph',
  name: 'Paragraph',
  category: 'Typography',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/5hP7jqXdP90BtLxMi6FSWm/09a555420c3313133d16e87a84e22826/component_paragraph_thumbnail.png',
  tooltip: {
    description:
      'Use a paragraph for body text and longer descriptions. Supports rich text formatting for emphasis, links, and structure.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/5qoQl0G7ZKxKCI8VYBaCzl/19a21cd2fbb6b037c397fcbc417f70b1/component_paragraph_tooltip.png',
  },
  builtInStyles: ['cfTextAlign', 'cfTextUnderline', 'cfWidth'],
  variables: {
    visualAppearance: {
      displayName: 'Visual Appearance',
      type: 'Text',
      defaultValue: 'body-one',
      group: 'style',
      validations: {
        in: [
          {value: 'body-one', displayName: 'Body L'},
          {value: 'body-two', displayName: 'Body M'},
          {value: 'body-three', displayName: 'Body S'},
          {value: 'body-four', displayName: 'Body XS'},
        ],
      },
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Paragraph',
      group: 'content',
      description: 'The text or other elements to display inside the paragraph',
    },
    isStrong: {
      displayName: 'Make this paragraph bold',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
