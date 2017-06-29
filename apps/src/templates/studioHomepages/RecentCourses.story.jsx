import React from 'react';
import RecentCourses from './RecentCourses';

export default storybook => {
  return storybook
    .storiesOf('RecentCourses', module)
    .addStoryTable([
      {
        name: "Recent Courses - Teacher, no courses yet",
        description: "If the teacher does not have any recent courses, there will be a set up message encouraging them to learn more about courses.",
        story: () => (
          <RecentCourses
            courses={[]}
            showAllCoursesLink={true}
            heading="Courses"
            isTeacher={true}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Teacher, 1 course ',
        description: ` Recent Courses when the teacher has sections enrolled in only 1 course or they have progress in only one.`,
        story: () => (
          <RecentCourses
            courses= {[{
              name: "Play Lab",
              description: "Create a story or make a game with Play Lab!",
              link: "https://code.org/playlab",
            }]}
            showAllCoursesLink={true}
            heading="Courses"
            isTeacher={true}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Teacher, 2 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={true}
            heading="Courses"
            isTeacher={true}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Teacher, 3 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={true}
            heading="Courses"
            isTeacher={true}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Teacher, 4 courses ',
        description: `Recent courses when the teacher has sections enrolled in at least 2 courses.`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={false}
            heading=" My Courses"
            isTeacher={true}
            isRtl={false}
          />
        )
      },
      {
        name: "Recent Courses - Student, no courses yet",
        description: "If the student doesn't have any progress in a course or script yet.",
        story: () => (
          <RecentCourses
            courses={[]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Student, 1 course ',
        description: ` Recent Courses when the student has progress in one course or script.`,
        story: () => (
          <RecentCourses
            courses= {[{
              name: "Play Lab",
              description: "Create a story or make a game with Play Lab!",
              link: "https://code.org/playlab",
            }]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Student, 2 courses ',
        description: `Recent courses when the student has progress in 2 courses or scripts`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Student, 3 courses ',
        description: `Recent courses when the student has progress in 3 courses or scripts`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            isRtl={false}
          />
        )
      },
      {
        name: 'Recent Courses - Student, 4 courses ',
        description: `Recent courses when the student has progress in 4 courses or scripts.`,
        story: () => (
          <RecentCourses
            courses= {[
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "Play Lab",
                description: "Create a story or make a game with Play Lab!",
                link: "https://code.org/playlab",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
              {
                name: "CSP Unit 2 - Digital Information",
                description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
                link: "https://curriculum.code.org/csp/unit2/",
              },
            ]}
            showAllCoursesLink={false}
            heading="My Courses"
            isTeacher={false}
            isRtl={false}
          />
        )
      },
    ]);
};
