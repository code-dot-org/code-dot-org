export const announcement = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link: 'https://hourofcode.com/beyond',
};

export const courses = [
  {
    title: 'Course 1',
    description:
      'Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/courses/course1',
    assignedSections: [],
  },
  {
    title: 'Course 2',
    description:
      'Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/courses/course2',
    assignedSections: [],
  },
];

export const plCourses = [
  {
    title: 'PL Course 1',
    description: 'Teachers learning things about teaching',
    link: 'https://studio.code.org/courses/pl-course1',
    assignedSections: [],
  },
  {
    title: 'Course 2',
    description: 'Facilitators learning stuff about facilitating',
    link: 'https://studio.code.org/courses/pl-course2',
    assignedSections: [],
  },
];

export const moreCourses = [
  ...courses,
  {
    title: 'Course 3',
    description:
      'Start with Course 3 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/courses/course3',
    assignedSections: [],
  },
  {
    title: 'Course 4',
    description:
      'Start with Course 4 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/courses/course4',
    assignedSections: [],
  },
  {
    title: 'Course 5',
    description:
      'Start with Course 5 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/courses/course5',
    assignedSections: [],
  },
  {
    title: 'Course 6',
    description:
      'Start with Course 6 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/courses/course6',
    assignedSections: [],
  },
];

export const taughtSections = [
  {
    id: 1,
    name: 'Best Section Ever',
    loginType: 'picture',
    lessonExtras: false,
    pairingAllowed: true,
    studentCount: 25,
    code: 'MRTHUN',
    courseId: 360,
    courseOfferingId: 360,
    courseVersionId: 362,
    unitId: 361,
    grade: 'K',
    providerManaged: false,
    hidden: false,
    participantType: 'student',
  },
  {
    id: 2,
    name: 'Even Better Section',
    loginType: 'word',
    lessonExtras: false,
    pairingAllowed: true,
    studentCount: 18,
    code: 'DINOSAR',
    courseId: 150,
    courseOfferingId: 150,
    courseVersionId: 151,
    unitId: 13,
    grade: '7',
    providerManaged: false,
    hidden: false,
    participantType: 'student',
  },
];

export const joinedSections = [
  {
    name: 'Period 1',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/courses/course1',
    code: 'ClassOneCode',
    participantType: 'student',
  },
  {
    name: 'Period 2',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/s/course2-unit3',
    code: 'ClassTwoCode',
    participantType: 'student',
  },
  {
    name: 'Period 3 (Google Classroom)',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 3',
    linkToAssigned: 'https://studio.code.org/courses/course3',
    login_type: 'google_classroom',
    code: 'DoNotShowThis',
    participantType: 'student',
  },
  {
    name: 'Period 4 (Clever)',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 4',
    linkToAssigned: 'https://studio.code.org/courses/course4',
    login_type: 'clever',
    code: 'OrThisEither',
    participantType: 'student',
  },
];

export const joinedStorySections = [
  {
    name: 'First Pd',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/courses/course1',
    code: 'ClassOneCode',
    participantType: 'student',
  },
  {
    name: 'Second Pd',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/courses/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/courses/course2/units/3',
    code: 'ClassTwoCode',
    participantType: 'student',
  },
];

export const joinedPlSections = [
  {
    name: 'Period 1',
    loginType: 'word',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'PL Course 1',
    linkToAssigned: 'https://studio.code.org/courses/course1',
    code: 'ClassOneCode',
    participantType: 'teacher',
  },
  {
    name: 'Period 2',
    loginType: 'word',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'PL Course 2',
    linkToAssigned: 'https://studio.code.org/courses/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/courses/course2/units/3',
    code: 'ClassTwoCode',
    participantType: 'teacher',
  },
  {
    name: 'Period 3 (Google Classroom)',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'PL Course 3',
    linkToAssigned: 'https://studio.code.org/courses/course3',
    loginType: 'google_classroom',
    code: 'DoNotShowThis',
    participantType: 'teacher',
  },
  {
    name: 'Period 4 (Clever)',
    teacherName: 'Ms. Frizzle',
    assignedTitle: 'PL Course 4',
    linkToAssigned: 'https://studio.code.org/courses/course4',
    loginType: 'clever',
    code: 'OrThisEither',
    participantType: 'teacher',
  },
];

export const topCourse = {
  assignableName: 'Course 1',
  lessonName: 'Lesson 3: Learn to drag and drop',
  linkToOverview: 'http://localhost-studio.code.org:3000/courses/course1',
  linkToLesson:
    'http://localhost-studio.code.org:3000/courses/course1/units/1/lessons/3/levels/1',
};

export const topPlCourse = {
  assignableName: 'PL Course 1',
  lessonName: 'Learning how to teacher',
  linkToOverview: 'http://studio.code.org/courses/vpl-csp-2021',
  linkToLesson:
    'http://studio.code.org/courses/vpl-csp-2021/units/1/lessons/3/levels/1',
};
