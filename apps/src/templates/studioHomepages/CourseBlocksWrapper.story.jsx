import React from 'react';
import CourseBlocksWrapper from './CourseBlocksWrapper';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';
import {
  TeacherGradeBandCards,
  ToolsCards,
  ToolsAIExtrasCard,
} from '@cdo/apps/util/courseBlockCardsConstants';

export default {
  title: 'CourseBlocksWrapper',
  component: CourseBlocksWrapper,
};

// Template
const Template = args => (
  <Provider store={reduxStore()}>
    <CourseBlocksWrapper {...args} />
  </Provider>
);

export const CardsWithLinkAndDescription = Template.bind({});
CardsWithLinkAndDescription.args = {
  cards: TeacherGradeBandCards,
  heading: 'Course Blocks Title',
  description: 'Descriptions of these cards and their relevance',
  link: '/test/link',
  linkText: 'View more of these cards',
  hideBottomMargin: false,
};

export const CardsWithOnlyLink = Template.bind({});
CardsWithOnlyLink.args = {
  cards: TeacherGradeBandCards,
  link: '/test/link',
  linkText: 'View more of these cards',
  hideBottomMargin: false,
};

export const CardsWithOnlyDescription = Template.bind({});
CardsWithOnlyDescription.args = {
  cards: TeacherGradeBandCards,
  heading: 'Course Blocks Title',
  description: 'Descriptions of these cards and their relevance',
  hideBottomMargin: false,
};

export const CardsWithoutBottomMarginAndLinkAndDescription = Template.bind({});
CardsWithoutBottomMarginAndLinkAndDescription.args = {
  cards: TeacherGradeBandCards,
  hideBottomMargin: true,
};

export const ManyCardsWithDescription = Template.bind({});
ManyCardsWithDescription.args = {
  cards: ToolsCards.concat(ToolsAIExtrasCard),
  heading: 'Course Blocks Title',
  description: 'Descriptions of these cards and their relevance',
  hideBottomMargin: true,
};
