import React from 'react';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';

const exampleCard = {
  name: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  link: "https://curriculum.code.org/csp/unit2/",
};

// ContentContainer is a generic component that will render whatever child components are passed to it.  CourseCards are used here as an example because it was first built to render them for the Teacher Homepage.

export default storybook => {
  return storybook
    .storiesOf('ContentContainer', module)
    .addStoryTable([
      {
        name: 'no link',
        description: 'Example ContentContainer without a link',
        story: () => (
          <ContentContainer
            heading="Recent Courses"
            isRtl={false}
          >
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              isRtl={false}
            />
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              isRtl={false}
            />
          </ContentContainer>
        )
      },
      {
        name: 'link',
        description: `Example ContentContainer with a link`,
        story: () => (
          <ContentContainer
            heading="Recent Courses"
            linkText="View all courses"
            link="link to see all of the courses"
            showLink={true}
            isRtl={false}
          >
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              isRtl={false}
            />
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              isRtl={false}
            />
        </ContentContainer>
        )
      },
    ]);
};
