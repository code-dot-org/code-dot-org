// Creates a definition for the Typography component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const HeadingContentfulComponentDefinition: ComponentDefinition = {
  id: 'heading',
  name: 'Heading',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/LHRmOBd4IWYZuWScbJG3i/0442e38966e91c0e2aca88fdb2b217ad/component_divider_thumbnail.png',
  tooltip: {
    description:
      'Use a heading to introduce a section or key content. Choose from different levels to maintain a clear content hierarchy.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3kSwyMuHssbpZtr0hUAKyf/1f4d22b8e8bf3037bda3ff58d03ce293/component_heading_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
  variables: {
    visualAppearance: {
      displayName: 'Visual Appearance',
      type: 'Text',
      defaultValue: 'heading-xl',
      group: 'style',
      validations: {
        in: [
          {value: 'heading-xxl', displayName: 'Heading 1'},
          {value: 'heading-xl', displayName: 'Heading 2'},
          {value: 'heading-lg', displayName: 'Heading 3'},
          {value: 'heading-md', displayName: 'Heading 4'},
          {value: 'heading-sm', displayName: 'Heading 5'},
          {value: 'heading-xs', displayName: 'Heading 6'},
        ],
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Heading',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
