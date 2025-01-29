import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ButtonContentfulComponentDefinition: ComponentDefinition = {
  id: 'button',
  name: 'Button',
  category: 'Custom Components',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/4fJ5H4ztpxsps2n46akVPd/5389a912640503795e2dd51cd3d92061/component_button_thumbnail.png',
  tooltip: {
    description:
      'Use a button to create clear calls to action. Supports different styles, sizes, and links to guide users to key actions.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/6pLvzcnn5QJLPq1s4SLtVC/27cefc6049496000bcc797df11d81d03/component_button_tooltip.png',
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
    iconLeft: {
      displayName: 'Left Icon',
      type: 'Object',
      group: 'style',
      fields: {
        iconName: {type: 'Text', displayName: 'Icon Name'},
        iconStyle: {type: 'Text', displayName: 'Icon Style'},
        title: {type: 'Text', displayName: 'Title'},
      },
    },
    iconRight: {
      displayName: 'Right Icon',
      type: 'Object',
      group: 'style',
      fields: {
        iconName: {type: 'Text', displayName: 'Icon Name'},
        iconStyle: {type: 'Text', displayName: 'Icon Style'},
        title: {type: 'Text', displayName: 'Title'},
      },
    },
    href: {
      displayName: 'Link URL',
      type: 'Text',
      defaultValue: 'code.org',
      group: 'content',
    },
    target: {
      displayName: 'Link Target',
      type: 'Text',
      defaultValue: '_self',
      group: 'content',
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
    }
  },
};
