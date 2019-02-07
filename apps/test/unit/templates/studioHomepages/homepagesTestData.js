export const announcement = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link:
    'http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the'
};

export const courses = [
  {
    title: 'Course 1',
    description:
      'Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/s/course1',
    assignedSections: []
  },
  {
    title: 'Course 2',
    description:
      'Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course2',
    assignedSections: []
  }
];

export const moreCourses = [
  ...courses,
  {
    title: 'Course 3',
    description:
      'Start with Course 3 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/s/course3',
    assignedSections: []
  },
  {
    title: 'Course 4',
    description:
      'Start with Course 4 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course4',
    assignedSections: []
  },
  {
    title: 'Course 5',
    description:
      'Start with Course 5 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/s/course5',
    assignedSections: []
  },
  {
    title: 'Course 6',
    description:
      'Start with Course 6 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course6',
    assignedSections: []
  }
];

export const taughtSections = [
  {
    id: 14,
    name: 'Best Section Ever',
    loginType: 'picture',
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 25,
    code: 'MRTHUN',
    courseId: 360,
    scriptId: 361,
    grade: 'K',
    providerManaged: false,
    hidden: false
  },
  {
    id: 15,
    name: 'Even Better Section',
    loginType: 'word',
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 18,
    code: 'DINOSAR',
    courseId: 150,
    scriptId: 13,
    grade: '7',
    providerManaged: false,
    hidden: false
  }
];

export const joinedSections = [
  {
    id: 11,
    name: 'Period 1',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/111111/progress',
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/111111/manage',
    code: 'ClassOneCode'
  },
  {
    id: 12,
    name: 'Period 2',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/222222/progress',
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/s/course2-unit3',
    numberOfStudents: 2,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/222222/manage',
    code: 'ClassTwoCode'
  },
  {
    id: 13,
    name: 'Period 3 (Google Classroom)',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/333333/progress',
    assignedTitle: 'Course 3',
    linkToAssigned: 'https://studio.code.org/s/course3',
    numberOfStudents: 3,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/333333/manage',
    login_type: 'google_classroom',
    code: 'DoNotShowThis'
  },
  {
    id: 14,
    name: 'Period 4 (Clever)',
    teacherName: 'Ms. Frizzle',
    linkToProgress:
      'https://code.org/teacher-dashboard#/sections/444444/progress',
    assignedTitle: 'Course 4',
    linkToAssigned: 'https://studio.code.org/s/course4',
    numberOfStudents: 4,
    linkToStudents:
      'https://code.org/teacher-dashboard#/sections/444444/manage',
    login_type: 'clever',
    code: 'OrThisEither'
  }
];

export const topCourse = {
  assignableName: 'Course 1',
  lessonName: 'Lesson 3: Learn to drag and drop',
  linkToOverview: 'http://localhost-studio.code.org:3000/s/course1',
  linkToLesson:
    'http://localhost-studio.code.org:3000/s/course1/stage/3/puzzle/1'
};
