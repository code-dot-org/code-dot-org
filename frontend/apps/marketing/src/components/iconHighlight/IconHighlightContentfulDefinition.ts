// Creates a definition for the Icon Highlight component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const IconHighlightContentfulComponentDefinition: ComponentDefinition = {
  id: 'iconHighlight',
  name: 'Icon Highlight',
  category: '03: Basic',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/1Hmduomo4RMBD7E3N3kWKc/5ced16462aa02176586777ccdd04f869/component_icon_highlight_thumbnail.png',
  tooltip: {
    description:
      'Use to highlight information at a glance like key features and resources. Supports a custom icon and links.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/55Tf3bhFiUdkvScJc7NHhu/3090d5797a14005ac69fe3a9cb9255c2/component_icon_highlight_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  children: false,
  variables: {
    heading: {
      displayName: 'Heading',
      type: 'Text',
      group: 'content',
      defaultValue: 'Icon Highlight Heading',
      validations: {
        required: true,
      },
    },
    text: {
      displayName: 'Text content',
      type: 'Text',
      group: 'content',
      defaultValue: 'Icon Highlight\nMultiline Text',
      validations: {
        required: true,
      },
    },
    iconName: {
      displayName: 'Icon name',
      type: 'Text',
      group: 'style',
      description: 'Font Awesome icon name',
      defaultValue: 'smile',
      validations: {
        required: true,
      },
    },
    linkEntry: {
      displayName: 'Single Link',
      type: 'Link',
      group: 'content',
      description: 'Accepts only the "Link" content type entry',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
    linkEntries: {
      displayName: 'Multiple Links',
      type: 'Array',
      group: 'content',
      description:
        'Accepts only the "List" content type entry that contain "Link" entries',
      validations: {
        bindingSourceType: ['entry'],
      },
    },
  },
};
