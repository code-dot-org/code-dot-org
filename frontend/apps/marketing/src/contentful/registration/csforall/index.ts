import Button, {
  ButtonMuiContentfulComponentDefinition,
} from '@/components/contentful/button';
import Card, {
  CardContentfulComponentDefinition,
} from '@/components/contentful/card';
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
import FAQAccordion, {
  FAQAccordionContentfulComponentDefinition,
} from '@/components/contentful/faqAccordion';
import Heading, {
  HeadingContentfulComponentDefinition,
} from '@/components/contentful/heading';
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
import Video, {
  VideoContentfulComponentDefinition,
} from '@/components/contentful/video';

const contentfulRegistration = {
  componentRegistrations: [
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
      component: FAQAccordion,
      definition: FAQAccordionContentfulComponentDefinition,
    },
    {
      component: Heading,
      definition: HeadingContentfulComponentDefinition,
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
    {
      component: Video,
      definition: VideoContentfulComponentDefinition,
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
