// Creates a definition for the Divider component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const DividerContentfulComponentDefinition: ComponentDefinition = {
  id: 'divider',
  name: 'Divider',
  category: '02: Page Structure',
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/6UpajalIAQ0bHw17sZky2Y/6c93c9859576d981676325338e844075/component_divider_thumbnail.png',
  tooltip: {
    description:
      'Use a divider to visually separate content sections. It spans the full width and helps improve readability and layout structure.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/3gRz7bA5miAVaFwJqM6w18/075ca1479e4c79c3969e3cb4a87a9992/component_divider_tooltip.png',
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
          // This value is `strong` in existing usage of this component on Code.org,
          // but a Secondary displayName label is more generic for different themes.
          // Keeping the value as `strong` so it can be used in existing components
          // without breaking, but the dropdown will say "Secondary" on all sites.
          {value: 'strong', displayName: 'Secondary'},
        ],
      },
    },
    margin: {
      displayName: 'Margin',
      type: 'Text',
      defaultValue: 'm',
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
