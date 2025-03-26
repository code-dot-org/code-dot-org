/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';

import Button, {ButtonContentfulComponentDefinition} from '@/components/button';
import VideoCarousel, {
  VideoCarouselContentfulComponentDefinition,
} from '@/components/carousels/videoCarousel';
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/divider';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/heading';
import IconHighlight, {
  IconHighlightContentfulComponentDefinition,
} from '@/components/iconHighlight';
import Iframe, {IframeContentfulComponentDefinition} from '@/components/iframe';
import Image, {ImageContentfulComponentDefinition} from '@/components/image';
import Link, {LinkContentfulComponentDefinition} from '@/components/link';
import Overline, {
  OverlineContentfulComponentDefinition,
} from '@/components/overline';
import Paragraph, {
  ParagraphContentfulComponentDefinition,
} from '@/components/paragraph';
import Section, {
  SectionContentfulComponentDefinition,
} from '@/components/section';
import SimpleList, {
  SimpleListContentfulComponentDefinition,
} from '@/components/simpleList';
import TabGroup, {
  TabGroupContentfulComponentDefinition,
} from '@/components/tabGroup';
import Video, {VideoContentfulComponentDefinition} from '@/components/video';

defineComponents(
  [
    {component: Button, definition: ButtonContentfulComponentDefinition},
    {
      component: VideoCarousel,
      definition: VideoCarouselContentfulComponentDefinition,
    },
    {
      component: Divider,
      definition: DividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: FAQAccordion,
      definition: FAQAccordionContentfulComponentDefinition,
    },
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
    },
    {
      component: IconHighlight,
      definition: IconHighlightContentfulComponentDefinition,
    },
    {
      component: Iframe,
      definition: IframeContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Image,
      definition: ImageContentfulComponentDefinition,
    },
    {
      component: Link,
      definition: LinkContentfulComponentDefinition,
    },
    {component: Overline, definition: OverlineContentfulComponentDefinition},
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
      component: SimpleList,
      definition: SimpleListContentfulComponentDefinition,
    },
    {component: TabGroup, definition: TabGroupContentfulComponentDefinition},
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  {
    enabledBuiltInComponents: [],
  },
);
