import image1 from '@public/images/action-block-01.png';
import image2 from '@public/images/action-block-02.png';
import image3 from '@public/images/action-block-03.png';
import image4 from '@public/images/action-block-04.png';
import image5 from '@public/images/action-block-05.png';
import image6 from '@public/images/action-block-06.png';
import type {Meta, StoryFn} from '@storybook/react';
import {within, expect, userEvent} from '@storybook/test';

import ActionBlock from '@/actionBlock';
import {Heading2} from '@/typography';
import Video from '@/video';

import Carousel, {CarouselProps} from '../index';

export default {
  title: 'DesignSystem/Carousel',
  component: Carousel,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for action blocks.
            // ActionBlock component has one a11y issue, and it's related to the overline color.
            // This is a known issue across our design system, and we are ok accepting this for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
} as Meta;

// Create a basic slide
const createBasicSlide = (index: number) => (
  <div
    style={{
      height: '250px',
      width: '100%',
      background: '#EEE',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
    }}
    key={index}
  >
    <div style={{margin: '0 auto'}}>
      <Heading2>This is slide {index.toString()}</Heading2>
    </div>
  </div>
);

//
// TEMPLATES
//
const SingleTemplate: StoryFn<CarouselProps> = componentArg => (
  <div style={{maxWidth: '800px', margin: '0 auto'}}>
    <Carousel {...componentArg} key={componentArg.carouselId} />
  </div>
);

const MultipleTemplate: StoryFn<{components: CarouselProps[]}> = args => (
  <>
    {args.components?.map((componentArg, index) => (
      <div
        style={{maxWidth: '800px', margin: '0 auto', marginBlock: '2rem'}}
        key={index}
      >
        <Carousel {...componentArg} key={componentArg.carouselId} />
      </div>
    ))}
  </>
);

//
// STORIES
//
export const DefaultCarousel = SingleTemplate.bind({});
DefaultCarousel.args = {
  slides: Array.from({length: 6}, (_, index) => ({
    id: `default-slide-${index + 1}`,
    slide: createBasicSlide(index + 1),
  })),
};
DefaultCarousel.parameters = {
  docs: {
    description: {
      story:
        "This is the default carousel with navigation arrow buttons and pagination. Carousels are inside a 800px container so we can see the navigation arrow buttons in Storybook, but the default width of the carousel is 100% to fit whatever container it lives in. Navigation arrow buttons are on the outside of the container so the carousel content is the same width as the rest of the pages's content.",
    },
  },
  eyes: {waitBeforeCapture: 4000},
};
// There are no unit (Jest) tests for this component because there are
// integration issues between Swiper and Jest, and we can cover what we
// need using Storybook play functions and Eyes tests.
// See https://codedotorg.atlassian.net/browse/CMS-361 for more context.
DefaultCarousel.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = canvas.getByLabelText('Previous slide');
  const navArrowNext = canvas.getByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2', 'Go to slide 3'];
  const slides = [
    'This is slide 1',
    'This is slide 2',
    'This is slide 3',
    'This is slide 4',
    'This is slide 5',
    'This is slide 6',
  ];

  // check that slides are in the carousel
  for (const slideText of slides) {
    const heading = await canvas.findByText(slideText);
    await expect(heading).toBeInTheDocument();
  }

  // check that the next nav arrow is showing and working
  await expect(navArrowNext).toBeInTheDocument();
  // click to the next slide group
  await userEvent.click(navArrowNext);
  // click to the end of the carousel
  await userEvent.click(navArrowNext);

  // check that the previous nav arrow is showing and working
  await expect(navArrowPrev).toBeInTheDocument();
  // click to the previous slide group
  await userEvent.click(navArrowPrev);
  // click to the beginning of the carousel
  await userEvent.click(navArrowPrev);

  // check that the pagination dots are showing
  for (const dotLabel of paginationDots) {
    const dot = await canvas.findByLabelText(dotLabel);
    await expect(dot).toBeInTheDocument();
  }

  // check that pagination dots are working
  const paginationDotOne = canvas.getByLabelText(paginationDots[0]);
  const paginationDotTwo = canvas.getByLabelText(paginationDots[1]);
  const paginationDotThree = canvas.getByLabelText(paginationDots[2]);
  // click pagination dot 1
  await userEvent.click(paginationDotOne);
  // click pagination dot 2
  await userEvent.click(paginationDotTwo);
  // click pagination dot 3
  await userEvent.click(paginationDotThree);
  // go back to beginning of the carousel
  await userEvent.click(paginationDotOne);
};

