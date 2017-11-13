import React from 'react';
import ContentContainer from './ContentContainer';
import CourseCard from './studioHomepages/CourseCard';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../code-studio/responsiveRedux';
import isRtl from '../code-studio/isRtlRedux';

const exampleCard = {
  title: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  link: "https://curriculum.code.org/csp/unit2/",
};

// ContentContainer is a generic component that will render whatever child components are passed to it.  CourseCards are used here as an example because it was first built to render them for the Teacher Homepage.

export default storybook => {
  const store = createStore(combineReducers({responsive, isRtl}));
  return storybook
    .storiesOf('ContentContainer', module)
    .addStoryTable([
      {
        name: 'no link',
        description: 'Example ContentContainer without a link',
        story: () => (
          <Provider store={store}>
            <ContentContainer
              heading="Recent Courses"
            >
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
            </ContentContainer>
          </Provider>
        )
      },
      {
        name: 'link',
        description: `Example ContentContainer with a link`,
        story: () => (
          <Provider store={store}>
            <ContentContainer
              heading="Recent Courses"
              linkText="View all courses"
              link="link to see all of the courses"
              showLink={true}
            >
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
            </ContentContainer>
          </Provider>
        )
      },
      {
        name: 'link and description',
        description: `Example ContentContainer with a link and description`,
        story: () => (
          <Provider store={store}>
            <ContentContainer
              heading="Recent Courses"
              linkText="View all courses"
              link="link to see all of the courses"
              showLink={true}
              description="These are courses that you have worked on recently"
            >
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
              <CourseCard
                title={exampleCard.title}
                description={exampleCard.description}
                image={exampleCard.image}
                link={exampleCard.link}
                isRtl={false}
              />
            </ContentContainer>
          </Provider>
        )
      },
    ]);
};
