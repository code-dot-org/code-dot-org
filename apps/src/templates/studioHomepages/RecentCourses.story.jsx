import React from 'react';
import RecentCourses from './RecentCourses';

const courses = [
  {
    title: 'CSP Unit 1',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit1/'
  },
  {
    title: 'CSP Unit 2',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit2/'
  },
  {
    title: 'CSP Unit 3',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit3/'
  },
  {
    title: 'CSP Unit 4',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit4/'
  },
  {
    title: 'CSP Unit 5',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit5/'
  },
  {
    title: 'CSP Unit 6',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit6/'
  },
  {
    title: 'CSP Unit 7',
    description:
      'Explore how more complex digital information is represented and manipulated through computation and visualization',
    link: 'https://curriculum.code.org/csp/unit7/'
  }
];

const topCourse = {
  assignableName: 'Course 1',
  lessonName: 'Lesson 3: Learn to drag and drop',
  linkToOverview: 'http://localhost-studio.code.org:3000/s/course1',
  linkToLesson:
    'http://localhost-studio.code.org:3000/s/course1/lessons/3/levels/1'
};

export default storybook => {
  return storybook
    .storiesOf('Homepages/RecentCourses', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Recent Courses - teacher, no courses yet',
        description:
          'If the teacher does not have any recent courses, there will be a set up message encouraging them to learn more about courses.',
        story: () => (
          <RecentCourses
            courses={[]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={true}
          />
        )
      },
      {
        name: 'Recent Courses - student, no courses yet',
        description:
          'If the student does not have any recent courses, there will be a set up message encouraging them to learn more about courses.',
        story: () => (
          <RecentCourses
            courses={[]}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
          />
        )
      },
      {
        name: 'Recent Courses - teacher, 4 courses ',
        description: ` Recent Courses when the teacher has sections enrolled in 4 courses.`,
        story: () => (
          <RecentCourses
            courses={courses.slice(0, 4)}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={true}
          />
        )
      },
      {
        name: 'Recent Courses - student, 5 courses ',
        description: ` Recent Courses when the student has progress in 5 courses.`,
        story: () => (
          <RecentCourses
            courses={courses.slice(0, 4)}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            topCourse={topCourse}
          />
        )
      },
      {
        name: 'Recent Courses - teacher, 7 courses ',
        description: ` Recent Courses when the teacher has sections enrolled in 7 courses. Should see a View More button`,
        story: () => (
          <RecentCourses
            courses={courses}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={true}
          />
        )
      },
      {
        name: 'Recent Courses - student, 7 courses ',
        description: ` Recent Courses when the student has progress in 7 courses. Should see a View More button`,
        story: () => (
          <RecentCourses
            courses={courses.slice(0, 7)}
            showAllCoursesLink={true}
            heading="My Courses"
            isTeacher={false}
            topCourse={topCourse}
          />
        )
      }
    ]);
};
