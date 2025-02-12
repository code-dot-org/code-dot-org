// Creates a definition for the Link component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const LinkContentfulComponentDefinition: ComponentDefinition = {
  id: 'link',
  name: 'Text Link',
  category: 'Typography',
  thumbnailUrl:
    'https://images.ctfassets.net/90t6bu6vlf76/2CPKrKCB3KxD1n6wG9JTn9/aab22373a39e9cc5305b21c08bba588d/component_link_thumbnail.png',
  tooltip: {
    description:
      'A standalone text link that directs users to internal or external pages, with options for styling and accessibility.',
    imageUrl:
      'https://images.ctfassets.net/90t6bu6vlf76/2toB92KGYPO9yDK3bI3qD8/7bcfbe2819c43f6c5b9c89e6218bad10/component_link_tooltip.png',
  },
  builtInStyles: [],
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: [
          {value: 'purple', displayName: 'Purple'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 'l', displayName: 'Large'},
          {value: 'm', displayName: 'Medium'},
          {value: 's', displayName: 'Small'},
          {value: 'xs', displayName: 'Extra Small'},
        ],
      },
    },
    bottomMargin: {
      displayName: 'Bottom Margin',
      type: 'Text',
      defaultValue: 'xs',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: '0px (None)'},
          {value: 'xs', displayName: '8px (Extra Small)'},
          {value: 's', displayName: '16px (Small)'},
          {value: 'm', displayName: '24px (Medium)'},
        ],
      },
    },
    isLinkExternal: {
      displayName:
        'Is this link external? (Does this link leave the code.org site?)',
      description:
        'External links will be opened in a new tab, while internal links will be opened in the same tab.',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
    href: {
      displayName: 'Link URL',
      type: 'Text',
      defaultValue: 'https://code.org',
      group: 'content',
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Link',
      group: 'content',
      required: true,
    },
  },
};
