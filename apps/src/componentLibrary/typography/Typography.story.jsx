import React from 'react';
import Typography from './index';

export default {
  title: 'DesignSystem/Typography Component',
  component: Typography,
};

//
// TEMPLATE
//
const MultipleTemplate = (args = []) => (
  <>
    {args.components?.map(componentArg => (
      <Typography
        key={`${componentArg.semanticTag}-${componentArg.visualAppearance}`}
        semanticTag={componentArg.semanticTag}
        visualAppearance={componentArg.visualAppearance}
      >
        {componentArg.children}
      </Typography>
    ))}
  </>
);

//
// Arrays of grouped Typography elements
//
const headingComponents = [
  {
    semanticTag: 'h1',
    visualAppearance: 'heading-xxl',
    children: 'This is a Typography Component. (H1)',
  },
  {
    semanticTag: 'h2',
    visualAppearance: 'heading-xl',
    children: 'This is a Typography Component. (H2)',
  },
  {
    semanticTag: 'h3',
    visualAppearance: 'heading-lg',
    children: 'This is a Typography Component. (H3)',
  },
  {
    semanticTag: 'h4',
    visualAppearance: 'heading-md',
    children: 'This is a Typography Component. (H4)',
  },
  {
    semanticTag: 'h5',
    visualAppearance: 'heading-sm',
    children: 'This is a Typography Component. (H5)',
  },
  {
    semanticTag: 'h6',
    visualAppearance: 'heading-xs',
    children: 'This is a Typography Component. (H6)',
  },
];

const bodyTextComponents = [
  {
    semanticTag: 'p',
    visualAppearance: 'body-one',
    children: 'This is a Typography Component. (body-one)',
  },
  {
    displayName: 'BodyTwoText',
    semanticTag: 'p',
    visualAppearance: 'body-two',
    children: 'This is a Typography Component. (body-two)',
  },
  {
    semanticTag: 'p',
    visualAppearance: 'body-three',
    children: 'This is a Typography Component. (body-three)',
  },
  {
    semanticTag: 'p',
    visualAppearance: 'body-four',
    children: 'This is a Typography Component. (body-four)',
  },
];

const overlineTextComponents = [
  {
    semanticTag: 'p',
    visualAppearance: 'overline-one',
    children: 'This is a Typography Component. (overline-one)',
  },
  {
    semanticTag: 'p',
    visualAppearance: 'overline-two',
    children: 'This is a Typography Component. (overline-two)',
  },
  {
    semanticTag: 'p',
    visualAppearance: 'overline-three',
    children: 'This is a Typography Component. (overline-three)',
  },
];

const otherTextComponents = [
  {
    semanticTag: 'em',
    visualAppearance: 'em',
    children: 'This is a Typography Component. (em)',
  },
  {
    semanticTag: 'strong',
    visualAppearance: 'strong',
    children: 'This is a Typography Component. (strong)',
  },
  {
    semanticTag: 'strong',
    visualAppearance: 'extra-strong',
    children: 'This is a Typography Component. (extra-strong)',
  },
  {
    semanticTag: 'figcaption',
    visualAppearance: 'figcaption',
    children: 'This is a Typography Component. (figcaption)',
  },
];

//
// STORIES
//
export const AllTypographyElements = MultipleTemplate.bind({});
AllTypographyElements.args = {
  components: [
    ...headingComponents,
    ...bodyTextComponents,
    ...overlineTextComponents,
    ...otherTextComponents,
  ],
};

export const Headings = MultipleTemplate.bind({});
Headings.args = {
  components: [...headingComponents],
};

export const BodyTexts = MultipleTemplate.bind({});
BodyTexts.args = {
  components: [...bodyTextComponents],
};

export const OverlineTexts = MultipleTemplate.bind({});
OverlineTexts.args = {
  components: [...overlineTextComponents],
};

export const OtherTexts = MultipleTemplate.bind({});
OtherTexts.args = {
  components: [...otherTextComponents],
};

export const CustomUsageExamples = MultipleTemplate.bind({});
CustomUsageExamples.args = {
  components: [
    {
      semanticTag: 'h1',
      visualAppearance: 'heading-lg',
      children:
        '(Heading1 as Heading3) This is a Typography Component. (H1 as H3)',
    },
    {
      semanticTag: 'h2',
      visualAppearance: 'body-one',
      children:
        '(Heading2 as body-one) This is a Typography Component. (H2 as p.body-one)',
    },
    {
      semanticTag: 'h3',
      visualAppearance: 'heading-sm',
      children:
        '(Heading3 as Heading5) This is a Typography Component. (H3 as H5)',
    },
  ],
};
