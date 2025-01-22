// Creates a definition for the Divider component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const DividerContentfulComponentDefinition: ComponentDefinition = {
  id: 'divider',
  name: 'Divider',
  category: 'Custom Components',
  builtInStyles: 'cfMargin',
  // thumbnailUrl: 'https://code.org/images/logo.svg',
  tooltip: {
    description: 'A horizontal line to separate content',
    // imageUrl: 'https://code.org/images/logo.svg',
  },
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'primary',
      group: 'style',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'strong', displayName: 'Strong'},
        ],
      },
    },
    margin: {
      displayName: 'Margin',
      type: 'Text',
      defaultValue: 'none',
      group: 'style',
      validations: {
        in: [
          {value: 'none', displayName: 'None'},
          {value: 'xs', displayName: 'Extra Small'},
          {value: 's', displayName: 'Small'},
          {value: 'm', displayName: 'Medium'},
          {value: 'l', displayName: 'Large'},
        ],
      },
    },
  },
};
