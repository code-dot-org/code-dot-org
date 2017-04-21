import React from 'react';
import RecentCourses from './RecentCourses';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';

const EXAMPLE_CARD_DATA = {
  courseName: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to wherever you want the button to go...",
  assignedSections: []
};

export default storybook => {
  return storybook
    .storiesOf('RecentCourses', module)
    .addStoryTable([
      {
        name: 'Recent Courses - 2 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCourses>
            <CourseCard cardData={EXAMPLE_CARD_DATA}/>
            <CourseCard cardData={EXAMPLE_CARD_DATA}/>
          </RecentCourses>
        )
      },
      {
        name: 'Recent Courses - 1 course ',
        description: `Recent courses when the teacher has sections enrolled in only 1 course.`,
        story: () => (
          <RecentCourses>
            <CourseCard cardData={EXAMPLE_CARD_DATA}/>
          </RecentCourses>
        )
      },
      {
        name: 'Recent Courses - 0 courses ',
        description: `Recent courses when the teacher has not yet enrolled any sections in a course.`,
        story: () => (
          <RecentCourses>
            <SetUpMessage type="courses"/>
          </RecentCourses>
        )
      },
    ]);
};
