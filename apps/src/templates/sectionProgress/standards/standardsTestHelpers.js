export const unpluggedLessonList = [
  {
    id: 'one',
    name: 'Lesson 1',
    number: 1,
    url: 'https://curriculum.code.org/csf-19/coursea/1/'
  },
  {
    id: 'two',
    name: 'Lesson 4',
    number: 3,
    url: 'https://curriculum.code.org/csf-19/coursea/3/'
  }
];

export const lessonCompletedByStandard = {
  1: {
    lessons: [
      {
        name: 'Mazes',
        lessonNumber: 1,
        completed: true,
        numStudentsCompleted: 25,
        numStudents: 30,
        url: 'https://curriculum.code.org/csf-19/coursea/1/'
      },
      {
        name: 'More Mazes',
        lessonNumber: 14,
        completed: true,
        numStudentsCompleted: 28,
        numStudents: 30,
        url: 'https://curriculum.code.org/csf-19/coursea/14/'
      },
      {
        name: 'Even More Mazes',
        lessonNumber: 15,
        completed: false,
        numStudentsCompleted: 10,
        numStudents: 30,
        url: 'https://curriculum.code.org/csf-19/coursea/15/'
      },
      {
        name: 'Hard Mazes',
        lessonNumber: 16,
        completed: false,
        numStudentsCompleted: 10,
        numStudents: 30,
        url: 'https://curriculum.code.org/csf-19/coursea/16/'
      },
      {
        name: 'Really Hard Mazes',
        lessonNumber: 17,
        completed: false,
        numStudentsCompleted: 10,
        numStudents: 30,
        url: 'https://curriculum.code.org/csf-19/coursea/17/'
      }
    ]
  }
};

export const fakeStandards = [
  {
    id: 1,
    category: 'Algorithms and Programming',
    number: '1B-AP-08',
    description:
      'Decompose (break down) problems into smaller, manageable subproblems to facilitate the program development process.'
  },
  {
    id: 2,
    category: 'Algorithms and Programming',
    number: '1B-AP-11',
    description:
      'Compare and refine multiple algorithms for the same task and determine which is the most appropriate.'
  },
  {
    id: 3,
    category: 'Algorithms and Programming',
    number: '1B-AP-12',
    description:
      'Use an iterative process to plan the development of a program by including others perspectives and considering user preferences.'
  },
  {
    id: 4,
    category: 'Networks and Internet',
    number: '1B-NI-05',
    description:
      'Describe choices made during program development using code comments, presentations, and demonstrations.'
  },
  {
    id: 5,
    category: 'Networks and Internet',
    number: '1B-N1-04',
    description:
      'Model how information is broken down into smaller pieces, transmitted as packets through multiple devices over networks and the Internet, and reassembled at the destination..'
  }
];
