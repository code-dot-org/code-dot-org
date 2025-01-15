/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {
  defineComponents,
  CONTENTFUL_COMPONENTS,
} from '@contentful/experiences-sdk-react';
import {
  Stub,
  StubContentfulComponentDefinition,
} from '@code-dot-org/component-library/stub';
import {
  StubSection,
  StubSectionContentfulComponentDefinition,
} from '@code-dot-org/component-library/stub-section';

defineComponents(
  [
    {
      component: Stub,
      definition: StubContentfulComponentDefinition,
    },
    {
      component: StubSection,
      definition: StubSectionContentfulComponentDefinition,
    },
  ],
  {
    enabledBuiltInComponents: [
      CONTENTFUL_COMPONENTS.heading.id, // Remove this once Heading component is implemented
      CONTENTFUL_COMPONENTS.image.id,
    ],
  },
);
