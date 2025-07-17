// Creates a definition for the Link component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const LinkContentfulComponentDefinition: ComponentDefinition = {
  id: 'link',
  name: 'Text Link',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2CPKrKCB3KxD1n6wG9JTn9/aab22373a39e9cc5305b21c08bba588d/component_link_thumbnail.png',
  tooltip: {
    description:
      'A standalone text link that directs users to internal or external pages, with options for styling and accessibility.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/2toB92KGYPO9yDK3bI3qD8/7bcfbe2819c43f6c5b9c89e6218bad10/component_link_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
  variables: {
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
    children: {
      displayName: 'Link Label',
      type: 'Text',
      defaultValue: 'Link',
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
    isLinkExternal: {
      displayName:
        'Is this link external? (Does this link leave the code.org site?)',
      description:
        'External links will be opened in a new tab, while internal links will be opened in the same tab.',
      type: 'Boolean',
      defaultValue: false,
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
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