export const CarouselWithoutNavArrows = SingleTemplate.bind({});
CarouselWithoutNavArrows.args = {
  showNavArrows: false,
  slides: Array.from({length: 6}, (_, index) => ({
    id: `default-slide-${index + 1}`,
    slide: createBasicSlide(index + 1),
  })),
};
CarouselWithoutNavArrows.parameters = {
  docs: {
    description: {
      story:
        'This carousel does not show navigation arrow buttons, but will always show pagination dots. Navigation arrow buttons are also automatically hidden when the screen size is < 1024px.',
    },
  },
};
CarouselWithoutNavArrows.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = canvas.queryByLabelText('Previous slide');
  const navArrowNext = canvas.queryByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2', 'Go to slide 3'];

  // check that the navigation arrows are not showing
  await expect(navArrowPrev).not.toBeInTheDocument();
  await expect(navArrowNext).not.toBeInTheDocument();

  // check that the pagination dots are showing
  for (const dotLabel of paginationDots) {
    const dot = await canvas.findByLabelText(dotLabel);
    await expect(dot).toBeInTheDocument();
  }
};

export const CarouselWithTouchMove = SingleTemplate.bind({});
CarouselWithTouchMove.args = {
  allowTouchMove: true,
  slides: Array.from({length: 6}, (_, index) => ({
    id: `default-slide-${index + 1}`,
    slide: createBasicSlide(index + 1),
  })),
};
CarouselWithTouchMove.parameters = {
  docs: {
    description: {
      story:
        'This carousel allows slides to be moved by dragging/touching using the `allowTouchMove` prop. This is disabled by default and should not be used with Video carousels since it impedes the video player controls.',
    },
  },
};
CarouselWithTouchMove.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = canvas.queryByLabelText('Previous slide');
  const navArrowNext = canvas.queryByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2', 'Go to slide 3'];
  const slides = [
    'This is slide 1',
    'This is slide 2',
    'This is slide 3',
    'This is slide 4',
    'This is slide 5',
    'This is slide 6',
  ];

  // check that the navigation arrows are showing
  await expect(navArrowPrev).toBeInTheDocument();
  await expect(navArrowNext).toBeInTheDocument();

  // check that the pagination dots are showing
  for (const dotLabel of paginationDots) {
    const dot = await canvas.findByLabelText(dotLabel);
    await expect(dot).toBeInTheDocument();
  }

  // check that slides are in the carousel
  for (const slideText of slides) {
    const heading = await canvas.findByText(slideText);
    await expect(heading).toBeInTheDocument();
  }
};

export const CarouselWithCustomSlidesPerView = SingleTemplate.bind({});
CarouselWithCustomSlidesPerView.args = {
  slidesPerView: 3,
  slidesPerGroup: 3,
  slides: Array.from({length: 6}, (_, index) => ({
    id: `default-slide-${index + 1}`,
    slide: createBasicSlide(index + 1),
  })),
};
CarouselWithCustomSlidesPerView.parameters = {
  docs: {
    description: {
      story:
        'This carousel shows three slides per view, and three slides per group. This can be changed with the `slidesPerView` and `slidesPerGroup` props. These can be changed to be as little as one slide per view and group to show one individual slide at a time. All carousels will show one slide at a time on mobile, and two slides per view and group when screen size is >= 768px. This prop applies to screens that are >= 1024px only.',
    },
  },
};
CarouselWithCustomSlidesPerView.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = canvas.queryByLabelText('Previous slide');
  const navArrowNext = canvas.queryByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2'];
  const paginationDotThree = canvas.queryByLabelText('Go to slide 3');
  const slides = [
    'This is slide 1',
    'This is slide 2',
    'This is slide 3',
    'This is slide 4',
    'This is slide 5',
    'This is slide 6',
  ];

  // check that the navigation arrows are showing
  await expect(navArrowPrev).toBeInTheDocument();
  await expect(navArrowNext).toBeInTheDocument();

  // check that two pagination dots are showing
  for (const dotLabel of paginationDots) {
    const dot = await canvas.findByLabelText(dotLabel);
    await expect(dot).toBeInTheDocument();
  }

  // check that the third pagination dot is not showing
  await expect(paginationDotThree).not.toBeInTheDocument();

  // check that slides are in the carousel
  for (const slideText of slides) {
    const heading = await canvas.findByText(slideText);
    await expect(heading).toBeInTheDocument();
  }
};

