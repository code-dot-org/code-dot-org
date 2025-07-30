import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ButtonMuiContentfulComponentDefinition: ComponentDefinition = {
  id: 'button-mui',
  name: 'Button',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/6fRMP55wwDZF2C4ubzygTO/bad1643a5db519e1e3f6886f0f7bc7cd/component_button_thumbnail.png',
  tooltip: {
    description:
      'Use a button to create clear calls to action. Supports different styles, sizes, and links to guide users to key actions.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/6B9UVqsphQR9MUnNf4tYHU/94e6f32fcb793401f02399ceb0069722/component_button_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
  variables: {
    type: {
      displayName: 'Type',
      type: 'Text',
      defaultValue: 'primary',
      group: 'style',
      validations: {
        in: [
          {value: 'emphasized', displayName: 'Emphasized'},
          {value: 'primary', displayName: 'Primary'},
          {value: 'secondary', displayName: 'Secondary'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'medium',
      group: 'style',
      validations: {
        in: [
          {value: 'small', displayName: 'Small'},
          {value: 'medium', displayName: 'Medium'},
          {value: 'large', displayName: 'Large'},
        ],
      },
    },
    text: {
      displayName: 'Text',
      type: 'Text',
      defaultValue: 'Button',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    href: {
      displayName: 'Link URL',
      type: 'Text',
      defaultValue: 'https://csforall.org',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    isLinkExternal: {
      displayName: 'Is this link external? (Does this link leave the site?)',
      description:
        'External links will be opened in a new tab, while internal links will be opened in the same tab.',
      type: 'Boolean',
      defaultValue: false,
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    ariaLabel: {
      displayName: 'Aria Label',
      type: 'Text',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
