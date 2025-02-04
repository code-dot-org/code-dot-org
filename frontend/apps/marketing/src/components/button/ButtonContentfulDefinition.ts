import {ComponentDefinition} from '@contentful/experiences-sdk-react';
import {iconStyles, iconFamilies} from '@/components/button/Button';
import {capitalize} from '@/components/common/helpers';

const iconStylesOptions = iconStyles.map(style => ({
  value: style,
  displayName: capitalize(style),
}));
const iconFamiliesOptions = iconFamilies.map(family => ({
  value: family,
  displayName: capitalize(family),
}));

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
    },
    iconLeftName: {
      displayName: 'Left Icon Name',
      type: 'Text',
      group: 'style',
      defaultValue: '',
    },
    iconLeftStyle: {
      displayName: 'Left Icon Style',
      type: 'Text',
      group: 'style',
      defaultValue: 'solid',
      validations: {
        in: iconStylesOptions,
      },
    },
    iconLeftFamily: {
      displayName: 'Left Icon Family',
      type: 'Text',
      group: 'style',
      defaultValue: undefined,
      validations: {
        // Adding an empty option to allow also not to select family
        in: iconFamiliesOptions,
      },
    },
    iconRightName: {
      displayName: 'Right Icon Name',
      type: 'Text',
      group: 'style',
      defaultValue: '',
    },
    iconRightStyle: {
      displayName: 'Right Icon Style',
      type: 'Text',
      group: 'style',
      defaultValue: 'solid',
      validations: {
        in: iconStylesOptions,
      },
    },
    iconRightFamily: {
      displayName: 'Right Icon Family',
      type: 'Text',
      group: 'style',
      defaultValue: undefined,
      validations: {
        // Adding an empty option to allow also not to select family
        in: iconFamiliesOptions,
      },
    },
  },
};
