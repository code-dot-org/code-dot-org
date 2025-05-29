// Creates a definition for the Spacer component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

import {componentSizeXSToLDefinition} from '@/components/common/definitions';

export const SpacerContentfulComponentDefinition: ComponentDefinition = {
  id: 'spacer',
  name: 'Spacer',
  category: '02: Page Structure',
  thumbnailUrl:
    'https://contentful-images.code.org/90t6bu6vlf76/2z5ZAhyRRPCnryQTvCaRek/3862a4b87deb0b8256f8b4a418c64393/component_spacer_thumbnail.png',
  tooltip: {
    description:
      'A simple layout tool for adding fixed space between components or sections, ensuring proper visual separation.',
    imageUrl:
      'https://contentful-images.code.org/90t6bu6vlf76/5qbYpflX1L7cQRx0fh4gRi/0f2b0f64dea3e1f4cabed4f1498e1d34/component_spacer_tooltip.png',
  },
  // Adding an empty array here so no default style options show in the Design tab.
  builtInStyles: [],
  variables: {
    size: componentSizeXSToLDefinition,
  },
};
