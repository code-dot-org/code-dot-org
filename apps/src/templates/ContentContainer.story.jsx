import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import ContentContainer from './ContentContainer';
import CourseCard from './studioHomepages/CourseCard';

export default {
  component: ContentContainer,
};

// ContentContainer is a generic component that will render whatever child components are passed to it.  CourseCards are used here as an example because it was first built to render them for the Teacher Homepage.

const exampleCard = {
  title: 'CSP Unit 2 - Digital Information',
  description:
    'Explore how more complex digital information is represented and manipulated through computation and visualization',
  link: 'https://curriculum.code.org/csp/unit2/',
};

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <ContentContainer {...args}>
      <CourseCard
        title={exampleCard.title}
        description={exampleCard.description}
        image={exampleCard.image}
        link={exampleCard.link}
      />
      <CourseCard
        title={exampleCard.title}
        description={exampleCard.description}
        image={exampleCard.image}
        link={exampleCard.link}
      />
    </ContentContainer>
  </Provider>
);

//
// STORIES
//

export const WithoutLink = Template.bind({});
WithoutLink.args = {
  heading: 'Recent Courses',
};

export const WithLink = Template.bind({});
WithLink.args = {
  heading: 'Recent Courses',
  linkText: 'View all courses',
  link: '/courses',
  showLink: true,
};

export const WithLinkAndDescription = Template.bind({});
WithLinkAndDescription.args = {
  heading: 'Recent Courses',
  linkText: 'View all courses',
  link: '/courses',
  showLink: true,
  description: 'These are courses that you have worked on recently',
};
