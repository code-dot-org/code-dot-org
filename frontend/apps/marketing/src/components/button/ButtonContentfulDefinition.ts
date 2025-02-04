import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ButtonContentfulComponentDefinition: ComponentDefinition = {
  id: 'button',
  name: 'Button',
  category: 'Custom Components',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/6fRMP55wwDZF2C4ubzygTO/bad1643a5db519e1e3f6886f0f7bc7cd/component_button_thumbnail.png',
  tooltip: {
    description:
      'Use a button to create clear calls to action. Supports different styles, sizes, and links to guide users to key actions.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/6B9UVqsphQR9MUnNf4tYHU/94e6f32fcb793401f02399ceb0069722/component_button_tooltip.png',
  },
  variables: {
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
    type: {
      displayName: 'Type',
      type: 'Text',
      defaultValue: 'primary',
      group: 'style',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'secondary', displayName: 'Secondary'},
        ],
      },
    },
    text: {
      displayName: 'Text',
      type: 'Text',
      defaultValue: 'Button',
      group: 'content',
    },
    href: {
      displayName: 'Link URL',
      type: 'Text',
      defaultValue: 'https://code.org',
      group: 'content',
    },
    target: {
      displayName: 'Open link in (Link target)',
      type: 'Text',
      defaultValue: '_self',
      group: 'style',
      validations: {
        in: [
            {value: '_self', displayName: 'Same tab'},
            {value: '_blank', displayName: 'New tab'},
        ],
      },
    },
    download: {
      displayName: 'Download',
      type: 'Text',
      group: 'content',
    },
    disabled: {
      displayName: 'Disabled',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    isPending: {
      displayName: 'Pending State',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
    },
    iconLeftName: {
      displayName: 'Left Icon Name',
      type: 'Text',
      group: 'style',
      defaultValue: '',
    },
    isLeftIconBrand: {
      displayName: 'Is left icon a brand icon?',
      type: 'Boolean',
      group: 'style',
      defaultValue: false,
    },
    iconRightName: {
      displayName: 'Right Icon Name',
      type: 'Text',
      group: 'style',
      defaultValue: '',
    },
    isRightIconBrand: {
      displayName: 'Is right icon a brand icon?',
      type: 'Boolean',
      group: 'style',
      defaultValue: false,
    },
  },
};
