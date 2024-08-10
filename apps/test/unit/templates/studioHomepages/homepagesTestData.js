import {progressUrl, manageStudentsUrl} from './fakeSectionUtils';

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
    link: 'https://studio.code.org/s/course1',
    assignedSections: [],
  },
  {
    title: 'Course 2',
    description:
      'Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course2',
    assignedSections: [],
  },
];

export const plCourses = [
  {
    title: 'PL Course 1',
    description: 'Teachers learning things about teaching',
    link: 'https://studio.code.org/s/pl-course1',
    assignedSections: [],
  },
  {
    title: 'Course 2',
    description: 'Facilitators learning stuff about facilitating',
    link: 'https://studio.code.org/s/pl-course2',
    assignedSections: [],
  },
];

export const moreCourses = [
  ...courses,
  {
    title: 'Course 3',
    description:
      'Start with Course 3 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/s/course3',
    assignedSections: [],
  },
  {
    title: 'Course 4',
    description:
      'Start with Course 4 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course4',
    assignedSections: [],
  },
  {
    title: 'Course 5',
    description:
      'Start with Course 5 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.',
    link: 'https://studio.code.org/s/course5',
    assignedSections: [],
  },
  {
    title: 'Course 6',
    description:
      'Start with Course 6 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.',
    link: 'https://studio.code.org/s/course6',
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
    id: 3,
    name: 'Period 1',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents: manageStudentsUrl,
    code: 'ClassOneCode',
    hidden: false,
    participantType: 'student',
  },
  {
    id: 4,
    name: 'Period 2',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    studentCount: 10,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/s/course2-unit3',
    numberOfStudents: 2,
    linkToStudents: manageStudentsUrl,
    code: 'ClassTwoCode',
    hidden: false,
    participantType: 'student',
  },
  {
    id: 5,
    name: 'Period 3 (Google Classroom)',
    teacherName: 'Ms. Frizzle',
    studentCount: 4,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 3',
    linkToAssigned: 'https://studio.code.org/s/course3',
    numberOfStudents: 3,
    linkToStudents: manageStudentsUrl,
    login_type: 'google_classroom',
    code: 'DoNotShowThis',
    hidden: false,
    participantType: 'student',
  },
  {
    id: 6,
    name: 'Period 4 (Clever)',
    teacherName: 'Ms. Frizzle',
    studentCount: 22,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 4',
    linkToAssigned: 'https://studio.code.org/s/course4',
    numberOfStudents: 4,
    linkToStudents: manageStudentsUrl,
    login_type: 'clever',
    code: 'OrThisEither',
    hidden: false,
    participantType: 'student',
  },
];

export const joinedStorySections = [
  {
    id: 30,
    name: 'First Pd',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents: manageStudentsUrl,
    code: 'ClassOneCode',
    hidden: false,
    participantType: 'student',
  },
  {
    id: 40,
    name: 'Second Pd',
    loginType: 'picture',
    teacherName: 'Ms. Frizzle',
    studentCount: 10,
    linkToProgress: progressUrl,
    assignedTitle: 'Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/s/course2-unit3',
    numberOfStudents: 2,
    linkToStudents: manageStudentsUrl,
    code: 'ClassTwoCode',
    hidden: false,
    participantType: 'student',
  },
];

export const joinedPlSections = [
  {
    id: 7,
    name: 'Period 1',
    loginType: 'word',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'PL Course 1',
    linkToAssigned: 'https://studio.code.org/s/course1',
    numberOfStudents: 1,
    linkToStudents: manageStudentsUrl,
    code: 'ClassOneCode',
    hidden: false,
    participantType: 'teacher',
  },
  {
    id: 8,
    name: 'Period 2',
    loginType: 'word',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'PL Course 2',
    linkToAssigned: 'https://studio.code.org/s/course2',
    currentUnitTitle: 'Unit 3',
    linkToCurrentUnit: 'https://studio.code.org/s/course2-unit3',
    numberOfStudents: 2,
    linkToStudents: manageStudentsUrl,
    code: 'ClassTwoCode',
    hidden: false,
    participantType: 'teacher',
  },
  {
    id: 9,
    name: 'Period 3 (Google Classroom)',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'PL Course 3',
    linkToAssigned: 'https://studio.code.org/s/course3',
    numberOfStudents: 3,
    linkToStudents: manageStudentsUrl,
    loginType: 'google_classroom',
    code: 'DoNotShowThis',
    hidden: false,
    participantType: 'teacher',
  },
  {
    id: 10,
    name: 'Period 4 (Clever)',
    teacherName: 'Ms. Frizzle',
    studentCount: 18,
    linkToProgress: progressUrl,
    assignedTitle: 'PL Course 4',
    linkToAssigned: 'https://studio.code.org/s/course4',
    numberOfStudents: 4,
    linkToStudents: manageStudentsUrl,
    loginType: 'clever',
    code: 'OrThisEither',
    hidden: false,
    participantType: 'teacher',
  },
];

export const topCourse = {
  assignableName: 'Course 1',
  lessonName: 'Lesson 3: Learn to drag and drop',
  linkToOverview: 'http://studio.code.org.localhost:3000/s/course1',
  linkToLesson:
    'http://studio.code.org.localhost:3000/s/course1/lessons/3/levels/1',
};

export const topPlCourse = {
  assignableName: 'PL Course 1',
  lessonName: 'Learning how to teacher',
  linkToOverview: 'http://studio.code.org/s/vpl-csp-2021',
  linkToLesson: 'http://studio.code.org/s/vpl-csp-2021/lessons/3/levels/1',
};
