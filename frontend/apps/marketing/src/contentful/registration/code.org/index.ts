import ActionBlock, {
  ActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import FullWidthActionBlock, {
  FullWidthActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import ActionBlockCarousel, {
  ActionBlockCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/actionBlockCarousel';
import ImageCarousel, {
  ImageCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/imageCarousel';
import VideoCarousel, {
  VideoCarouselContentfulComponentDefinition,
} from '@/components/contentful/carousels/videoCarousel';
import ActionBlockCollection, {
  ActionBlockCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/actionBlockCollection';
import LogoCollection, {
  LogoCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/logoCollection';
import PeopleCollection, {
  PeopleCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/peopleCollection';
import AdoptionMap, {
  AdoptionMapContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/adoptionMap';
import AFEEligibility, {
  AFEEligibilityContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/afeEligibility';
import Button, {
  ButtonLegacyContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/buttonLegacy';
import {DoubleTheDonationContentfulComponentDefinition} from '@/components/contentful/corporateSite/doubleTheDonation';
import DoubleTheDonation from '@/components/contentful/corporateSite/doubleTheDonation/DoubleTheDonation';
import YourSchool, {
  YourSchoolContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/yourSchool';
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

const contentfulRegistration = {
  componentRegistrations: [
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
      component: AdoptionMap,
      definition: AdoptionMapContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: AFEEligibility,
      definition: AFEEligibilityContentfulComponentDefinition,
    },
    {
      component: Button,
      definition: ButtonLegacyContentfulComponentDefinition,
    },
    {
      component: ActionBlockCollection,
      definition: ActionBlockCollectionContentfulComponentDefinition,
    },
    {
      component: LogoCollection,
      definition: LogoCollectionContentfulComponentDefinition,
    },
    {
      component: PeopleCollection,
      definition: PeopleCollectionContentfulComponentDefinition,
    },
    {
      component: Divider,
      definition: DividerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: DoubleTheDonation,
      definition: DoubleTheDonationContentfulComponentDefinition,
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
    {
      component: YourSchool,
      definition: YourSchoolContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  options: {
    enabledBuiltInComponents: [],
  },
};

export default contentfulRegistration;
