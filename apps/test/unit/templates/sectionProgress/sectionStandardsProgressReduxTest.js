import {assert, expect} from '../../../util/reconfiguredChai';
import sectionStandardsProgress, {
  setTeacherCommentForReport,
  getUnpluggedLessonsForScript,
  getNumberLessonsInScript,
  lessonsByStandard,
  getLessonCompletionStatus
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';

const stageId = 662;

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

const standardsData = [
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

const scriptDataByScript = {
  92: {
    csf: true,
    hasStandards: true,
    id: 92,
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
        flex_category: 'Digital Citizenship',
        lockable: false,
        levels: [{activeId: 10001}, {activeId: 10002}, {activeId: 10003}],
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
        script_id: 92,
        script_name: 'coursea-2019',
        script_stages: 3,
        id: 663,
        position: 2,
        relative_position: 2,
        name: 'Learn to Drag and Drop',
        title: 'Lesson 2: Learn to Drag and Drop',
        flex_category: 'Sequencing',
        lockable: false,
        levels: [],
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
        script_id: 92,
        script_name: 'coursea-2019',
        script_stages: 3,
        id: 664,
        position: 3,
        relative_position: 3,
        name: 'Happy Maps',
        title: 'Lesson 3: Happy Maps',
        flex_category: 'Sequencing',
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

// Construct state
const fakeState = {
  sectionProgress: {
    scriptDataByScript: scriptDataByScript,
    studentLevelProgressByScript: {92: {}}
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: standardsData
  },
  teacherSections: teacherSections
};

const stateForPartiallyCompletedLesson = {
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

const stateForCompletedLesson = {
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

describe('sectionStandardsProgressRedux', () => {
  const initialState = sectionStandardsProgress(undefined, {});

  describe('setTeacherCommentForReport', () => {
    it('can set the teacher comment', () => {
      const action = setTeacherCommentForReport(
        'A lovely comment about my class'
      );
      const nextState = sectionStandardsProgress(initialState, action);
      assert.deepEqual(
        nextState.teacherComment,
        'A lovely comment about my class'
      );
    });
  });

  describe('getNumberLessonsInScript', () => {
    it('gets the correct number of lessons in the script', () => {
      assert.deepEqual(getNumberLessonsInScript(fakeState), 3);
    });
  });

  describe('lessonsByStandard', () => {
    it('gets the correct lessons and completion by standard, no progress', () => {
      assert.deepEqual(lessonsByStandard(fakeState), {
        4: [
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            completed: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
        ],
        16: [
          {
            completed: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ],
        17: [
          {
            completed: false,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ]
      });
    });

    it('gets the correct lessons and completion by standard, completed lesson', () => {
      assert.deepEqual(lessonsByStandard(stateForCompletedLesson), {
        4: [
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            completed: false,
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
        ],
        16: [
          {
            completed: true,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ],
        17: [
          {
            completed: true,
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 4,
            numStudentsCompleted: 4,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            completed: false,
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 4,
            numStudentsCompleted: 0,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ]
      });
    });
  });

  describe('getUnpluggedLessonsForScript', () => {
    it('gets the unplugged lessons for script', () => {
      assert.deepEqual(getUnpluggedLessonsForScript(fakeState), [
        {
          id: 662,
          name: 'Going Places Safely',
          number: 1,
          url: 'https://curriculum.code.org/csf-19/coursea/1'
        },
        {
          id: 664,
          name: 'Happy Maps',
          number: 3,
          url: 'https://curriculum.code.org/csf-19/coursea/3'
        }
      ]);
    });
  });

  describe('getLessonCompletionStatus', () => {
    it('accurately calculates no progress', () => {
      expect(getLessonCompletionStatus(fakeState, stageId)).to.deep.equal({
        completed: false,
        numStudentsCompleted: 0
      });
    });

    it('accurately calculates partial progress', () => {
      expect(
        getLessonCompletionStatus(stateForPartiallyCompletedLesson, stageId)
      ).to.deep.equal({
        completed: false,
        numStudentsCompleted: 2
      });
    });

    it('accurately calculates > 80% of students completed > 60% of levels', () => {
      expect(
        getLessonCompletionStatus(stateForCompletedLesson, stageId)
      ).to.deep.equal({
        completed: true,
        numStudentsCompleted: 4
      });
    });
  });
});
