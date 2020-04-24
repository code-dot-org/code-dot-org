import {TeacherScores} from '@cdo/apps/templates/sectionProgress/standards/standardsConstants';

export const unpluggedLessonList = [
  {
    id: 1,
    name: 'Lesson 1',
    number: 1,
    url: 'https://curriculum.code.org/csf-19/coursea/1/'
  },
  {
    id: 2,
    name: 'Lesson 4',
    number: 3,
    url: 'https://curriculum.code.org/csf-19/coursea/3/'
  }
];

export const lessonCompletedByStandard = {
  1: [
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
};

const teacherSections = {
  selectedSectionId: 1,
  sections: {
    1: {
      id: 1,
      name: 'Picture Section',
      createdAt: '2019-10-25T14:24:28.000Z',
      loginType: 'picture',
      grade: '9',
      providerManaged: false,
      stageExtras: true,
      pairingAllowed: true,
      sharingDisabled: false,
      studentCount: 4,
      code: 'HQGBNJ',
      courseId: null,
      scriptId: 92,
      hidden: false
    }
  }
};

export const standardsData = [
  {
    id: 16,
    organization: 'CSTA',
    organization_id: '1A-IC-17',
    description: 'Work respectfully and responsibly with others online.',
    concept: 'Impacts of Computing',
    lesson_ids: [662, 663]
  },
  {
    id: 17,
    organization: 'CSTA',
    organization_id: '1A-IC-18',
    description: '"Keep login information private',
    concept: 'Impacts of Computing',
    lesson_ids: [662, 663]
  },
  {
    id: 4,
    organization: 'CSTA',
    organization_id: '1A-AP-11',
    description:
      'Decompose (break down) the steps needed to solve a problem into a precise sequence of instructions.',
    concept: 'Algorithms & Programming',
    lesson_ids: [663, 664, 665, 666, 667, 669, 670, 671, 672, 673]
  }
];

export const stageId = 662;
export const scriptId = 92;

const scriptDataByScript = {
  92: {
    csf: true,
    hasStandards: true,
    id: scriptId,
    path: '//localhost-studio.code.org:3000/s/coursea-2019',
    title: 'Course A (2019)',
    stages: [
      {
        script_id: 92,
        script_name: 'coursea-2019',
        script_stages: 3,
        id: stageId,
        position: 1,
        relative_position: 1,
        name: 'Going Places Safely',
        title: 'Lesson 1: Going Places Safely',
        lesson_group_display_name: 'Digital Citizenship',
        lockable: false,
        levels: [],
        description_student: 'Learn the rules to safely visit places online.',
        description_teacher:
          'In collaboration with Common Sense Media, this lesson helps students learn that many websites ask for information that is private and discusses how to responsibly handle such requests. Students also find out that they can go to exciting places online, but they need to follow certain rules to remain safe.',
        unplugged: true,
        lesson_plan_html_url: 'https://curriculum.code.org/csf-19/coursea/1',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/coursea-2019/1/Teacher.pdf',
        stage_extras_level_url:
          'http://localhost-studio.code.org:3000/s/coursea-2019/stage/1/extras'
      },
      {
        script_id: scriptId,
        script_name: 'coursea-2019',
        script_stages: 3,
        id: 663,
        position: 2,
        relative_position: 2,
        name: 'Learn to Drag and Drop',
        title: 'Lesson 2: Learn to Drag and Drop',
        lesson_group_display_name: 'Sequencing',
        lockable: false,
        levels: [{activeId: 10001}, {activeId: 10002}, {activeId: 10003}],
        description_student: 'Click and drag to finish the puzzles.',
        description_teacher:
          'This lesson will give students an idea of what to expect when they head to the computer lab. It begins with a brief discussion introducing them to computer lab manners, then they will progress into using a computer to complete online puzzles.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csf-19/coursea/2',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/coursea-2019/2/Teacher.pdf',
        stage_extras_level_url:
          'http://localhost-studio.code.org:3000/s/coursea-2019/stage/2/extras'
      },
      {
        script_id: scriptId,
        script_name: 'coursea-2019',
        script_stages: 3,
        id: 664,
        position: 3,
        relative_position: 3,
        name: 'Happy Maps',
        title: 'Lesson 3: Happy Maps',
        lesson_group_display_name: 'Sequencing',
        lockable: false,
        levels: [],
        description_student:
          'Write instructions to get the Flurb to the fruit.',
        description_teacher:
          'This unplugged lesson brings together teams with a simple task: get the "flurb" to the fruit. Students will practice writing precise instructions as they work to translate instructions into the symbols provided. If problems arise in the code, students should also work together to recognize bugs and build solutions.',
        unplugged: true,
        lesson_plan_html_url: 'https://curriculum.code.org/csf-19/coursea/3',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/coursea-2019/3/Teacher.pdf',
        stage_extras_level_url:
          'http://localhost-studio.code.org:3000/s/coursea-2019/stage/3/extras'
      }
    ]
  }
};

export const pluggedStage = scriptDataByScript[scriptId].stages[1];

const sectionCompletedLesson = {
  92: {
    100001: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100002: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100003: {
      10001: 20,
      10002: 20
    },
    100004: {
      10001: 20,
      10002: 20
    }
  }
};

const sectionPartialCompletedLesson = {
  92: {
    100001: {
      10001: 20,
      10002: 20,
      10003: 20
    },
    100002: {
      10001: 20,
      10002: 20,
      10003: 20
    }
  }
};

const studentLevelScoresByStageComplete = {
  92: {662: {100001: {10001: TeacherScores.COMPLETE}}}
};

const studentLevelScoresByStageIncomplete = {
  92: {662: {100001: {10001: TeacherScores.INCOMPLETE}}}
};

const selectedLessons = [
  {
    id: 662,
    completed: true,
    name: 'Going Places Safely',
    number: 1,
    url: 'https://curriculum.code.org/csf-19/coursea/1'
  }
];

// Construct state
export const fakeState = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: {92: {}}
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData,
    studentLevelScoresByStage: {92: {662: {}}}
  },
  teacherSections: teacherSections
};

export const stateForPartiallyCompletedLesson = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: sectionPartialCompletedLesson
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData
  },
  teacherSections: teacherSections
};

export const stateForCompletedLesson = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: sectionCompletedLesson
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData
  },
  teacherSections: teacherSections
};

export const stateForTeacherMarkedCompletedLesson = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: sectionCompletedLesson
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData,
    studentLevelScoresByStage: studentLevelScoresByStageComplete,
    selectedLessons: selectedLessons
  },
  teacherSections: teacherSections
};

export const stateForTeacherMarkedIncompletedLesson = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: sectionCompletedLesson
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData,
    studentLevelScoresByStage: studentLevelScoresByStageIncomplete,
    selectedLessons: []
  },
  teacherSections: teacherSections
};

export const stateForTeacherMarkedAndProgress = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: sectionCompletedLesson
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData,
    studentLevelScoresByStage: studentLevelScoresByStageComplete,
    selectedLessons: selectedLessons
  },
  teacherSections: teacherSections
};
