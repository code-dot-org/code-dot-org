import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ButtonContentfulComponentDefinition: ComponentDefinition = {
  id: 'button',
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
    component: {
      displayName: 'Component',
      type: 'Text',
      defaultValue: 'a',
      group: 'style',
      validations: {
        in: [{value: 'a', displayName: 'Anchor Link'}],
      },
    },
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: [
          {value: 'purple', displayName: 'Purple'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    children: {
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
      defaultValue: 'https://code.org',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