export const ActionBlockCarousel = SingleTemplate.bind({});
const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam.';
const DESCRIPTION_MED =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus vitae massa semper aliquam quis mattis quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
ActionBlockCarousel.args = {
  allowTouchMove: true,
  slidesPerView: 3,
  slidesPerGroup: 3,
  slides: [
    {
      id: 'action-block-slide-1',
      slide: (
        <ActionBlock
          title="Action Block 1"
          description={DESCRIPTION}
          image={{src: image1}}
          overline={'Overline 1'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
    {
      id: 'action-block-slide-2',
      slide: (
        <ActionBlock
          title="Action Block 2"
          description={DESCRIPTION_MED}
          image={{src: image2}}
          overline={'Overline 2'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
    {
      id: 'action-block-slide-3',
      slide: (
        <ActionBlock
          title="Action Block 3"
          description={DESCRIPTION}
          image={{src: image3}}
          overline={'Overline 3'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
    {
      id: 'action-block-slide-4',
      slide: (
        <ActionBlock
          title="Action Block 4"
          description={DESCRIPTION_MED}
          image={{src: image4}}
          overline={'Overline 4'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
    {
      id: 'action-block-slide-5',
      slide: (
        <ActionBlock
          title="Action Block 5"
          description={DESCRIPTION}
          image={{src: image5}}
          overline={'Overline 5'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
    {
      id: 'action-block-slide-6',
      slide: (
        <ActionBlock
          title="Action Block 6"
          description={DESCRIPTION_MED}
          image={{src: image6}}
          overline={'Overline 6'}
          primaryButton={{
            text: 'Primary Button',
            href: '#',
          }}
        />
      ),
    },
  ],
};
ActionBlockCarousel.parameters = {
  docs: {
    description: {
      story:
        'Use action blocks in carousels to display a series of related cards. Carousels are recommended for sections with 4+ action blocks.',
    },
  },
};
ActionBlockCarousel.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = await canvas.findAllByLabelText('Previous slide');
  const navArrowNext = await canvas.findAllByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2'];
  const actionBlockTitles = [
    'Action Block 1',
    'Action Block 2',
    'Action Block 3',
    'Action Block 4',
    'Action Block 5',
    'Action Block 6',
  ];

  // check that the navigation arrows are showing on both carousels
  navArrowPrev.forEach(prevArrow => expect(prevArrow).toBeInTheDocument());
  navArrowNext.forEach(nextArrow => expect(nextArrow).toBeInTheDocument());

  // check that the pagination dots are showing on both carousels
  for (const dotLabel of paginationDots) {
    const dots = await canvas.findAllByLabelText(dotLabel);
    dots.forEach(dot => expect(dot).toBeInTheDocument());
  }

  // check that action blocks are visible in both carousels
  for (const title of actionBlockTitles) {
    const actionBlock = await canvas.findByText(title);
    expect(actionBlock).toBeVisible();
  }
};

export const VideoCarousels = MultipleTemplate.bind({});
VideoCarousels.args = {
  components: [
    {
      slides: [
        {
          id: 'video-slide-1',
          slide: (
            <Video
              videoTitle="Generative AI: Input & Pre-training"
              youTubeId="JO9MgO1Zp3E"
              showCaption={true}
            />
          ),
        },
        {
          id: 'video-slide-2',
          slide: (
            <Video
              videoTitle="Generative AI: Storage & Embeddings"
              youTubeId="s1fhxAVpYx8"
              showCaption={true}
            />
          ),
        },
        {
          id: 'video-slide-3',
          slide: (
            <Video
              videoTitle="Generative AI: Processing & Neural Networks"
              youTubeId="Z7Mes_Ej69Y"
              showCaption={true}
            />
          ),
        },
        {
          id: 'video-slide-4',
          slide: (
            <Video
              videoTitle="Generative AI: Attention"
              youTubeId="2RdK6k45koY"
              showCaption={true}
            />
          ),
        },
      ],
    },
    {
      slides: [
        {
          id: 'video-slide-no-caption-1',
          slide: (
            <Video
              videoTitle="Generative AI: Input & Pre-training"
              youTubeId="JO9MgO1Zp3E"
              showCaption={false}
            />
          ),
        },
        {
          id: 'video-slide-no-caption-6',
          slide: (
            <Video
              videoTitle="Generative AI: Storage & Embeddings"
              youTubeId="s1fhxAVpYx8"
              showCaption={false}
            />
          ),
        },
        {
          id: 'video-slide-no-caption-7',
          slide: (
            <Video
              videoTitle="Generative AI: Processing & Neural Networks"
              youTubeId="Z7Mes_Ej69Y"
              showCaption={false}
            />
          ),
        },
        {
          id: 'video-slide-no-caption-8',
          slide: (
            <Video
              videoTitle="Generative AI: Attention"
              youTubeId="2RdK6k45koY"
              showCaption={false}
            />
          ),
        },
      ],
    },
  ],
};
VideoCarousels.parameters = {
  docs: {
    description: {
      story:
        'Videos carousels can show or hide captions based on the `showCaption` prop on the `Video` component. There are margins applied between carousels so this displays nicely in Storybook, but this is not a part of the component itself.',
    },
  },
  eyes: {
    waitBeforeCapture: 4000,
    ignoreRegions: [{selector: '.ytp-impression-link'}],
  },
};
VideoCarousels.play = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = await canvas.findAllByLabelText('Previous slide');
  const navArrowNext = await canvas.findAllByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2'];
  const videoTitles = [
    'Generative AI: Input & Pre-training',
    'Generative AI: Storage & Embeddings',
    'Generative AI: Processing & Neural Networks',
    'Generative AI: Attention',
  ];

  // check that the navigation arrows are showing on both carousels
  navArrowPrev.forEach(prevArrow => expect(prevArrow).toBeInTheDocument());
  navArrowNext.forEach(nextArrow => expect(nextArrow).toBeInTheDocument());

  // check that the pagination dots are showing on both carousels
  for (const dotLabel of paginationDots) {
    const dots = await canvas.findAllByLabelText(dotLabel);
    dots.forEach(dot => expect(dot).toBeInTheDocument());
  }

  // check that videos are visible in both carousels
  for (const videoTitle of videoTitles) {
    const videos = await canvas.findAllByLabelText(`Play video ${videoTitle}`);
    videos.forEach(video => expect(video).toBeVisible());
  }
};

export const ImageCarousel = SingleTemplate.bind({});
ImageCarousel.args = {
  slides: [
    {
      id: 'image-slide-1',
      slide: (
        <img
          src="https://code.org/images/cs-stats/Slide1_Schools_Teach.png"
          style={{width: '100%'}}
          alt="Slide 1"
        />
      ),
    },
    {
      id: 'image-slide-2',
      slide: (
        <img
          src="https://code.org/images/cs-stats/Slide2_STEM_CS.png"
          style={{width: '100%'}}
          alt="Slide 2"
        />
      ),
    },
    {
      id: 'image-slide-3',
      slide: (
        <img
          src="https://code.org/images/cs-stats/Slide_Students_Like_CS.png"
          style={{width: '100%'}}
          alt="Slide 3"
        />
      ),
    },
    {
      id: 'image-slide-4',
      slide: (
        <img
          src="https://code.org/images/cs-stats/Slide3_Diversity_K12.png"
          style={{width: '100%'}}
          alt="Slide 4"
        />
      ),
    },
  ],
};
ImageCarousel.play = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);
  const navArrowPrev = canvas.getByLabelText('Previous slide');
  const navArrowNext = canvas.getByLabelText('Next slide');
  const paginationDots = ['Go to slide 1', 'Go to slide 2'];
  const imageSlides = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];

  // check that the navigation arrows are showing
  await expect(navArrowPrev).toBeInTheDocument();
  await expect(navArrowNext).toBeInTheDocument();

  // check that the pagination dots are showing
  for (const dotLabel of paginationDots) {
    const dot = await canvas.findByLabelText(dotLabel);
    await expect(dot).toBeInTheDocument();
  }

  // check that images are visible in carousel
  for (const imageSlide of imageSlides) {
    const image = await canvas.findByAltText(imageSlide);
    await expect(image).toBeVisible();
  }
};
