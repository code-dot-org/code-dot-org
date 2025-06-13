/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';

import {LinkAsButton} from '@/components/ui/LinkButton';

defineComponents(
  [
    {
      component: LinkAsButton,
      definition: {
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
          variant: {
            displayName: 'Variant',
            type: 'Text',
            defaultValue: 'default',
            group: 'style',
            validations: {
              in: [
                {value: 'default', displayName: 'Default'},
                {value: 'destructive', displayName: 'Destructive'},
                {value: 'outline', displayName: 'Outline'},
              ],
            },
          },
          size: {
            displayName: 'Size',
            type: 'Text',
            defaultValue: 'Button',
            group: 'style',
            validations: {
              in: [
                {value: 'default', displayName: 'Default'},
                {value: 'sm', displayName: 'Small'},
                {value: 'lg', displayName: 'Large'},
              ],
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

          text: {
            displayName: 'Text',
            type: 'Text',
            defaultValue: 'Button',
            group: 'content',
            validations: {
              bindingSourceType: ['entry', 'manual'],
            },
          },
        },
      },
    },
  ],
  {
    enabledBuiltInComponents: [],
  },
);
