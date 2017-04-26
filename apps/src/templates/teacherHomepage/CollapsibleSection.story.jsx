import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';

const exampleCard = {
  courseName: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to the course",
  assignedSections: []
};

export default storybook => {
  return storybook
    .storiesOf('CollapsibleSections', module)
    .addStoryTable([
      {
        name: 'Recent Courses - 2 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <CollapsibleSection
            header="Recent Courses"
            linkText="View all courses"
            link="link to see all of the courses"
          >
            <CourseCard
              courseName={exampleCard.courseName}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
            <CourseCard
              courseName={exampleCard.courseName}
              description={exampleCard.description}
              image={exampleCard.image}
              link={exampleCard.link}
              assignedSections={exampleCard.assignedSections}
            />
          </CollapsibleSection>
        )
      },
      {
        name: 'Recent Courses - 1 course ',
        description: `Collapsible section that holds Recent Courses when the teacher has sections enrolled in only 1 course.`,
        story: () => (
          <CollapsibleSection
            header="Recent Courses"
            linkText="View all courses"
            link="link to see all of the courses"
          >
          <CourseCard
            courseName={exampleCard.courseName}
            description={exampleCard.description}
            image={exampleCard.image}
            link={exampleCard.link}
            assignedSections={exampleCard.assignedSections}
          />
          </CollapsibleSection>
        )
      },
      {
        name: 'Recent Courses - 0 courses ',
        description: `Collapsible section that holds Recent Courses when the teacher has not yet enrolled any sections in a course.`,
        story: () => (
          <CollapsibleSection
            header="Recent Courses"
            linkText="View all courses"
            link="link to see all of the courses"
          >
            <SetUpMessage type="courses"/>
          </CollapsibleSection>
        )
      },
      {
        name: 'Manage Sections - No sections yet',
        description: `Collapsible section that holds Manage Sections when the teacher does not yet have any sections to manage.`,
        story: () => (
          <CollapsibleSection
            header="Manage Sections"
            linkText="Add new section"
            link="link to add a new section"
          >
            <SetUpMessage type="sections"/>
          </CollapsibleSection>
        )
      },
      {
        name: 'Manage Sections',
        description: `Collapsible section that holds the Manage Sections Table.`,
        story: () => (
          <CollapsibleSection
            header="Manage Sections"
            linkText="Add new section"
            link="link to add a new section"
          >
            <div>The new and improved Manage Sections React table will be here!</div>
          </CollapsibleSection>
        )
      },
      {
        name: 'Announcements & News',
        description: `Collapsible section that holds Announcements & News`,
        story: () => (
          <CollapsibleSection
            header="Announcements & News"
            linkText="View all announcements"
            link="link to see all of the announcements"
          >
            <div>Annoucements and news will be displayed here!</div>
          </CollapsibleSection>
        )
      },
    ]);
};
