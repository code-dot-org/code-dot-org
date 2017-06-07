import React from 'react';
import ContentBox from './ContentBox';
import CourseCard from './CourseCard';

const exampleCard = {
  name: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to the course",
  assignedSections: []
};

// ContentBox is a generic component that will render whatever child components are passed to it.  CourseCards are used here as an example because it was first built to render them for the Teacher Homepage.

export default storybook => {
  return storybook
    .storiesOf('ContentBox', module)
    .addStoryTable([
      {
        name: 'no link',
        description: 'Example CollapsibleSection without a link',
        story: () => (
          <ContentBox
            heading="Recent Courses"
          >
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
          </ContentBox>
        )
      },
      {
        name: 'link',
        description: `Example CollapsibleSection with a link`,
        story: () => (
          <ContentBox
            heading="Recent Courses"
            linkText="View all courses"
            link="link to see all of the courses"
          >
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
            <CourseCard
              name={exampleCard.name}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
        </ContentBox>
        )
      },
    ]);
};
