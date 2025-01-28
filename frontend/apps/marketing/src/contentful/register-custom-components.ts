/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/divider';
import {
  defineComponents,
  CONTENTFUL_COMPONENTS,
} from '@contentful/experiences-sdk-react';

defineComponents(
  [
    {
      component: Divider,
      definition: DividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  {
    enabledBuiltInComponents: [
      CONTENTFUL_COMPONENTS.heading.id, // Remove this once Heading component is implemented
      CONTENTFUL_COMPONENTS.image.id,
    ],
  },
);
