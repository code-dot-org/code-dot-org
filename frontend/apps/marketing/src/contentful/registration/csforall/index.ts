import ActionBlock, {
  ActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/defaultActionBlock';
import FullWidthActionBlock, {
  FullWidthActionBlockContentfulComponentDefinition,
} from '@/components/contentful/actionBlocks/fullWidthActionBlock';
import Button, {
  ButtonMuiContentfulComponentDefinition,
} from '@/components/contentful/button';
import Card, {
  CardContentfulComponentDefinition,
} from '@/components/contentful/card';
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
import CardCollection, {
  CardCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/cardCollection';
import LogoCollection, {
  LogoCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/logoCollection';
import PeopleCollection, {
  PeopleCollectionContentfulComponentDefinition,
} from '@/components/contentful/collections/peopleCollection';
import AdoptionMap, {
  AdoptionMapContentfulComponentDefinition,
} from '@/components/contentful/corporateSite/adoptionMap';
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
import IconHighlight, {
  IconHighlightContentfulComponentDefinition,
} from '@/components/contentful/iconHighlight';
import Iframe, {
  IframeContentfulComponentDefinition,
} from '@/components/contentful/iframe';
import Image, {
  ImageCSforAllContentfulComponentDefinition,
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
  SectionCSforAllContentfulComponentDefinition,
} from '@/components/contentful/section';
import Spacer, {
  SpacerContentfulComponentDefinition,
} from '@/components/contentful/spacer';
import TabGroup, {
  TabGroupContentfulComponentDefinition,
} from '@/components/contentful/tabGroup';
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
      component: Button,
      definition: ButtonMuiContentfulComponentDefinition,
    },
    {
      component: ActionBlockCollection,
      definition: ActionBlockCollectionContentfulComponentDefinition,
    },
    {
      component: CardCollection,
      definition: CardCollectionContentfulComponentDefinition,
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
      component: Card,
      definition: CardContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
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
      definition: ImageCSforAllContentfulComponentDefinition,
    },
    {
      component: ImageCarousel,
      definition: ImageCarouselContentfulComponentDefinition,
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
      definition: SectionCSforAllContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
    {
      component: Spacer,
      definition: SpacerContentfulComponentDefinition,
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
  options: {
    enabledBuiltInComponents: [],
  },
};

export default contentfulRegistration;
