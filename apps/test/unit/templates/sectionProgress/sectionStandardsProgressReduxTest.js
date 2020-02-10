import {assert} from '../../../util/reconfiguredChai';
import sectionStandardsProgress, {
  setTeacherCommentForReport,
  getUnpluggedLessonsForScript,
  getNumberLessonsInScript,
  lessonsByStandard
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';

// Construct state
const fakeState = {
  sectionProgress: {
    scriptDataByScript: {
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
            script_stages: 12,
            id: 662,
            position: 1,
            relative_position: 1,
            name: 'Going Places Safely',
            title: 'Lesson 1: Going Places Safely',
            flex_category: 'Digital Citizenship',
            lockable: false,
            levels: [],
            description_student:
              'Learn the rules to safely visit places online.',
            description_teacher:
              'In collaboration with Common Sense Media, this lesson helps students learn that many websites ask for information that is private and discusses how to responsibly handle such requests. Students also find out that they can go to exciting places online, but they need to follow certain rules to remain safe.',
            unplugged: true,
            lesson_plan_html_url:
              'https://curriculum.code.org/csf-19/coursea/1',
            lesson_plan_pdf_url:
              '//localhost.code.org:3000/curriculum/coursea-2019/1/Teacher.pdf',
            stage_extras_level_url:
              'http://localhost-studio.code.org:3000/s/coursea-2019/stage/1/extras'
          },
          {
            script_id: 92,
            script_name: 'coursea-2019',
            script_stages: 12,
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
            lesson_plan_html_url:
              'https://curriculum.code.org/csf-19/coursea/2',
            lesson_plan_pdf_url:
              '//localhost.code.org:3000/curriculum/coursea-2019/2/Teacher.pdf',
            stage_extras_level_url:
              'http://localhost-studio.code.org:3000/s/coursea-2019/stage/2/extras'
          },
          {
            script_id: 92,
            script_name: 'coursea-2019',
            script_stages: 12,
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
            lesson_plan_html_url:
              'https://curriculum.code.org/csf-19/coursea/3',
            lesson_plan_pdf_url:
              '//localhost.code.org:3000/curriculum/coursea-2019/3/Teacher.pdf',
            stage_extras_level_url:
              'http://localhost-studio.code.org:3000/s/coursea-2019/stage/3/extras'
          }
        ]
      }
    }
  },
  scriptSelection: {
    scriptId: 92
  },
  sectionStandardsProgress: {
    standardsData: [
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
    ]
  },
  teacherSections: {
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
        studentCount: 9,
        code: 'HQGBNJ',
        courseId: null,
        scriptId: 92,
        hidden: false
      }
    }
  }
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
    it('gets the correct lessons by standard', () => {
      assert.deepEqual(lessonsByStandard(fakeState), {
        4: [
          {
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 9,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          },
          {
            lessonNumber: 3,
            name: 'Happy Maps',
            numStudents: 9,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/3'
          }
        ],
        16: [
          {
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 9,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 9,
            unplugged: false,
            url: 'https://curriculum.code.org/csf-19/coursea/2'
          }
        ],
        17: [
          {
            lessonNumber: 1,
            name: 'Going Places Safely',
            numStudents: 9,
            unplugged: true,
            url: 'https://curriculum.code.org/csf-19/coursea/1'
          },
          {
            lessonNumber: 2,
            name: 'Learn to Drag and Drop',
            numStudents: 9,
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
});
