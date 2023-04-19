import React from 'react';
import Typography from './index';

export default {
  title: 'Typography Component',
  component: Typography
};

const DEFAULT_PROPS = {
  semanticTag: 'h1',
  visualApproach: 'heading-xxl',
  children: 'H1 as H1. This is a Typography Component.'
};

//
// TEMPLATE
//
const Template = args => <Typography {...DEFAULT_PROPS} {...args} />;

//
// STORIES
//
export const Default = Template.bind({});

export const Heading1asHeading3 = Template.bind({});
Heading1asHeading3.args = {
  semanticTag: 'h1',
  visualApproach: 'heading-lg',
  children: 'This is a Typography Component. (H1 as H3)'
};

export const Heading3asHeading5 = Template.bind({});
Heading3asHeading5.args = {
  semanticTag: 'h3',
  visualApproach: 'heading-sm',
  children: 'This is a Typography Component. (H3 as H5)'
};

export const Heading2asBodyOne = Template.bind({});
Heading2asBodyOne.args = {
  semanticTag: 'h2',
  visualApproach: 'body-one',
  children: 'This is a Typography Component. (H2 as p.body-one)'
};

export const Heading1 = Template.bind({});
Heading1.args = {
  semanticTag: 'h1',
  visualApproach: 'heading-xxl',
  children: 'This is a Typography Component. (H1)'
};

export const Heading2 = Template.bind({});
Heading2.args = {
  semanticTag: 'h2',
  visualApproach: 'heading-xl',
  children: 'This is a Typography Component. (H2)'
};

export const Heading3 = Template.bind({});
Heading3.args = {
  semanticTag: 'h3',
  visualApproach: 'heading-lg',
  children: 'This is a Typography Component. (H3)'
};

export const Heading4 = Template.bind({});
Heading4.args = {
  semanticTag: 'h4',
  visualApproach: 'heading-md',
  children: 'This is a Typography Component. (H4)'
};

export const Heading5 = Template.bind({});
Heading5.args = {
  semanticTag: 'h5',
  visualApproach: 'heading-sm',
  children: 'This is a Typography Component. (H5)'
};

export const Heading6 = Template.bind({});
Heading6.args = {
  semanticTag: 'h6',
  visualApproach: 'heading-xs',
  children: 'This is a Typography Component. (H6)'
};

export const BodyOne = Template.bind({});
BodyOne.args = {
  semanticTag: 'p',
  visualApproach: 'body-one',
  children: 'This is a Typography Component. (p.body-one)'
};

export const BodyTwo = Template.bind({});
BodyTwo.args = {
  semanticTag: 'p',
  visualApproach: 'body-two',
  children: 'This is a Typography Component. (p.body-two)'
};

export const OverlineText = Template.bind({});
OverlineText.args = {
  semanticTag: 'p',
  visualApproach: 'overline',
  children: 'This is a Typography Component. (p.overline)'
};

export const StrongText = Template.bind({});
StrongText.args = {
  semanticTag: 'strong',
  visualApproach: 'strong',
  children: 'This is a Typography Component. (strong)'
};

export const EmText = Template.bind({});
EmText.args = {
  semanticTag: 'em',
  visualApproach: 'em',
  children: 'This is a Typography Component. (em)'
};

export const FigcaptionText = Template.bind({});
FigcaptionText.args = {
  semanticTag: 'figcaption',
  visualApproach: 'figcaption',
  children: 'This is a Typography Component. (figcaption)'
};
