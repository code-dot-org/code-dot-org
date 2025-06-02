/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';

import ActionBlock, {
  ActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import FullWidthActionBlock, {
  FullWidthActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import AFEEligibility, {
  AFEEligibilityContentfulComponentDefinition,
} from '@/components/contentful/afeEligibility';
import Button, {
  ButtonContentfulComponentDefinition,
} from '@/components/contentful/button';
import ActionBlockCarousel, {
  ActionBlockCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/actionBlockCarousel';
import ImageCarousel, {
  ImageCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/imageCarousel';
import VideoCarousel, {
  VideoCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/videoCarousel';
import Divider, {
  DividerContentfulComponentDefinition,
} from '@/components/contentful/divider';
import EditorialCard, {
  EditorialCardContentfulComponentDefinition,
} from '@/components/contentful/editorialCard';
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/contentful/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/contentful/heading';
import HeroBanner, {
  HeroBannerContentfulComponentDefinition,
} from '@/components/contentful/heroBanner';
import IconHighlight, {
  IconHighlightContentfulComponentDefinition,
} from '@/components/contentful/iconHighlight';
import Iframe, {
  IframeContentfulComponentDefinition,
} from '@/components/contentful/iframe';
import Image, {
  ImageContentfulComponentDefinition,
} from '@/components/contentful/image';
import Link, {
  LinkContentfulComponentDefinition,
} from '@/components/contentful/link';
import Overline, {
  OverlineContentfulComponentDefinition,
} from '@/components/contentful/overline';
import Paragraph, {
  ParagraphContentfulComponentDefinition,
} from '@/components/contentful/paragraph';
import RichText, {
  RichTextContentfulComponentDefinition,
} from '@/components/contentful/richText';
import Section, {
  SectionContentfulComponentDefinition,
} from '@/components/contentful/section';
import SimpleList, {
  SimpleListContentfulComponentDefinition,
} from '@/components/contentful/simpleList';
import SkinnyBanner, {
  SkinnyBannerContentfulComponentDefinition,
} from '@/components/contentful/skinnyBanner';
import CurriculumSnapshot, {
  CurriculumSnapshotContentfulComponentDefinition,
} from '@/components/contentful/snapshots/curriculumSnapshot';
import LabSnapshot, {
  LabSnapshotContentfulComponentDefinition,
} from '@/components/contentful/snapshots/labSnapshot';
import Spacer, {
  SpacerContentfulComponentDefinition,
} from '@/components/contentful/spacer';
import TabGroup, {
  TabGroupContentfulComponentDefinition,
} from '@/components/contentful/tabGroup';
import Testimonial, {
  TestimonialContentfulComponentDefinition,
} from '@/components/contentful/testimonial';
import Video, {
  VideoContentfulComponentDefinition,
} from '@/components/contentful/video';

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
    {
      component: AFEEligibility,
      definition: AFEEligibilityContentfulComponentDefinition,
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
      component: Testimonial,
      definition: TestimonialContentfulComponentDefinition,
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
    {
      component: VideoCarousel,
      definition: VideoCarouselContentfulComponentDefinition,
    },
  ],
  {
    enabledBuiltInComponents: [],
  },
);
