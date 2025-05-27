// Creates a definition for the Overline component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {removeMarginBottomDefinition} from '@/components/common/definitions';

export const OverlineContentfulComponentDefinition: ComponentDefinition = {
  id: 'overline',
  name: 'Overline',
  category: '03: Content Building Blocks',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/30ubXKEp07H0liw3w6jad/222daf47eb2d7f14dfef4e9711522217/component_overline_thumbnail.png',
  tooltip: {
    description:
      'A short, all-caps preheader used to introduce or categorize content.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/2I1BvrvBam8kLhb248w1z4/db2323e89e0ee68853f276417ceada74/component_overline_tooltip.png',
  },
  builtInStyles: ['cfTextAlign'],
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      group: 'style',
      defaultValue: 'primary',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'secondary', displayName: 'Secondary'},
        ],
      },
    },
    size: {
      displayName: 'Text Size',
      type: 'Text',
      group: 'style',
      defaultValue: 'm',
      validations: {
        in: [
          {value: 's', displayName: 'Small'},
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
    removeMarginBottom: {...removeMarginBottomDefinition},
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Overline',
      group: 'content',
      validations: {
        bindingSourceType: ['entry', 'manual'],
      },
    },
  },
};
