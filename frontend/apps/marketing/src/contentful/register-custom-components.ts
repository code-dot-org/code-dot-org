/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';

import Button, {ButtonContentfulComponentDefinition} from '@/components/button';
import ActionBlockCarousel, {
  ActionBlockCarouselContentfulComponentDefinition,
} from '@/components/carousels/actionBlockCarousel';
import ImageCarousel, {
  ImageCarouselContentfulComponentDefinition,
} from '@/components/carousels/imageCarousel';
import VideoCarousel, {
  VideoCarouselContentfulComponentDefinition,
} from '@/components/carousels/videoCarousel';
import ActionBlock, {
  ActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import FullWidthActionBlock, {
  FullWidthActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/contentful/heading';
import HeroBanner, {
  HeroBannerContentfulComponentDefinition,
} from '@/components/contentful/heroBanner';
import SkinnyBanner, {
  SkinnyBannerContentfulComponentDefinition,
} from '@/components/contentful/skinnyBanner';
import TabGroup, {
  TabGroupContentfulComponentDefinition,
} from '@/components/contentful/tabGroup';
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/divider';
import EditorialCard, {
  EditorialCardContentfulComponentDefinition,
} from '@/components/editorialCard';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/faqAccordion';
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
import RichText, {
  RichTextContentfulComponentDefinition,
} from '@/components/richText';
import Section, {
  SectionContentfulComponentDefinition,
} from '@/components/section';
import SimpleList, {
  SimpleListContentfulComponentDefinition,
} from '@/components/simpleList';
import CurriculumSnapshot, {
  CurriculumSnapshotContentfulComponentDefinition,
} from '@/components/snapshots/curriculumSnapshot';
import LabSnapshot, {
  LabSnapshotContentfulComponentDefinition,
} from '@/components/snapshots/labSnapshot';
import Spacer, {SpacerContentfulComponentDefinition} from '@/components/spacer';
import Video, {VideoContentfulComponentDefinition} from '@/components/video';

defineComponents(
  [
    {
      component: ActionBlock,
      definition: ActionBlockContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: ActionBlockCarousel,
      definition: ActionBlockCarouselContentfulComponentDefinition,
    },
    {component: Button, definition: ButtonContentfulComponentDefinition},
    {
      component: ActionBlockCarousel,
      definition: ActionBlockCarouselContentfulComponentDefinition,
    },
    {
      component: Divider,
      definition: DividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: EditorialCard,
      definition: EditorialCardContentfulComponentDefinition,
    },
    {
      component: FAQAccordion,
      definition: FAQAccordionContentfulComponentDefinition,
    },
    {
      component: FullWidthActionBlock,
      definition: FullWidthActionBlockContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
    },
    {
      component: HeroBanner,
      definition: HeroBannerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
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
      component: ImageCarousel,
      definition: ImageCarouselContentfulComponentDefinition,
    },
    {
      component: LabSnapshot,
      definition: LabSnapshotContentfulComponentDefinition,
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
      component: RichText,
      definition: RichTextContentfulComponentDefinition,
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
    {
      component: SkinnyBanner,
      definition: SkinnyBannerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Spacer,
      definition: SpacerContentfulComponentDefinition,
    },
    {
      component: CurriculumSnapshot,
      definition: CurriculumSnapshotContentfulComponentDefinition,
    },
    {component: TabGroup, definition: TabGroupContentfulComponentDefinition},
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: VideoCarousel,
      definition: VideoCarouselContentfulComponentDefinition,
    },
  ],
  {
    enabledBuiltInComponents: [],
  },
);
