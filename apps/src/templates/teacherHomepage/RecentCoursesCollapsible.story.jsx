import React from 'react';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';

export default storybook => {
  return storybook
    .storiesOf('RecentCoursesCollapsible', module)
    .addStoryTable([
      {
        name: "Recent Courses - no courses yet",
        description: "If the teacher does not have any recent courses, there will be a set up message encouraging them to learn more about courses.",
        story: () => (
          <RecentCoursesCollapsible
            courses={[]}
<<<<<<< HEAD
            showAllCoursesLink={true}
=======
            urlPrefix="http://localhost:3000/"
            studioUrlPrefix="http://localhost-studio.code.org:3000/"
>>>>>>> 74b8d2c96e... Relative links for RecentCoursesCollapsible
          />
        )
      },
      {
        name: 'Recent Courses - 1 course ',
        description: `Collapsible section that holds Recent Courses when the teacher has sections enrolled in only 1 course.`,
        story: () => (
          <RecentCoursesCollapsible
            courses= {[{
              courseName: "Play Lab",
              description: "Create a story or make a game with Play Lab!",
              link: "https://code.org/playlab",
              image:"photo source",
              assignedSections: ["Section 1"]
            }]}
<<<<<<< HEAD
            showAllCoursesLink={true}
=======
            urlPrefix="http://localhost:3000/"
            studioUrlPrefix="http://localhost-studio.code.org:3000/"
>>>>>>> 74b8d2c96e... Relative links for RecentCoursesCollapsible
          />
        )
      },
      {
        name: 'Recent Courses - 2 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCoursesCollapsible
            courses= {[
              {
                courseName: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
            ]}
<<<<<<< HEAD
            showAllCoursesLink={true}
=======
            urlPrefix="http://localhost:3000/"
            studioUrlPrefix="http://localhost-studio.code.org:3000/"
>>>>>>> 74b8d2c96e... Relative links for RecentCoursesCollapsible
          />
        )
      },
      {
        name: 'Recent Courses - 3 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCoursesCollapsible
            courses= {[
              {
                courseName: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
            ]}
            showAllCoursesLink={true}
          />
        )
      },
      {
        name: 'Recent Courses - 4 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCoursesCollapsible
            courses= {[
              {
                courseName: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
              {
                courseName: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
                image:"photo source",
                assignedSections: ["Section 1"]
              },
            ]}
            showAllCoursesLink={false}
          />
        )
      },
    ]);
};
