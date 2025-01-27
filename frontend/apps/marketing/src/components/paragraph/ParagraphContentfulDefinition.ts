// Creates a definition for the Paragraph component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ParagraphContentfulComponentDefinition: ComponentDefinition = {
  id: 'paragraph',
  name: 'Paragraph',
  category: 'Typography',
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
