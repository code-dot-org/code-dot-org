import React from 'react';
import RecentCourses from './RecentCourses';

export default storybook => {
  return storybook
    .storiesOf('RecentCourses', module)
    .addStoryTable([
      {
        name: "Recent Courses - no courses yet",
        description: "If the teacher does not have any recent courses, there will be a set up message encouraging them to learn more about courses.",
        story: () => (
          <RecentCourses/>
        )
      },
      {
        name: 'Recent Courses - 1 course ',
        description: `Collapsible section that holds Recent Courses when the teacher has sections enrolled in only 1 course.`,
        story: () => (
          <RecentCourses
            courseName1="Play Lab"
            description1="Create a story or make a game with Play Lab!"
            link1="https://code.org/playlab"
            image1="photo source"
            assignedSections1={["Section 1"]}
          />
        )
      },
      {
        name: 'Recent Courses - 2 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCourses
            courseName1="Play Lab"
            description1="Create a story or make a game with Play Lab!"
            link1="https://code.org/playlab"
            image1="photo source"
            assignedSections1={["Section 1"]}
            courseName2="CSP Unit 2 - Digital Information"
            description2="Explore how more complex digital information is represented and manipulated through computation and visualization"
            link2="https://curriculum.code.org/csp/unit2/"
            image2="photo source"
            assignedSections2={[]}
          />
        )
      },
    ]);
};
