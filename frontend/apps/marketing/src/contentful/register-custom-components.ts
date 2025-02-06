/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/divider';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/heading';
import Paragraph, {
  ParagraphContentfulComponentDefinition,
} from '@/components/paragraph';
import Section, {
  SectionContentfulComponentDefinition,
} from '@/components/section';
import Video, {VideoContentfulComponentDefinition} from '@/components/video';

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
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
    },
    {
      component: Paragraph,
      definition: ParagraphContentfulComponentDefinition,
    },
    {
      component: Section,
      definition: SectionContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  {
    enabledBuiltInComponents: [CONTENTFUL_COMPONENTS.image.id],
  },
);
