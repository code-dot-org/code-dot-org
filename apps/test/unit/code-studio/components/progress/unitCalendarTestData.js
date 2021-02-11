export const testLessons = [
  {
    id: 1,
    title: 'Lesson 1',
    duration: 87,
    assessment: true,
    unplugged: false,
    url: 'https://www.google.com/'
  },
  {
    id: 2,
    title: 'Lesson 2',
    duration: 40,
    assessment: false,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 3,
    title: 'Lesson 3',
    duration: 135,
    assessment: true,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 4,
    title: 'Lesson 4',
    duration: 60,
    assessment: false,
    unplugged: false,
    url: 'https://www.google.com/'
  }
];

export const testLessonSchedule = [
  [
    {
      id: 1,
      title: 'Lesson 1',
      duration: 87,
      assessment: true,
      unplugged: false,
      url: 'https://www.google.com/',
      isStart: true,
      isEnd: true,
      isMajority: true
    }
  ],
  [
    {
      id: 2,
      title: 'Lesson 2',
      duration: 40,
      assessment: false,
      unplugged: true,
      url: 'https://www.google.com/',
      isStart: true,
      isEnd: true,
      isMajority: true
    },
    {
      id: 3,
      title: 'Lesson 3',
      duration: 50,
      assessment: true,
      unplugged: true,
      url: 'https://www.google.com/',
      isStart: true,
      isEnd: false,
      isMajority: false
    }
  ],
  [
    {
      id: 3,
      title: 'Lesson 3',
      duration: 85,
      assessment: true,
      unplugged: true,
      url: 'https://www.google.com/',
      isStart: false,
      isEnd: true,
      isMajority: true
    }
  ],
  [
    {
      id: 4,
      title: 'Lesson 4',
      duration: 60,
      assessment: false,
      unplugged: false,
      url: 'https://www.google.com/',
      isStart: true,
      isEnd: true,
      isMajority: true
    }
  ]
];
